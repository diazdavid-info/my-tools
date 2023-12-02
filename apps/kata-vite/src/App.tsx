import { ThemeProvider } from '@/components/theme-provider'
import { Textarea } from '@/components/ui/textarea.tsx'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Textarea />
    </ThemeProvider>
  )
}

export default App
