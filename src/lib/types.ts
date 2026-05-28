export interface UserProfile {
  id: string
  email: string
  name: string
  region: string | null
  user_type: 'individual' | 'school' | 'business' | 'community' | null
  group_id: string | null
  points: number
  created_at: string
}

export interface Group {
  id: string
  name: string
  type: 'school' | 'business' | 'community'
  admin_id: string | null
  created_at: string
}

export interface ActionItem {
  id: string
  name: string
  category: string
  co2_saved_kg: number
  money_saved_nzd: number
  points: number
  description: string | null
  created_at: string
}

export interface UserAction {
  id: string
  user_id: string
  action_id: string
  logged_at: string
  notes: string | null
  actions_library?: ActionItem
}

export interface Challenge {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  group_id: string | null
  created_by: string | null
  is_active: boolean
  created_at: string
  participant_count?: number
  is_joined?: boolean
}

export interface ChallengeParticipant {
  id: string
  challenge_id: string
  user_id: string
  joined_at: string
}

export interface LeaderboardEntry {
  id: string
  name: string
  points: number
  region: string | null
  user_type: string | null
}
