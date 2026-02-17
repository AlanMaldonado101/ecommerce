import { createClient } from "@supabase/supabase-js";
import { Database } from "./supabase";
import { authStorage, AUTH_STORAGE_KEY } from './authStorage';

const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
const supabaseUrl = import.meta.env.VITE_PROJECT_URL_SUPABASE;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
		storageKey: AUTH_STORAGE_KEY,
		storage: authStorage,
	},
});