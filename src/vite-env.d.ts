/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_CLAUDE_TRANSLATION_PROXY_URL: string;
  readonly VITE_CLAUDE_CONSTITUTION_PROXY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
