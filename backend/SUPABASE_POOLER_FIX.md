# Fix for Supabase Connection Pooler "Prepared Statement Already Exists" Error

## Problem
When using Supabase's connection pooler, Prisma throws error:
```
prepared statement "s0" already exists
```

## Root Cause
- Supabase connection pooler uses **PgBouncer in transaction mode**
- PgBouncer reuses connections between transactions
- Prisma tries to create prepared statements that already exist from previous transactions

## Solution

### Update DATABASE_URL in Render

Add `?pgbouncer=true` parameter to your DATABASE_URL:

**Current (Broken):**
```
DATABASE_URL=postgresql://postgres.qxowgfdreqzqtbsoeqlu:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
```

**Fixed:**
```
DATABASE_URL=postgresql://postgres.qxowgfdreqzqtbsoeqlu:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### What This Does
- Tells Prisma to disable prepared statements
- Uses simple query protocol instead
- Prevents statement conflicts in pooled connections

### Performance Impact
- Slightly slower queries (no prepared statement optimization)
- But necessary for connection pooling to work
- Trade-off: scalability vs minor performance hit

## Implementation Steps

1. Go to Render Dashboard → Your service → Environment
2. Find `DATABASE_URL`
3. Click Edit
4. Add `?pgbouncer=true` to the end
5. Click Save
6. Render will auto-redeploy (~2 minutes)

## Alternative: Use Direct Connection (Not Recommended)

If you want to use prepared statements, you'd need direct connection:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.qxowgfdreqzqtbsoeqlu.supabase.co:5432/postgres
```

But this won't work from your local machine (IPv6 issue) and has connection limits.

**Recommendation:** Stick with pooler + pgbouncer parameter.
