import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/admin');
  }

  const { data: isAdmin, error } = await supabase.rpc('is_admin');

  if (error || !isAdmin) {
    redirect('/');
  }

  return <AdminDashboardClient />;
}
