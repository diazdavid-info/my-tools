import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Input } from '@/components/ui/input.tsx'
import { ChangeEvent, FC } from 'react'

type CardInputOptionProp = {
  value: string
  handleValueChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export const CardInputOption: FC<CardInputOptionProp> = ({ value, handleValueChange }) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Badge variant="outline">{value}</Badge>
      </PopoverTrigger>
      <PopoverContent>
        <Input onChange={handleValueChange} value={value} type="text" placeholder="" />
      </PopoverContent>
    </Popover>
  )
}
