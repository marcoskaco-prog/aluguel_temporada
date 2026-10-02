import { useState, type FormEvent } from "react";
import { useCreate, useDelete, useList, useUpdate } from "@refinedev/core";

export const HospedeList = () => {
  const { result, query } = useList({ resource: "hospedes" });
  const hospedes = result.data;
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoNome, setEditandoNome] = useState("");
  const [editandoTelefone, setEditandoTelefone] = useState("");
  const [editandoEmail, setEditandoEmail] = useState("");
  const [erroMutacao, setErroMutacao] = useState("");

  const { mutate: criarHospede } = useCreate();
  const { mutate: atualizarHospede } = useUpdate();
  const { mutate: excluirHospede } = useDelete();

  const handleIncluir = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nome = novoNome.trim();
    if (!nome) return;

    setErroMutacao("");
    criarHospede(
      {
        resource: "hospedes",
        values: {
          nome_completo: nome,
          telefone: novoTelefone.trim() || null,
          email: novoEmail.trim() || null,
        },
      },
      {
        onSuccess: () => {
          setNovoNome("");
          setNovoTelefone("");
          setNovoEmail("");
          query.refetch();
        },
        onError: (error) => setErroMutacao(error.message || "Não foi possível cadastrar o hóspede."),
      },
    );
  };

  const iniciarEdicao = (hospede: (typeof hospedes)[number]) => {
    setEditandoId(Number(hospede.id_hospede));
    setEditandoNome(String(hospede.nome_completo ?? ""));
    setEditandoTelefone(String(hospede.telefone ?? ""));
    setEditandoEmail(String(hospede.email ?? ""));
    setErroMutacao("");
  };

  const handleSalvarAlteracao = (id: number) => {
    const nome = editandoNome.trim();
    if (!nome) return;

    setErroMutacao("");
    atualizarHospede(
      {
        resource: "hospedes",
        id,
        values: {
          nome_completo: nome,
          telefone: editandoTelefone.trim() || null,
          email: editandoEmail.trim() || null,
        },
        meta: { idColumnName: "id_hospede" },
      },
      {
        onSuccess: () => {
          setEditandoId(null);
          query.refetch();
        },
        onError: (error) => setErroMutacao(error.message || "Não foi possível atualizar o hóspede."),
      },
    );
  };

  const handleExcluir = (id: number, nome: string) => {
    if (!window.confirm(`Deseja realmente excluir o hóspede "${nome}"?`)) return;

    setErroMutacao("");
    excluirHospede(
      { resource: "hospedes", id, meta: { idColumnName: "id_hospede" } },
      {
        onSuccess: () => query.refetch(),
        onError: (error) => setErroMutacao(error.message || "Não foi possível excluir o hóspede."),
      },
    );
  };

  if (query.isLoading) return <div style={{ padding: "20px" }}>A carregar hóspedes...</div>;

  if (query.isError) {
    const mensagem = query.error instanceof Error ? query.error.message : "Erro desconhecido";
    return <div role="alert" style={{ padding: "20px" }}>Erro ao carregar hóspedes: {mensagem}</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Hóspedes</h1>

      <form onSubmit={handleIncluir} style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        <input
          aria-label="Nome completo"
          placeholder="Nome completo *"
          value={novoNome}
          onChange={(event) => setNovoNome(event.target.value)}
          required
        />
        <input
          aria-label="Telefone"
          placeholder="Telefone"
          type="tel"
          value={novoTelefone}
          onChange={(event) => setNovoTelefone(event.target.value)}
        />
        <input
          aria-label="E-mail"
          placeholder="E-mail"
          type="email"
          value={novoEmail}
          onChange={(event) => setNovoEmail(event.target.value)}
        />
        <button type="submit" disabled={!novoNome.trim()}>
          Incluir hóspede
        </button>
      </form>

      {erroMutacao && <p role="alert">{erroMutacao}</p>}

      <table cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", border: "1px solid #cbd5e1" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
            <th>ID</th>
            <th>Nome completo</th>
            <th>Telefone</th>
            <th>E-mail</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {hospedes.length > 0 ? (
            hospedes.map((hospede) => (
              <tr key={hospede.id_hospede} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td>{hospede.id_hospede}</td>
                <td>
                  {editandoId === Number(hospede.id_hospede) ? (
                    <input
                      aria-label="Editar nome completo"
                      value={editandoNome}
                      onChange={(event) => setEditandoNome(event.target.value)}
                    />
                  ) : hospede.nome_completo}
                </td>
                <td>
                  {editandoId === Number(hospede.id_hospede) ? (
                    <input
                      aria-label="Editar telefone"
                      type="tel"
                      value={editandoTelefone}
                      onChange={(event) => setEditandoTelefone(event.target.value)}
                    />
                  ) : hospede.telefone || "-"}
                </td>
                <td>
                  {editandoId === Number(hospede.id_hospede) ? (
                    <input
                      aria-label="Editar e-mail"
                      type="email"
                      value={editandoEmail}
                      onChange={(event) => setEditandoEmail(event.target.value)}
                    />
                  ) : hospede.email || "-"}
                </td>
                <td>
                  {editandoId === Number(hospede.id_hospede) ? (
                    <>
                      <button
                        type="button"
                        disabled={!editandoNome.trim()}
                        onClick={() => handleSalvarAlteracao(Number(hospede.id_hospede))}
                      >
                        Guardar
                      </button>
                      <button type="button" onClick={() => setEditandoId(null)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => iniciarEdicao(hospede)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluir(Number(hospede.id_hospede), String(hospede.nome_completo ?? ""))}
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", color: "#64748b" }}>
                Nenhum hóspede cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};