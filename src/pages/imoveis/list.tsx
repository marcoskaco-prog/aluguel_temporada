import React, { useState } from "react";
import { useList, useCreate, useUpdate, useDelete } from "@refinedev/core";

export const ImovelList = () => {
  // Estado para o campo de pesquisa/consulta
  const [busca, setBusca] = useState("");

  const { result, query } = useList({ resource: "imoveis" });
  const imoveis = result.data;
  const isLoading = query.isLoading;
  const refetch = query.refetch;

  // Hooks do Refine para operações no Supabase
  const { mutate: createImovel } = useCreate();
  const { mutate: updateImovel } = useUpdate();
  const { mutate: deleteImovel } = useDelete();

  // Estados para inclusão de novo imóvel
  const [novoNome, setNovoNome] = useState("");
  const [novoEndereco, setNovoEndereco] = useState("");

  // Estados para edição
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoNome, setEditandoNome] = useState("");
  const [editandoEndereco, setEditandoEndereco] = useState("");

  // Filtragem local dos imóveis (pesquisa por nome ou endereço)
  const imoveisFiltrados = imoveis.filter((item: any) => {
    const termo = busca.toLowerCase();
    const nome = (item.nome_imovel || "").toLowerCase();
    const endereco = (item.endereco || "").toLowerCase();
    return nome.includes(termo) || endereco.includes(termo);
  });

  // Função para Incluir
  const handleIncluir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    createImovel(
      {
        resource: "imoveis",
        values: {
          nome_imovel: novoNome,
          endereco: novoEndereco || null,
        },
      },
      {
        onSuccess: () => {
          setNovoNome("");
          setNovoEndereco("");
          refetch();
        },
      }
    );
  };

  // Função para Salvar Alteração
  const handleSalvarAlteracao = (id: number) => {
    if (!editandoNome.trim()) return;

    updateImovel(
      {
        resource: "imoveis",
        id: id,
        values: {
          nome_imovel: editandoNome,
          endereco: editandoEndereco || null,
        },
        meta: { idColumnName: "id_imovel" },
      },
      {
        onSuccess: () => {
          setEditandoId(null);
          setEditandoNome("");
          setEditandoEndereco("");
          refetch();
        },
      }
    );
  };

  // Função para Excluir
  const handleExcluir = (id: number, nome: string) => {
    if (window.confirm(`Deseja realmente excluir o imóvel "${nome}"?`)) {
      deleteImovel(
        {
          resource: "imoveis",
          id: id,
          meta: { idColumnName: "id_imovel" },
        },
        {
          onSuccess: () => {
            refetch();
          },
        }
      );
    }
  };

  if (isLoading) return <div style={{ padding: "20px" }}>A carregar imóveis...</div>;

  if (query.isError) {
    const mensagem = query.error instanceof Error ? query.error.message : "Erro desconhecido";
    return <div role="alert" style={{ padding: "20px" }}>Erro ao carregar imóveis: {mensagem}</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Imóveis</h1>

      {/* Bar de Pesquisa / Consulta */}
      <div style={{ marginBottom: "20px", backgroundColor: "#f1f5f9", padding: "15px", borderRadius: "6px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
          🔍 Consultar Imóvel:
        </label>
        <input
          type="text"
          placeholder="Pesquisar por nome ou endereço..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #cbd5e1",
            width: "100%",
            maxWidth: "400px",
          }}
        />
      </div>

      {/* Formuário de Incluir */}
      <form
        onSubmit={handleIncluir}
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: "15px",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
        }}
      >
        <strong style={{ width: "100%" }}>Novo Imóvel:</strong>
        <input
          type="text"
          placeholder="Nome do Imóvel *"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          required
          style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "200px" }}
        />
        <input
          type="text"
          placeholder="Endereço (opcional)"
          value={novoEndereco}
          onChange={(e) => setNovoEndereco(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "300px", flexGrow: 1 }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#16a34a",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          + Incluir
        </button>
      </form>

      {/* Tabela de Dados */}
      <table cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", border: "1px solid #cbd5e1" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
            <th style={{ width: "80px" }}>ID</th>
            <th>Nome do Imóvel</th>
            <th>Endereço</th>
            <th style={{ width: "180px", textAlign: "center" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {imoveisFiltrados.length > 0 ? (
            imoveisFiltrados.map((item: any) => {
              const id = item.id_imovel;
              const isEditing = editandoId === id;

              return (
                <tr key={id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td>{id}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editandoNome}
                        onChange={(e) => setEditandoNome(e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #0284c7" }}
                      />
                    ) : (
                      item.nome_imovel
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editandoEndereco}
                        onChange={(e) => setEditandoEndereco(e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #0284c7", width: "90%" }}
                      />
                    ) : (
                      item.endereco || <span style={{ color: "#94a3b8" }}>Não informado</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleSalvarAlteracao(id)}
                          style={{
                            backgroundColor: "#2563eb",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          style={{
                            backgroundColor: "#64748b",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                        <button
                          onClick={() => {
                            setEditandoId(id);
                            setEditandoNome(item.nome_imovel || "");
                            setEditandoEndereco(item.endereco || "");
                          }}
                          style={{
                            backgroundColor: "#0284c7",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Alterar
                        </button>
                        <button
                          onClick={() => handleExcluir(id, item.nome_imovel)}
                          style={{
                            backgroundColor: "#dc2626",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", color: "#64748b" }}>
                Nenhum imóvel encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};