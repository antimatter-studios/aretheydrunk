"use server"

import { confirmEmail } from "@/lib/auth"
import { createServerComponentClient } from "@/lib/supabase/server"

export async function confirmUserAccount(confirmCode: string) {
  const result = await confirmEmail(confirmCode)

  if (!result.success) {
    return { error: result.error }
  }

  return { success: true }
}

export async function confirmAndLogin(data: { email: string; password: string; confirmCode: string }) {
  const supabase = await createServerComponentClient()

  // First check if user is already confirmed (confirm_code would be null)
  const { data: user } = await supabase
    .from("users")
    .select("id, email_confirmed_at, confirm_code")
    .eq("email", data.email)
    .single()

  // If user has a confirm_code that matches, confirm them
  if (user && user.confirm_code === data.confirmCode && !user.email_confirmed_at) {
    await confirmEmail(data.confirmCode)
  }

  // Now login regardless of confirmation status
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function loginAfterConfirm(data: { email: string; password: string }) {
  const supabase = await createServerComponentClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
