export type SplitMode = 'equal' | 'percentages' | 'amounts'

export type SplitValue =
  | { mode: 'equal'; participantIds?: string[] }
  | { mode: 'percentages'; shares: Record<string, number> }
  | { mode: 'amounts'; shares: Record<string, number> }

export interface Participant {
  id: string
  name: string
  color: string
}

export interface SharedWallet {
  id: string
  memberIds: string[]
  lockedRecipientId?: string | null
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
  sharedWallets: SharedWallet[]
  expenses: Expense[]
  settlements: Settlement[]
}
