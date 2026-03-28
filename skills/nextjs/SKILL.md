---
name: nextjs
displayName: Next.js
emoji: ⚡
vibe: Server-first React with type-safe data flows
category: frontend
description: Next.js 15+ App Router development patterns including Server Components, Client Components, data fetching, layouts, and server actions. Use when creating pages, routes, layouts, components, API route handlers, server actions, loading states, error boundaries, or working with Next.js navigation and metadata.
version: 1.0.0
maturity: seed
evolution_count: 0
tags:
  - nextjs
  - react
  - typescript
triggers:
  - creating a Next.js page, layout, or route
  - adding a Server Component or Client Component
  - implementing a server action or API route handler
  - working with App Router navigation, metadata, or loading states
  - setting up data fetching with fetch, cache, or revalidate
  - adding error boundaries or suspense boundaries
---

# Next.js Development Guidelines

Development patterns for Next.js 15+ using the App Router, Server Components, and modern data fetching.

## Communication Style
- Code examples for every pattern (not theory-heavy)
- Assume React fundamentals + TypeScript familiarity
- Highlight gotchas explicitly with ⚠️ warnings
- Server Components by default (Client Components when needed)
- Show both file structure AND code

## Success Metrics
- ✅ Zero client-side data fetching (use Server Components)
- ✅ Lighthouse Performance >90
- ✅ Type-safe data flows (TypeScript strict mode)
- ✅ All async routes have loading.tsx + error.tsx
- ✅ Bundle size <200KB (initial client load)

<!-- ZONE:STABLE -->
## Core Principles

1. **Server-First Architecture**: Default to Server Components, use Client Components only when needed
2. **File-Based Routing**: Use App Router conventions for pages, layouts, and route handlers
3. **Data Fetching**: Fetch data where it's needed using async/await in Server Components
4. **Type Safety**: Leverage TypeScript for route params, search params, and data types
5. **Performance**: Optimize with streaming, parallel data fetching, and static generation

## App Router Structure

### File Conventions

```
app/
├── layout.tsx              # Root layout (required)
├── page.tsx               # Home page
├── loading.tsx            # Loading UI
├── error.tsx              # Error boundary
├── not-found.tsx          # 404 page
├── posts/
│   ├── layout.tsx         # Posts layout
│   ├── page.tsx          # /posts
│   ├── [id]/
│   │   └── page.tsx      # /posts/123
│   └── new/
│       └── page.tsx      # /posts/new
└── api/
    └── posts/
        └── route.ts      # API route handler
```

### Page Component

```typescript
// app/posts/page.tsx
import { getPosts } from '@/lib/api';

export const metadata = {
  title: 'Posts',
  description: 'Browse all blog posts'
};

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <a href={`/posts/${post.id}`}>{post.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Dynamic Routes

```typescript
// app/posts/[id]/page.tsx
import { getPost } from '@/lib/api';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);
  return {
    title: post.title,
    description: post.excerpt
  };
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

## Server vs Client Components

### Server Components (Default)

Use for:
- Data fetching
- Accessing backend resources
- Keeping sensitive info on server
- Reducing client-side JavaScript

```typescript
// app/posts/page.tsx (Server Component by default)
import { db } from '@/lib/db';

export default async function PostsPage() {
  // Direct database access
  const posts = await db.post.findMany();

  return <PostList posts={posts} />;
}
```

### Client Components

Use for:
- Event listeners (onClick, onChange, etc.)
- State and lifecycle (useState, useEffect)
- Browser-only APIs
- Custom hooks

```typescript
// components/SearchBar.tsx
'use client'; // Required directive

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${query}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search posts..."
      />
      <button type="submit">Search</button>
    </form>
  );
}
```

### Composition Pattern

```typescript
// app/posts/page.tsx (Server Component)
import { getPosts } from '@/lib/api';
import { SearchBar } from '@/components/SearchBar'; // Client Component

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <SearchBar /> {/* Client Component for interactivity */}
      <PostList posts={posts} /> {/* Can be Server Component */}
    </div>
  );
}
```

## Data Fetching

### Basic Pattern

```typescript
// Server Component with async/await
export default async function PostsPage() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 } // Cache for 1 hour
  }).then(res => res.json());

  return <PostList posts={posts} />;
}
```

