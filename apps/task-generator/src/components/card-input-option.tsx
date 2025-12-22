import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover.tsx'
import { Input } from '@/components/ui/input.tsx'
import { type ChangeEvent, type FC } from 'react'
import { Pencil } from 'lucide-react'

type CardInputOptionProp = {
  value: string
  handleValueChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export const CardInputOption: FC<CardInputOptionProp> = ({
  value,
  handleValueChange
}) => {
  return (
    <Popover>
      <PopoverTrigger className="flex cursor-pointer flex-row items-center justify-end gap-2">
        {value} <Pencil className="inline size-3" strokeWidth="1" />
      </PopoverTrigger>
      <PopoverContent>
        <Input
          onChange={handleValueChange}
          value={value}
          type="text"
          placeholder=""
        />
      </PopoverContent>
    </Popover>
  )
}
