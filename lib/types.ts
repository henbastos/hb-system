export interface Cost {
  id: string
  user_id: string
  name: string
  value: number
  category: string
  created_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  category: string
  color?: string | null
  start_time: string
  duration: number
  day_of_week?: number | null
  recurrence_days?: number[] | null
  date?: string | null
  description?: string | null
  meet_link?: string | null
  card_id?: string | null
  created_at: string
}

export interface DealService {
  id?: string
  card_id?: string
  user_id?: string
  service_type: string
  value: number
  description?: string | null
  created_at?: string
}

export interface KanbanCard {
  id: string
  user_id: string
  board: string
  column_name: string
  title: string
  description?: string | null
  tags?: string[] | null
  scheduled_at?: string | null
  position: number
  followup: boolean
  value?: number | null
  service_type?: string | null
  deal_name?: string | null
  company_name?: string | null
  contact_name?: string | null
  contact_phone?: string | null
  deal_services?: DealService[] | null
  category?: string | null
  created_at: string
}
