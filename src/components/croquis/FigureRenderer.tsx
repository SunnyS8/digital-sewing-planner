import { useMemo } from 'react'
import type { BodyMeasurements, BodyPose } from '@/types'
import { generateFigureSvg } from '@/lib/figureGeometry'

interface Props {
  measurements: BodyMeasurements
  pose?: BodyPose
  className?: string
}

export function FigureRenderer({ measurements, pose = 'front', className }: Props) {
  const svgContent = useMemo(
    () => generateFigureSvg(measurements, pose),
    [measurements, pose]
  )

  return (
    <div
      className={`flex items-center justify-center ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}
