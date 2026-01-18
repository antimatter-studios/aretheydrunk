"use server"
import { createServerComponentClient } from "@/lib/supabase/server"

export async function loginUser(data: { email: string; password: string }) {
  // For login, we need to use the Supabase client that can set cookies
  // The auth service handles the password verification
  const supabase = await createServerComponentClient()

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check/align confirmation status between auth and app profile
  const { data: userData } = await supabase
    .from("users")
    .select("id, email_confirmed_at, confirm_code")
    .eq("auth_id", authData.user.id)
    .single()

  const authConfirmedAt = authData.user.email_confirmed_at || authData.user.confirmed_at

  if (!userData?.email_confirmed_at && authConfirmedAt) {
    // Backfill app confirmation if auth is already confirmed
    await supabase
      .from("users")
      .update({ email_confirmed_at: authConfirmedAt, confirm_code: null })
      .eq("auth_id", authData.user.id)
  }

  // Re-check after potential backfill
  const emailConfirmed = userData?.email_confirmed_at || authConfirmedAt

  if (!emailConfirmed) {
    const confirmCode = userData?.confirm_code
    await supabase.auth.signOut()
    return {
      error: "Please confirm your email first",
      confirmCode,
    }
  }

  return { success: true }
}
