import { FC } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type PreviewProps = {
  method: 'GET' | 'POST'
  description: string
  code: { [language: string]: string }
}

export const Preview: FC<PreviewProps> = function ({ method, description, code }) {
  const keys = Object.keys(code)
  const values = Object.values(code)

  return (
    <>
      <h2 className="font-semibold border-b text-2xl mb-4">{description}</h2>
      <Badge>{method}</Badge>
      <Tabs defaultValue={keys[0]} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b p-0">
          {keys.map((key) => (
            <TabsTrigger key={key} value={key} className="bg-transparent">
              {key}
            </TabsTrigger>
          ))}
        </TabsList>
        {values.map((value, idx) => (
          <TabsContent key={idx} value={keys[idx]} className="p-2 border w-full rounded">
            <code>{value}</code>
          </TabsContent>
        ))}
      </Tabs>
    </>
  )
}
