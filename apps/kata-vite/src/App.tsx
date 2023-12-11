import { ThemeProvider } from '@/components/theme-provider'
import { Textarea } from '@/components/ui/textarea.tsx'
import React from 'react'
import { CardList } from '@/components/ui/card-list.tsx'
import { CardOptions } from '@/components/ui/card-options.tsx'
import { useTasksStore } from '@/store/tasks.ts'
import { Command } from '@/components/ui/command.tsx'

function App() {
  const { createTask } = useTasksStore((state) => state)

  const handleOnChangeContent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    createTask(event.target.value)
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <main className="w-full lg:w-3/4 m-auto p-5 flex flex-col gap-5">
        <section>
          <Textarea onChange={handleOnChangeContent} placeholder="Type your message here." />
        </section>
        <section className="flex flex-col gap-5">
          <header>
            <CardOptions />
          </header>
          <main className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-2">
            <CardList />
          </main>
          <footer className="border-2 rounded">
            <Command />
          </footer>
        </section>
      </main>
    </ThemeProvider>
  )
}

export default App
