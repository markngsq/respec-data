---
name: prisma
emoji: 🗄️
vibe: Type-safe database queries with zero boilerplate
category: backend
description: Prisma ORM patterns including Prisma Client usage, queries, mutations, relations, transactions, and schema management. Use when working with Prisma database operations or schema definitions.
maturity: seed
evolution_count: 0
tags:
  - prisma
  - postgres
  - mysql
  - database
triggers:
  - writing a Prisma query, mutation, or relation
  - updating schema.prisma or running a migration
  - working with Prisma transactions or nested writes
  - debugging a Prisma query or N+1 problem
  - seeding the database or using Prisma Client
---

# Prisma ORM Patterns

## Communication Style
- Show both schema definition AND TypeScript usage
- Point out performance implications (N+1, missing indexes)
- Include migration commands alongside schema changes
- Assume SQL fundamentals (JOIN, transaction isolation)

## Success Metrics
- ✅ Zero N+1 queries (use `include` or batch operations)
- ✅ All relations have proper indexes
- ✅ Transactions used for multi-step writes
- ✅ Type-safe queries (no `as any` casts)
- ✅ Migrations run before deployment

<!-- ZONE:STABLE -->
## Purpose

Complete patterns for using Prisma ORM effectively, including query optimization, transaction handling, and the repository pattern for clean data access.

## When to Use This Skill

- Working with Prisma Client for database queries
- Creating repositories for data access
- Using transactions
- Query optimization and N+1 prevention
- Handling Prisma errors

---

## Basic Prisma Usage

### Core Query Patterns

```typescript
import { PrismaService } from '@project-lifecycle-portal/database';

// Always use PrismaService.main
if (!PrismaService.isAvailable) {
    throw new Error('Prisma client not initialized');
}

// Find one
const user = await PrismaService.main.user.findUnique({
    where: { id: userId },
});

// Find many with filters
const users = await PrismaService.main.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
});

// Create
const newUser = await PrismaService.main.user.create({
    data: {
        email: 'user@example.com',
        name: 'John Doe',
    },
});

// Update
const updated = await PrismaService.main.user.update({
    where: { id: userId },
    data: { name: 'Jane Doe' },
});

// Delete
await PrismaService.main.user.delete({
    where: { id: userId },
});
```

### Complex Filtering

```typescript
// Multiple conditions
const users = await PrismaService.main.user.findMany({
    where: {
        email: { contains: '@example.com' },
        isActive: true,
        createdAt: { gte: new Date('2024-01-01') },
    },
});

// AND/OR conditions
const posts = await PrismaService.main.post.findMany({
    where: {
        AND: [
            { published: true },
            { author: { isActive: true } },
        ],
        OR: [
            { title: { contains: 'prisma' } },
            { content: { contains: 'prisma' } },
        ],
    },
});
```

---

## Repository Pattern

### When to Use Repositories

✅ **Use repositories when:**
- Complex queries with joins/includes
- Query used in multiple places
- Need to mock for testing

❌ **Skip repositories for:**
- Simple one-off queries
- Prototyping

### Repository Template

```typescript
import { PrismaService } from '@project-lifecycle-portal/database';
import type { User, Prisma } from '@prisma/client';

export class UserRepository {
    async findById(id: string): Promise<User | null> {
        return PrismaService.main.user.findUnique({
            where: { id },
            include: { profile: true },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return PrismaService.main.user.findUnique({
            where: { email },
        });
    }

    async findActive(): Promise<User[]> {
        return PrismaService.main.user.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return PrismaService.main.user.create({ data });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return PrismaService.main.user.update({ where: { id }, data });
    }

    async delete(id: string): Promise<void> {
        await PrismaService.main.user.delete({ where: { id } });
    }
}
```

### Using in Service

```typescript
export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async getById(id: string): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}
```

---

## Transaction Patterns

### Simple Transaction

```typescript
const result = await PrismaService.main.$transaction(async (tx) => {
    const user = await tx.user.create({
        data: { email: 'user@example.com', name: 'John' },
    });

    const profile = await tx.userProfile.create({
        data: { userId: user.id, bio: 'Developer' },
    });

    return { user, profile };
});
```

