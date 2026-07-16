import type { BodyMeasurements, BodyPose } from '@/types'

const CANVAS_W = 500
const CANVAS_H = 950

type Point = { x: number; y: number }

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function scaleVal(val: number, base: number, ratio: number): number {
  return base + (val - base) * ratio
}

interface FigureParams {
  headR: number
  neckY: number
  shoulderW: number
  shoulderY: number
  bustX: number; bustY: number; bustW: number
  waistX: number; waistY: number; waistW: number
  hipX: number; hipY: number; hipW: number
  crotchY: number
  armLen: number; armW: number
  legLen: number
  thighW: number; kneeW: number; calfW: number; ankleW: number
  cx: number
  heightRatio: number
}

function computeParams(m: BodyMeasurements): FigureParams {
  const cx = CANVAS_W / 2
  const baseH = 165
  const hRatio = m.height / baseH

  const headR = 22 * hRatio
  const topY = 25

  const neckY = topY + headR * 2 + 5
  const shoulderY = neckY + 8 * hRatio
  const shoulderW = (m.shoulderWidth / 38) * 65 * hRatio

  const bustY = shoulderY + 25 * hRatio
  const bustW = (m.bust / 90) * 50 * hRatio

  const waistY = bustY + 45 * hRatio
  const waistW = (m.waist / 68) * 32 * hRatio

  const hipY = waistY + 35 * hRatio
  const hipW = (m.hip / 96) * 58 * hRatio

  const crotchY = hipY + 30 * hRatio

  const armLen = 200 * hRatio
  const armW = (m.armCircumference / 28) * 14 * hRatio

  const legLen = 360 * hRatio
  const thighW = (m.thigh / 54) * 28 * hRatio
  const kneeW = (m.knee / 36) * 16 * hRatio
  const calfW = (m.calf / 34) * 18 * hRatio
  const ankleW = (m.ankle / 22) * 10 * hRatio

  return {
    cx, headR, neckY, shoulderW, shoulderY,
    bustX: cx, bustY, bustW,
    waistX: cx, waistY, waistW,
    hipX: cx, hipY, hipW,
    crotchY, armLen, armW, legLen,
    thighW, kneeW, calfW, ankleW,
    heightRatio: hRatio,
  }
}

function buildBodyPath(p: FigureParams, pose: BodyPose): string {
  const { cx, shoulderW, shoulderY, bustY, bustW, waistY, waistW, hipY, hipW, crotchY } = p

  let shoulderTilt = 0
  let hipTilt = 0
  let waistShift = 0
  let hipShift = 0
  let crotchShift = 0

  if (pose === 'front') {
    shoulderTilt = -3
    hipTilt = 4
    waistShift = 2
    hipShift = 4
    crotchShift = 3
  } else if (pose === 'back') {
    shoulderTilt = 0
    hipTilt = 0
    waistShift = 0
    hipShift = 0
    crotchShift = 0
  } else {
    shoulderTilt = -2
    hipTilt = 2
    waistShift = 1
    hipShift = 2
    crotchShift = 1
  }

  const sLx = cx - shoulderW + shoulderTilt
  const sRx = cx + shoulderW + shoulderTilt
  const sY = shoulderY

  const bLx = cx - bustW + waistShift * 0.3
  const bRx = cx + bustW + waistShift * 0.3
  const bY = bustY

  const wLx = cx - waistW + waistShift
  const wRx = cx + waistW + waistShift
  const wY = waistY

  const hLx = cx - hipW + hipShift
  const hRx = cx + hipW + hipShift
  const hY = hipY

  const cX = cx + crotchShift
  const cY = crotchY

  return (
    `M${sLx},${sY} ` +
    // Left shoulder to bust
    `C${sLx - 5},${sY + 10} ${bLx - 8},${bY - 5} ${bLx},${bY} ` +
    // Bust to waist (hourglass)
    `C${bLx + 5},${bY + 15} ${wLx - 3},${wY - 8} ${wLx},${wY} ` +
    // Waist to hip
    `C${wLx + 3},${wY + 10} ${hLx - 5},${hY - 5} ${hLx},${hY} ` +
    // Hip to crotch
    `C${hLx + 5},${hY + 10} ${cX - 15},${cY - 8} ${cX},${cY} ` +
    // Crotch to right hip
    `C${cX + 15},${cY - 8} ${hRx - 5},${hY + 10} ${hRx},${hY} ` +
    // Hip to waist
    `C${hRx + 5},${hY - 5} ${wRx - 3},${wY + 10} ${wRx},${wY} ` +
    // Waist to bust
    `C${wRx + 3},${wY - 8} ${bRx - 5},${bY + 15} ${bRx},${bY} ` +
    // Bust to right shoulder
    `C${bRx + 8},${bY - 5} ${sRx + 5},${sY + 10} ${sRx},${sY} ` +
    `Z`
  )
}

