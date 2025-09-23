// Configuration for the application
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
  },
  admin: {
    code: import.meta.env.VITE_ADMIN_CODE || 'Createrkkrishavya'
  },
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key'
  },
  moderation: {
    enabled: import.meta.env.VITE_ENABLE_MODERATION === 'true'
  },
  app: {
    name: 'U-Fresher ❤',
    version: '1.0.0',
    url: import.meta.env.VITE_APP_URL || 'https://U-fresher.vercel.app'
  }
}
