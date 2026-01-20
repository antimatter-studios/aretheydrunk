import "server-only"
import { getAdminClient } from "./supabase/admin"

export type ScopeType = "team" | null

export interface CapabilityRow {
  id: string
  name: string
}

export interface UserCapability {
  capability_id: string
  scope_type: string | null
  scope_id: string | null
}

const capIdCache: Map<string, string> = new Map()

async function getCapabilityId(name: string): Promise<string | null> {
  if (capIdCache.has(name)) return capIdCache.get(name) || null
  const admin = getAdminClient()
  const { data } = await admin.from("capabilities").select("id").eq("name", name).single()
  if (data?.id) {
    capIdCache.set(name, data.id)
    return data.id
  }
  return null
}

export async function listCapabilities(userId: string) {
  const admin = getAdminClient()
  const { data } = await admin.from("user_capabilities").select("capability_id, scope_type, scope_id").eq("user_id", userId)
  return data || []
}

export async function hasCapability(options: {
  userId: string
  name: string
  scopeType?: ScopeType
  scopeId?: string | null
}): Promise<boolean> {
  const { userId, name, scopeType = null, scopeId = null } = options
  const capabilityId = await getCapabilityId(name)
  if (!capabilityId) return false
  const admin = getAdminClient()
  const query = admin
    .from("user_capabilities")
    .select("id")
    .eq("user_id", userId)
    .eq("capability_id", capabilityId)

  // Handle nullable scope columns correctly
  if (scopeType === null) {
    query.is("scope_type", null)
  } else {
    query.eq("scope_type", scopeType)
  }

  if (scopeId === null) {
    query.is("scope_id", null)
  } else {
    query.eq("scope_id", scopeId)
  }

  query.limit(1)
  const { data, error } = await query
  if (error) {
    console.error("[authz] hasCapability error", error)
    return false
  }
  return Array.isArray(data) && data.length > 0
}

export async function requireCapability(options: {
  userId: string
  name: string
  scopeType?: ScopeType
  scopeId?: string | null
}): Promise<void> {
  const ok = await hasCapability(options)
  if (!ok) {
    throw new Error("Forbidden: missing capability")
  }
}
