import { useState } from 'preact/hooks'
import type { Bote, Participant, SharedWallet } from '@/lib/types'

interface Props {
  bote: Bote
  onChanged: (bote: Bote) => void
  onClose: () => void
}

export function BoteSettings({ bote, onChanged, onClose }: Props) {
  const [name, setName] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const occupied = new Set(
    bote.sharedWallets.flatMap((wallet) => wallet.memberIds)
  )
  const available = bote.participants.filter(
    (person) => !occupied.has(person.id)
  )
  const orderedSelection = bote.participants
    .filter((person) => selectedIds.includes(person.id))
    .map((person) => person.id)
  const personName = (id: string) =>
    bote.participants.find((person) => person.id === id)?.name ?? '?'

  const addPerson = async () => {
    if (!name.trim()) return
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(`/api/botes/${bote.id}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })
      const data = (await response.json()) as Participant & { error?: string }
      if (!response.ok)
        throw new Error(data.error ?? 'No se pudo añadir la persona')
      onChanged({
        ...bote,
        participants: [...bote.participants, data],
        expenses: bote.expenses.map((expense) =>
          expense.split.mode === 'equal' && !expense.split.participantIds
            ? {
                ...expense,
                split: {
                  mode: 'equal',
                  participantIds: bote.participants.map((person) => person.id)
                }
              }
            : expense
        )
      })
      setName('')
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'No se pudo añadir la persona'
      )
    } finally {
      setBusy(false)
    }
  }

  const addWallet = async () => {
    if (orderedSelection.length < 2) return
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(`/api/botes/${bote.id}/shared-wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberIds: orderedSelection })
      })
      const data = (await response.json()) as SharedWallet & { error?: string }
      if (!response.ok)
        throw new Error(data.error ?? 'No se pudo crear el monedero')
      onChanged({ ...bote, sharedWallets: [...bote.sharedWallets, data] })
      setSelectedIds([])
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'No se pudo crear el monedero'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-dim/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        class="flex max-h-[92dvh] w-full max-w-[480px] flex-col rounded-t-3xl bg-paper pt-3 sm:mb-6 sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div class="flex items-center justify-between px-5 pb-3">
          <div>
            <span class="label-mono">CONFIGURACIÓN DEL BOTE</span>
            <h2
              id="settings-title"
              class="mt-1 text-[29px] leading-none text-ink"
            >
              Personas y monederos
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            class="flex size-11 items-center justify-center rounded-xl border border-line bg-paper-white text-xl text-ink"
          >
            ×
          </button>
        </div>
        <div class="flex flex-col gap-6 overflow-y-auto px-5 pb-8">
          <section class="rounded-2xl border border-line bg-paper-white p-4">
            <h3 class="text-lg font-medium text-ink">Personas</h3>
            <p class="mt-1 text-xs text-ink-soft">
              Las personas nuevas solo entran en los gastos futuros.
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              {bote.participants.map((person) => (
                <span
                  key={person.id}
                  class="rounded-full bg-paper-soft px-3 py-1.5 text-sm text-ink"
                >
                  {person.name}
                </span>
              ))}
            </div>
            <form
              class="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                void addPerson()
              }}
            >
              <input
                aria-label="Nombre de la nueva persona"
                value={name}
                onInput={(event) =>
                  setName((event.target as HTMLInputElement).value)
                }
                placeholder="Nombre de la persona"
                class="h-11 min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 text-sm text-ink"
              />
              <button
                type="submit"
                disabled={busy || !name.trim()}
                class="rounded-lg bg-ink px-4 text-sm font-semibold text-paper disabled:opacity-40"
              >
                Añadir
              </button>
            </form>
          </section>

          <section class="rounded-2xl border border-line bg-paper-white p-4">
            <h3 class="text-lg font-medium text-ink">Monederos compartidos</h3>
            <p class="mt-1 text-xs text-ink-soft">
              Solo se usan cuando alguien los selecciona al pagar. Cada persona
              puede estar en uno. La app elegirá quién recibe los pagos al
              saldar.
            </p>
            {bote.sharedWallets.map((wallet) => (
              <div
                key={wallet.id}
                class="mt-4 rounded-xl border border-line bg-paper-soft p-3"
              >
                <p class="font-medium text-ink">
                  {wallet.memberIds.map(personName).join(' y ')}
                </p>
              </div>
            ))}
            {available.length >= 2 ? (
              <div class="mt-5 border-t border-line pt-4">
                <p class="text-sm font-medium text-ink">Crear otro monedero</p>
                <div class="mt-2 flex flex-col">
                  {available.map((person) => (
                    <label
                      key={person.id}
                      class="flex min-h-10 items-center gap-3 text-sm text-ink"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(person.id)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(person.id)
                              ? prev.filter((id) => id !== person.id)
                              : [...prev, person.id]
                          )
                        }
                        class="size-5 accent-ink"
                      />
                      {person.name}
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void addWallet()}
                  disabled={busy || orderedSelection.length < 2}
                  class="mt-4 h-11 rounded-lg border border-ink px-4 text-sm font-semibold text-ink disabled:opacity-40"
                >
                  Crear monedero
                </button>
              </div>
            ) : (
              <p class="mt-4 text-xs text-ink-soft">
                Añade dos personas sin monedero compartido para crear otro.
              </p>
            )}
          </section>
          {error && (
            <p role="alert" class="text-sm font-medium text-accent">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
