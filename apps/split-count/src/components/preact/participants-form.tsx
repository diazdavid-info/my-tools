import { useState } from 'preact/hooks'
import { IconButton } from '@/components/preact/button'
import { avatarColor } from '@/lib/split'

interface Draft {
  localId: string
  name: string
  couple: boolean
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
  const [lastIsCouple, setLastIsCouple] = useState(false)
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
    setParticipants((prev) => [
      ...prev,
      { localId: nextId(), name, couple: lastIsCouple }
    ])
    setNameInput('')
    setLastIsCouple(false)
  }

  const removeParticipant = (localId: string) => {
    setParticipants((prev) => prev.filter((p) => p.localId !== localId))
  }

  const toggleCouple = (localId: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.localId === localId ? { ...p, couple: !p.couple } : p))
    )
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
          participants: valid.map((p) => ({ name: p.name, couple: p.couple }))
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
        <span class="label-mono">NUEVO BOTE</span>
        <span class="size-11" />
      </header>

      <div class="flex flex-col gap-2.5">
        <h1 class="text-[34px]/[1.05] tracking-[-0.3px] text-ink">
          ¿Entre quiénes se reparte?
        </h1>
        <p class="text-[15px]/[1.45] text-ink-muted">
          Ponle nombre al bote y añade a la gente. Sin cuentas: solo nombres.
        </p>
      </div>

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
                  <span class="text-[17px] font-medium text-ink">{p.name}</span>
                  {p.couple && (
                    <span class="rounded border border-line px-1 py-0.5 font-mono text-[9px] tracking-[1.1px] text-ink-muted">
                      PAREJA
                    </span>
                  )}
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
              <button
                type="button"
                onClick={() => toggleCouple(p.localId)}
                class="flex h-[52px] items-center gap-3 bg-paper-soft px-3.5 text-left"
              >
                <span class="flex w-full flex-col gap-px">
                  <span class="text-sm font-medium text-ink">
                    Es una pareja
                  </span>
                  <span class="text-xs text-ink-soft">
                    Comparten cartera: cuentan como uno
                  </span>
                </span>
                <span
                  class={`flex h-6.5 w-11 items-center rounded-full p-[3px] transition-colors ${p.couple ? 'justify-end bg-ink' : 'justify-start bg-line'}`}
                >
                  <span class="size-5 rounded-full bg-paper-white shadow-sm" />
                </span>
              </button>
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

      {error && <p class="text-sm font-medium text-accent">{error}</p>}

      <div class="flex-1" />

      <div class="flex flex-col gap-3">
        <CreateButton onClick={createBote} loading={loading} />
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
