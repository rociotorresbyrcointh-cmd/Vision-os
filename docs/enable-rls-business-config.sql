-- ============================================================================
-- SCRIPT: Enable RLS on business_config table
-- ============================================================================
--
-- Purpose: Enforce row-level security on business_config to prevent
--          unauthorized access to other users' business configurations
--
-- Prerequisites:
--   - Two Supabase clients configured in /api/register:
--     * supabasePublic (ANON_KEY) for auth.signUp()
--     * supabaseAdmin (SERVICE_ROLE_KEY) for business_config.insert()
--   - Código deployado: commit b3f4a3e or later
--
-- Execution:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste this entire script
--   3. Click "Run"
--   4. Verify: Row Level Security should show "ON" (green) for business_config
--
-- ============================================================================

-- Step 1: Enable Row Level Security on business_config
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can delete own config" ON business_config;
DROP POLICY IF EXISTS "Users can insert own config" ON business_config;
DROP POLICY IF EXISTS "Users can update own config" ON business_config;
DROP POLICY IF EXISTS "Users can view own config" ON business_config;

-- Step 3: Create new RLS policies
-- Policy 1: SELECT - Users can view their own business configuration
CREATE POLICY "Users can view own config" ON business_config
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: INSERT - Users can insert their own configuration during signup
CREATE POLICY "Users can insert own config" ON business_config
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: UPDATE - Users can update their own configuration
CREATE POLICY "Users can update own config" ON business_config
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: DELETE - Users can delete their own configuration
CREATE POLICY "Users can delete own config" ON business_config
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Verification
-- ============================================================================
--
-- After running this script, verify:
--
-- 1. Check RLS status:
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename = 'business_config';
-- Expected: rowsecurity = true
--
-- 2. List created policies:
SELECT
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'business_config'
ORDER BY policyname;
-- Expected: 4 rows (view, insert, update, delete)
--
-- 3. Test isolation (as authenticated user):
-- SELECT * FROM business_config;
-- Expected: Only your own record(s), not other users'
--
-- ============================================================================