### Parallel Data Fetching

```typescript
export default async function DashboardPage() {
  // Fetch in parallel
  const [user, posts, stats] = await Promise.all([
    getUser(),
    getPosts(),
    getStats()
  ]);

  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={posts} />
      <Stats data={stats} />
    </div>
  );
}
```

### Streaming with Suspense

```typescript
import { Suspense } from 'react';

export default function PostsPage() {
  return (
    <div>
      <h1>Posts</h1>
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
    </div>
  );
}

async function Posts() {
  const posts = await getPosts(); // Slow data fetch
  return <PostList posts={posts} />;
}
```

## Layouts

### Root Layout (Required)

```typescript
// app/layout.tsx
import './globals.css';

export const metadata = {
  title: {
    default: 'My Blog',
    template: '%s | My Blog'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>{/* Navigation */}</nav>
        </header>
        <main>{children}</main>
        <footer>{/* Footer */}</footer>
      </body>
    </html>
  );
}
```

### Nested Layout

```typescript
// app/posts/layout.tsx
export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <aside>
        <PostsSidebar />
      </aside>
      <div>{children}</div>
    </div>
  );
}
```

## Route Handlers (API Routes)

### Basic Handler

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const posts = await getPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const post = await createPost(body);
  return NextResponse.json({ post }, { status: 201 });
}
```

### Dynamic Route Handler

```typescript
// app/api/posts/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await getPost(params.id);

  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ post });
}
```

## Server Actions

### Basic Server Action

```typescript
// app/actions/posts.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  const post = await db.post.create({
    data: { title, content }
  });

  revalidatePath('/posts');
  redirect(`/posts/${post.id}`);
}
```

### Using in Forms

```typescript
import { createPost } from '@/app/actions/posts';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

## Navigation

### Link Component

```typescript
import Link from 'next/link';

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.id}`} prefetch={true}>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
    </Link>
  );
}
```

### Programmatic Navigation

```typescript
'use client';

import { useRouter } from 'next/navigation';

