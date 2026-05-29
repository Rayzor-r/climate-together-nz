'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase-server'

function assertAdmin() {
  const cookieStore = cookies()
  if (cookieStore.get('admin_auth')?.value !== 'true') {
    throw new Error('Unauthorized')
  }
}

export async function adminLogin(password: string): Promise<{ success: boolean; error?: string }> {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return { success: false, error: 'Admin password not configured' }
  if (password !== adminPassword) return { success: false, error: 'Incorrect password' }

  const cookieStore = cookies()
  cookieStore.set('admin_auth', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
  })
  return { success: true }
}

export async function adminLogout() {
  const cookieStore = cookies()
  cookieStore.delete('admin_auth')
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}

export async function createChallenge(data: {
  title: string
  description: string
  start_date: string
  end_date: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    assertAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.from('challenges').insert({ ...data, is_active: true })
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function toggleChallenge(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    assertAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.from('challenges').update({ is_active: isActive }).eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    assertAdmin()
    const supabase = createAdminClient()
    // auth.admin.deleteUser removes from auth.users; the ON DELETE CASCADE on
    // the public.users FK then removes their profile row and all user_actions.
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function createGroup(data: {
  name: string
  type: 'school' | 'business' | 'community'
}): Promise<{ success: boolean; error?: string }> {
  try {
    assertAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.from('groups').insert(data)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
