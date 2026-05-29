import { More } from '@/shared/icons/More'
import { EqualizeH } from '@/shared/icons/EqualizeH'
import { EqualizeL } from '@/shared/icons/EqualizeL'
import { Minimize } from '@/shared/icons/Minimize'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  currentHueToRow,
  currentLuminanceToColumn,
  pushColorsIntoRgb,
} from '@/store/palette'

export const ColorActions = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Actions"
        >
          <More />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuItem
          onClick={pushColorsIntoRgb}
          title="Not all LCH colors are displayable in RGB color space. This button will tweak all LCH values to be displayable."
        >
          <span className="flex items-center gap-8">
            <Minimize />
            Make colors displayable
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={currentHueToRow}>
          <span className="flex items-center gap-8">
            <EqualizeH />
            Apply current hue to row
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={currentLuminanceToColumn}>
          <span className="flex items-center gap-8">
            <EqualizeL />
            Apply current luminance to column
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