function buildArmPath(
  shoulder: Point, elbow: Point, wrist: Point,
  armW: number, wristW: number, isRight: boolean, pose: BodyPose
): string {
  const dir = isRight ? 1 : -1

  let eX = elbow.x
  let eY = elbow.y
  let wX = wrist.x
  let wY = wrist.y

  if (pose === 'front') {
    eX = shoulder.x - dir * (armW * 1.5 + 5)
    eY = shoulder.y + armW * 4
    wX = eX - dir * 5
    wY = eY + armW * 5
  } else if (pose === 'back') {
    eX = shoulder.x - dir * armW
    eY = shoulder.y + armW * 4
    wX = eX - dir * 3
    wY = eY + armW * 4.5
  } else {
    if (isRight) {
      eX = shoulder.x + 5
      eY = shoulder.y + armW * 4
      wX = eX + 3
      wY = eY + armW * 4.5
    } else {
      eX = shoulder.x - armW * 2.5
      eY = shoulder.y + armW * 4
      wX = eX - 8
      wY = eY + armW * 5
    }
  }

  const topW = armW * 0.8
  const midW = armW * 0.6
  const botW = wristW

  return (
    `M${shoulder.x - topW * 0.5},${shoulder.y} ` +
    `C${shoulder.x - topW * 0.8},${shoulder.y + 10} ${eX - midW * 0.7},${eY - 5} ${eX - midW * 0.3},${eY} ` +
    `C${eX - midW * 0.2},${eY + 5} ${wX - botW * 0.3},${wY - 5} ${wX},${wY} ` +
    `C${wX + botW * 0.3},${wY} ${eX + midW * 0.2},${eY + 3} ${eX + midW * 0.3},${eY} ` +
    `C${eX + midW * 0.7},${eY - 5} ${shoulder.x + topW * 0.8},${shoulder.y + 10} ${shoulder.x + topW * 0.5},${shoulder.y} ` +
    `Z`
  )
}

function buildLegPath(
  hip: Point, knee: Point, ankle: Point,
  thighW: number, kneeW: number, calfW: number, ankleW: number,
  pose: BodyPose, isRight: boolean
): string {
  const dir = isRight ? 1 : -1
  const weightShift = 8

  let kX = knee.x
  let kY = knee.y
  let aX = ankle.x
  let aY = ankle.y

  if (pose === 'front') {
    if (isRight) {
      kX = hip.x + weightShift
      aX = hip.x + weightShift
    } else {
      kX = hip.x - weightShift * 0.3
      aX = hip.x - weightShift * 0.3
    }
    kY = hip.y + 220
    aY = kY + 140
  } else if (pose === 'back') {
    kX = hip.x
    aX = hip.x
    kY = hip.y + 220
    aY = kY + 140
  } else {
    if (isRight) {
      kX = hip.x + weightShift * 2
      aX = hip.x + weightShift * 2
    } else {
      kX = hip.x - weightShift * 0.5
      aX = hip.x - weightShift * 0.5
    }
    kY = hip.y + 220
    aY = kY + 140
  }

  return (
    `M${hip.x - thighW * 0.5},${hip.y} ` +
    `C${hip.x - thighW * 0.6},${hip.y + 20} ${kX - kneeW * 0.6},${kY - 20} ${kX - kneeW * 0.5},${kY} ` +
    `C${kX - kneeW * 0.4},${kY + 10} ${aX - calfW * 0.3},${aY - 15} ${aX - ankleW * 0.5},${aY} ` +
    `L${aX + ankleW * 0.5},${aY} ` +
    `C${aX + calfW * 0.3},${aY - 15} ${kX + kneeW * 0.4},${kY + 10} ${kX + kneeW * 0.5},${kY} ` +
    `C${kX + kneeW * 0.6},${kY - 20} ${hip.x + thighW * 0.6},${hip.y + 20} ${hip.x + thighW * 0.5},${hip.y} ` +
    `Z`
  )
}

function buildFoot(ankle: Point, ankleW: number, isRight: boolean, pose: BodyPose): string {
  const dir = isRight ? 1 : -1
  let tipX: number, tipY: number

  if (pose === 'front') {
    tipX = ankle.x + dir * 8
    tipY = ankle.y + 8
  } else if (pose === 'back') {
    tipX = ankle.x + dir * 5
    tipY = ankle.y + 8
  } else {
    if (isRight) {
      tipX = ankle.x + 12
      tipY = ankle.y + 6
    } else {
      tipX = ankle.x + 3
      tipY = ankle.y + 10
    }
  }

  return (
    `M${ankle.x - ankleW * 0.6},${ankle.y} ` +
    `Q${ankle.x - ankleW * 0.3},${ankle.y + 10} ${tipX},${tipY} ` +
    `Q${ankle.x + ankleW * 0.3},${ankle.y + 10} ${ankle.x + ankleW * 0.6},${ankle.y} ` +
    `Z`
  )
}

