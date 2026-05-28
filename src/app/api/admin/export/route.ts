import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  // Check admin auth cookie
  const cookieStore = cookies()
  if (cookieStore.get('admin_auth')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const type = request.nextUrl.searchParams.get('type')
  const supabase = createAdminClient()

  if (type === 'users') {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, region, user_type, points, created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const header = 'id,email,name,region,user_type,points,created_at'
    const rows = (data ?? []).map((u) =>
      [u.id, `"${u.email}"`, `"${u.name}"`, `"${u.region ?? ''}"`, u.user_type ?? '', u.points, u.created_at].join(',')
    )
    const csv = [header, ...rows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-${Date.now()}.csv"`,
      },
    })
  }

  if (type === 'actions') {
    const { data, error } = await supabase
      .from('user_actions')
      .select('id, logged_at, notes, users(email, name), actions_library(name, category, co2_saved_kg, money_saved_nzd, points)')
      .order('logged_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const header = 'id,user_email,user_name,action,category,co2_saved_kg,money_saved_nzd,points,logged_at,notes'
    const rows = (data ?? []).map((ua) => {
      const u = ua.users as unknown as { email: string; name: string } | null
      const a = ua.actions_library as unknown as { name: string; category: string; co2_saved_kg: number; money_saved_nzd: number; points: number } | null
      return [
        ua.id,
        `"${u?.email ?? ''}"`,
        `"${u?.name ?? ''}"`,
        `"${a?.name ?? ''}"`,
        a?.category ?? '',
        a?.co2_saved_kg ?? 0,
        a?.money_saved_nzd ?? 0,
        a?.points ?? 0,
        ua.logged_at,
        `"${ua.notes ?? ''}"`,
      ].join(',')
    })
    const csv = [header, ...rows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="actions-${Date.now()}.csv"`,
      },
    })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
