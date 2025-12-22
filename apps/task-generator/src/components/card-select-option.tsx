import { type FC } from "react";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import {Pencil} from "lucide-react";

type CardSelectOptionProps = {
  value?: string
  items: { key: string; value: string }[]
  handleValueChange: (event: string) => void
}

export const CardSelectOption: FC<CardSelectOptionProps> = ({ value, items, handleValueChange }) => {
    const label = items.find(({key}) => key === value)?.value
    return (
    <Popover>
      <PopoverTrigger className="flex items-center flex-row justify-end gap-2 cursor-pointer">
        {label} {label && <Pencil className="size-3 inline" strokeWidth="1" />}
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
