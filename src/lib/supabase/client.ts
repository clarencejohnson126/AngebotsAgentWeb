import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import {
  DEMO_USER,
  DEMO_COMPANY,
  DEMO_DOCUMENTS,
  DEMO_EXTRACTED_DATA,
  DEMO_PRICE_LIBRARY,
  DEMO_RISK_FLAGS,
  DEMO_OFFER_DRAFTS,
  DEMO_OFFER_LINE_ITEMS,
  DEMO_TAKEOFF_RESULTS,
  getAllProjects,
  getDocumentsByProjectId,
  addProject,
  addDocument,
  RUNTIME_PROJECTS,
  RUNTIME_DOCUMENTS,
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

// Check if we're in demo mode (client-side)
function isDemoModeClient(): boolean {
  if (typeof window === 'undefined') return true
  return !process.env.NEXT_PUBLIC_SUPABASE_URL ||
         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
         process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

// =============================================================================
// IN-MEMORY FILE STORAGE FOR DEMO MODE
// =============================================================================

// Global file store for demo mode - stores actual file content
const DEMO_FILE_STORE: Map<string, Blob> = new Map()

export function storeFileForDemo(path: string, file: Blob): void {
  DEMO_FILE_STORE.set(path, file)
}

export function getFileFromDemo(path: string): Blob | null {
  return DEMO_FILE_STORE.get(path) || null
}

// =============================================================================
// MOCK QUERY BUILDER - Properly simulates Supabase query chain
// =============================================================================

function createMockQueryBuilder<T>(initialData: T[]) {
  let data = [...initialData]
  let includeRelations: string[] = []

  const builder: any = {
    select: (columns?: string) => {
      // Parse relation includes like 'offer_line_items(*)'
      if (columns) {
        const relationMatches = columns.match(/(\w+)\(\*\)/g)
        if (relationMatches) {
          includeRelations = relationMatches.map(m => m.replace('(*)', ''))
        }
      }
      return builder
    },
    eq: (column: string, value: any) => {
      data = data.filter((item: any) => item[column] === value)
      return builder
    },
    neq: (column: string, value: any) => {
      data = data.filter((item: any) => item[column] !== value)
      return builder
    },
    gt: (column: string, value: any) => {
      data = data.filter((item: any) => item[column] > value)
      return builder
    },
    lt: (column: string, value: any) => {
      data = data.filter((item: any) => item[column] < value)
      return builder
    },
    in: (column: string, values: any[]) => {
      data = data.filter((item: any) => values.includes(item[column]))
      return builder
    },
    order: (column: string, options?: { ascending?: boolean }) => {
      const asc = options?.ascending !== false
      data.sort((a: any, b: any) => {
        if (a[column] < b[column]) return asc ? -1 : 1
        if (a[column] > b[column]) return asc ? 1 : -1
        return 0
      })
      return builder
    },
    limit: (count: number) => {
      data = data.slice(0, count)
      return builder
    },
    single: async () => {
      const item = data[0] || null

      // Handle relation includes for offer_drafts -> offer_line_items
      if (item && includeRelations.includes('offer_line_items')) {
        (item as any).offer_line_items = DEMO_OFFER_LINE_ITEMS.filter(
          (li) => li.offer_draft_id === (item as any).id
        )
      }

      return { data: item, error: null }
    },
    // Make the builder thenable so it works with await and SWR
    then: (resolve: any) => {
      // Handle relation includes
      const enrichedData = data.map((item: any) => {
        const enriched = { ...item }
        if (includeRelations.includes('offer_line_items')) {
          enriched.offer_line_items = DEMO_OFFER_LINE_ITEMS.filter(
            (li) => li.offer_draft_id === enriched.id
          )
        }
        return enriched
      })
      return Promise.resolve({ data: enrichedData, error: null }).then(resolve)
    },
  }

  return builder
}

function createMockInsertBuilder<T>(tableName: string) {
  let insertData: any = null

  const builder: any = {
    insert: (data: any) => {
      // Use runtime store functions for specific tables
      if (tableName === 'projects') {
        insertData = addProject(data)
      } else if (tableName === 'documents') {
        insertData = addDocument(data)
      } else {
        insertData = { ...data, id: `new-${Date.now()}`, created_at: new Date().toISOString() }
      }
      return builder
    },
    select: () => builder,
    single: async () => ({ data: insertData, error: null }),
    then: (resolve: any) => Promise.resolve({ data: insertData, error: null }).then(resolve),
  }

  return builder
}

function createMockUpdateBuilder<T>(tableName: string, mockData: T[]) {
  let targetId: string | null = null
  let updateData: any = null

  const performUpdate = () => {
    // Find and update the item in the array
    const index = (mockData as any[]).findIndex((i: any) => i.id === targetId)
    if (index !== -1) {
      // Actually update the item in the array
      Object.assign((mockData as any[])[index], updateData)
      return { ...(mockData as any[])[index] }
    }
    // Also check RUNTIME arrays for documents
    if (tableName === 'documents') {
      const runtimeIndex = RUNTIME_DOCUMENTS.findIndex((d: any) => d.id === targetId)
      if (runtimeIndex !== -1) {
        Object.assign(RUNTIME_DOCUMENTS[runtimeIndex], updateData)
        return { ...RUNTIME_DOCUMENTS[runtimeIndex] }
      }
    }
    return null
  }

  const builder: any = {
    update: (data: any) => {
      updateData = data
      return builder
    },
    eq: (column: string, value: any) => {
      if (column === 'id') targetId = value
      return builder
    },
    select: () => builder,
    single: async () => {
      const updatedItem = performUpdate()
      return { data: updatedItem, error: null }
    },
    then: (resolve: any) => {
      const updatedItem = performUpdate()
      return Promise.resolve({ data: updatedItem, error: null }).then(resolve)
    },
  }

  return builder
}

function createMockDeleteBuilder<T>() {
  const builder: any = {
    delete: () => builder,
    eq: () => builder,
    then: (resolve: any) => Promise.resolve({ data: null, error: null }).then(resolve),
  }

  return builder
}

// Mock client for demo mode
function createMockBrowserClient() {
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            user_metadata: DEMO_USER.user_metadata,
          },
        },
        error: null,
      }),
      signInWithPassword: async () => ({
        data: {
          user: {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
          },
          session: { access_token: 'demo-token' },
        },
        error: null,
      }),
      signUp: async () => ({
        data: {
          user: {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
          },
          session: null,
        },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback: any) => {
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: {
              id: DEMO_USER.id,
              email: DEMO_USER.email,
            },
          })
        }, 0)
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
    from: (table: string) => {
      // Get the appropriate mock data - use dynamic functions for runtime data
      const getDataForTable = () => {
        switch (table) {
          case 'companies': return [DEMO_COMPANY]
          case 'company_members': return [{
            id: 'member-001',
            company_id: DEMO_COMPANY.id,
            user_id: DEMO_USER.id,
            role: 'owner',
          }]
          case 'projects': return getAllProjects() // Use dynamic function
          case 'documents': return [...RUNTIME_DOCUMENTS, ...DEMO_DOCUMENTS] // Combine runtime + demo
          case 'extracted_data': return DEMO_EXTRACTED_DATA
          case 'price_library': return DEMO_PRICE_LIBRARY
          case 'risk_flags': return DEMO_RISK_FLAGS
          case 'offer_drafts': return DEMO_OFFER_DRAFTS
          case 'offer_line_items': return DEMO_OFFER_LINE_ITEMS
          case 'takeoff_results': return DEMO_TAKEOFF_RESULTS
          default: return []
        }
      }

      const mockData = getDataForTable() as any[]

      return {
        select: (columns?: string) => createMockQueryBuilder(mockData).select(columns),
        insert: (data: any) => createMockInsertBuilder(table).insert(data),
        update: (data: any) => createMockUpdateBuilder(table, mockData).update(data),
        delete: () => createMockDeleteBuilder(),
      }
    },
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: File | Blob) => {
          // Store actual file content in memory for demo mode
          const storagePath = `${bucket}/${path}`
          DEMO_FILE_STORE.set(storagePath, file)
          console.log(`[Demo Storage] Stored file: ${storagePath} (${file.size} bytes)`)
          return {
            data: { path: storagePath },
            error: null,
          }
        },
        download: async (path: string) => {
          // Retrieve actual file content from memory
          const storagePath = path.startsWith(bucket) ? path : `${bucket}/${path}`
          const file = DEMO_FILE_STORE.get(storagePath) || DEMO_FILE_STORE.get(path)
          if (file) {
            console.log(`[Demo Storage] Retrieved file: ${path} (${file.size} bytes)`)
            return { data: file, error: null }
          }
          console.log(`[Demo Storage] File not found: ${path}`)
          return { data: new Blob(['Demo file content']), error: null }
        },
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `/demo/storage/${bucket}/${path}` },
        }),
        remove: async (paths: string[]) => {
          // Remove from memory
          for (const path of paths) {
            DEMO_FILE_STORE.delete(path)
            DEMO_FILE_STORE.delete(`${bucket}/${path}`)
          }
          return { data: [], error: null }
        },
      }),
    },
  }
}

export function createClient() {
  // Return mock client if in demo mode
  if (isDemoModeClient()) {
    return createMockBrowserClient() as any
  }

  const realClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

// Export demo mode check for client components
export { isDemoModeClient as isDemoMode }
