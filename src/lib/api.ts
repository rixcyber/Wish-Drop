import type { Backend } from "./backend";
import { localBackend } from "./local";
import { isSupabaseConfigured } from "./supabase";
import { supabaseBackend } from "./supabaseBackend";

/**
 * Single access point for all persistence. Supabase (auth + Postgres + Storage,
 * with RLS from supabase/schema.sql) when env vars are present; otherwise the
 * local demo store so the app is fully usable with zero configuration.
 */
export const api: Backend = isSupabaseConfigured ? supabaseBackend : localBackend;

export const backendMode = api.mode;
