import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"
import { getSupabaseServerClient } from "@/lib/supabase/server"

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
      <div className="container mx-auto flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-bangers)] text-2xl md:text-4xl tracking-wider text-brutal"
        >
          ARE THEY DRUNK?
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <BrutalButton variant="accent" size="sm">
                  DASHBOARD
                </BrutalButton>
              </Link>
              <Link href="/create">
                <BrutalButton variant="primary" size="sm">
                  START A PARTY
                </BrutalButton>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <BrutalButton variant="accent" size="sm">
                  LOGIN
                </BrutalButton>
              </Link>
              <Link href="/auth/signup">
                <BrutalButton variant="primary" size="sm">
                  SIGN UP
                </BrutalButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
