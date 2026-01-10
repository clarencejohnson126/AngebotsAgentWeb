# Supabase Integration for Next.js Applications

## Overview
This skill covers integrating Supabase with Next.js App Router for authentication, database operations, and file storage. Optimized for construction/business applications requiring multi-tenant data isolation and secure document handling.

## When to Use
- Applications requiring user authentication
- Projects needing PostgreSQL database with row-level security
- File upload/storage requirements (PDFs, documents, images)
- Real-time data subscriptions
- Multi-tenant SaaS applications

## Technology Stack
- **BaaS**: Supabase (Auth + Postgres + Storage + Edge Functions)
- **Client**: `@supabase/supabase-js` + `@supabase/ssr`
- **Framework**: Next.js 14+ with App Router
- **ORM**: Direct Supabase client (or Drizzle/Prisma optional)

## Project Structure

```
├── app/
│   ├── [locale]/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (protected)/
│   │   │   ├── layout.tsx        # Auth check wrapper
│   │   │   ├── dashboard/
│   │   │   └── projects/
│   │   └── auth/
│   │       └── callback/route.ts # OAuth callback handler
├── lib/
│   └── supabase/
│       ├── client.ts             # Browser client
│       ├── server.ts             # Server client
│       ├── middleware.ts         # Auth middleware helper
│       └── admin.ts              # Service role client (server only)
├── types/
│   └── database.types.ts         # Generated from Supabase
├── middleware.ts
└── .env.local
```

## Installation

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Server only!
```

## Core Implementation

### 1. Supabase Clients

**Browser Client (`lib/supabase/client.ts`):**
```typescript
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Server Client (`lib/supabase/server.ts`):**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  );
}
```

**Admin Client (`lib/supabase/admin.ts`):**
```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// ONLY use server-side - never expose to client!
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

### 2. Middleware for Auth (`middleware.ts`)

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Protect routes
  const isProtectedRoute = request.nextUrl.pathname.includes('/dashboard') ||
                           request.nextUrl.pathname.includes('/projects');
  
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### 3. Database Schema for AngebotsAgent

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies (multi-tenant root)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  trade TEXT NOT NULL CHECK (trade IN ('drywall', 'screed', 'waterproofing', 'flooring', 'other')),
  address TEXT,
  vat_number TEXT,
  default_markup_percent DECIMAL(5,2) DEFAULT 10.00,
  overhead_percent DECIMAL(5,2) DEFAULT 8.00,
  risk_buffer_percent DECIMAL(5,2) DEFAULT 5.00,
  offer_template_style TEXT DEFAULT 'standard' CHECK (offer_template_style IN ('short', 'standard', 'detailed')),
  default_language TEXT DEFAULT 'de' CHECK (default_language IN ('de', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (linked to Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  title TEXT NOT NULL,
  client_name TEXT,
  client_contact TEXT,
  location TEXT,
  due_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'submitted', 'won', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'tender', 'specs', 'plans', 'other'
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'parsing', 'parsed', 'extracted', 'failed')),
  extraction_data JSONB,  -- Structured extraction results
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Takeoff Results (measurements from plans)
CREATE TABLE takeoff_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  label TEXT NOT NULL,           -- e.g., "Drywall area Level 1"
  measurement_type TEXT NOT NULL, -- 'area', 'length', 'count'
  value DECIMAL(12,3) NOT NULL,
  unit TEXT NOT NULL,            -- 'm²', 'm', 'pcs'
  source_type TEXT NOT NULL,     -- 'extracted', 'measured'
  page_reference TEXT,           -- e.g., "Page 5, Room 1.02"
  polygon_data JSONB,            -- For user-drawn measurements
  confidence DECIMAL(3,2),       -- 0.00 to 1.00
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price Library (per company)
CREATE TABLE price_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  item_code TEXT,
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  trade TEXT,
  category TEXT,
  notes TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, item_code)
);

-- Offer Drafts
CREATE TABLE offer_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft',
  letter_content_de TEXT,
  letter_content_en TEXT,
  assumptions TEXT[],
  exclusions TEXT[],
  payment_terms TEXT,
  validity_days INTEGER DEFAULT 30,
  subtotal DECIMAL(12,2),
  vat_rate DECIMAL(4,2) DEFAULT 19.00,
  vat_amount DECIMAL(12,2),
  total DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offer Line Items
CREATE TABLE offer_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_draft_id UUID NOT NULL REFERENCES offer_drafts(id) ON DELETE CASCADE,
  position_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  takeoff_result_id UUID REFERENCES takeoff_results(id),
  price_library_id UUID REFERENCES price_library(id),
  notes TEXT,
  sort_order INTEGER,
  UNIQUE(offer_draft_id, position_number)
);

