import { useMemo } from 'react'
import type { BodyMeasurements, BodyPose } from '@/types'
import { generateFigureSvg, CANVAS_W, CANVAS_H } from '@/lib/figureGeometry'

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
      style={{ minHeight: CANVAS_H / 2 }}
    />
  )
}