function buildHand(wrist: Point, wristW: number, isRight: boolean, pose: BodyPose): string {
  const dir = isRight ? 1 : -1
  return (
    `M${wrist.x - wristW * 0.4},${wrist.y} ` +
    `Q${wrist.x - wristW * 0.2},${wrist.y + wristW * 0.8} ${wrist.x + dir * 2},${wrist.y + wristW} ` +
    `Q${wrist.x + wristW * 0.2},${wrist.y + wristW * 0.8} ${wrist.x + wristW * 0.4},${wrist.y} ` +
    `Z`
  )
}

function buildHead(cx: number, topY: number, headR: number): string {
  const chinY = topY + headR * 2.8
  const jawW = headR * 0.75

  return (
    `M${cx - headR},${topY + headR} ` +
    `C${cx - headR},${topY + headR * 0.3} ${cx - headR * 0.5},${topY} ${cx},${topY} ` +
    `C${cx + headR * 0.5},${topY} ${cx + headR},${topY + headR * 0.3} ${cx + headR},${topY + headR} ` +
    `C${cx + headR},${topY + headR * 1.5} ${cx + jawW},${chinY - 5} ${cx + jawW * 0.5},${chinY} ` +
    `C${cx + jawW * 0.3},${chinY + 2} ${cx},${chinY + 3} ${cx},${chinY + 3} ` +
    `C${cx},${chinY + 3} ${cx - jawW * 0.3},${chinY + 2} ${cx - jawW * 0.5},${chinY} ` +
    `C${cx - jawW},${chinY - 5} ${cx - headR},${topY + headR * 1.5} ${cx - headR},${topY + headR} Z`
  )
}

function buildHair(cx: number, topY: number, headR: number): string {
  return (
    `M${cx - headR * 0.95},${topY + headR * 0.8} ` +
    `C${cx - headR * 1.1},${topY + headR * 0.2} ${cx - headR * 0.6},${topY - 5} ${cx},${topY - 3} ` +
    `C${cx + headR * 0.6},${topY - 5} ${cx + headR * 1.1},${topY + headR * 0.2} ${cx + headR * 0.95},${topY + headR * 0.8} ` +
    `C${cx + headR * 0.9},${topY + headR * 1.2} ${cx + headR * 0.5},${topY + headR * 0.5} ${cx},${topY + headR * 0.3} ` +
    `C${cx - headR * 0.5},${topY + headR * 0.5} ${cx - headR * 0.9},${topY + headR * 1.2} ${cx - headR * 0.95},${topY + headR * 0.8} Z`
  )
}

function buildFace(cx: number, topY: number, headR: number): string {
  const faceY = topY + headR * 0.3
  const eyeY = faceY + headR * 0.8
  const eyeSpacing = headR * 0.3
  const noseY = eyeY + headR * 0.6
  const mouthY = noseY + headR * 0.5
  const neckTopY = topY + headR * 2.6

  const leftEye = `M${cx - eyeSpacing - 4},${eyeY} Q${cx - eyeSpacing},${eyeY + 2} ${cx - eyeSpacing + 4},${eyeY}`
  const rightEye = `M${cx + eyeSpacing - 4},${eyeY} Q${cx + eyeSpacing},${eyeY + 2} ${cx + eyeSpacing + 4},${eyeY}`

  const nose = `M${cx},${noseY - 3} L${cx},${noseY}`
  const mouth = `M${cx - 5},${mouthY} Q${cx},${mouthY + 3} ${cx + 5},${mouthY}`

  return [leftEye, rightEye, nose, mouth].join('; ')
}

function buildNeck(cx: number, neckTopY: number, shoulderY: number, headR: number): string {
  const neckBottomY = neckTopY + (shoulderY - neckTopY) * 0.4
  const neckW = headR * 0.35
  return (
    `M${cx - neckW},${neckTopY} ` +
    `C${cx - neckW * 0.8},${neckBottomY} ${cx - neckW * 0.8},${shoulderY - 5} ${cx - shoulderY * 0.15},${shoulderY - 3} ` +
    `L${cx + shoulderY * 0.15},${shoulderY - 3} ` +
    `C${cx + neckW * 0.8},${shoulderY - 5} ${cx + neckW * 0.8},${neckBottomY} ${cx + neckW},${neckTopY} Z`
  )
}

