"use client"

import { useState } from "react"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalCard } from "@/components/brutal-card"
import { updateTeamName, deleteTeam } from "./actions"

interface TeamSettingsFormProps {
  team: {
    id: string
    name: string
    slug: string
    created_at: string
  }
  slug: string
}

export function TeamSettingsForm({ team, slug }: TeamSettingsFormProps) {
  const [teamName, setTeamName] = useState(team.name)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateName = async () => {
    if (!teamName.trim()) {
      setMessage({ type: "error", text: "Team name cannot be empty" })
      return
    }

    setIsLoading(true)
    setMessage(null)

    const result = await updateTeamName(team.id, teamName.trim())

    if (result.success) {
      setMessage({ type: "success", text: "✅ Team name updated successfully!" })
    } else {
      setMessage({ type: "error", text: `❌ ${result.error}` })
    }

    setIsLoading(false)
  }

  const handleDeleteTeam = async () => {
    if (deleteConfirmText !== team.name) {
      setMessage({ type: "error", text: "Team name doesn't match" })
      return
    }

    setIsLoading(true)
    setMessage(null)

    const result = await deleteTeam(team.id)

    if (result.success) {
      // Redirect will happen from the server action
    } else {
      setMessage({ type: "error", text: `❌ ${result.error}` })
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {message && (
        <div
          className={`${
            message.type === "success" ? "bg-brutal-green" : "bg-brutal-red"
          } text-black px-6 py-4 border-6 border-black shadow-brutal font-black text-lg`}
        >
          {message.text}
        </div>
      )}

      {/* Team Name */}
      <BrutalCard className="bg-white">
        <h2 className="font-display text-2xl text-black mb-4">TEAM NAME</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-sm font-bold text-black mb-2">
              Team Name
            </label>
            <input
              id="teamName"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-brutal-yellow"
              placeholder="Team Name"
            />
          </div>
          <BrutalButton onClick={handleUpdateName} disabled={isLoading} className="bg-brutal-green text-black">
            {isLoading ? "SAVING..." : "SAVE CHANGES"}
          </BrutalButton>
        </div>
      </BrutalCard>

      {/* Team Info */}
      <BrutalCard className="bg-white">
        <h2 className="font-display text-2xl text-black mb-4">TEAM INFORMATION</h2>
        <div className="space-y-3 text-black">
          <div className="flex justify-between py-2 border-b-2 border-black/10">
            <span className="font-bold">Team Slug:</span>
            <span className="font-mono">{team.slug}</span>
          </div>
          <div className="flex justify-between py-2 border-b-2 border-black/10">
            <span className="font-bold">Created:</span>
            <span>{new Date(team.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-black/70 pt-2">
            The team slug is used in URLs and cannot be changed. Share your team's URL with others to invite them.
          </p>
        </div>
      </BrutalCard>

      {/* Danger Zone */}
      <BrutalCard className="bg-brutal-red border-brutal-red">
        <h2 className="font-display text-2xl text-black mb-4">⚠️ DANGER ZONE</h2>
        <p className="text-black mb-4 font-bold">
          Deleting a team is permanent and cannot be undone. All parties, votes, and data will be lost forever.
        </p>

        {!showDeleteConfirm ? (
          <BrutalButton onClick={() => setShowDeleteConfirm(true)} className="bg-black text-white hover:bg-black/80">
            DELETE TEAM
          </BrutalButton>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="confirmDelete" className="block text-sm font-bold text-black mb-2">
                Type "{team.name}" to confirm deletion:
              </label>
              <input
                id="confirmDelete"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-black"
                placeholder={team.name}
              />
            </div>
            <div className="flex gap-2">
              <BrutalButton
                onClick={handleDeleteTeam}
                disabled={deleteConfirmText !== team.name || isLoading}
                className="bg-black text-white"
              >
                {isLoading ? "DELETING..." : "CONFIRM DELETE"}
              </BrutalButton>
              <BrutalButton onClick={() => setShowDeleteConfirm(false)} className="bg-white text-black">
                CANCEL
              </BrutalButton>
            </div>
          </div>
        )}
      </BrutalCard>
    </div>
  )
}
