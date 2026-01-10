import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/projekte'

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
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
          remove(name: string) {
            try {
              cookieStore.delete(name)
            } catch {
              // Cookie deletion might fail in server components
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Session exchange error:', error)
      return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
    }

    // Check if user needs to complete company setup (new OAuth user)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('No user found after session exchange')
      return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
    }

    // Check if user has a company membership
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (membershipError && membershipError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected for new users
      console.error('Company membership check error:', membershipError)
    }

    if (!membership) {
      // New OAuth user - redirect to company setup
      return NextResponse.redirect(new URL('/auth/setup-company', requestUrl.origin))
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
}