export function generateFigureSvg(m: BodyMeasurements, pose: BodyPose = 'front'): string {
  const p = computeParams(m)
  const { cx, headR } = p
  const topY = 25

  const headPath = buildHead(cx, topY, headR)
  const hairPath = buildHair(cx, topY, headR)
  const facePath = buildFace(cx, topY, headR)
  const neckPath = buildNeck(cx, topY + headR * 2.4, p.shoulderY, headR)

  const bodyPath = buildBodyPath(p, pose)

  const shoulderX = cx - p.shoulderW
  const shoulderY = p.shoulderY

  const leftArmPath = buildArmPath(
    { x: shoulderX, y: shoulderY },
    { x: shoulderX - 20, y: shoulderY + 60 },
    { x: shoulderX - 25, y: shoulderY + 140 },
    p.armW, p.ankleW * 0.4, false, pose
  )

  const rightArmPath = buildArmPath(
    { x: cx + p.shoulderW, y: shoulderY },
    { x: cx + p.shoulderW + 20, y: shoulderY + 60 },
    { x: cx + p.shoulderW + 25, y: shoulderY + 140 },
    p.armW, p.ankleW * 0.4, true, pose
  )

  const hipLX = cx - p.hipW + (pose === 'front' ? 4 : 0)
  const hipRX = cx + p.hipW + (pose === 'front' ? 4 : 0)

  const leftLegPath = buildLegPath(
    { x: hipLX, y: p.hipY },
    { x: hipLX - 5, y: p.hipY + 200 },
    { x: hipLX - 5, y: p.hipY + 340 },
    p.thighW, p.kneeW, p.calfW, p.ankleW, pose, false
  )

  const rightLegPath = buildLegPath(
    { x: hipRX, y: p.hipY },
    { x: hipRX + 8, y: p.hipY + 200 },
    { x: hipRX + 8, y: p.hipY + 340 },
    p.thighW, p.kneeW, p.calfW, p.ankleW, pose, true
  )

  const leftFoot = buildFoot(
    { x: hipLX - 5, y: p.hipY + 340 },
    p.ankleW, false, pose
  )

  const rightFoot = buildFoot(
    { x: hipRX + 8, y: p.hipY + 340 },
    p.ankleW, true, pose
  )

  const leftWrist = {
    x: shoulderX - 25,
    y: shoulderY + 140
  }
  const rightWrist = {
    x: cx + p.shoulderW + 25,
    y: shoulderY + 140
  }

  const leftHand = buildHand(leftWrist, p.ankleW * 0.4, false, pose)
  const rightHand = buildHand(rightWrist, p.ankleW * 0.4, true, pose)

  const skin = '#f0d5c0'
  const stroke = '#c4957a'
  const strokeW = 1.2

  function path(d: string, fill: string, strokeColor: string, sw: number, extra = '') {
    return `<path d="${d}" fill="${fill}" stroke="${strokeColor}" stroke-width="${sw}" ${extra}/>`
  }

  const figureGroup = `
    <g id="croquis-figure" transform="translate(0,0)">
      <!-- Body -->
      ${path(bodyPath, skin, stroke, strokeW)}
      <!-- Neck -->
      ${path(neckPath, skin, stroke, strokeW)}
      <!-- Arms -->
      ${path(leftArmPath, skin, stroke, strokeW)}
      ${path(rightArmPath, skin, stroke, strokeW)}
      <!-- Hands -->
      ${path(leftHand, skin, stroke, strokeW)}
      ${path(rightHand, skin, stroke, strokeW)}
      <!-- Legs -->
      ${path(leftLegPath, skin, stroke, strokeW)}
      ${path(rightLegPath, skin, stroke, strokeW)}
      <!-- Feet -->
      ${path(leftFoot, skin, stroke, strokeW)}
      ${path(rightFoot, skin, stroke, strokeW)}
      <!-- Head -->
      ${path(headPath, skin, stroke, strokeW)}
      <!-- Hair -->
      ${path(hairPath, '#3d2b1f', 'none', 0)}
      <!-- Face features -->
      <path d="${facePath}" fill="none" stroke="#8b6b5a" stroke-width="0.8"/>
    </g>`

  const labels = pose === 'front' ? `
    <g id="measurement-lines" fill="none" stroke="#d9468b" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.5">
      <line x1="${cx - p.bustW - 20}" y1="${p.bustY}" x2="${cx + p.bustW + 20}" y2="${p.bustY}"/>
      <line x1="${cx - p.waistW - 20}" y1="${p.waistY}" x2="${cx + p.waistW + 20}" y2="${p.waistY}"/>
      <line x1="${cx - p.hipW - 20}" y1="${p.hipY}" x2="${cx + p.hipW + 20}" y2="${p.hipY}"/>
    </g>` : ''

  return `<svg viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.08"/>
      </filter>
    </defs>
    ${figureGroup}
    ${labels}
  </svg>`
}

export { CANVAS_W, CANVAS_H }
