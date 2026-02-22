import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Utiliser les cookies pour le flow PKCE (magic links)
        // au lieu de localStorage pour que ça fonctionne 
        // même si on change de navigateur entre la demande et le clic
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
      cookies: {
        get(name: string) {
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
          return cookie ? cookie.split('=')[1] : undefined
        },
        set(name: string, value: string, options: { expires?: Date; path?: string; domain?: string; secure?: boolean }) {
          let cookie = `${name}=${value}`
          if (options.expires) cookie += `; expires=${options.expires.toUTCString()}`
          if (options.path) cookie += `; path=${options.path}`
          if (options.domain) cookie += `; domain=${options.domain}`
          if (options.secure) cookie += `; secure`
          cookie += `; samesite=lax`
          document.cookie = cookie
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          if (options.path) cookie += `; path=${options.path}`
          if (options.domain) cookie += `; domain=${options.domain}`
          document.cookie = cookie
        },
      },
    }
  )
}