export function PostActions({ postId }: { postId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    await deletePost(postId);
    router.push('/posts');
    router.refresh(); // Refresh server components
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

### Router Hooks

```typescript
'use client';

import { usePathname, useSearchParams } from 'next/navigation';

const pathname = usePathname(); // /posts/123
const searchParams = useSearchParams(); // ?q=hello
const query = searchParams.get('q');
```

## Metadata

```typescript
// Static metadata
export const metadata = {
  title: 'All Posts',
  description: 'Browse our collection of blog posts'
};

// Dynamic metadata
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);
  return {
    title: post.title,
    description: post.excerpt
  };
}
```

## Error Handling

```typescript
// app/posts/error.tsx
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

// app/posts/[id]/not-found.tsx
export default function NotFound() {
  return <div>Post Not Found</div>;
}
```

## Static Generation & ISR

```typescript
// Generate static pages at build time
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ id: post.id }));
}

// Revalidate every hour (ISR)
export const revalidate = 3600;

export default async function PostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const post = await getPost(id);
  return <Post data={post} />;
}
```

## Anti-Patterns (Don't Do This)

### ❌ Client-Side Data Fetching in useEffect

```tsx
// BAD: Unnecessary client work + waterfall requests
'use client'
function Page() {
  const [data, setData] = useState()
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  }, [])
  return data ? <Display data={data} /> : 'Loading...'
}
```

**Why it's bad:**
- Adds client JS bundle
- Waterfall: HTML → hydrate → fetch → render
- No SEO (content arrives late)

**✅ Do this instead:**
```tsx
// GOOD: Fetch on server, send HTML
async function Page() {
  const data = await fetch('/api/data').then(r => r.json())
  return <Display data={data} />
}
```

---

### ❌ Missing Error Boundaries

```tsx
// BAD: No error.tsx, crashes bubble to root
app/
├── users/
│   └── page.tsx  // async, can throw
```

**What happens:** Unhandled errors crash entire app.

**✅ Do this instead:**
```tsx
// GOOD: error.tsx handles crashes gracefully
app/
├── users/
│   ├── page.tsx   // async
│   ├── error.tsx  // handles errors
│   └── loading.tsx // handles suspense
```

---

### ❌ Everything in /app (Flat Structure)

```tsx
// BAD: Hard to navigate, no colocation
app/
├── page.tsx
├── UserCard.tsx
├── UserList.tsx
├── users/
│   └── page.tsx
```

**Why it's bad:** Components scattered, hard to find what belongs to which route.

**✅ Do this instead:**
```tsx
// GOOD: Colocate components with routes
app/
├── page.tsx
├── users/
│   ├── page.tsx
│   └── _components/
│       ├── UserCard.tsx
│       └── UserList.tsx
components/  # Only truly shared components
```

---

### ❌ Using 'use client' Everywhere

```tsx
// BAD: Marking everything as client
'use client'
import { useState } from 'react'

export default function Layout({ children }) {
  return <div>{children}</div>
}
```

**Why it's bad:** Forces entire tree client-side, loses Server Component benefits.

**✅ Do this instead:**
```tsx
// GOOD: Server Component by default
export default function Layout({ children }) {
  return (
    <div>
      <Header />
      {children}
      <ClientSidebar /> {/* Only this is 'use client' */}
    </div>
  )
}
```

⚠️ **Mark Client Components at the boundary only** — Start with Server Components, add `'use client'` only where needed.

## Additional Resources

For detailed information, see:
- [Server Actions Guide](resources/server-actions.md)
- [Data Fetching Patterns](resources/data-fetching.md)
- [Routing and Navigation](resources/routing.md)
- [Performance Optimization](resources/performance.md)

<!-- ZONE:APPEND -->
## Lessons Learned

### 2026-03-06 — `output: "export"` for static Next.js builds

When building a Next.js app as a fully static site (no server), set `output: "export"` in `next.config.ts`. This generates a static export in `out/` instead of the `.next/standalone` server bundle.

```ts
// next.config.ts
const nextConfig: NextConfig = {
  output: "export",
}
```

Without this, `next build` produces a server bundle that won't work when deployed as static files. The error is usually "cannot find module" or a runtime crash at the hosting layer. [global]

---

### 2026-03-06 — Next.js standalone needs env vars at BOTH build time and runtime

For standalone deployments, `NEXT_PUBLIC_*` vars must be present at build time — they get inlined into the client bundle. If missing at build time, they bake as `undefined` even if you set them correctly at runtime.

Pattern for Docker: pass env vars via `--build-arg` AND set them in the container runtime config. [project:respec]

---

### 2026-03-27 — Monorepo package name mismatch causes cryptic import errors

In the Respec monorepo, `@respec/core` was imported everywhere but the actual `package.json` defined it as `@respec-gtc/core`. This caused 31 "cannot find module" errors at build.

The error looks like a missing npm dependency, not a naming mismatch. Check `package.json#name` first.

```jsonc
// package.json
{ "name": "@respec-gtc/core" }  // actual name

// broken import — wrong name, fails silently in dev
import { something } from "@respec/core"
```

In a pnpm workspace, symlinks are keyed by the exact `name` field. [project:respec]

---

### 2026-03-25 — Google OAuth `createUser()` — use object params not positional args

When adding OAuth (no password), a `createUser(email, passwordHash, role)` function with positional args breaks. Refactor to object param so optional fields (`name?`, `avatar?`, `provider?`) can be added without touching every callsite.

```ts
// BAD: breaks when fields become optional
createUser(email, passwordHash, role)

// GOOD: extensible
createUser({ email, passwordHash, name, avatar, provider })
```
[project:respec]

<!-- ZONE:APPEND -->
## Changelog

- **2026-02-18**: `generateStaticParams` must return plain objects, not class instances. Prisma results need `.map(p => ({ id: p.id }))` transformation or you get cryptic serialization errors at build time.
- **2026-02-17**: When using `revalidatePath` in a server action, the revalidation only applies to the specific layout segment — not child pages. Use `revalidatePath('/posts', 'layout')` to bust the whole subtree.
- **2026-02-15**: `unstable_cache` with `fetch` inside a server component creates a double-cache situation. Pick one: either use `fetch` with `next.revalidate` OR use `unstable_cache` wrapping a direct DB call. Never both.

<!-- Test edit for GWS sync - 2026-03-23 16:24 -->
