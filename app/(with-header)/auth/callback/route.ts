import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const next = searchParams.get("next") ?? "/dashboard"
  const confirm_code = searchParams.get("confirm_code")

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    },
  )

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "email",
    })

    if (!error && data.user) {
      // Get the confirm_code from user metadata
      const userConfirmCode = data.user.user_metadata?.confirm_code
      if (userConfirmCode) {
        return NextResponse.redirect(`${origin}/auth/confirmed?confirm_code=${userConfirmCode}`)
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If we have a confirm_code in the URL, redirect to confirmed page
      if (confirm_code) {
        return NextResponse.redirect(`${origin}/auth/confirmed?confirm_code=${confirm_code}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
}
