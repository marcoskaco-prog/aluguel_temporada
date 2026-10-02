import { useState, type FormEvent } from "react";
import { useCreate, useDelete, useList, useUpdate, type HttpError } from "@refinedev/core";

type ReservaForm = {
  id_imovel: string;
  id_hospede: string;
  id_plataforma: string;
  data_checkin: string;
  data_checkout: string;
  qtd_hospedes: string;
  valor_total_diarias: string;
  taxa_limpeza: string;
  status: string;
};

const criarFormularioVazio = (): ReservaForm => ({
  id_imovel: "",
  id_hospede: "",
  id_plataforma: "",
  data_checkin: "",
  data_checkout: "",
  qtd_hospedes: "1",
  valor_total_diarias: "0.00",
  taxa_limpeza: "0.00",
  status: "Confirmada",
});

const registroRelacionado = (registro: any) => (Array.isArray(registro) ? registro[0] : registro);

export const ReservaList = () => {
  const { result: reservasResult, query: reservasQuery } = useList({
    resource: "reservas",
    meta: {
      select:
        "*, imoveis(id_imovel, nome_imovel), hospedes(id_hospede, nome_completo), plataformas(id_plataforma, nome_plataforma)",
    },
  });
  const { result: imoveisResult, query: imoveisQuery } = useList({
    resource: "imoveis",
    pagination: { pageSize: 100 },
  });
  const { result: hospedesResult, query: hospedesQuery } = useList({
    resource: "hospedes",
    pagination: { pageSize: 100 },
  });
  const { result: plataformasResult, query: plataformasQuery } = useList({
    resource: "plataformas",
    pagination: { pageSize: 100 },
  });

  const reservas = reservasResult.data;
  const imoveis = imoveisResult.data;
  const hospedes = hospedesResult.data;
  const plataformas = plataformasResult.data;
  const [formulario, setFormulario] = useState<ReservaForm>(criarFormularioVazio);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erroMutacao, setErroMutacao] = useState("");

  const { mutate: criarReserva } = useCreate();
  const { mutate: atualizarReserva } = useUpdate();
  const { mutate: excluirReserva } = useDelete();

  const alterarCampo = (campo: keyof ReservaForm, valor: string) => {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  };

  const limparFormulario = () => {
    setFormulario(criarFormularioVazio());
    setEditandoId(null);
  };

  const handleSalvar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErroMutacao("");

    if (formulario.data_checkout < formulario.data_checkin) {
      setErroMutacao("A data de checkout deve ser igual ou posterior ao check-in.");
      return;
    }

    const valores = {
      id_imovel: Number(formulario.id_imovel),
      id_hospede: Number(formulario.id_hospede),
      id_plataforma: Number(formulario.id_plataforma),
      data_checkin: formulario.data_checkin,
      data_checkout: formulario.data_checkout,
      qtd_hospedes: Number(formulario.qtd_hospedes),
      valor_total_diarias: Number(formulario.valor_total_diarias),
      taxa_limpeza: Number(formulario.taxa_limpeza),
      status: formulario.status.trim() || "Confirmada",
    };

    const callbacks = {
      onSuccess: () => {
        limparFormulario();
        reservasQuery.refetch();
      },
      onError: (error: HttpError) => setErroMutacao(error.message || "Não foi possível salvar a reserva."),
    };

    if (editandoId === null) {
      criarReserva({ resource: "reservas", values: valores }, callbacks);
    } else {
      atualizarReserva(
        {
          resource: "reservas",
          id: editandoId,
          values: valores,
          meta: { idColumnName: "id_reserva" },
        },
        callbacks,
      );
    }
  };

  const iniciarEdicao = (reserva: any) => {
    setEditandoId(Number(reserva.id_reserva));
    setFormulario({
      id_imovel: String(reserva.id_imovel),
      id_hospede: String(reserva.id_hospede),
      id_plataforma: String(reserva.id_plataforma),
      data_checkin: String(reserva.data_checkin).slice(0, 10),
      data_checkout: String(reserva.data_checkout).slice(0, 10),
      qtd_hospedes: String(reserva.qtd_hospedes ?? 1),
      valor_total_diarias: String(reserva.valor_total_diarias ?? 0),
      taxa_limpeza: String(reserva.taxa_limpeza ?? 0),
      status: String(reserva.status ?? "Confirmada"),
    });
    setErroMutacao("");
  };

  const handleExcluir = (reserva: any) => {
    if (!window.confirm(`Deseja realmente excluir a reserva ${reserva.id_reserva}?`)) return;

    setErroMutacao("");
    excluirReserva(
      {
        resource: "reservas",
        id: reserva.id_reserva,
        meta: { idColumnName: "id_reserva" },
      },
      {
        onSuccess: () => reservasQuery.refetch(),
        onError: (error) => setErroMutacao(error.message || "Não foi possível excluir a reserva."),
      },
    );
  };

  if (reservasQuery.isLoading || imoveisQuery.isLoading || hospedesQuery.isLoading || plataformasQuery.isLoading) {
    return <div style={{ padding: "20px" }}>Carregando reservas e opções...</div>;
  }

  const erroConsulta = reservasQuery.error || imoveisQuery.error || hospedesQuery.error || plataformasQuery.error;
  if (erroConsulta) {
    const mensagem = erroConsulta instanceof Error ? erroConsulta.message : "Erro desconhecido";
    return <div role="alert" style={{ padding: "20px" }}>Erro ao carregar dados das reservas: {mensagem}</div>;
  }

  const campoStyle = { display: "grid", gap: "4px", minWidth: "170px" };
  const inputStyle = { boxSizing: "border-box" as const, width: "100%", padding: "8px" };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Reservas</h1>

      <form
        onSubmit={handleSalvar}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
          padding: "16px",
          border: "1px solid #cbd5e1",
          borderRadius: "6px",
        }}
      >
        <strong style={{ gridColumn: "1 / -1" }}>{editandoId === null ? "Nova reserva" : `Editar reserva ${editandoId}`}</strong>

        <label style={campoStyle}>
          Imóvel
          <select required value={formulario.id_imovel} onChange={(event) => alterarCampo("id_imovel", event.target.value)} style={inputStyle}>
            <option value="">Selecione um imóvel</option>
            {imoveis.map((imovel) => (
              <option key={imovel.id_imovel} value={imovel.id_imovel}>
                {imovel.nome_imovel || `Imóvel ${imovel.id_imovel}`}
              </option>
            ))}
          </select>
        </label>

        <label style={campoStyle}>
          Hóspede
          <select required value={formulario.id_hospede} onChange={(event) => alterarCampo("id_hospede", event.target.value)} style={inputStyle}>
            <option value="">Selecione um hóspede</option>
            {hospedes.map((hospede) => (
              <option key={hospede.id_hospede} value={hospede.id_hospede}>
                {hospede.nome_completo || `Hóspede ${hospede.id_hospede}`}
              </option>
            ))}
          </select>
        </label>

        <label style={campoStyle}>
          Plataforma
          <select required value={formulario.id_plataforma} onChange={(event) => alterarCampo("id_plataforma", event.target.value)} style={inputStyle}>
            <option value="">Selecione uma plataforma</option>
            {plataformas.map((plataforma) => (
              <option key={plataforma.id_plataforma} value={plataforma.id_plataforma}>
                {plataforma.nome_plataforma || `Plataforma ${plataforma.id_plataforma}`}
              </option>
            ))}
          </select>
        </label>

        <label style={campoStyle}>
          Check-in
          <input type="date" required value={formulario.data_checkin} onChange={(event) => alterarCampo("data_checkin", event.target.value)} style={inputStyle} />
        </label>

        <label style={campoStyle}>
          Check-out
          <input type="date" required min={formulario.data_checkin || undefined} value={formulario.data_checkout} onChange={(event) => alterarCampo("data_checkout", event.target.value)} style={inputStyle} />
        </label>

        <label style={campoStyle}>
          Quantidade de hóspedes
          <input type="number" min="1" step="1" required value={formulario.qtd_hospedes} onChange={(event) => alterarCampo("qtd_hospedes", event.target.value)} style={inputStyle} />
        </label>

        <label style={campoStyle}>
          Valor das diárias
          <input type="number" min="0" step="0.01" required value={formulario.valor_total_diarias} onChange={(event) => alterarCampo("valor_total_diarias", event.target.value)} style={inputStyle} />
        </label>

        <label style={campoStyle}>
          Taxa de limpeza
          <input type="number" min="0" step="0.01" required value={formulario.taxa_limpeza} onChange={(event) => alterarCampo("taxa_limpeza", event.target.value)} style={inputStyle} />
        </label>

        <label style={campoStyle}>
          Status
          <input value={formulario.status} onChange={(event) => alterarCampo("status", event.target.value)} style={inputStyle} />
        </label>

        <div style={{ display: "flex", alignItems: "end", gap: "8px" }}>
          <button type="submit">{editandoId === null ? "Cadastrar reserva" : "Salvar alterações"}</button>
          {editandoId !== null && <button type="button" onClick={limparFormulario}>Cancelar</button>}
        </div>
      </form>

      {erroMutacao && <p role="alert">{erroMutacao}</p>}

      <table cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", border: "1px solid #cbd5e1" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
            <th>ID</th>
            <th>Imóvel</th>
            <th>Hóspede</th>
            <th>Plataforma</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Hóspedes</th>
            <th>Diárias</th>
            <th>Limpeza</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {reservas.length ? (
            reservas.map((reserva) => {
              const imovel = registroRelacionado(reserva.imoveis);
              const hospede = registroRelacionado(reserva.hospedes);
              const plataforma = registroRelacionado(reserva.plataformas);

              return (
                <tr key={reserva.id_reserva} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td>{reserva.id_reserva}</td>
                  <td>{imovel?.nome_imovel || `Imóvel ${reserva.id_imovel}`}</td>
                  <td>{hospede?.nome_completo || `Hóspede ${reserva.id_hospede}`}</td>
                  <td>{plataforma?.nome_plataforma || `Plataforma ${reserva.id_plataforma}`}</td>
                  <td>{reserva.data_checkin}</td>
                  <td>{reserva.data_checkout}</td>
                  <td>{reserva.qtd_hospedes ?? 1}</td>
                  <td>{Number(reserva.valor_total_diarias).toFixed(2)}</td>
                  <td>{Number(reserva.taxa_limpeza).toFixed(2)}</td>
                  <td>{reserva.status || "Confirmada"}</td>
                  <td>
                    <button type="button" onClick={() => iniciarEdicao(reserva)}>Editar</button>
                    <button type="button" onClick={() => handleExcluir(reserva)}>Excluir</button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={11} style={{ textAlign: "center", color: "#64748b" }}>
                Nenhuma reserva cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};