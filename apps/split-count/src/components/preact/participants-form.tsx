import { useState } from 'preact/hooks'
import { IconButton } from '@/components/preact/button'
import { avatarColor } from '@/lib/split'

interface Draft {
  localId: string
  name: string
}

interface WalletDraft {
  localId: string
  memberIds: string[]
}

let counter = 0
function nextId() {
  counter += 1
  return `local-${counter}`
}

export function ParticipantsForm() {
  const [boteName, setBoteName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [participants, setParticipants] = useState<Draft[]>([])
  const [step, setStep] = useState<'people' | 'wallets'>('people')
  const [wallets, setWallets] = useState<WalletDraft[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const addParticipant = () => {
    const name = nameInput.trim()
    if (!name) return
    if (participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setError('Ese nombre ya está en la lista')
      return
    }
    setError(null)
    setParticipants((prev) => [...prev, { localId: nextId(), name }])
    setNameInput('')
  }

  const removeParticipant = (localId: string) => {
    setParticipants((prev) => prev.filter((p) => p.localId !== localId))
    setWallets((prev) =>
      prev.filter((wallet) => !wallet.memberIds.includes(localId))
    )
    setSelectedIds((prev) => prev.filter((id) => id !== localId))
  }

  const addWallet = () => {
    if (selectedIds.length < 2) return
    const memberIds = participants
      .filter((person) => selectedIds.includes(person.localId))
      .map((person) => person.localId)
    setWallets((prev) => [...prev, { localId: nextId(), memberIds }])
    setSelectedIds([])
  }

  const createBote = async () => {
    const name = boteName.trim()
    if (!name) {
      setError('Ponle un nombre al bote')
      return
    }
    const valid = participants.filter((p) => p.name.trim())
    if (valid.length < 2) {
      setError('Añade al menos 2 participantes')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/botes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          participants: valid.map((p) => ({
            clientId: p.localId,
            name: p.name
          })),
          sharedWallets: wallets.map((wallet) => ({
            memberIds: wallet.memberIds
          }))
        })
      })
      const data = (await res.json()) as { id?: string; error?: string }
      if (!res.ok || !data.id) {
        setError(data.error ?? 'No se pudo crear el bote')
        setLoading(false)
        return
      }
      location.href = `/b/${data.id}`
    } catch {
      setError('No se pudo crear el bote')
      setLoading(false)
    }
  }

  return (
    <div class="flex min-h-dvh flex-col gap-5 px-5 pt-14 pb-8">
      <header class="flex items-center justify-between">
        <IconButton label="Volver" onClick={() => (location.href = '/')}>
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
        </IconButton>
        <span class="label-mono">
          {step === 'people' ? '1 / 2 · PERSONAS' : '2 / 2 · MONEDEROS'}
        </span>
        <span class="size-11" />
      </header>

      <div class="flex flex-col gap-2.5">
        <h1 class="text-[34px]/[1.05] tracking-[-0.3px] text-ink">
          {step === 'people'
            ? '¿Entre quiénes se reparte?'
            : '¿Comparten un monedero?'}
        </h1>
        <p class="text-[15px]/[1.45] text-ink-muted">
          {step === 'people'
            ? 'Ponle nombre al bote y añade a la gente. Sin cuentas: solo nombres.'
            : 'Opcional. Cada persona conserva también su monedero individual.'}
        </p>
      </div>

      {step === 'people' && (
        <div class="flex flex-col gap-2">
          <span class="label-mono">NOMBRE DEL BOTE</span>
          <input
            type="text"
            value={boteName}
            onInput={(e) => setBoteName((e.target as HTMLInputElement).value)}
            placeholder="Escapada a Cádiz"
            class="h-13 w-full rounded-xl border border-line bg-paper-white px-4 text-[17px] text-ink placeholder:text-ink-soft focus:border-ink"
          />
        </div>
      )}

      {step === 'people' && (
        <div class="flex flex-col gap-2">
          <div class="flex items-end justify-between">
            <span class="label-mono">PARTICIPANTES</span>
            <span class="font-mono text-xs text-ink-soft">
              {participants.length}
            </span>
          </div>
          <div class="flex flex-col overflow-hidden rounded-[14px] border border-line bg-paper-white">
            {participants.map((p) => (
              <>
                <div
                  key={p.localId}
                  class="flex h-14 items-center gap-3 px-3.5 pr-1.5"
                >
                  <span
                    class="flex size-9 shrink-0 items-center justify-center rounded-full font-serif text-lg text-ink"
                    style={{ background: avatarColor(p.name) }}
                  >
                    {p.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <span class="flex w-full items-center gap-2">
                    <span class="text-[17px] font-medium text-ink">
                      {p.name}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Quitar a ${p.name}`}
                    onClick={() => removeParticipant(p.localId)}
                    class="flex size-11 items-center justify-center text-ink-soft hover:text-ink"
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
                <div class="mx-3.5 h-px bg-line-soft last:hidden" />
              </>
            ))}

            <form
              class="flex h-14 items-center gap-3 px-3.5 pr-1.5"
              onSubmit={(e) => {
                e.preventDefault()
                addParticipant()
              }}
            >
              <span class="flex size-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-line-strong text-ink-muted">
                <svg
                  class="size-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </span>
              <input
                type="text"
                value={nameInput}
                onInput={(e) =>
                  setNameInput((e.target as HTMLInputElement).value)
                }
                placeholder="Nombre…"
                class="w-full bg-transparent text-[17px] text-ink placeholder:text-ink-soft"
              />
              <button
                type="submit"
                disabled={!nameInput.trim()}
                class="h-11 rounded-[10px] bg-ink px-3.5 text-sm font-semibold text-paper disabled:opacity-40"
              >
                Añadir
              </button>
            </form>
          </div>
        </div>
      )}

      {step === 'wallets' && (
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <span class="label-mono">MONEDEROS COMPARTIDOS</span>
            {wallets.length === 0 && (
              <p class="rounded-xl border border-line bg-paper-white p-4 text-sm text-ink-muted">
                Si nadie comparte monedero, puedes crear el bote directamente.
              </p>
            )}
            {wallets.map((wallet) => (
              <div
                key={wallet.localId}
                class="rounded-xl border border-line bg-paper-white p-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-medium text-ink">
                      {wallet.memberIds
                        .map(
                          (id) =>
                            participants.find((person) => person.localId === id)
                              ?.name
                        )
                        .join(' y ')}
                    </p>
                    <p class="mt-1 text-xs text-ink-soft">
                      Solo se usa cuando alguien paga con este monedero
                    </p>
                  </div>
                  <button
                    type="button"
                    class="text-sm text-accent"
                    onClick={() =>
                      setWallets((prev) =>
                        prev.filter((item) => item.localId !== wallet.localId)
                      )
                    }
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
          {participants.filter(
            (person) =>
              !wallets.some((wallet) =>
                wallet.memberIds.includes(person.localId)
              )
          ).length >= 2 && (
            <div class="rounded-xl border border-line bg-paper-white p-4">
              <p class="text-base font-medium text-ink">
                Añadir monedero compartido
              </p>
              <p class="mt-1 text-xs text-ink-soft">
                Elige al menos dos personas. Cada persona puede estar en un solo
                compartido.
              </p>
              <div class="mt-3 flex flex-col gap-1">
                {participants
                  .filter(
                    (person) =>
                      !wallets.some((wallet) =>
                        wallet.memberIds.includes(person.localId)
                      )
                  )
                  .map((person) => (
                    <label
                      key={person.localId}
                      class="flex min-h-11 items-center gap-3 text-sm text-ink"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(person.localId)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(person.localId)
                              ? prev.filter((id) => id !== person.localId)
                              : [...prev, person.localId]
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
                onClick={addWallet}
                disabled={selectedIds.length < 2}
                class="mt-3 h-11 rounded-lg border border-ink px-4 text-sm font-semibold text-ink disabled:opacity-40"
              >
                Añadir monedero
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p class="text-sm font-medium text-accent">{error}</p>}

      <div class="flex-1" />

      <div class="flex flex-col gap-3">
        {step === 'people' ? (
          <button
            type="button"
            onClick={() => {
              if (!boteName.trim()) {
                setError('Ponle un nombre al bote')
                return
              }
              if (participants.length < 2) {
                setError('Añade al menos 2 participantes')
                return
              }
              setError(null)
              setStep('wallets')
            }}
            class="flex h-14 w-full items-center justify-center rounded-xl bg-accent text-[17px] font-semibold text-paper-white"
          >
            Continuar
          </button>
        ) : (
          <>
            <CreateButton onClick={createBote} loading={loading} />
            <button
              type="button"
              onClick={() => setStep('people')}
              class="h-11 text-sm font-medium text-ink-muted"
            >
              Volver a personas
            </button>
          </>
        )}
        <p class="text-center font-mono text-xs tracking-[0.5px] text-ink-soft">
          Se creará un enlace para el grupo
        </p>
      </div>
    </div>
  )
}

function CreateButton({
  onClick,
  loading
}: {
  onClick: () => void
  loading: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      class="flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-accent text-[17px] font-semibold text-paper-white shadow-button transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      {loading ? (
        <svg
          class="size-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round" />
        </svg>
      ) : (
        <>
          Crear bote
          <svg
            class="size-5"
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
        </>
      )}
    </button>
  )
}
