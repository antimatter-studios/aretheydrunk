"use client"

import type React from "react"

import { useState } from "react"
import { sendTeamInvitations } from "./actions"
import { BrutalButton } from "@/components/brutal-button"

export default function InviteForm({ teamId, teamSlug }: { teamId: string; teamSlug: string }) {
  const [emails, setEmails] = useState([""])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const addEmailField = () => {
    setEmails([...emails, ""])
  }

  const removeEmailField = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index))
  }

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    // Filter out empty emails
    const validEmails = emails.filter((email) => email.trim() !== "")

    if (validEmails.length === 0) {
      setError("Please enter at least one email address")
      setLoading(false)
      return
    }

    const result = await sendTeamInvitations(teamId, validEmails)

    if (!result.success) {
      setError(result.error || "Failed to send invitations")
      setLoading(false)
      return
    }

    setSuccess(true)
    setEmails([""])
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold text-white">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-brutal-green border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold text-black">✅ Invitations sent successfully!</p>
        </div>
      )}

      <div className="space-y-4">
        {emails.map((email, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => updateEmail(index, e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 text-lg font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
                required={index === 0}
              />
            </div>
            {emails.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmailField(index)}
                className="px-4 py-3 bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all font-black text-white"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEmailField}
        className="w-full px-6 py-3 bg-brutal-yellow border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all font-black text-xl"
      >
        + ADD ANOTHER EMAIL
      </button>

      <BrutalButton type="submit" disabled={loading} className="w-full">
        {loading
          ? "SENDING..."
          : `SEND ${emails.filter((e) => e.trim()).length} INVITATION${emails.filter((e) => e.trim()).length !== 1 ? "S" : ""}`}
      </BrutalButton>
    </form>
  )
}
