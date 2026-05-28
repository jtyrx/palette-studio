import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Settings } from '@/shared/icons/Settings'
import {
  chartSettingsStore,
  toggleShowColors,
  toggleShowP3,
  toggleShowRec2020,
} from '@/store/chartSettings'
import { useStore } from '@nanostores/react'
import { paletteStore, toggleColorSpace } from '@/store/palette'

export const ChartSettings = () => {
  const { showColors, showP3, showRec2020 } = useStore(chartSettingsStore)
  const { mode } = useStore(paletteStore)
  const nextMode = mode === 'cielch' ? 'OKLch' : 'CIELch'
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button title="Chart settings">
            <Settings />
          </Button>
        }
      />

      <DropdownMenuContent align="center" sideOffset={4}>
        <DropdownMenuItem onClick={toggleColorSpace}>
          Use {nextMode} color model
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleShowColors}>
          {showColors ? 'Hide' : 'Show'} colors on charts
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleShowP3}>
          {showP3 ? 'Hide' : 'Show'} P3 color space
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleShowRec2020}>
          {showRec2020 ? 'Hide' : 'Show'} Rec. 2020 color space
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
