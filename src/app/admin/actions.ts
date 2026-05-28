'use server'

import { cookies } from 'next/headers'

export async function adminLogin(password: string): Promise<{ success: boolean; error?: string }> {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return { success: false, error: 'Admin password not configured' }
  if (password !== adminPassword) return { success: false, error: 'Incorrect password' }

  const cookieStore = cookies()
  cookieStore.set('admin_auth', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
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
