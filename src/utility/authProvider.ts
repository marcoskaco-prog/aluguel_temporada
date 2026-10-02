import type { AuthProvider } from "@refinedev/core";
import { supabaseClient } from "./supabaseClient";

export const authProvider: AuthProvider = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) return { success: false, error };
    if (!data.session) {
      return {
        success: false,
        error: new Error("Confirme seu e-mail antes de entrar."),
      };
    }

    return { success: true, redirectTo: "/" };
  },
  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) return { success: false, error };

    return { success: true, redirectTo: "/login" };
  },
  check: async () => {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
      return { authenticated: false, logout: true, redirectTo: "/login", error };
    }

    return data.session
      ? { authenticated: true }
      : { authenticated: false, redirectTo: "/login" };
  },
  onError: async () => ({}),
  getIdentity: async () => {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data.user) return null;

    return { id: data.user.id, email: data.user.email };
  },
};