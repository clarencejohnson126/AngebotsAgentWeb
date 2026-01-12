import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete(name)
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user already has a company
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Query company_members using the actual table name
        const { data: membership, error: memberError } = await supabase
          .from('angebots_company_members')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle()  // Use maybeSingle to avoid error when no rows

        console.log('Auth callback - user:', user.id, 'membership:', membership, 'error:', memberError)

        if (membership?.company_id) {
          // User has company, go directly to projects
          return NextResponse.redirect(`${origin}/projekte`)
        }
      }

      // No company, go to firma-einrichten
      return NextResponse.redirect(`${origin}/firma-einrichten`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
