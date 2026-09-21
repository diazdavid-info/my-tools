import { useEffect, useMemo, useState } from 'preact/hooks'
import { Avatar } from './avatar'
import { Button } from './button'
import { centsToInput, formatDecimalNumber, formatMoney } from '@/lib/split'
import type { Bote, Expense, Participant, SplitMode } from '@/lib/types'

interface Props {
  bote: Bote
  expense?: Expense
  onClose: () => void
  onSaved: (expense: Expense) => void
}

function parseAmount(input: string): number {
  const normalized = input.replace(',', '.')
  const value = Number(normalized)
  return Number.isFinite(value) ? value : NaN
}

/** Reparte amountCents entre ids por igual, ajustando céntimos restantes */
function autoSplitCents(
  amountCents: number,
  ids: string[]
): Record<string, number> {
  const result: Record<string, number> = {}
  if (ids.length === 0) return result
  const base = Math.floor(amountCents / ids.length)
  let rest = amountCents - base * ids.length
  for (const id of ids) {
    result[id] = base + (rest > 0 ? 1 : 0)
    if (rest > 0) rest--
  }
  return result
}

/** Reparte amountCents manteniendo fixedId fijo y distribuyendo el resto entre los demás */
function redistributeCents(
  amountCents: number,
  ids: string[],
  fixedId: string,
  fixedCents: number
): Record<string, number> {
  const others = ids.filter((id) => id !== fixedId)
  const result: Record<string, number> = { [fixedId]: fixedCents }
  const split = autoSplitCents(Math.max(0, amountCents - fixedCents), others)
  for (const id of others) result[id] = split[id] ?? 0
  return result
}