-- Risk Flags (Nachtragspotenziale)
CREATE TABLE risk_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  offer_draft_id UUID REFERENCES offer_drafts(id) ON DELETE SET NULL,
  flag_type TEXT NOT NULL, -- 'quantity_mismatch', 'missing_detail', 'conflicting_docs'
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_references JSONB,  -- [{doc_id, page, excerpt}, ...]
  recommended_question TEXT, -- Question to ask main contractor
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE takeoff_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;

-- Users can see their own company's data
CREATE POLICY "Users can view own company" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view company members" ON users
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can manage own company projects" ON projects
  FOR ALL USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can manage project documents" ON documents
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Similar policies for other tables...
```

### 4. Storage Bucket Setup

```sql
-- Create storage bucket for project documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents',
  false,  -- Private bucket
  52428800,  -- 50MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
);

-- Storage policies
CREATE POLICY "Users can upload to own company folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view own company files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM users WHERE id = auth.uid()
  )
);
```

### 5. Type Generation

```bash
# Install Supabase CLI
npm install -D supabase

# Generate types from your database
npx supabase gen types typescript --project-id your-project-id > types/database.types.ts
```

### 6. Authentication Components

**Login Page:**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('auth');
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">{t('login')}</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
      )}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('email')}
        required
        className="w-full p-2 border rounded"
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('password')}
        required
        className="w-full p-2 border rounded"
      />
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white p-2 rounded disabled:opacity-50"
      >
        {loading ? t('loggingIn') : t('login')}
      </button>
    </form>
  );
}
```

### 7. Data Fetching Patterns

**Server Component (recommended):**
```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProjectsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      documents(count),
      offer_drafts(id, status, total)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return <div>Error loading projects</div>;
  }

  return (
    <div>
      {projects?.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

**Client Component with Real-time:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

type Document = Database['public']['Tables']['documents']['Row'];

export function DocumentList({ projectId }: { projectId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .then(({ data }) => setDocuments(data || []));

    // Real-time subscription
    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDocuments((prev) => [...prev, payload.new as Document]);
          } else if (payload.eventType === 'UPDATE') {
            setDocuments((prev) =>
              prev.map((d) => (d.id === payload.new.id ? payload.new as Document : d))
            );
          } else if (payload.eventType === 'DELETE') {
            setDocuments((prev) => prev.filter((d) => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase]);

  return (
    <ul>
      {documents.map((doc) => (
        <li key={doc.id}>{doc.file_name} - {doc.status}</li>
      ))}
    </ul>
  );
}
```

### 8. File Upload

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function FileUpload({ 
  projectId, 
  companyId,
  onUploadComplete 
}: { 
  projectId: string;
  companyId: string;
  onUploadComplete: (doc: any) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // Upload to storage
    const filePath = `${companyId}/${projectId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('project-documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setUploading(false);
      return;
    }

    // Create document record
    const { data: doc, error: dbError } = await supabase
      .from('documents')
      .insert({
        project_id: projectId,
        file_name: file.name,
        file_type: 'other',
        storage_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        status: 'uploaded',
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB error:', dbError);
    } else {
      onUploadComplete(doc);
    }

    setUploading(false);
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept=".pdf"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
      />
      <span className="inline-block px-4 py-2 bg-primary text-white rounded">
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </span>
    </label>
  );
}
```

### 9. Server Actions

```typescript
// app/actions/projects.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!userData?.company_id) throw new Error('No company');

  const { data, error } = await supabase
    .from('projects')
    .insert({
      company_id: userData.company_id,
      created_by: user.id,
      title: formData.get('title') as string,
      client_name: formData.get('clientName') as string,
      due_date: formData.get('dueDate') as string || null,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard');
  return data;
}
```

## Best Practices

1. **Always use RLS**: Never trust client-side filtering alone
2. **Type safety**: Generate and use database types
3. **Server components first**: Fetch data on server when possible
4. **Handle errors gracefully**: Show user-friendly error messages
5. **Optimize queries**: Use `.select()` to limit returned columns
6. **Secure service role**: Never expose service role key to client

## Checklist

- [ ] Set up Supabase project
- [ ] Configure environment variables
- [ ] Create browser and server clients
- [ ] Set up middleware for auth
- [ ] Create database schema with RLS
- [ ] Set up storage bucket with policies
- [ ] Generate TypeScript types
- [ ] Implement authentication flow
- [ ] Test data access with different users
