import { createNewTeam } from "./actions"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalInput } from "@/components/brutal-input"
import { BrutalCard } from "@/components/brutal-card"
import { Header } from "@/components/header"
import Link from "next/link"

export default function CreateTeamPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-brutal-pink relative overflow-auto">
        {/* Sunburst background */}
        <div
          className="fixed inset-0 opacity-30"
          style={{
            background: `repeating-conic-gradient(
              from 0deg at 50% 50%,
              #FFD700 0deg 10deg,
              #FF69B4 10deg 20deg,
              #00CED1 20deg 30deg
            )`,
          }}
        />

        {/* Halftone overlay */}
        <div
          className="fixed inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, black 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 pt-8">
          <div className="max-w-2xl mx-auto mb-6">
            <Link
              href="/dashboard"
              className="inline-block px-4 py-2 bg-white border-4 border-black font-bold hover:translate-x-[-4px] hover:translate-y-[-4px] transition-transform"
              style={{ boxShadow: "6px 6px 0 black" }}
            >
              ← DASHBOARD
            </Link>
          </div>

          <BrutalCard className="max-w-2xl mx-auto">
            <h1 className="font-display text-5xl font-black text-center mb-2 text-brutal-yellow brutal-text-shadow transform -rotate-1">
              CREATE NEW TEAM
            </h1>
            <p className="text-center text-lg mb-8">Start a new team for your company, friends, or any group! 🎉</p>

            <form action={createNewTeam} className="space-y-6">
              <div>
                <label htmlFor="teamName" className="block text-lg font-bold mb-2">
                  Team Name
                </label>
                <BrutalInput
                  id="teamName"
                  name="teamName"
                  type="text"
                  placeholder="e.g. My Awesome Company"
                  required
                  className="w-full"
                />
              </div>

              {/* Additional form fields can be added here */}
              <div>
                <label htmlFor="teamDescription" className="block text-lg font-bold mb-2">
                  Team Description
                </label>
                <BrutalInput
                  id="teamDescription"
                  name="teamDescription"
                  type="text"
                  placeholder="Describe your team"
                  className="w-full"
                />
              </div>

              <BrutalButton type="submit" className="w-full">
                CREATE TEAM 🚀
              </BrutalButton>
            </form>
          </BrutalCard>
        </div>
      </div>
    </>
  )
}
