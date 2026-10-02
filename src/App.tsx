import { BrowserRouter, Navigate, Route, Routes, Link } from "react-router-dom";
import { Authenticated, Refine, useLogout } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import { dataProvider } from "@refinedev/supabase";

import { authProvider } from "./utility/authProvider";
import { supabaseClient } from "./utility/supabaseClient";

import { PlataformaList } from "./pages/plataformas/list";
import { ImovelList } from "./pages/imoveis/list";
import { HospedeList } from "./pages/hospedes/list";
import { ReservaList } from "./pages/reservas/list";
import { UsuarioList } from "./pages/usuarios/list";
import { LoginPage } from "./pages/login";

// Barra de navegação superior
const MenuNavegacao = () => {
  const { mutate: logout } = useLogout();

  return (
    <nav
      style={{
        display: "flex",
        gap: "20px",
        padding: "15px 30px",
        backgroundColor: "#0f172a",
        fontFamily: "sans-serif",
      }}
    >
      <Link to="/" style={{ color: "#ffffff", textDecoration: "none", fontWeight: "bold" }}>
        🏠 Início
      </Link>
      <Link to="/plataformas" style={{ color: "#38bdf8", textDecoration: "none" }}>
        Plataformas
      </Link>
      <Link to="/imoveis" style={{ color: "#38bdf8", textDecoration: "none" }}>
        Imóveis
      </Link>
      <Link to="/hospedes" style={{ color: "#38bdf8", textDecoration: "none" }}>
        Hóspedes
      </Link>
      <Link to="/reservas" style={{ color: "#38bdf8", textDecoration: "none" }}>
        Reservas
      </Link>
      <Link to="/usuarios" style={{ color: "#38bdf8", textDecoration: "none" }}>
        Usuários
      </Link>
      <button type="button" onClick={() => logout()} style={{ marginLeft: "auto" }}>
        Terminar sessão
      </button>
    </nav>
  );
};

// Página inicial com os botões/cartões
const PaginaInicial = () => {
  const cardStyle = {
    display: "block",
    padding: "24px 32px",
    backgroundColor: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    textDecoration: "none",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    minWidth: "180px",
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1 style={{ color: "#0f172a", marginBottom: "10px" }}>Gerenciador de Aluguéis</h1>
      <p style={{ color: "#64748b", marginBottom: "35px" }}>
        Selecione um módulo abaixo para visualizar os dados:
      </p>

      <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
        <Link to="/plataformas" style={cardStyle}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏢</div>
          <h2 style={{ margin: 0, fontSize: "18px", color: "#0284c7" }}>Plataformas</h2>
        </Link>

        <Link to="/imoveis" style={cardStyle}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏠</div>
          <h2 style={{ margin: 0, fontSize: "18px", color: "#0284c7" }}>Imóveis</h2>
        </Link>

        <Link to="/hospedes" style={cardStyle}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>👥</div>
          <h2 style={{ margin: 0, fontSize: "18px", color: "#0284c7" }}>Hóspedes</h2>
        </Link>

        <Link to="/reservas" style={cardStyle}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>📅</div>
          <h2 style={{ margin: 0, fontSize: "18px", color: "#0284c7" }}>Reservas</h2>
        </Link>

        <Link to="/usuarios" style={cardStyle}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>👤</div>
          <h2 style={{ margin: 0, fontSize: "18px", color: "#0284c7" }}>Usuários</h2>
        </Link>
      </div>
    </div>
  );
};

const PaginasProtegidas = () => (
  <>
    <MenuNavegacao />
    <Routes>
      <Route path="/" element={<PaginaInicial />} />
      <Route path="/plataformas" element={<PlataformaList />} />
      <Route path="/imoveis" element={<ImovelList />} />
      <Route path="/hospedes" element={<HospedeList />} />
      <Route path="/reservas" element={<ReservaList />} />
      <Route path="/usuarios" element={<UsuarioList />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <Refine
        dataProvider={dataProvider(supabaseClient)}
        authProvider={authProvider}
        routerProvider={routerProvider}
        resources={[
          { name: "plataformas", list: "/plataformas" },
          { name: "imoveis", list: "/imoveis" },
          { name: "hospedes", list: "/hospedes" },
          { name: "reservas", list: "/reservas" },
          { name: "usuario", list: "/usuarios", meta: { idColumnName: "id_usuario" } },
          { name: "usuario_imovel", meta: { idColumnName: "id_usuario" } },
        ]}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <Authenticated key="protected-pages" fallback={<Navigate to="/login" replace />}>
                <PaginasProtegidas />
              </Authenticated>
            }
          />
        </Routes>
      </Refine>
    </BrowserRouter>
  );
}