export function NewExpenseModal({ bote, expense: editing, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(editing?.title ?? '')
  const [amountInput, setAmountInput] = useState(
    editing ? centsToInput(editing.amountCents) : ''
  )
  const [payers, setPayers] = useState<Record<string, string>>(() =>
    editing
      ? Object.fromEntries(
          editing.payers.map((p) => [p.id, centsToInput(p.amountCents)])
        )
      : {}
  )
  const [splitMode, setSplitMode] = useState<SplitMode>(
    editing?.split.mode ?? 'equal'
  )
  const [shares, setShares] = useState<Record<string, string>>(() =>
    editing && editing.split.mode !== 'equal'
      ? Object.fromEntries(
          Object.entries(editing.split.shares).map(([id, value]) => [
            id,
            formatDecimalNumber(value)
          ])
        )
      : {}
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const amountCents = useMemo(() => {
    const value = parseAmount(amountInput)
    return Number.isFinite(value) ? Math.round(value * 100) : 0
  }, [amountInput])

  const payersTotalCents = useMemo(
    () =>
      Object.values(payers).reduce((sum, raw) => {
        const value = parseAmount(raw)
        return sum + (Number.isFinite(value) ? Math.round(value * 100) : 0)
      }, 0),
    [payers]
  )

  const activePayerIds = bote.participants
    .filter((p) => payers[p.id] !== undefined)
    .map((p) => p.id)

  const sharesTotal = useMemo(() => {
    if (splitMode === 'equal') return 100
    return Object.values(shares).reduce((sum, raw) => {
      const value = parseAmount(raw)
      return sum + (Number.isFinite(value) ? value : 0)
    }, 0)
  }, [shares, splitMode])

  const sharesTotalCents = Math.round(sharesTotal * 100)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Al cambiar el importe general, se reinician los pagadores seleccionados
  const onAmountChange = (value: string) => {
    setAmountInput(value)
    setPayers({})
  }

  const togglePayer = (p: Participant) => {
    setPayers((prev) => {
      const ids = Object.keys(prev)
      if (prev[p.id] !== undefined) {
        // Deseleccionar: repartir de nuevo entre los restantes
        const rest = ids.filter((id) => id !== p.id)
        const split = autoSplitCents(amountCents, rest)
        return Object.fromEntries(
          rest.map((id) => [id, centsToInput(split[id])])
        )
      }
      // Seleccionar: repartir el total entre todos los seleccionados (incluido el nuevo)
      const all = [...ids, p.id]
      const split = autoSplitCents(amountCents, all)
      return Object.fromEntries(all.map((id) => [id, centsToInput(split[id])]))
    })
  }

  const setPayerAmount = (id: string, raw: string) => {
    setPayers((prev) => {
      const ids = Object.keys(prev)
      const value = parseAmount(raw)
      const fixedCents = Number.isFinite(value) ? Math.round(value * 100) : 0
      // Mantener el valor editado fijo y repartir el resto entre los demás
      const split = redistributeCents(amountCents, ids, id, fixedCents)
      return Object.fromEntries(
        ids.map((pid) => [pid, centsToInput(split[pid])])
      )
    })
  }

  const setShare = (id: string, value: string) => {
    setShares((prev) => ({ ...prev, [id]: value }))
  }

  const splitValid =
    splitMode === 'equal'
      ? true
      : splitMode === 'percentages'
        ? Math.abs(sharesTotal - 100) < 0.01
        : sharesTotalCents === amountCents

  const payersValid =
    activePayerIds.length > 0 &&
    payersTotalCents === amountCents &&
    amountCents > 0

  const setModeWithDefaults = (mode: SplitMode) => {
    setSplitMode(mode)
    // Al entrar en porcentajes/importes: reparto por defecto entre todos
    if (mode === 'percentages') {
      const n = bote.participants.length
      if (n > 0) {
        const per = Math.floor((100 / n) * 100) / 100
        const rest = Math.round((100 - per * n) * 100) / 100
        setShares(
          Object.fromEntries(
            bote.participants.map((p, i) => [
              p.id,
              formatDecimalNumber(per + (i === 0 ? rest : 0)),
            ])
          )
        )
      }
    } else if (mode === 'amounts') {
      const ids = bote.participants.map((p) => p.id)
      const split = autoSplitCents(amountCents, ids)
      setShares(Object.fromEntries(ids.map((id) => [id, centsToInput(split[id])])))
    }
  }

  const save = async () => {
    if (!title.trim()) {
      setError('Ponle un concepto al gasto')
      return
    }
    if (amountCents <= 0) {
      setError('El importe debe ser mayor que 0')
      return
    }
    if (activePayerIds.length === 0) {
      setError('Marca quién ha pagado')
      return
    }
    if (payersTotalCents !== amountCents) {
      setError('Lo pagado debe coincidir con el importe')
      return
    }
    if (!splitValid) {
      setError(
        splitMode === 'percentages'
          ? 'Los porcentajes deben sumar 100 %'
          : 'Los importes deben sumar el total del gasto'
      )
      return
    }

    const split =
      splitMode === 'equal'
        ? ({ mode: 'equal' } as const)
        : ({
            mode: splitMode,
            shares: Object.fromEntries(
              bote.participants
                .filter((p) => shares[p.id] !== undefined)
                .map((p) => [p.id, parseAmount(shares[p.id])])
            )
          } as const)

    setSaving(true)
    setError(null)
    try {
      const res = await fetch(
        editing
          ? `/api/botes/${bote.id}/expenses/${editing.id}`
          : `/api/botes/${bote.id}/expenses`,
        {
          method: editing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            amountCents,
            date: editing?.date ?? new Date().toISOString(),
            payers: activePayerIds.map((id) => ({
              id,
              amountCents: Math.round(parseAmount(payers[id]) * 100)
            })),
            split
          })
        }
      )
      const data = (await res.json()) as Expense & { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'No se pudo guardar el gasto')
        setSaving(false)
        return
      }
      onSaved(data)
    } catch {
      setError(
        editing ? 'No se pudo actualizar el gasto' : 'No se pudo guardar el gasto'
      )
      setSaving(false)
    }
  }

  return (
    <div
      class="fixed inset-0 z-50 flex flex-col justify-end bg-dim/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        class="mx-auto flex max-h-[92dvh] w-full max-w-[480px] flex-1 flex-col overflow-hidden rounded-t-3xl bg-paper pt-2.5 sm:mb-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grabber + cabecera */}
        <div class="flex justify-center px-5 pb-1">
          <div class="h-1 w-10 rounded-sm bg-[#cfc8b9]" />
        </div>
        <div class="flex items-center justify-between px-5 pb-2">
          <h2 class="text-[32px] leading-none tracking-[-0.3px] text-ink">
            {editing ? 'Editar gasto' : 'Nuevo gasto'}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            class="flex size-11 items-center justify-center rounded-xl border border-line bg-paper-white text-ink"
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

        <div class="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pb-2">
          {/* Concepto */}
          <div class="flex flex-col gap-2">
            <span class="label-mono">CONCEPTO</span>
            <input
              type="text"
              value={title}
              onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
              placeholder="Cena en el Bajo de Guía"
              class="h-13 w-full rounded-xl border border-line bg-paper-white px-4 text-[17px] text-ink placeholder:text-ink-soft focus:border-ink"
            />
          </div>

          {/* Importe */}
          <div class="flex flex-col gap-2">
            <span class="label-mono">IMPORTE</span>
            <div class="flex h-16 items-center justify-between rounded-xl border border-line bg-paper-white px-4">
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                onInput={(e) =>
                  onAmountChange((e.target as HTMLInputElement).value)
                }
                placeholder="0,00"
                class="w-full bg-transparent font-mono text-[30px] font-medium tracking-[-0.6px] text-ink placeholder:text-ink-soft"
              />
              <span class="ml-2 font-mono text-xl text-ink-soft">€</span>
            </div>
          </div>

          {/* Quién ha pagado */}
          <div class="flex flex-col gap-2.5">
            <div class="flex items-end justify-between">
              <span class="label-mono">¿QUIÉN HA PAGADO?</span>
              <span class="text-xs text-ink-soft">Puedes marcar a varios</span>
            </div>
            <div class="flex flex-col overflow-hidden rounded-[14px] border border-line bg-paper-white">
              {bote.participants.map((p, i) => {
                const active = payers[p.id] !== undefined
                return (
                  <>
                    <div
                      key={p.id}
                      class="flex h-[60px] items-center gap-3 px-3 py-0 pr-3"
                    >
                      <button
                        type="button"
                        aria-label={`${active ? 'Quitar' : 'Añadir'} a ${p.name} como pagador`}
                        onClick={() => togglePayer(p)}
                        class={`flex size-6 shrink-0 items-center justify-center rounded-[7px] border transition-colors ${
                          active
                            ? 'border-ink bg-ink text-paper'
                            : 'border-line-strong bg-paper-white'
                        }`}
                      >
                        {active && (
                          <svg
                            class="size-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                      <Avatar
                        name={p.name}
                        color={p.color}
                        size={32}
                        className={active ? '' : 'opacity-60'}
                      />
                      <span
                        class={`flex w-full flex-col gap-px ${active ? 'text-ink' : 'text-ink-soft'}`}
                      >
                        <span class="text-base font-medium">{p.name}</span>
                        {p.couple && (
                          <span class="font-mono text-[10px] tracking-[1.2px] text-ink-soft">
                            PAREJA
                          </span>
                        )}
                      </span>
                      {active ? (
                        <input
                          type="text"
                          inputMode="decimal"
                          value={payers[p.id]}
                          onInput={(e) =>
                            setPayerAmount(
                              p.id,
                              (e.target as HTMLInputElement).value
                            )
                          }
                          class="h-11 w-[108px] shrink-0 rounded-[10px] border border-line bg-paper px-3 text-right font-mono text-[15px] font-medium text-ink"
                        />
                      ) : (
                        <span class="pr-3 font-mono text-[15px] text-line-strong">
                          —
                        </span>
                      )}
                    </div>
                    {i < bote.participants.length - 1 && (
                      <div class="mx-3.5 h-px bg-line-soft" />
                    )}
                  </>
                )
              })}
            </div>
            {amountCents > 0 && (
              <div
                class={`flex items-center gap-2 ${payersValid ? 'text-ink-muted' : 'text-accent'}`}
              >
                {payersValid ? (
                  <svg
                    class="size-4 text-accent"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    class="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                )}
                <span class="text-[13px]">
                  {activePayerIds.length === 0
                    ? 'Marca quién ha pagado'
                    : `Suman ${formatMoney(payersTotalCents)} de ${formatMoney(amountCents)}`}
                </span>
              </div>
            )}
          </div>

          {/* Cómo se reparte */}
          <div class="flex flex-col gap-2.5">
            <span class="label-mono">¿CÓMO SE REPARTE?</span>
            <div class="flex gap-1 rounded-xl bg-chip p-1">
              {(
                [
                  ['equal', 'Por igual'],
                  ['percentages', 'Porcentajes'],
                  ['amounts', 'Importes']
                ] as [SplitMode, string][]
              ).map(([mode, label]) => (
                <button
                  type="button"
                  onClick={() => setModeWithDefaults(mode)}
                  class={`flex h-11 flex-1 items-center justify-center rounded-[9px] text-sm transition-colors ${
                    splitMode === mode
                      ? 'bg-ink font-semibold text-paper'
                      : 'font-medium text-ink-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {splitMode === 'equal' ? (
              <p class="text-[13px] text-ink-muted">
                Se reparte entre los {bote.participants.length} participantes
              </p>
            ) : (
              <div class="flex flex-col overflow-hidden rounded-[14px] border border-line bg-paper-white">
                {bote.participants.map((p, i) => {
                  const raw = shares[p.id]
                  const value = raw !== undefined ? parseAmount(raw) : 0
                  const isPercent = splitMode === 'percentages'
                  const displayAmount = isPercent
                    ? formatMoney(
                        Math.round(
                          (amountCents * (Number.isFinite(value) ? value : 0)) /
                            100
                        )
                      )
                    : formatMoney(
                        Number.isFinite(value) ? Math.round(value * 100) : 0
                      )
                  return (
                    <>
                      <div
                        key={p.id}
                        class="flex h-[66px] items-center gap-3 px-3 py-0 pr-3"
                      >
                        <Avatar name={p.name} color={p.color} size={32} />
                        <div class="flex w-full flex-col gap-[7px]">
                          <span class="text-base font-medium text-ink">
                            {p.name}
                          </span>
                          <div class="h-1.5 w-full rounded-[3px] bg-bar-track">
                            <div
                              class="h-1.5 rounded-[3px] bg-ink transition-all"
                              style={{
                                width:
                                  splitTotalForDisplay(splitMode, sharesTotal) >
                                  0
                                    ? `${Math.min(100, ((Number.isFinite(value) ? value : 0) / splitTotalForDisplay(splitMode, sharesTotal)) * 100)}%`
                                    : '0%'
                              }}
                            />
                          </div>
                        </div>
                        {splitMode === 'amounts' ? (
                          <span class="w-[60px] shrink-0 text-right font-mono text-[13px] text-ink-soft">
                            {displayAmount}
                          </span>
                        ) : null}
                        <input
                          type="text"
                          inputMode="decimal"
                          value={raw ?? ''}
                          onInput={(e) =>
                            setShare(p.id, (e.target as HTMLInputElement).value)
                          }
                          placeholder={isPercent ? '0' : '0,00'}
                          class={`h-11 w-[76px] shrink-0 rounded-[10px] border border-line bg-paper px-2.5 text-right font-mono text-[15px] font-medium text-ink ${
                            raw === undefined ? 'opacity-40' : ''
                          }`}
                        />
                        <span class="shrink-0 font-mono text-[15px] text-ink-soft">
                          {isPercent ? '%' : ''}
                        </span>
                        {isPercent && (
                          <span class="w-[60px] shrink-0 text-right font-mono text-[13px] text-ink-soft">
                            {displayAmount}
                          </span>
                        )}
                      </div>
                      {i < bote.participants.length - 1 && (
                        <div class="mx-3.5 h-px bg-line-soft" />
                      )}
                    </>
                  )
                })}
                <div
                  class={`flex h-12 items-center gap-2 px-3.5 ${splitValid ? 'bg-paper-soft' : 'bg-paper-soft'}`}
                >
                  {splitValid ? (
                    <svg
                      class="size-4 shrink-0 text-accent"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg
                      class="size-4 shrink-0 text-accent"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4" />
                      <path d="M12 16h.01" />
                    </svg>
                  )}
                  <span class="flex-1 text-[13px] text-ink-muted">
                    {splitValid ? 'Reparto completo' : 'Reparto incompleto'}
                  </span>
                  <span class="font-mono text-sm font-medium text-ink">
                    {splitMode === 'percentages'
                      ? `${formatDecimalNumber(sharesTotal)} %`
                      : formatMoney(sharesTotalCents)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && <p class="text-sm font-medium text-accent">{error}</p>}
        </div>

        <div class="px-5 pt-3 pb-8">
          <Button onClick={save} loading={saving}>
            {editing ? 'Guardar cambios' : 'Guardar gasto'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function splitTotalForDisplay(mode: SplitMode, rawTotal: number): number {
  if (mode === 'percentages') return rawTotal > 0 ? rawTotal / 100 : 0
  return rawTotal
}
