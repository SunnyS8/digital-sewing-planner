import { useMemo } from 'react'
import type { BodyMeasurements } from '@/types'
import { generateFigureSvg } from '@/lib/figureGeometry'

interface Props {
  measurements: BodyMeasurements
  className?: string
}

export function FigureRenderer({ measurements, className }: Props) {
  const svgContent = useMemo(
    () => generateFigureSvg(measurements),
    [measurements]
  )

  return (
    <div
      className={`flex items-center justify-center ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}
