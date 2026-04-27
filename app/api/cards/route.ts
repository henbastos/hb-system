import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// UTC-3 (America/Sao_Paulo — Goiânia does not observe DST)
function scheduledToEvent(scheduledAt: string) {
  const local = new Date(new Date(scheduledAt).getTime() - 3 * 60 * 60 * 1000)
  return {
    date: local.toISOString().slice(0, 10),
    start_time: local.toISOString().slice(11, 19),
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const board = new URL(request.url).searchParams.get('board')
  if (!board) return NextResponse.json({ error: 'Missing board' }, { status: 400 })

  const selectFields = board === 'funil'
    ? '*, deal_services(id, service_type, value, description, created_at)'
    : '*'

  const { data, error } = await supabase
    .from('cards')
    .select(selectFields)
    .eq('user_id', user.id)
    .eq('board', board)
    .order('position', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cards: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  console.log('[DIAG POST /api/cards] body received:', JSON.stringify(body))
  const { deal_services, ...cardData } = body

  const { data: card, error } = await supabase
    .from('cards')
    .insert({ ...cardData, user_id: user.id })
    .select()
    .single()

  console.log('[DIAG POST /api/cards] card inserted:', JSON.stringify(card), 'error:', error?.message)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (card && Array.isArray(deal_services) && deal_services.length > 0) {
    for (const s of deal_services) {
      await supabase.from('deal_services').insert({
        service_type: s.service_type,
        value: Number(s.value) || 0,
        description: s.description ?? null,
        card_id: card.id,
        user_id: user.id,
      })
    }
  }

  console.log('[DIAG POST /api/cards] scheduled_at:', card?.scheduled_at, 'category:', card?.category)

  if (card && card.scheduled_at && card.category) {
    const { date, start_time } = scheduledToEvent(card.scheduled_at)
    const eventPayload = {
      user_id: user.id,
      card_id: card.id,
      title: card.title,
      category: card.category,
      date,
      start_time,
      duration: 0.5,
      day_of_week: null,
      description: card.description ?? null,
      color: null,
      meet_link: null,
    }
    console.log('[DIAG POST /api/cards] inserting event:', JSON.stringify(eventPayload))
    const { data: eventData, error: eventError } = await supabase.from('events').insert(eventPayload).select().single()
    console.log('[DIAG POST /api/cards] event result:', JSON.stringify(eventData), 'error:', eventError?.message)
  } else {
    console.log('[DIAG POST /api/cards] skipping event — condition not met (scheduled_at or category missing)')
  }

  return NextResponse.json({ card })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, user_id: _uid, created_at: _ca, deal_services, ...rest } = body

  const { data: card, error } = await supabase
    .from('cards')
    .update(rest)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (Array.isArray(deal_services)) {
    await supabase.from('deal_services').delete().eq('card_id', id).eq('user_id', user.id)
    for (const s of deal_services) {
      await supabase.from('deal_services').insert({
        service_type: s.service_type,
        value: Number(s.value) || 0,
        description: s.description ?? null,
        card_id: id,
        user_id: user.id,
      })
    }
  }

  // Sync linked event
  const { data: existingEvent } = await supabase
    .from('events')
    .select('id')
    .eq('card_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (card && card.scheduled_at && card.category) {
    const { date, start_time } = scheduledToEvent(card.scheduled_at)
    const eventPayload = {
      title: card.title,
      category: card.category,
      date,
      start_time,
      duration: 0.5,
      day_of_week: null,
      description: card.description ?? null,
    }
    if (existingEvent) {
      await supabase.from('events').update(eventPayload).eq('id', existingEvent.id).eq('user_id', user.id)
    } else {
      await supabase.from('events').insert({
        ...eventPayload,
        user_id: user.id,
        card_id: id,
        color: null,
        meet_link: null,
      })
    }
  } else if (existingEvent) {
    await supabase.from('events').delete().eq('id', existingEvent.id).eq('user_id', user.id)
  }

  return NextResponse.json({ card })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { updates } = await request.json() as {
    updates: Array<{ id: string; column_name: string; position: number }>
  }

  await Promise.all(
    updates.map(({ id, column_name, position }) =>
      supabase
        .from('cards')
        .update({ column_name, position })
        .eq('id', id)
        .eq('user_id', user.id)
    )
  )

  return NextResponse.json({ success: true })
}
