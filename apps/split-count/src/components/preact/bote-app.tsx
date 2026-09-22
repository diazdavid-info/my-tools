import { useMemo, useState } from 'preact/hooks'
import { Avatar } from './avatar'
import { NewExpenseModal } from './new-expense-modal'
import { BoteSettings } from './bote-settings'
import {
  computeBalances,
  planRoutedSettlements,
  dateGroupLabel,
  formatMoney
} from '@/lib/split'
import type { Bote, Expense } from '@/lib/types'

interface Props {
  initialBote: Bote
}

export function BoteApp({ initialBote }: Props) {
  const [bote, setBote] = useState(initialBote)
  const [tab, setTab] = useState<'gastos' | 'saldos'>('gastos')
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [shareStatus, setShareStatus] = useState<'copied' | 'error' | null>(
    null
  )
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const totalCents = bote.expenses.reduce((sum, e) => sum + e.amountCents, 0)

  const balances = useMemo(() => computeBalances(bote), [bote])
  const plan = useMemo(
    () => planRoutedSettlements(bote, balances),
    [bote, balances]
  )
  const transfers = plan.transfers
  const pendingTransfers = transfers.length

  const groupedExpenses = useMemo(() => {
    const groups: { label: string; expenses: Expense[] }[] = []
    for (const expense of bote.expenses) {
      const label = dateGroupLabel(expense.date)
      const last = groups[groups.length - 1]
      if (last && last.label === label) last.expenses.push(expense)
      else groups.push({ label, expenses: [expense] })
    }
    return groups
  }, [bote.expenses])

  const addExpense = (expense: Expense) => {
    setBote((prev) => ({ ...prev, expenses: [...prev.expenses, expense] }))
    closeExpenseModal()
  }

  const updateExpense = (expense: Expense) => {
    setBote((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === expense.id ? expense : e))
    }))
    closeExpenseModal()
  }

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setShowModal(true)
  }

  const closeExpenseModal = () => {
    setShowModal(false)
    setEditingExpense(null)
  }

  const markSettlement = async (transfer: {
    from: string
    to: string
    amountCents: number
  }) => {
    const res = await fetch(`/api/botes/${bote.id}/settlements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', paid: true, ...transfer })
    })
    if (res.ok) {
      const fresh = await fetch(`/api/botes/${bote.id}`)
      if (fresh.ok) setBote((await fresh.json()) as Bote)
      setPaymentError(null)
    } else {
      setPaymentError('No se pudo registrar el pago')
    }
  }

  const togglePaid = async (settlementId: string, paid: boolean) => {
    const res = await fetch(`/api/botes/${bote.id}/settlements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark', settlementId, paid })
    })
    if (res.ok) {
      const fresh = await fetch(`/api/botes/${bote.id}`)
      if (fresh.ok) setBote((await fresh.json()) as Bote)
      setPaymentError(null)
    } else {
      setPaymentError('No se pudo actualizar el pago')
    }
  }

  const removePendingSettlement = async (settlementId: string) => {
    const res = await fetch(`/api/botes/${bote.id}/settlements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', settlementId })
    })
    if (res.ok) {
      setBote((prev) => ({
        ...prev,
        settlements: prev.settlements.filter((item) => item.id !== settlementId)
      }))
      setPaymentError(null)
    } else {
      setPaymentError('No se pudo quitar el pago pendiente')
    }
  }

  const closeShareDialog = () => {
    setShowShareDialog(false)
    setShareStatus(null)
  }

  const share = async () => {
    const url = window.location.href
    const text = `Únete al bote «${bote.name}»`

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: bote.name,
          text,
          url
        })
        closeShareDialog()
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setShareStatus('error')
      }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}: ${url}`)}`
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      closeShareDialog()
    }
  }

  const copyLink = async () => {
    const url = window.location.href
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
        setShareStatus('copied')
      } else {
        window.prompt('Copia este enlace:', url)
      }
    } catch {
      setShareStatus('error')
    }
  }

  const participantName = (id: string) =>
    bote.participants.find((p) => p.id === id)?.name ?? '?'
  const walletName = (id: string) => {
    const wallet = bote.sharedWallets.find((item) => item.id === id)
    return wallet
      ? wallet.memberIds.map(participantName).join(' y ')
      : participantName(id)
  }
  const accountColor = (id: string) => {
    const wallet = bote.sharedWallets.find((item) => item.id === id)
    return (
      bote.participants.find((p) => p.id === (wallet?.memberIds[0] ?? id))
        ?.color ?? '#eee'
    )
  }

  return (
    <div class="relative flex min-h-dvh flex-col bg-paper">
      {/* Header */}
      <header class="flex items-center justify-between px-5 pt-14">
        <button
          type="button"
          aria-label="Volver"
          onClick={() => (location.href = '/')}
          class="flex size-11 items-center justify-center rounded-xl border border-line bg-paper-white text-ink"
        >
          <svg
            class="size-[22px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div class="flex items-center gap-2">
          <button
            type="button"
            aria-label="Personas y monederos"
            onClick={() => setShowSettings(true)}
            class="flex h-11 items-center gap-1.5 rounded-xl border border-line bg-paper-white px-3 text-sm font-semibold text-ink"
          >
            <svg
              class="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            <span>Personas</span>
          </button>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={showShareDialog}
            onClick={() => setShowShareDialog(true)}
            class="flex h-11 items-center gap-2 rounded-full border border-line bg-paper-white pr-4 pl-3 text-[15px] font-semibold text-ink active:bg-paper-soft"
          >
            <svg
              class="size-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Compartir
          </button>
        </div>
      </header>

      {/* Título */}
      <div class="flex flex-col gap-2 px-5 pt-4">
        <p class="label-mono-strong">BOTE</p>
        <h1 class="text-4xl leading-[1.02] tracking-[-0.3px] text-ink">
          {bote.name}
        </h1>
        <div class="flex items-center gap-2.5 pt-0.5">
          <div class="flex -space-x-2">
            {bote.participants.map((p) => (
              <Avatar
                key={p.id}
                name={p.name}
                color={p.color}
                size={28}
                className="ring-2 ring-paper"
              />
            ))}
          </div>
          <span class="text-sm text-ink-muted">
            {bote.participants.map((p) => p.name).join(' · ')}
          </span>
        </div>
      </div>

      {/* Total */}
      <div class="px-5 pt-3.5">
        <div class="flex flex-col gap-1 rounded-2xl border border-line bg-paper-white px-5 pt-3.5 pb-2.5">
          <span class="font-mono text-[11px] tracking-[1.5px] text-ink-soft">
            TOTAL DEL BOTE
          </span>
          <div class="flex items-end justify-between">
            <span class="font-mono text-[34px] leading-[1.1] font-medium tracking-[-0.7px] text-ink">
              {formatMoney(totalCents)}
            </span>
            <span class="font-mono text-xs text-ink-soft">
              {bote.expenses.length}{' '}
              {bote.expenses.length === 1 ? 'gasto' : 'gastos'}
            </span>
          </div>
          {pendingTransfers > 0 && (
            <button
              type="button"
              onClick={() => setTab('saldos')}
              class="flex h-11 items-center gap-1.5 text-sm font-semibold text-accent"
            >
              {pendingTransfers} {pendingTransfers === 1 ? 'pago' : 'pagos'}{' '}
              para saldar el bote
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div class="px-5 pt-3.5">
        <div class="flex gap-1 rounded-xl bg-chip p-1">
          <button
            type="button"
            onClick={() => setTab('gastos')}
            class={`flex h-11 flex-1 items-center justify-center rounded-[9px] text-[15px] transition-colors ${
              tab === 'gastos'
                ? 'bg-ink font-semibold text-paper'
                : 'font-medium text-ink-muted'
            }`}
          >
            Gastos
          </button>
          <button
            type="button"
            onClick={() => setTab('saldos')}
            class={`flex h-11 flex-1 items-center justify-center rounded-[9px] text-[15px] transition-colors ${
              tab === 'saldos'
                ? 'bg-ink font-semibold text-paper'
                : 'font-medium text-ink-muted'
            }`}
          >
            Saldos
          </button>
        </div>
      </div>

      {/* Contenido */}
      {tab === 'gastos' ? (
        <div class="flex-1 overflow-y-auto px-5 pt-1 pb-32">
          {bote.expenses.length === 0 && (
            <div class="flex flex-col items-center gap-2 pt-16 text-center">
              <p class="text-lg text-ink-muted">Todavía no hay gastos.</p>
              <p class="text-sm text-ink-soft">
                Pulsa «Añadir gasto» para apuntar el primero.
              </p>
            </div>
          )}
          {groupedExpenses.map((group) => (
            <div class="flex flex-col">
              <p class="pt-3 pb-1.5 font-mono text-[11px] tracking-[1.5px] text-ink-soft">
                {group.label}
              </p>
              {group.expenses.map((expense) => {
                const payerAvatars = expense.payers.map((payer) => ({
                  id: payer.id,
                  name: walletName(payer.id),
                  color: accountColor(payer.id)
                }))
                const splitLabel =
                  expense.split.mode === 'equal'
                    ? 'por igual'
                    : expense.split.mode === 'percentages'
                      ? 'porcentajes'
                      : 'importes'
                const payerNames = expense.payers
                  .map((p) =>
                    bote.sharedWallets.some((wallet) => wallet.id === p.id)
                      ? `Compartido ${walletName(p.id)}`
                      : walletName(p.id)
                  )
                  .join(' + ')
                return (
                  <div
                    key={expense.id}
                    role="button"
                    tabindex={0}
                    aria-label={`Editar gasto ${expense.title}`}
                    onClick={() => openEditExpense(expense)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openEditExpense(expense)
                      }
                    }}
                    class="flex cursor-pointer items-center gap-3 rounded-xl py-2.5 transition-colors active:bg-paper-soft"
                  >
                    <div class="flex w-fit shrink-0 -space-x-4">
                      {payerAvatars.map((p) => (
                        <Avatar
                          key={p.id}
                          name={p.name}
                          color={p.color}
                          size={36}
                          className="ring-2 ring-paper"
                        />
                      ))}
                    </div>
                    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span class="truncate text-base font-medium text-ink">
                        {expense.title}
                      </span>
                      <span class="truncate text-xs text-ink-soft">
                        {payerNames} · {splitLabel}
                      </span>
                    </div>
                    <span class="shrink-0 font-mono text-base font-medium whitespace-nowrap text-ink">
                      {formatMoney(expense.amountCents)}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      ) : (
        <div class="flex-1 overflow-y-auto px-5 pt-1 pb-32">
          {/* Saldos de todos los monederos */}
          <p class="pt-3 pb-1.5 font-mono text-[11px] tracking-[1.5px] text-ink-soft">
            SALDO POR MONEDERO
          </p>
          <div class="flex flex-col overflow-hidden rounded-[14px] border border-line bg-paper-white">
            {[
              ...bote.participants,
              ...bote.sharedWallets.map((wallet) => ({
                id: wallet.id,
                name: walletName(wallet.id),
                color: accountColor(wallet.id)
              }))
            ].map((p, i, accounts) => {
              const balance = balances[p.id]
              const positive = balance.net > 0
              const zero = balance.net === 0
              const shared = bote.sharedWallets.find(
                (wallet) => wallet.id === p.id
              )
              return (
                <>
                  <div
                    key={p.id}
                    class="flex min-h-16 items-center gap-3 px-3.5 py-2"
                  >
                    <Avatar name={p.name} color={p.color} size={36} />
                    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span class="flex items-center gap-2 truncate text-base font-medium text-ink">
                        {p.name}
                        {shared && (
                          <span class="shrink-0 rounded border border-line px-1 py-px font-mono text-[9px] tracking-[1.1px] text-ink-muted">
                            COMPARTIDO
                          </span>
                        )}
                      </span>
                      <span class="text-xs text-ink-soft">
                        Gastos: pagó {formatMoney(balance.paid)} · le toca{' '}
                        {formatMoney(balance.owed)}
                      </span>
                      {balance.transferredIn || balance.transferredOut ? (
                        <span class="text-xs text-ink-soft">
                          Liquidaciones: envió{' '}
                          {formatMoney(balance.transferredOut ?? 0)} · recibió{' '}
                          {formatMoney(balance.transferredIn ?? 0)}
                        </span>
                      ) : null}
                      {shared && plan.recipients[shared.id] && (
                        <span class="text-xs text-ink-soft">
                          Cobra {participantName(plan.recipients[shared.id])}
                        </span>
                      )}
                    </div>
                    <div class="flex shrink-0 flex-col items-end gap-px whitespace-nowrap">
                      <span
                        class={`font-mono text-base font-medium ${zero ? 'text-ink' : positive ? 'text-ink' : 'text-accent'}`}
                      >
                        {zero
                          ? '0,00 €'
                          : `${positive ? '+' : '−'}${formatMoney(Math.abs(balance.net))}`}
                      </span>
                      <span class="font-mono text-[10px] tracking-[1.2px] text-ink-soft">
                        {zero ? 'SALDADO' : positive ? 'RECIBE' : 'DEBE'}
                      </span>
                    </div>
                  </div>
                  {i < accounts.length - 1 && <div class="h-px bg-line-soft" />}
                </>
              )
            })}
          </div>

          {/* Para saldar */}
          <div class="flex items-end justify-between pt-4 pb-1.5">
            <p class="font-mono text-[11px] tracking-[1.5px] text-ink-soft">
              PARA SALDAR
            </p>
          </div>
          {Object.keys(plan.recipients).length > 0 && (
            <p class="pb-2 text-xs text-ink-soft">
              Elegimos quién cobra por cada monedero compartido para reducir
              pagos. Se mantiene hasta saldar el bote.
            </p>
          )}
          <div class="flex flex-col overflow-hidden rounded-[14px] border border-line bg-paper-white">
            {transfers.length === 0 && (
              <p class="px-3.5 py-5 text-sm text-ink-muted">
                Todo saldado. No hay deudas pendientes.
              </p>
            )}
            {transfers.map((t, i) => {
              const existing = bote.settlements.find(
                (s) =>
                  !s.paid &&
                  s.from === t.from &&
                  s.to === t.to &&
                  s.amountCents === t.amountCents
              )
              return (
                <>
                  <div
                    key={`${t.from}-${t.to}-${i}`}
                    class="flex h-[66px] items-center gap-3 px-2.5 pl-3.5"
                  >
                    <div class="flex w-13 shrink-0 -space-x-[18px]">
                      <Avatar
                        name={walletName(t.from)}
                        color={accountColor(t.from)}
                        size={34}
                        className="ring-2 ring-paper-white"
                      />
                      <Avatar
                        name={walletName(t.to)}
                        color={accountColor(t.to)}
                        size={34}
                        className="ring-2 ring-paper-white"
                      />
                    </div>
                    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span class="truncate text-[13px] text-ink-soft">
                        {bote.sharedWallets.some((wallet) => wallet.id === t.to)
                          ? `${participantName(t.from)} ingresa en ${walletName(t.to)}`
                          : `${participantName(t.from)} paga a ${participantName(t.to)}`}
                      </span>
                      <span class="font-mono text-[17px] font-medium whitespace-nowrap text-ink">
                        {formatMoney(t.amountCents)}
                      </span>
                    </div>
                    {existing ? (
                      <button
                        type="button"
                        onClick={() => togglePaid(existing.id, true)}
                        class="flex h-11 shrink-0 items-center gap-1.25 rounded-[10px] border border-ink bg-paper-white px-3 text-sm font-semibold text-ink active:bg-paper-soft"
                      >
                        Marcar pagado
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markSettlement(t)}
                        class="h-11 shrink-0 rounded-[10px] border border-ink px-3 text-sm font-semibold text-ink active:bg-paper-soft"
                      >
                        Marcar pagado
                      </button>
                    )}
                  </div>
                  {i < transfers.length - 1 && (
                    <div class="h-px bg-line-soft" />
                  )}
                </>
              )
            })}
          </div>
          {paymentError && (
            <p role="alert" class="pt-2 text-sm text-accent">
              {paymentError}
            </p>
          )}
          {bote.settlements.length > 0 && (
            <div class="pt-5">
              <p class="pb-1.5 font-mono text-[11px] tracking-[1.5px] text-ink-soft">
                PAGOS REGISTRADOS
              </p>
              <div class="overflow-hidden rounded-[14px] border border-line bg-paper-white">
                {bote.settlements.map((settlement, index) => (
                  <div
                    key={settlement.id}
                    class={`flex min-h-16 items-center gap-3 px-3.5 ${index > 0 ? 'border-t border-line-soft' : ''}`}
                  >
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium text-ink">
                        {walletName(settlement.from)} →{' '}
                        {walletName(settlement.to)}
                      </p>
                      <p class="text-xs text-ink-soft">
                        {settlement.paid ? 'Pagado' : 'Pendiente'} ·{' '}
                        {formatMoney(settlement.amountCents)}
                      </p>
                    </div>
                    {settlement.paid ? (
                      <button
                        type="button"
                        onClick={() => togglePaid(settlement.id, false)}
                        class="h-11 text-xs font-medium text-ink-muted"
                      >
                        Deshacer
                      </button>
                    ) : (
                      <div class="flex gap-2">
                        <button
                          type="button"
                          onClick={() => togglePaid(settlement.id, true)}
                          class="h-11 text-xs font-semibold text-ink"
                        >
                          Marcar pagado
                        </button>
                        <button
                          type="button"
                          onClick={() => removePendingSettlement(settlement.id)}
                          class="h-11 text-xs text-accent"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Degradado + FAB */}
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-28"
        style="background: linear-gradient(to top, #f5f1e8 70%, #f5f1e800)"
      />
      <div class="absolute inset-x-0 bottom-6 flex justify-center">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          class="flex h-14 items-center gap-2.5 rounded-full bg-accent pr-6 pl-[18px] text-base font-semibold text-paper-white shadow-fab transition-transform active:scale-[0.97]"
        >
          <svg
            class="size-[22px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Añadir gasto
        </button>
      </div>

      {showModal && (
        <NewExpenseModal
          bote={bote}
          expense={editingExpense ?? undefined}
          onClose={closeExpenseModal}
          onSaved={editingExpense ? updateExpense : addExpense}
        />
      )}

      {showSettings && (
        <BoteSettings
          bote={bote}
          onChanged={setBote}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showShareDialog && (
        <div
          class="fixed inset-0 z-50 flex items-end justify-center bg-dim/60 backdrop-blur-[2px]"
          onClick={closeShareDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            class="w-full max-w-[480px] rounded-t-3xl bg-paper px-5 pt-5 pb-8 sm:mb-6 sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div class="flex items-center justify-between pb-5">
              <div>
                <p class="label-mono-strong">ENLACE DEL BOTE</p>
                <h2
                  id="share-dialog-title"
                  class="mt-1 text-[30px] leading-none text-ink"
                >
                  Compartir {bote.name}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={closeShareDialog}
                class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper-white text-ink"
              >
                <svg
                  class="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div class="mb-4 truncate rounded-xl border border-line bg-paper-white px-4 py-3 font-mono text-xs text-ink-muted">
              {window.location.href}
            </div>

            <div class="flex flex-col gap-3">
              <button
                type="button"
                onClick={share}
                class="flex h-14 items-center justify-center gap-2.5 rounded-xl bg-ink text-base font-semibold text-paper active:scale-[0.98]"
              >
                <svg
                  class="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="m8.59 13.51 6.83 3.98" />
                  <path d="m15.41 6.51-6.82 3.98" />
                </svg>
                Compartir
              </button>
              <button
                type="button"
                onClick={copyLink}
                class={`flex h-14 items-center justify-center gap-2.5 rounded-xl border text-base font-semibold active:scale-[0.98] ${
                  shareStatus === 'copied'
                    ? 'border-ink bg-paper-white text-ink'
                    : 'border-line bg-paper-white text-ink'
                }`}
              >
                {shareStatus === 'copied' ? (
                  <svg
                    class="size-5 text-accent"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    class="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
                {shareStatus === 'copied' ? 'Enlace copiado' : 'Copiar enlace'}
              </button>
              {shareStatus === 'error' && (
                <p
                  role="alert"
                  class="text-center text-sm font-medium text-accent"
                >
                  No se pudo completar la acción. Inténtalo de nuevo.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
