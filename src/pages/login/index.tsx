import { useState, type FormEvent } from "react";
import { useLogin } from "@refinedev/core";

export const LoginPage = () => {
  const { mutate: login, isPending } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    login(
      { email: email.trim(), password },
      { onError: (error) => setErrorMessage(error.message || "Não foi possível entrar.") },
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "linear-gradient(135deg, #e0f2fe 0%, #f8fafc 52%, #dcfce7 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "min(100%, 380px)",
          display: "grid",
          gap: "16px",
          padding: "32px",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          backgroundColor: "#ffffff",
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.1)",
        }}
      >
        <header>
          <p style={{ margin: "0 0 8px", color: "#0369a1", fontWeight: 700 }}>GERENCIADOR DE ALUGUÉIS</p>
          <h1 style={{ margin: 0, color: "#0f172a", fontSize: "28px" }}>Entrar</h1>
        </header>

        <label style={{ display: "grid", gap: "6px", color: "#334155" }}>
          E-mail
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{ boxSizing: "border-box", width: "100%", padding: "10px 12px" }}
          />
        </label>

        <label style={{ display: "grid", gap: "6px", color: "#334155" }}>
          Senha
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ boxSizing: "border-box", width: "100%", padding: "10px 12px" }}
          />
        </label>

        {errorMessage && <p role="alert" style={{ margin: 0, color: "#b91c1c" }}>{errorMessage}</p>}

        <button
          type="submit"
          disabled={isPending || !email.trim() || !password}
          style={{ padding: "11px 14px", border: 0, borderRadius: "4px", background: "#0369a1", color: "white", fontWeight: 700 }}
        >
          {isPending ? "A entrar..." : "Entrar"}
        </button>
      </form>
    </main>
  );
};