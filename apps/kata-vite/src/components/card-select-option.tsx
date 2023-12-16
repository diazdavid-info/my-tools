import { FC } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'

type CardSelectOptionProps = {
  value?: string
  items: { key: string; value: string }[]
  handleValueChange: (event: string) => void
}

export const CardSelectOption: FC<CardSelectOptionProps> = ({ value, items, handleValueChange }) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Badge variant="outline">{value}</Badge>
      </PopoverTrigger>
      <PopoverContent>
        <Select onValueChange={handleValueChange} value={value}>
          <SelectTrigger>
            <SelectValue placeholder="Equipo" />
          </SelectTrigger>
          <SelectContent>
            {items.map(({ key, value }) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  )
}
