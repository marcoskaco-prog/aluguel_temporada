import { useState, type FormEvent } from "react";
import { useCreate, useDelete, useList, useUpdate } from "@refinedev/core";
import { supabaseClient } from "../../utility/supabaseClient";

type UsuarioForm = {
  nome: string;
  email: string;
  telefone: string;
};

const formularioVazio: UsuarioForm = { nome: "", email: "", telefone: "" };

export const UsuarioList = () => {
  const { result: usuariosResult, query: usuariosQuery } = useList({
    resource: "usuario",
    meta: { select: "id_usuario,nome_usuario,email_usuario,telefone_usuario" },
  });
  const { result: imoveisResult, query: imoveisQuery } = useList({
    resource: "imoveis",
    pagination: { pageSize: 1000 },
  });
  const { result: vinculosResult, query: vinculosQuery } = useList({
    resource: "usuario_imovel",
    meta: { select: "id_usuario,id_imovel" },
    pagination: { pageSize: 1000 },
  });

  const usuarios = usuariosResult.data;
  const imoveis = imoveisResult.data;
  const vinculos = vinculosResult.data;
  const [formulario, setFormulario] = useState<UsuarioForm>(formularioVazio);
  const [editandoId, setEditandoId] = useState<number | string | null>(null);
  const [imovelSelecionado, setImovelSelecionado] = useState<Record<string, string>>({});
  const [erro, setErro] = useState("");

  const { mutate: criarUsuario } = useCreate();
  const { mutate: atualizarUsuario } = useUpdate();
  const { mutate: excluirUsuario } = useDelete();

  const refetchDados = () => {
    usuariosQuery.refetch();
    imoveisQuery.refetch();
    vinculosQuery.refetch();
  };

  const limparFormulario = () => {
    setFormulario(formularioVazio);
    setEditandoId(null);
  };

  const handleSalvar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nome = formulario.nome.trim();
    const telefoneTexto = formulario.telefone.trim();
    const telefone = telefoneTexto ? Number(telefoneTexto) : null;

    if (!nome) return;
    if (telefoneTexto && !Number.isFinite(telefone)) {
      setErro("O telefone precisa conter apenas números, conforme o tipo da coluna no banco.");
      return;
    }

    setErro("");
    const valores = {
      nome_usuario: nome,
      email_usuario: formulario.email.trim() || null,
      telefone_usuario: telefone,
    };
    const meta = { select: "id_usuario,nome_usuario,email_usuario,telefone_usuario" };
    const callbacks = {
      onSuccess: () => {
        limparFormulario();
        usuariosQuery.refetch();
      },
      onError: (error: { message?: string }) => setErro(error.message || "Não foi possível salvar o usuário."),
    };

    if (editandoId === null) {
      criarUsuario({ resource: "usuario", values: valores, meta }, callbacks);
    } else {
      atualizarUsuario(
        {
          resource: "usuario",
          id: editandoId,
          values: valores,
          meta: { ...meta, idColumnName: "id_usuario" },
        },
        callbacks,
      );
    }
  };

  const iniciarEdicao = (usuario: (typeof usuarios)[number]) => {
    setEditandoId(usuario.id_usuario);
    setFormulario({
      nome: String(usuario.nome_usuario ?? ""),
      email: String(usuario.email_usuario ?? ""),
      telefone: String(usuario.telefone_usuario ?? ""),
    });
    setErro("");
  };

  const handleExcluir = (usuario: (typeof usuarios)[number]) => {
    const possuiImoveis = vinculos.some(
      (vinculo) => String(vinculo.id_usuario) === String(usuario.id_usuario),
    );
    if (possuiImoveis) {
      setErro("Desvincule os imóveis deste usuário antes de excluí-lo.");
      return;
    }
    if (!window.confirm(`Deseja excluir o usuário "${usuario.nome_usuario}"?`)) return;

    setErro("");
    excluirUsuario(
      {
        resource: "usuario",
        id: usuario.id_usuario,
        meta: { idColumnName: "id_usuario" },
      },
      {
        onSuccess: () => usuariosQuery.refetch(),
        onError: (error) => setErro(error.message || "Não foi possível excluir o usuário."),
      },
    );
  };

  const handleVincularImovel = async (idUsuario: number | string) => {
    const idImovel = imovelSelecionado[String(idUsuario)];
    if (!idImovel) return;
    if (
      vinculos.some(
        (vinculo) =>
          String(vinculo.id_usuario) === String(idUsuario) &&
          String(vinculo.id_imovel) === idImovel,
      )
    ) {
      setErro("Este imóvel já está vinculado a este usuário.");
      return;
    }

    setErro("");
    const { error: erroVinculo } = await supabaseClient
      .from("usuario_imovel")
      .insert({ id_usuario: idUsuario, id_imovel: Number(idImovel) });

    if (erroVinculo) {
      setErro(erroVinculo.message);
      return;
    }

    setImovelSelecionado((atual) => ({ ...atual, [String(idUsuario)]: "" }));
    vinculosQuery.refetch();
  };

  const handleDesvincularImovel = async (idUsuario: number | string, idImovel: number | string) => {
    setErro("");
    const { error: erroVinculo } = await supabaseClient
      .from("usuario_imovel")
      .delete()
      .eq("id_usuario", idUsuario)
      .eq("id_imovel", idImovel);

    if (erroVinculo) {
      setErro(erroVinculo.message);
      return;
    }

    vinculosQuery.refetch();
  };

  if (usuariosQuery.isLoading || imoveisQuery.isLoading || vinculosQuery.isLoading) {
    return <div style={{ padding: "20px" }}>Carregando usuários e imóveis...</div>;
  }

  const erroConsulta = usuariosQuery.error || imoveisQuery.error || vinculosQuery.error;
  if (erroConsulta) {
    const mensagem = erroConsulta instanceof Error ? erroConsulta.message : "Erro desconhecido";
    return <div role="alert" style={{ padding: "20px" }}>Erro ao carregar usuários: {mensagem}</div>;
  }

  const inputStyle = { boxSizing: "border-box" as const, width: "100%", padding: "8px" };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Usuários administradores</h1>

      <form
        onSubmit={handleSalvar}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "16px",
          padding: "16px",
          border: "1px solid #cbd5e1",
          borderRadius: "6px",
        }}
      >
        <strong style={{ gridColumn: "1 / -1" }}>{editandoId === null ? "Novo usuário" : "Editar usuário"}</strong>
        <label style={{ display: "grid", gap: "4px" }}>
          Nome
          <input
            required
            value={formulario.nome}
            onChange={(event) => setFormulario({ ...formulario, nome: event.target.value })}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: "4px" }}>
          E-mail
          <input
            type="email"
            value={formulario.email}
            onChange={(event) => setFormulario({ ...formulario, email: event.target.value })}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: "4px" }}>
          Telefone
          <input
            type="tel"
            inputMode="numeric"
            value={formulario.telefone}
            onChange={(event) => setFormulario({ ...formulario, telefone: event.target.value })}
            style={inputStyle}
          />
        </label>
        <div style={{ display: "flex", alignItems: "end", gap: "8px" }}>
          <button type="submit">{editandoId === null ? "Cadastrar usuário" : "Salvar alterações"}</button>
          {editandoId !== null && <button type="button" onClick={limparFormulario}>Cancelar</button>}
        </div>
      </form>

      {erro && <p role="alert">{erro}</p>}

      <table cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", border: "1px solid #cbd5e1" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
            <th>ID</th>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Telefone</th>
            <th>Imóveis administrados</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length ? (
            usuarios.map((usuario) => {
              const idUsuario = usuario.id_usuario;
              const vinculosUsuario = vinculos.filter(
                (vinculo) => String(vinculo.id_usuario) === String(idUsuario),
              );
              const idsImoveisVinculados = new Set(vinculosUsuario.map((vinculo) => String(vinculo.id_imovel)));
              const imoveisDisponiveis = imoveis.filter(
                (imovel) => !idsImoveisVinculados.has(String(imovel.id_imovel)),
              );
              const idSelect = String(idUsuario);

              return (
                <tr key={idSelect} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td>{idUsuario}</td>
                  <td>{usuario.nome_usuario}</td>
                  <td>{usuario.email_usuario || "-"}</td>
                  <td>{usuario.telefone_usuario || "-"}</td>
                  <td>
                    {vinculosUsuario.length ? (
                      <ul style={{ margin: "0 0 8px", paddingLeft: "18px" }}>
                        {vinculosUsuario.map((vinculo) => {
                          const imovel = imoveis.find(
                            (item) => String(item.id_imovel) === String(vinculo.id_imovel),
                          );
                          return (
                            <li key={`${idSelect}-${vinculo.id_imovel}`}>
                              {imovel?.nome_imovel || `Imóvel ${vinculo.id_imovel}`} {" "}
                              <button
                                type="button"
                                aria-label={`Desvincular imóvel ${vinculo.id_imovel} de ${usuario.nome_usuario}`}
                                onClick={() => handleDesvincularImovel(idUsuario, vinculo.id_imovel)}
                              >
                                Desvincular
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span style={{ color: "#64748b" }}>Nenhum imóvel</span>
                    )}
                    <div style={{ display: "flex", gap: "6px" }}>
                      <select
                        aria-label={`Selecionar imóvel para ${usuario.nome_usuario}`}
                        value={imovelSelecionado[idSelect] || ""}
                        onChange={(event) =>
                          setImovelSelecionado((atual) => ({ ...atual, [idSelect]: event.target.value }))
                        }
                      >
                        <option value="">Vincular imóvel</option>
                        {imoveisDisponiveis.map((imovel) => (
                          <option key={imovel.id_imovel} value={imovel.id_imovel}>
                            {imovel.nome_imovel || `Imóvel ${imovel.id_imovel}`}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!imovelSelecionado[idSelect]}
                        onClick={() => handleVincularImovel(idUsuario)}
                      >
                        Vincular
                      </button>
                    </div>
                  </td>
                  <td>
                    <button type="button" onClick={() => iniciarEdicao(usuario)}>Editar</button>
                    <button type="button" onClick={() => handleExcluir(usuario)}>Excluir</button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>
                Nenhum usuário cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};