import { useState, type FormEvent } from "react";
import { useCreate, useDelete, useList, useUpdate } from "@refinedev/core";

export const PlataformaList = () => {
  const { result, query } = useList({ resource: "plataformas" });
  const plataformas = result.data;
  const [novoNome, setNovoNome] = useState("");
  const [editandoId, setEditandoId] = useState<number | string | null>(null);
  const [editandoNome, setEditandoNome] = useState("");
  const [erroMutacao, setErroMutacao] = useState("");

  const { mutate: criarPlataforma } = useCreate();
  const { mutate: atualizarPlataforma } = useUpdate();
  const { mutate: excluirPlataforma } = useDelete();

  const handleIncluir = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nome = novoNome.trim();
    if (!nome) return;

    setErroMutacao("");
    criarPlataforma(
      { resource: "plataformas", values: { nome_plataforma: nome } },
      {
        onSuccess: () => setNovoNome(""),
        onError: (error) => setErroMutacao(error.message || "Não foi possível incluir a plataforma."),
      },
    );
  };

  const iniciarEdicao = (plataforma: (typeof plataformas)[number]) => {
    setEditandoId(plataforma.id_plataforma);
    setEditandoNome(String(plataforma.nome_plataforma ?? ""));
    setErroMutacao("");
  };

  const handleSalvarAlteracao = (id: number | string) => {
    const nome = editandoNome.trim();
    if (!nome) return;

    setErroMutacao("");
    atualizarPlataforma(
      {
        resource: "plataformas",
        id,
        values: { nome_plataforma: nome },
        meta: { idColumnName: "id_plataforma" },
      },
      {
        onSuccess: () => {
          setEditandoId(null);
          setEditandoNome("");
        },
        onError: (error) => setErroMutacao(error.message || "Não foi possível atualizar a plataforma."),
      },
    );
  };

  const handleExcluir = (id: number | string, nome: string) => {
    if (!window.confirm(`Tem a certeza de que deseja excluir a plataforma "${nome}"?`)) return;

    setErroMutacao("");
    excluirPlataforma(
      { resource: "plataformas", id, meta: { idColumnName: "id_plataforma" } },
      {
        onError: (error) => setErroMutacao(error.message || "Não foi possível excluir a plataforma."),
      },
    );
  };

  if (query.isLoading) return <div style={{ padding: "20px" }}>A carregar plataformas...</div>;

  if (query.isError) {
    return <div style={{ padding: "20px" }}>Erro ao carregar plataformas do Supabase.</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Plataformas</h1>

      <form onSubmit={handleIncluir} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <label htmlFor="nova-plataforma">Nova plataforma</label>
        <input
          id="nova-plataforma"
          value={novoNome}
          onChange={(event) => setNovoNome(event.target.value)}
          required
        />
        <button type="submit" disabled={!novoNome.trim()}>
          Incluir
        </button>
      </form>

      {erroMutacao && <p role="alert">{erroMutacao}</p>}

      <table cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", border: "1px solid #cbd5e1" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
            <th>ID</th>
            <th>Nome da Plataforma</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {plataformas.length > 0 ? (
            plataformas.map((plataforma) => (
              <tr key={plataforma.id_plataforma} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td>{plataforma.id_plataforma}</td>
                <td>
                  {editandoId === plataforma.id_plataforma ? (
                    <input
                      aria-label="Nome da plataforma"
                      value={editandoNome}
                      onChange={(event) => setEditandoNome(event.target.value)}
                    />
                  ) : (
                    plataforma.nome_plataforma
                  )}
                </td>
                <td>
                  {editandoId === plataforma.id_plataforma ? (
                    <>
                      <button
                        type="button"
                        disabled={!editandoNome.trim()}
                        onClick={() => handleSalvarAlteracao(plataforma.id_plataforma)}
                      >
                        Guardar
                      </button>
                      <button type="button" onClick={() => setEditandoId(null)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => iniciarEdicao(plataforma)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluir(plataforma.id_plataforma, String(plataforma.nome_plataforma ?? ""))}
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
              <td colSpan={3} style={{ textAlign: "center", color: "#64748b" }}>
                Nenhuma plataforma encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};