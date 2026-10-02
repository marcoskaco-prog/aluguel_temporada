import { createClient } from "@refinedev/supabase";

const SUPABASE_URL = "https://iketmpwmhuqifbwxqptj.supabase.co";
const SUPABASE_KEY = "sb_publishable_SnRA8VEoyEq0cyTazPnO0A_jkmlWu8M";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);