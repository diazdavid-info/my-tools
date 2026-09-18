export type SplitMode = 'equal' | 'percentages' | 'amounts'

export type SplitValue =
  | { mode: 'equal' }
  | { mode: 'percentages'; shares: Record<string, number> }
  | { mode: 'amounts'; shares: Record<string, number> }

export interface Participant {
  id: string
  name: string
  color: string
  couple?: boolean
  members?: string[]
}

export interface Expense {
  id: string
  title: string
  amountCents: number
  date: string
  payers: { id: string; amountCents: number }[]
  split: SplitValue
}

export interface Settlement {
  id: string
  from: string
  to: string
  amountCents: number
  paid: boolean
}

export interface Bote {
  id: string
  name: string
  createdAt: string
  participants: Participant[]
  expenses: Expense[]
  settlements: Settlement[]
}
