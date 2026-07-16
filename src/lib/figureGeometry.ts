import type { BodyMeasurements } from '@/types'

const CANVAS_W = 1100
const CANVAS_H = 1000

function cmToPx(cm: number, scale: number = 2.0): number {
  return cm * scale
}

function buildFigure(m: BodyMeasurements, scale: number, offsetX: number, isFront: boolean): string {
  const cx = offsetX + 260 / 2
  
  // Proportions
  const heightPx = cmToPx(m.height, scale)
  const headSize = heightPx / 8.5
  const neckSize = headSize / 3
  
  // Y positions
  const topY = 20
  const headBottomY = topY + headSize
  const neckBottomY = headBottomY + neckSize * 0.8
  const shoulderY = neckBottomY + neckSize * 0.4
  
  // Bust, waist, hip
  const bustY = shoulderY + cmToPx(m.frontWaistLength * 0.4, scale)
  const waistY = shoulderY + cmToPx(m.frontWaistLength, scale)
  const hipY = waistY + cmToPx(8, scale)
  const crotchY = hipY + cmToPx(6, scale)
  
  // Legs
  const legLength = cmToPx(m.inseam, scale) * 1.1
  const ankleY = crotchY + legLength
  const kneeY = crotchY + legLength * 0.45
  
  // Widths
  const shoulderW = cmToPx(m.shoulderWidth / 2, scale)
  const bustW = cmToPx(m.bust / 4.5, scale)
  const waistW = cmToPx(m.waist / 4.5, scale)
  const hipW = cmToPx(m.hip / 4.5, scale)
  
  // Arms
  const armLength = cmToPx(m.armLength, scale) * 0.95
  const armCircW = cmToPx(m.armCircumference / 10, scale)
  
  // Legs widths
  const thighW = cmToPx(m.thigh / 6.5, scale)
  const kneeW = cmToPx(m.knee / 6.5, scale)
  const ankleW = cmToPx(m.ankle / 5, scale)
  
  const skinStroke = '#8b7355'
  
  // Body outline
  const sLx = cx - shoulderW
  const sRx = cx + shoulderW
  const sY = shoulderY
  
  const bLx = cx - bustW
  const bRx = cx + bustW
  const bY = bustY
  
  const wLx = cx - waistW
  const wRx = cx + waistW
  const wY = waistY
  
  const hLx = cx - hipW
  const hRx = cx + hipW
  const hY = hipY
  
  const cX = cx
  const cY = crotchY
  
  const bodyPath = isFront
    ? `M${sLx},${sY} C${sLx - 3},${sY + 5} ${bLx - 4},${bY - 3} ${bLx},${bY} C${bLx + 2},${bY + 8} ${wLx},${wY - 5} ${wLx},${wY} C${wLx},${wY + 5} ${hLx - 2},${hY - 3} ${hLx},${hY} C${hLx + 3},${hY + 5} ${cX - 8},${cY - 3} ${cX},${cY} C${cX + 8},${cY - 3} ${hRx - 3},${hY + 5} ${hRx},${hY} C${hRx + 2},${hY - 3} ${wRx},${wY + 5} ${wRx},${wY} C${wRx - 2},${wY - 5} ${bRx + 4},${bY + 8} ${bRx},${bY} C${bRx + 4},${bY - 3} ${sRx + 3},${sY + 5} ${sRx},${sY} Z`
    : `M${sLx},${sY} C${sLx + 3},${sY + 5} ${bLx + 4},${bY - 3} ${bLx},${bY} C${bLx - 2},${bY + 8} ${wLx},${wY - 5} ${wLx},${wY} C${wLx},${wY + 5} ${hLx + 2},${hY - 3} ${hLx},${hY} C${hLx - 3},${hY + 5} ${cX + 8},${cY - 3} ${cX},${cY} C${cX - 8},${cY - 3} ${hRx + 3},${hY + 5} ${hRx},${hY} C${hRx - 2},${hY - 3} ${wRx},${wY + 5} ${wRx},${wY} C${wRx + 2},${wY - 5} ${bRx - 4},${bY + 8} ${bRx},${bY} C${bRx - 4},${bY - 3} ${sRx - 3},${sY + 5} ${sRx},${sY} Z`
  
  // Head outline
  const headPath = `M${cx - headSize * 0.5},${topY + headSize * 0.3} C${cx - headSize * 0.5},${topY} ${cx - headSize * 0.2},${topY} ${cx},${topY} C${cx + headSize * 0.2},${topY} ${cx + headSize * 0.5},${topY + headSize * 0.3} ${cx + headSize * 0.5},${topY + headSize * 0.8} C${cx + headSize * 0.4},${headBottomY - 3} ${cx + headSize * 0.2},${headBottomY} ${cx},${headBottomY} C${cx - headSize * 0.2},${headBottomY} ${cx - headSize * 0.4},${headBottomY - 3} ${cx - headSize * 0.5},${topY + headSize * 0.8} Z`
  
  // Neck
  const neckPath = `M${cx - neckSize * 0.4},${headBottomY} L${cx - neckSize * 0.5},${neckBottomY} L${cx + neckSize * 0.5},${neckBottomY} L${cx + neckSize * 0.4},${headBottomY} Z`
  
  // Arms along body with hand
  const leftArmPath = `M${cx - shoulderW},${shoulderY} L${cx - shoulderW - armCircW * 0.2},${shoulderY + armLength} L${cx - shoulderW - armCircW * 0.4},${shoulderY + armLength + 8} L${cx - shoulderW - armCircW * 0.2},${shoulderY + armLength + 6} Z`
  const rightArmPath = `M${cx + shoulderW},${shoulderY} L${cx + shoulderW + armCircW * 0.2},${shoulderY + armLength} L${cx + shoulderW + armCircW * 0.4},${shoulderY + armLength + 8} L${cx + shoulderW + armCircW * 0.2},${shoulderY + armLength + 6} Z`
  
  // Legs
  const leftLegPath = `M${cx - thighW},${crotchY} L${cx - kneeW},${kneeY} L${cx - ankleW},${ankleY} L${cx + ankleW * 0.3},${ankleY} L${cx + kneeW * 0.3},${kneeY} L${cx + thighW},${crotchY} Z`
  const rightLegPath = `M${cx - thighW},${crotchY} L${cx - kneeW},${kneeY} L${cx - ankleW},${ankleY} L${cx + ankleW * 0.3},${ankleY} L${cx + kneeW * 0.3},${kneeY} L${cx + thighW},${crotchY} Z`
  
  return `
    <g>
      <!-- Figure - outline only -->
      <g fill="none" stroke="${skinStroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="${headPath}"/>
        <path d="${neckPath}"/>
        <path d="${bodyPath}"/>
        <path d="${leftArmPath}"/>
        <path d="${rightArmPath}"/>
        <path d="${leftLegPath}"/>
        <path d="${rightLegPath}"/>
      </g>
    </g>
  `
}

export function generateFigureSvg(m: BodyMeasurements): string {
  const scale = 2.0
  
  return `<svg viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="${CANVAS_W}" height="${CANVAS_H}" fill="#fafaf8"/>
    
    <!-- Front figure -->
    <text x="130" y="30" font-size="14" font-weight="bold" text-anchor="middle" fill="#333">Front</text>
    ${buildFigure(m, scale, 0, true)}
    
    <!-- Divider -->
    <line x1="550" y1="0" x2="550" y2="${CANVAS_H}" stroke="#ddd" stroke-width="1"/>
    
    <!-- Back figure -->
    <text x="880" y="30" font-size="14" font-weight="bold" text-anchor="middle" fill="#333">Back</text>
    ${buildFigure(m, scale, 550, false)}
  </svg>`
}

export { CANVAS_W, CANVAS_H }
