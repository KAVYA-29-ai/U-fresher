/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_SUPABASE_URL: string
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  readonly NEXT_PUBLIC_ADMIN_CODE: string
  readonly NEXT_PUBLIC_GEMINI_API_KEY: string
  readonly NEXT_PUBLIC_ENABLE_MODERATION: string
  readonly NEXT_PUBLIC_APP_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
