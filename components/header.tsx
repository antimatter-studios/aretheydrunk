import Link from "next/link"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { HeaderMenu } from "@/components/header-menu"
import { SiteTitle } from "@/components/site-title"

async function getUser() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function Header() {
  const user = await getUser()

  return (
    <header className="brutal-border-thick border-t-0 border-x-0 bg-secondary halftone p-4 relative z-50">
      <div className="container mx-auto relative z-10">
        <div className="relative flex items-center justify-center md:justify-between">
          <SiteTitle />
          <div className="absolute right-0 md:static md:ml-auto">
            <HeaderMenu isAuthenticated={!!user} />
          </div>
        </div>
      </div>
    </header>
  )
}
