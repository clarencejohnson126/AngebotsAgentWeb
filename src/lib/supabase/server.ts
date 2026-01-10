import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import {
  isDemoMode,
  DEMO_USER,
  DEMO_COMPANY,
  DEMO_PROJECTS,
  DEMO_DOCUMENTS,
  DEMO_EXTRACTED_DATA,
  DEMO_PRICE_LIBRARY,
  DEMO_RISK_FLAGS,
  DEMO_OFFER_DRAFTS,
  DEMO_OFFER_LINE_ITEMS,
  DEMO_TAKEOFF_RESULTS,
} from '@/lib/mock-data'

// Table name mapping - maps app table names to actual database table names
const TABLE_NAME_MAP: Record<string, string> = {
  'companies': 'angebots_companies',
  'company_members': 'angebots_company_members',
  'projects': 'angebots_projects',
  'documents': 'angebots_documents',
  'extracted_data': 'angebots_extracted_data',
  'takeoff_results': 'angebots_takeoff_results',
  'price_library': 'angebots_price_library',
  'offer_drafts': 'angebots_offer_drafts',
  'offer_line_items': 'angebots_offer_line_items',
  'risk_flags': 'angebots_risk_flags',
  'export_bundles': 'angebots_export_bundles',
}

// =============================================================================
// MOCK SUPABASE CLIENT FOR DEMO MODE
// =============================================================================

type MockQueryResult<T> = {
  data: T | null
  error: null
}

type MockQueryBuilder<T> = {
  select: (columns?: string) => MockQueryBuilder<T>
  eq: (column: string, value: any) => MockQueryBuilder<T>
  neq: (column: string, value: any) => MockQueryBuilder<T>
  order: (column: string, options?: { ascending?: boolean }) => MockQueryBuilder<T>
  limit: (count: number) => MockQueryBuilder<T>
  single: () => Promise<MockQueryResult<T extends any[] ? T[0] : T>>
  then: <R>(resolve: (result: MockQueryResult<T>) => R) => Promise<R>
}

function createMockQueryBuilder<T>(data: T[]): MockQueryBuilder<T[]> {
  let filteredData = [...data]

  const builder: MockQueryBuilder<T[]> = {
    select: () => builder,
    eq: (column: string, value: any) => {
      filteredData = filteredData.filter((item: any) => item[column] === value)
      return builder
    },
    neq: (column: string, value: any) => {
      filteredData = filteredData.filter((item: any) => item[column] !== value)
      return builder
    },
    order: (column: string, options?: { ascending?: boolean }) => {
      const asc = options?.ascending !== false
      filteredData.sort((a: any, b: any) => {
        if (a[column] < b[column]) return asc ? -1 : 1
        if (a[column] > b[column]) return asc ? 1 : -1
        return 0
      })
      return builder
    },
    limit: (count: number) => {
      filteredData = filteredData.slice(0, count)
      return builder
    },
    single: async () => ({
      data: filteredData[0] || null,
      error: null,
    }),
    then: async <R>(resolve: (result: MockQueryResult<T[]>) => R) => {
      return resolve({ data: filteredData, error: null })
    },
  }

  return builder
}

function createMockSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: DEMO_USER },
        error: null,
      }),
      signInWithPassword: async () => ({
        data: { user: DEMO_USER, session: { access_token: 'demo-token' } },
        error: null,
      }),
      signOut: async () => ({ error: null }),
    },
    from: (table: string) => {
      switch (table) {
        case 'companies':
          return createMockQueryBuilder([DEMO_COMPANY])
        case 'company_members':
          return createMockQueryBuilder([{
            id: 'member-001',
            company_id: DEMO_COMPANY.id,
            user_id: DEMO_USER.id,
            role: 'owner',
            companies: DEMO_COMPANY,
          }])
        case 'projects':
          return createMockQueryBuilder(DEMO_PROJECTS)
        case 'documents':
          return createMockQueryBuilder(DEMO_DOCUMENTS)
        case 'extracted_data':
          return createMockQueryBuilder(DEMO_EXTRACTED_DATA)
        case 'price_library':
          return createMockQueryBuilder(DEMO_PRICE_LIBRARY)
        case 'risk_flags':
          return createMockQueryBuilder(DEMO_RISK_FLAGS)
        case 'offer_drafts':
          return createMockQueryBuilder(DEMO_OFFER_DRAFTS)
        case 'offer_line_items':
          return createMockQueryBuilder(DEMO_OFFER_LINE_ITEMS)
        case 'takeoff_results':
          return createMockQueryBuilder(DEMO_TAKEOFF_RESULTS)
        default:
          return createMockQueryBuilder([])
      }
    },
    storage: {
      from: (bucket: string) => ({
        upload: async () => ({ data: { path: '/demo/upload' }, error: null }),
        download: async () => ({ data: new Blob(), error: null }),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `/demo/storage/${bucket}/${path}` },
        }),
      }),
    },
  }
}

// =============================================================================
// REAL SUPABASE CLIENT
// =============================================================================

export async function createServerSupabaseClient() {
  // Return mock client if in demo mode
  if (isDemoMode()) {
    return createMockSupabaseClient() as any
  }

  const cookieStore = await cookies()

  const realClient = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )

  // Wrap client to map table names to angebots_ prefixed tables
  return {
    ...realClient,
    auth: realClient.auth,
    storage: realClient.storage,
    from: (table: string) => {
      const actualTable = TABLE_NAME_MAP[table] || table
      return realClient.from(actualTable as any)
    },
  } as any
}

export async function getUser() {
  // Return demo user if in demo mode
  if (isDemoMode()) {
    return DEMO_USER
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getUserCompany() {
  // Return demo company if in demo mode
  if (isDemoMode()) {
    return {
      companyId: DEMO_COMPANY.id,
      role: 'owner' as const,
      company: DEMO_COMPANY,
    }
  }

  const supabase = await createServerSupabaseClient()
  const user = await getUser()

  if (!user) {
    return null
  }

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role, companies(*)')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return null
  }

  return {
    companyId: membership.company_id,
    role: membership.role,
    company: membership.companies,
  }
}

// Check if demo mode is active
export { isDemoMode }

// Alias for backward compatibility with API routes
export { createServerSupabaseClient as createClient }
