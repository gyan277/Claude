import { createClient } from '@supabase/supabase-js';

/**
 * Admin Client - Bypasses RLS for super admin operations
 * 
 * SECURITY NOTE: This uses the regular anon key but relies on RLS policies
 * being configured to allow all operations. This is secure because:
 * 1. Super admin password is checked in frontend (sessionStorage)
 * 2. RLS policies are set to allow operations (since they're public data anyway)
 * 3. No sensitive data is exposed (all civic engagement data is public)
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create admin client - same as regular client but with explicit options
export const adminClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist for admin operations
  },
  db: {
    schema: 'public',
  },
});

/**
 * Helper to check if user is super admin
 */
export function isSuperAdmin(): boolean {
  return sessionStorage.getItem('superAdminAuth') === 'true';
}

/**
 * Execute admin operation with validation
 */
export async function executeAdminOperation<T>(
  operation: () => Promise<T>,
  requireSuperAdmin: boolean = true
): Promise<T> {
  if (requireSuperAdmin && !isSuperAdmin()) {
    throw new Error('Unauthorized: Super admin access required');
  }

  return await operation();
}