### Interactive Transaction

```typescript
const result = await PrismaService.main.$transaction(
    async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        const updated = await tx.user.update({
            where: { id: userId },
            data: { lastLogin: new Date() },
        });

        await tx.auditLog.create({
            data: { userId, action: 'LOGIN', timestamp: new Date() },
        });

        return updated;
    },
    {
        maxWait: 5000,   // Wait max 5s to start
        timeout: 10000,  // Timeout after 10s
    }
);
```

---

## Query Optimization

### Use select to Limit Fields

```typescript
// ❌ Fetches all fields
const users = await PrismaService.main.user.findMany();

// ✅ Only fetch needed fields
const users = await PrismaService.main.user.findMany({
    select: {
        id: true,
        email: true,
        name: true,
    },
});

// ✅ Select with relations
const users = await PrismaService.main.user.findMany({
    select: {
        id: true,
        email: true,
        profile: {
            select: { firstName: true, lastName: true },
        },
    },
});
```

### Use include Carefully

```typescript
// ❌ Excessive includes
const user = await PrismaService.main.user.findUnique({
    where: { id },
    include: {
        posts: { include: { comments: true } },
        workflows: { include: { steps: { include: { actions: true } } } },
    },
});

// ✅ Only include what you need
const user = await PrismaService.main.user.findUnique({
    where: { id },
    include: { profile: true },
});
```

---

## N+1 Query Prevention

### Problem

```typescript
// ❌ N+1 Query Problem
const users = await PrismaService.main.user.findMany(); // 1 query

for (const user of users) {
    // N additional queries
    const profile = await PrismaService.main.userProfile.findUnique({
        where: { userId: user.id },
    });
}
```

### Solution 1: Use include

```typescript
// ✅ Single query with include
const users = await PrismaService.main.user.findMany({
    include: { profile: true },
});

for (const user of users) {
    console.log(user.profile.bio);
}
```

### Solution 2: Batch Query

```typescript
// ✅ Batch query
const users = await PrismaService.main.user.findMany();
const userIds = users.map(u => u.id);

const profiles = await PrismaService.main.userProfile.findMany({
    where: { userId: { in: userIds } },
});

const profileMap = new Map(profiles.map(p => [p.userId, p]));
```

---

## Relations

### One-to-Many

```typescript
// Get user with posts
const user = await PrismaService.main.user.findUnique({
    where: { id: userId },
    include: {
        posts: {
            where: { published: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
        },
    },
});
```

### Nested Writes

```typescript
// Create user with profile
const user = await PrismaService.main.user.create({
    data: {
        email: 'user@example.com',
        name: 'John Doe',
        profile: {
            create: {
                bio: 'Developer',
                avatar: 'avatar.jpg',
            },
        },
    },
    include: { profile: true },
});

// Update with nested updates
const user = await PrismaService.main.user.update({
    where: { id: userId },
    data: {
        name: 'Jane Doe',
        profile: {
            update: { bio: 'Senior developer' },
        },
    },
});
```

---

## Error Handling

### Prisma Error Codes

```typescript
import { Prisma } from '@prisma/client';

try {
    await PrismaService.main.user.create({
        data: { email: 'user@example.com' },
    });
} catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint violation
        if (error.code === 'P2002') {
            throw new ConflictError('Email already exists');
        }

        // P2003: Foreign key constraint failed
        if (error.code === 'P2003') {
            throw new ValidationError('Invalid reference');
        }

        // P2025: Record not found
        if (error.code === 'P2025') {
            throw new NotFoundError('Record not found');
        }
    }

    Sentry.captureException(error);
    throw error;
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| P2002 | Unique constraint violation |
| P2003 | Foreign key constraint failed |
| P2025 | Record not found |
| P2014 | Relation violation |

---

## Advanced Patterns

### Aggregations

```typescript
// Count
const count = await PrismaService.main.user.count({
    where: { isActive: true },
});

// Aggregate
const stats = await PrismaService.main.post.aggregate({
    _count: true,
    _avg: { views: true },
    _sum: { likes: true },
    where: { published: true },
});

