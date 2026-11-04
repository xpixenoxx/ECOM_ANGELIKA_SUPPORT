import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Admin-only operations
export async function adminGetUser(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error) throw error;
  return data.user;
}

export async function adminCreateUser(email: string, password: string, userData?: Record<string, any>) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: userData,
  });
  if (error) throw error;
  return data.user;
}

export async function adminUpdateUser(userId: string, updates: Record<string, any>) {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates);
  if (error) throw error;
  return data.user;
}

export async function adminDeleteUser(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
  return true;
}

export async function adminInviteUser(email: string, redirectTo?: string) {
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: redirectTo || `${process.env['NEXT_PUBLIC_SITE_URL']}/auth/callback`,
  });
  if (error) throw error;
  return data.user;
}

export async function adminGenerateLink(type: 'signup' | 'magiclink' | 'recovery', email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type,
    email,
    options: {
      redirectTo: `${process.env['NEXT_PUBLIC_SITE_URL']}/auth/callback`,
    },
  } as any); // Type assertion to handle union type constraints
  if (error) throw error;
  return data.properties?.action_link;
}

// Storage admin
export async function adminUploadFile(bucket: string, path: string, file: File | Buffer, options?: { contentType?: string; upsert?: boolean }) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType,
      upsert: options?.upsert ?? false,
    });
  if (error) throw error;
  return data;
}

export async function adminDeleteFile(bucket: string, paths: string[]) {
  const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);
  if (error) throw error;
  return true;
}

export async function adminGetPublicUrl(bucket: string, path: string) {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function adminCreateSignedUrl(bucket: string, path: string, expiresIn = 3600) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

// Database admin helpers
export async function adminQuery<T>(table: string, query: (q: any) => any) {
  const q = supabaseAdmin.from(table);
  const result = await query(q);
  if (result.error) throw result.error;
  return result.data as T;
}

export async function adminRPC<T>(fn: string, params?: Record<string, any>) {
  const { data, error } = await supabaseAdmin.rpc(fn, params);
  if (error) throw error;
  return data as T;
}

// Realtime admin
export function adminSubscribeToTable(
  table: string,
  callback: (payload: any) => void,
  filter?: string
) {
  let channel = supabaseAdmin.channel(`admin:${table}`);

  if (filter) {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table, filter }, callback);
  } else {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, callback);
  }

  return channel.subscribe();
}

// Analytics helpers
export async function getDashboardStats() {
  const [
    { count: totalUsers },
    { count: totalOrders },
    { count: totalProducts },
    { count: pendingOrders },
    { data: revenueData },
    { data: recentOrders },
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('orders')
      .select('total_amount, created_at')
      .eq('payment_status', 'paid')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabaseAdmin.from('orders')
      .select(`
        id, order_number, total_amount, status, created_at,
        profiles(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const totalRevenue = revenueData?.reduce((sum, o) => sum + o.total_amount, 0) || 0;

  return {
    totalUsers: totalUsers || 0,
    totalOrders: totalOrders || 0,
    totalProducts: totalProducts || 0,
    pendingOrders: pendingOrders || 0,
    totalRevenue,
    recentOrders: recentOrders || [],
  };
}