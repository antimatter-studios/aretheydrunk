import Link from "next/link"
import { Header } from "@/components/header"
import { CreatePartyForm } from "./create-party-form"
import { createServerClient } from "@/lib/supabase/server"

export default async function CreatePartyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createServerClient()
  const { data: team } = await supabase.from("team").select("name").eq("slug", slug).single()

  return (
    <>
      <Header />
      <div className="min-h-screen relative bg-brutal-pink overflow-auto">
        {/* Sunburst background */}
        <div className="fixed inset-0 opacity-30 pointer-events-none sunburst-multi" />

        {/* Halftone overlay */}
        <div className="fixed inset-0 opacity-10 pointer-events-none halftone-overlay-20" />

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Back link */}
            <Link
              href={`/dashboard/team/${slug}`}
              className="inline-block mb-8 text-2xl font-black text-black hover:text-brutal-yellow transition-colors font-(family-name:--font-bangers)"
            >
              ← BACK TO TEAM
            </Link>

            <CreatePartyForm slug={slug} teamName={team?.name || ""} />
          </div>
        </div>
      </div>
    </>
  )
}
