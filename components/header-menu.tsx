"use client"

import { useState } from "react"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"
import { LogoutButton } from "@/components/logout-button"

export function HeaderMenu({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {/* Desktop buttons */}
      <div className="hidden md:flex items-center gap-3">
        {isAuthenticated ? (
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
            <LogoutButton />
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

      {/* Mobile hamburger */}
      <div className="md:hidden">
        <BrutalButton
          variant="secondary"
          size="sm"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </BrutalButton>

        {open && (
          <div className="absolute right-0 mt-2 w-64 bg-white border-4 border-black p-3 rounded-sm z-50">
            <div className="flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <BrutalButton variant="accent" size="sm" className="w-full">
                      DASHBOARD
                    </BrutalButton>
                  </Link>
                  <Link href="/create" onClick={() => setOpen(false)}>
                    <BrutalButton variant="primary" size="sm" className="w-full">
                      START A PARTY
                    </BrutalButton>
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setOpen(false)}>
                    <BrutalButton variant="accent" size="sm" className="w-full">
                      LOGIN
                    </BrutalButton>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setOpen(false)}>
                    <BrutalButton variant="primary" size="sm" className="w-full">
                      SIGN UP
                    </BrutalButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
