import { FC, useState } from 'react'
import { useStore } from '@nanostores/react'
import {
  deletePalette,
  duplicatePalette,
  paletteIdStore,
  paletteListStore,
  paletteStore,
  renamePalette,
  switchPalette,
} from '@/store/palette'
import { ChevronDown } from '@/shared/icons/ChevronDown'
import { Trash } from '@/shared/icons/Trash'
import { Copy } from '@/shared/icons/Copy'
import { Edit } from '@/shared/icons/Edit'
import { Check } from '@/shared/icons/Check'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const PaletteSelect = () => {
  const [renameState, setRenameState] = useState(false)
  const palette = useStore(paletteStore)

  if (renameState) {
    return (
      <RenameInput
        name={palette.name}
        onChange={name => {
          renamePalette(name)
          setRenameState(false)
        }}
      />
    )
  }

  return (
    <ButtonGroup orientation="horizontal" className="w-full">
      <PaletteSelectComponent />
      <Button
        type="button"
        variant="outline"
        size="sm"
        title="Rename palette"
        onClick={() => setRenameState(true)}
      >
        <Edit />
      </Button>
    </ButtonGroup>
  )
}

export const RenameInput: FC<{
  name: string
  onChange: (name: string) => void
}> = ({ name, onChange }) => {
  const [value, setValue] = useState(name)
  return (
    <ButtonGroup orientation="horizontal" className="w-full">
      <Input
        variant="workbench"
        name="Palette name"
        autoFocus
        className="min-w-0 flex-1"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onChange(value)}
        onBlur={() => onChange(value)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        title="Save changes"
        onClick={() => onChange(value)}
      >
        <Check />
      </Button>
    </ButtonGroup>
  )
}

const PaletteSelectComponent = () => {
  const paletteList = useStore(paletteListStore)
  const currentIdx = useStore(paletteIdStore)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full min-w-0 max-w-full justify-between"
          title={paletteList[currentIdx].name}
        >
          <span className="min-w-0 truncate">{paletteList[currentIdx].name}</span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={4} className="min-w-50">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-sm font-bold">
            Palettes
          </DropdownMenuLabel>
          {paletteList.map((p, i) => (
            <DropdownMenuItem
              key={i}
              className={cn(
                'cursor-pointer justify-between',
                i === currentIdx && 'menu-item-selected'
              )}
              onClick={() => switchPalette(i)}
            >
              {p.name}
              {!p.isPreset && (
                <span className="flex gap-8">
                  <Copy
                    onClick={e => {
                      e.preventDefault()
                      duplicatePalette(i)
                    }}
                  />
                  <Trash
                    onClick={e => {
                      e.preventDefault()
                      deletePalette(i)
                    }}
                  />
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
