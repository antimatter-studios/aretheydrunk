import type React from "react"
import { Header } from "@/components/header"

export default function WithHeaderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
