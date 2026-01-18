"use server"

import { signup } from "@/lib/auth"

export async function signUpUser(data: { email: string; password: string; fullName: string; teamName: string }) {
  try {
    const result = await signup({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      teamName: data.teamName,
    })

    if (!result.success) {
      return { error: result.error }
    }

    return { success: true, confirmCode: result.confirmCode }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
    console.error("[v0] Signup error:", errorMessage)
    return { error: errorMessage }
  }
}