// Group by
const postsByAuthor = await PrismaService.main.post.groupBy({
    by: ['authorId'],
    _count: { id: true },
});
```

### Upsert

```typescript
// Update if exists, create if not
const user = await PrismaService.main.user.upsert({
    where: { email: 'user@example.com' },
    update: { lastLogin: new Date() },
    create: {
        email: 'user@example.com',
        name: 'John Doe',
    },
});
```

---

## TypeScript Patterns

```typescript
import type { User, Prisma } from '@prisma/client';

// Create input type
const createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
    return PrismaService.main.user.create({ data });
};

// Include type
type UserWithProfile = Prisma.UserGetPayload<{
    include: { profile: true };
}>;

const user: UserWithProfile = await PrismaService.main.user.findUnique({
    where: { id },
    include: { profile: true },
});
```

---

## Anti-Patterns (Don't Do This)

### ❌ N+1 Queries (Fetching in Loops)

```ts
// BAD: N+1 queries (1 query for users + N queries for posts)
const users = await prisma.user.findMany()
for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { authorId: user.id }
  })
  console.log(`${user.name} has ${posts.length} posts`)
}
```

**Why it's bad:** If you have 100 users, this executes 101 queries!

**✅ Do this instead:**
```ts
// GOOD: Single query with include
const users = await prisma.user.findMany({
  include: { posts: true }
})
users.forEach(user => {
  console.log(`${user.name} has ${user.posts.length} posts`)
})

// OR: Batch query with grouping
const [users, posts] = await Promise.all([
  prisma.user.findMany(),
  prisma.post.findMany()
])
const postsByUser = posts.reduce((acc, post) => {
  acc[post.authorId] = acc[post.authorId] || []
  acc[post.authorId].push(post)
  return acc
}, {})
```

---

### ❌ Missing Indexes on Foreign Keys

```prisma
// BAD: No index on foreign key
model Post {
  id       String @id
  authorId String  // ⚠️ No @@index!
  author   User   @relation(fields: [authorId], references: [id])
}
```

**Why it's bad:** Queries like `prisma.post.findMany({ where: { authorId: 'x' } })` will be slow (full table scan).

**✅ Do this instead:**
```prisma
// GOOD: Index on foreign key
model Post {
  id       String @id
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
  
  @@index([authorId])  // ✅ Index for fast lookups
}
```

---

### ❌ Multi-Step Writes Without Transactions

```ts
// BAD: Not atomic — can fail halfway through
const user = await prisma.user.create({ data: { name: 'Alice' } })
await prisma.profile.create({ data: { userId: user.id, bio: 'Hello' } })
// ⚠️ If this fails, user exists but has no profile!
```

**Why it's bad:** If the second operation fails, you're left with inconsistent data.

**✅ Do this instead:**
```ts
// GOOD: Atomic transaction
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { name: 'Alice' } })
  await tx.profile.create({ data: { userId: user.id, bio: 'Hello' } })
})
// Both succeed or both fail
```

---

### ❌ Selecting All Fields When You Need Few

```ts
// BAD: Fetching entire user object when you only need name
const users = await prisma.user.findMany()  // Returns id, email, password, etc.
return users.map(u => u.name)
```

**Why it's bad:** Wastes bandwidth, exposes sensitive fields (password hashes), slower queries.

**✅ Do this instead:**
```ts
// GOOD: Select only needed fields
const users = await prisma.user.findMany({
  select: { name: true }
})
return users.map(u => u.name)
```

---

## Best Practices

1. **Always Use PrismaService.main** - Never create new PrismaClient instances
2. **Use Repositories for Complex Queries** - Keep data access organized
3. **Select Only Needed Fields** - Improve performance with select
4. **Prevent N+1 Queries** - Use include or batch queries
5. **Use Transactions** - Ensure atomicity for multi-step operations
6. **Handle Errors** - Check for specific Prisma error codes

---

**Related Skills:**
- **backend-dev-guidelines** - Complete backend architecture guide
- **nodejs** - Core Node.js patterns and async handling
- **express** - Express.js routing and middleware

<!-- ZONE:APPEND -->
## Lessons Learned

<!-- ZONE:APPEND -->
## Changelog
