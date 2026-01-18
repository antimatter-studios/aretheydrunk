"use server"

// Supabase implementation of AuthService
// IMPORTANT: This file uses "use server" so it can ONLY export async functions
// All functions automatically run server-side only

import type { AuthUser, SignupData, LoginData, AuthResult } from "./types"
import { createServerComponentClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"

async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin credentials. Ensure SUPABASE_SERVICE_ROLE_KEY is set.")
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function signup(data: SignupData): Promise<AuthResult> {
  const confirmCode = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "")
  const adminClient = await getAdminClient()

  const { data: authData, error } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.fullName,
      team_name: data.teamName,
      confirm_code: confirmCode,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Store password hash in our users table for future migration
  const bcrypt = await import("bcryptjs")
  const passwordHash = await bcrypt.hash(data.password, 12)

  await adminClient.from("users").update({ password_hash: passwordHash }).eq("auth_id", authData.user.id)

  return {
    success: true,
    confirmCode,
    user: {
      id: authData.user.id,
      email: data.email,
      fullName: data.fullName,
      emailConfirmed: false,
    },
  }
}

export async function login(data: LoginData): Promise<AuthResult> {
  const supabase = await createServerComponentClient()

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const { data: userData } = await supabase.from("users").select("*").eq("auth_id", authData.user.id).single()

  return {
    success: true,
    user: {
      id: userData?.id || authData.user.id,
      email: authData.user.email!,
      fullName: userData?.full_name || "",
      displayName: userData?.display_name,
      emailConfirmed: !!userData?.email_confirmed_at,
    },
  }
}

export async function logout(): Promise<void> {
  const supabase = await createServerComponentClient()
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase.from("users").select("*").eq("auth_id", user.id).single()

  if (!userData) return null

  return {
    id: userData.id,
    email: userData.email,
    fullName: userData.full_name,
    displayName: userData.display_name,
    emailConfirmed: !!userData.email_confirmed_at,
  }
}

export async function confirmEmail(confirmCode: string): Promise<AuthResult> {
  const adminClient = await getAdminClient()

  const { data: userData, error } = await adminClient
    .from("users")
    .update({
      email_confirmed_at: new Date().toISOString(),
      confirm_code: null,
    })
    .eq("confirm_code", confirmCode)
    .select()
    .single()

  if (error || !userData) {
    return { success: false, error: "Invalid confirmation code" }
  }

  return {
    success: true,
    user: {
      id: userData.id,
      email: userData.email,
      fullName: userData.full_name,
      displayName: userData.display_name,
      emailConfirmed: true,
    },
  }
}

export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerComponentClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerComponentClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    return { success: false, error: error.message }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const bcrypt = await import("bcryptjs")
    const passwordHash = await bcrypt.hash(newPassword, 12)

    const adminClient = await getAdminClient()
    await adminClient.from("users").update({ password_hash: passwordHash }).eq("auth_id", user.id)
  }

  return { success: true }
}
