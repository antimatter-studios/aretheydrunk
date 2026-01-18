"use server"

import { createServerComponentClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import bcrypt from "bcryptjs"

export async function updateUserSettings(formData: FormData) {
  const supabase = await createServerComponentClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { error: "Not authenticated" }
  }

  const full_name = formData.get("full_name") as string
  const display_name = formData.get("display_name") as string

  const { error } = await supabase
    .from("users")
    .update({
      full_name,
      display_name: display_name || null,
    })
    .eq("auth_id", authUser.id)

  if (error) {
    return { error: "Failed to update profile" }
  }

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const supabase = await createServerComponentClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { error: "Not authenticated" }
  }

  const current_password = formData.get("current_password") as string
  const new_password = formData.get("new_password") as string
  const confirm_password = formData.get("confirm_password") as string

  if (new_password !== confirm_password) {
    return { error: "New passwords do not match" }
  }

  if (new_password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authUser.email!,
    password: current_password,
  })

  if (signInError) {
    return { error: "Current password is incorrect" }
  }

  // Update password in Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({
    password: new_password,
  })

  if (updateError) {
    return { error: "Failed to update password" }
  }

  // Also update password hash in users table
  const passwordHash = await bcrypt.hash(new_password, 10)
  await supabase.from("users").update({ password_hash: passwordHash }).eq("auth_id", authUser.id)

  return { success: true }
}

export async function uploadProfilePicture(formData: FormData) {
  const supabase = await createServerComponentClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { error: "Not authenticated" }
  }

  const file = formData.get("file") as File

  if (!file) {
    return { error: "No file provided" }
  }

  try {
    // Upload to Vercel Blob
    const blob = await put(`profile-pictures/${authUser.id}-${Date.now()}.${file.name.split(".").pop()}`, file, {
      access: "public",
    })

    // Update user record
    const { error } = await supabase.from("users").update({ profile_picture_url: blob.url }).eq("auth_id", authUser.id)

    if (error) {
      return { error: "Failed to update profile picture" }
    }

    revalidatePath("/dashboard/settings")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: "Failed to upload image" }
  }
}
