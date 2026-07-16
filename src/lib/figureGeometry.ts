import type { BodyMeasurements, BodyPose } from '@/types'

export interface FigurePoints {
  head: { cx: number; cy: number; r: number }
  neck: { x: number; y: number }
  shoulders: { left: { x: number; y: number }; right: { x: number; y: number }; center: { x: number; y: number } }
  bust: { left: { x: number; y: number }; right: { x: number; y: number }; center: { x: number; y: number }; width: number }
  waist: { left: { x: number; y: number }; right: { x: number; y: number }; center: { x: number; y: number }; width: number }
  hip: { left: { x: number; y: number }; right: { x: number; y: number }; center: { x: number; y: number }; width: number }
  leftArm: { shoulder: { x: number; y: number }; elbow: { x: number; y: number }; wrist: { x: number; y: number } }
  rightArm: { shoulder: { x: number; y: number }; elbow: { x: number; y: number }; wrist: { x: number; y: number } }
  leftLeg: { hip: { x: number; y: number }; knee: { x: number; y: number }; ankle: { x: number; y: number } }
  rightLeg: { hip: { x: number; y: number }; knee: { x: number; y: number }; ankle: { x: number; y: number } }
  crotch: { x: number; y: number }
}

const CANVAS_W = 400
const CANVAS_H = 700
const SCALE = 2.5

function cmToPx(cm: number): number {
  return cm * SCALE
}

export function computeFigurePoints(m: BodyMeasurements, pose: BodyPose = 'front'): FigurePoints {
  const cx = CANVAS_W / 2
  const topY = 30

  const h = cmToPx(m.height)
  const headR = cmToPx(m.neck) / 3.5
  const shoulderW = cmToPx(m.shoulderWidth) / 2
  const bustW = cmToPx(m.bust) / 4
  const waistW = cmToPx(m.waist) / 4
  const hipW = cmToPx(m.hip) / 4
  const armLen = cmToPx(m.armLength)
  const armW = cmToPx(m.armCircumference) / 4
  const legLen = cmToPx(m.inseam)
  const thighW = cmToPx(m.thigh) / 4
  const kneeW = cmToPx(m.knee) / 4
  const calfW = cmToPx(m.calf) / 4

  const headY = topY + headR
  const neckY = headY + headR + cmToPx(2)
  const shoulderY = neckY + cmToPx(2)
  const bustY = shoulderY + cmToPx(6)
  const waistY = bustY + cmToPx(m.frontWaistLength - 8)
  const hipY = waistY + cmToPx(10)
  const crotchY = hipY + cmToPx(6)
  const kneeY = crotchY + legLen * 0.45
  const ankleY = crotchY + legLen

  const leftW = (armLen * 0.45)
  const elbowXOffset = cmToPx(3)

  let leftShoulderX = cx - shoulderW
  let rightShoulderX = cx + shoulderW
  let leftElbowX: number
  let rightElbowX: number
  let leftWristX: number
  let rightWristX: number

  if (pose === 'front') {
    leftElbowX = leftShoulderX - elbowXOffset - leftW * 0.3
    rightElbowX = rightShoulderX + elbowXOffset + leftW * 0.3
    leftWristX = leftElbowX - elbowXOffset
    rightWristX = rightElbowX + elbowXOffset
  } else if (pose === 'back') {
    leftElbowX = leftShoulderX - elbowXOffset - leftW * 0.2
    rightElbowX = rightShoulderX + elbowXOffset + leftW * 0.2
    leftWristX = leftElbowX - elbowXOffset * 0.5
    rightWristX = rightElbowX + elbowXOffset * 0.5
  } else {
    leftElbowX = leftShoulderX - leftW * 0.6
    rightElbowX = cx + shoulderW * 0.3
    leftWristX = leftElbowX - leftW * 0.4
    rightWristX = rightElbowX + leftW * 0.1
  }

  const leftHipX = cx - hipW
  const rightHipX = cx + hipW

  return {
    head: { cx, cy: headY, r: headR },
    neck: { x: cx, y: neckY },
    shoulders: {
      left: { x: leftShoulderX, y: shoulderY },
      right: { x: rightShoulderX, y: shoulderY },
      center: { x: cx, y: shoulderY },
    },
    bust: {
      left: { x: cx - bustW, y: bustY },
      right: { x: cx + bustW, y: bustY },
      center: { x: cx, y: bustY },
      width: bustW * 2,
    },
    waist: {
      left: { x: cx - waistW, y: waistY },
      right: { x: cx + waistW, y: waistY },
      center: { x: cx, y: waistY },
      width: waistW * 2,
    },
    hip: {
      left: { x: leftHipX, y: hipY },
      right: { x: rightHipX, y: hipY },
      center: { x: cx, y: hipY },
      width: hipW * 2,
    },
    leftArm: {
      shoulder: { x: leftShoulderX, y: shoulderY },
      elbow: { x: leftElbowX, y: shoulderY + leftW },
      wrist: { x: leftWristX, y: shoulderY + armLen },
    },
    rightArm: {
      shoulder: { x: rightShoulderX, y: shoulderY },
      elbow: { x: rightElbowX, y: shoulderY + leftW },
      wrist: { x: rightWristX, y: shoulderY + armLen },
    },
    leftLeg: {
      hip: { x: leftHipX, y: hipY },
      knee: { x: leftHipX - cmToPx(1), y: kneeY },
      ankle: { x: leftHipX - cmToPx(1), y: ankleY },
    },
    rightLeg: {
      hip: { x: rightHipX, y: hipY },
      knee: { x: rightHipX + cmToPx(1), y: kneeY },
      ankle: { x: rightHipX + cmToPx(1), y: ankleY },
    },
    crotch: { x: cx, y: crotchY },
  }
}

export function generateFigureSvg(m: BodyMeasurements, pose: BodyPose = 'front'): string {
  const p = computeFigurePoints(m, pose)
  const skinColor = '#f5d6c6'
  const strokeColor = '#c4957a'
  const strokeWidth = 1.5

  function pathAttr(d: string) {
    return `<path d="${d}" fill="${skinColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
  }

  function circle(cx: number, cy: number, r: number) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${skinColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
  }

  const head = circle(p.head.cx, p.head.cy, p.head.r)

  const neck = pathAttr(
    `M${p.neck.x - p.head.r * 0.2},${p.neck.y} ` +
    `Q${p.neck.x},${p.neck.y + cmToPx(2)} ${p.neck.x + p.head.r * 0.2},${p.neck.y}`
  )

  const torso = buildTorsoPath(p, cmToPx)
  const torsoEl = pathAttr(torso)

  function buildLimbPath(start: { x: number; y: number }, mid: { x: number; y: number }, end: { x: number; y: number }, topW: number, botW: number): string {
    const a = start.x - topW
    const b = start.x + topW
    const c = end.x - botW
    const d = end.x + botW
    return `M${a},${start.y} Q${mid.x - topW * 0.7},${mid.y} ${c},${end.y} L${d},${end.y} Q${mid.x + topW * 0.7},${mid.y} ${b},${start.y} Z`
  }

  const armW = cmToPx(m.armCircumference) / 6
  const leftArmEl = pathAttr(buildLimbPath(p.leftArm.shoulder, p.leftArm.elbow, p.leftArm.wrist, armW, cmToPx(m.wrist) / 4))
  const rightArmEl = pathAttr(buildLimbPath(p.rightArm.shoulder, p.rightArm.elbow, p.rightArm.wrist, armW, cmToPx(m.wrist) / 4))

  const thighTopW = cmToPx(m.thigh) / 6
  const kneeW2 = cmToPx(m.knee) / 6
  const calfW2 = cmToPx(m.calf) / 6
  const ankleW = cmToPx(m.ankle) / 5
  const leftLegEl = pathAttr(buildLimbPath(p.leftLeg.hip, p.leftLeg.knee, p.leftLeg.ankle, thighTopW, ankleW))
  const rightLegEl = pathAttr(buildLimbPath(p.rightLeg.hip, p.rightLeg.knee, p.rightLeg.ankle, thighTopW, ankleW))

  const leftKneeEl = pathAttr(`M${p.leftLeg.knee.x - kneeW2},${p.leftLeg.knee.y} Q${p.leftLeg.knee.x},${p.leftLeg.knee.y + cmToPx(1)} ${p.leftLeg.knee.x + kneeW2},${p.leftLeg.knee.y}`)
  const rightKneeEl = pathAttr(`M${p.rightLeg.knee.x - kneeW2},${p.rightLeg.knee.y} Q${p.rightLeg.knee.x},${p.rightLeg.knee.y + cmToPx(1)} ${p.rightLeg.knee.x + kneeW2},${p.rightLeg.knee.y}`)
  const leftCalfEl = pathAttr(`M${p.leftLeg.ankle.x - calfW2},${p.leftLeg.ankle.y - cmToPx(5)} Q${p.leftLeg.ankle.x - calfW2 * 0.5},${p.leftLeg.ankle.y - cmToPx(3)} ${p.leftLeg.ankle.x},${p.leftLeg.ankle.y}`)
  const rightCalfEl = pathAttr(`M${p.rightLeg.ankle.x - calfW2},${p.rightLeg.ankle.y - cmToPx(5)} Q${p.rightLeg.ankle.x + calfW2 * 0.5},${p.rightLeg.ankle.y - cmToPx(3)} ${p.rightLeg.ankle.x},${p.rightLeg.ankle.y}`)

  const bustGuide = pose === 'front'
    ? `<path d="M${p.bust.left.x},${p.bust.left.y} Q${p.bust.center.x},${p.bust.left.y - cmToPx(3)} ${p.bust.right.x},${p.bust.right.y}" fill="none" stroke="#e8b4a0" stroke-width="1" stroke-dasharray="4,3"/>`
    : ''

  return `<svg viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" xmlns="http://www.w3.org/2000/svg">
    ${head}
    ${neck}
    ${torsoEl}
    ${leftArmEl}
    ${rightArmEl}
    ${leftLegEl}
    ${rightLegEl}
    ${leftKneeEl}
    ${rightKneeEl}
    ${leftCalfEl}
    ${rightCalfEl}
    ${bustGuide}
  </svg>`
}

function buildTorsoPath(p: FigurePoints, cmToPxFn: (cm: number) => number): string {
  const sL = p.shoulders.left
  const sR = p.shoulders.right
  const bL = p.bust.left
  const bR = p.bust.right
  const wL = p.waist.left
  const wR = p.waist.right
  const hL = p.hip.left
  const hR = p.hip.right
  const c = p.crotch

  return (
    `M${sL.x},${sL.y} ` +
    `C${sL.x + cmToPxFn(2)},${sL.y + cmToPxFn(3)} ${bL.x - cmToPxFn(1)},${bL.y} ${bL.x},${bL.y} ` +
    `C${bL.x + cmToPxFn(1)},${bL.y + cmToPxFn(2)} ${wL.x},${wL.y - cmToPxFn(1)} ${wL.x},${wL.y} ` +
    `C${wL.x},${wL.y + cmToPxFn(1)} ${hL.x - cmToPxFn(1)},${hL.y - cmToPxFn(1)} ${hL.x},${hL.y} ` +
    `C${hL.x + cmToPxFn(1)},${hL.y + cmToPxFn(2)} ${c.x - cmToPxFn(3)},${c.y - cmToPxFn(1)} ${c.x},${c.y} ` +
    `C${c.x + cmToPxFn(3)},${c.y - cmToPxFn(1)} ${hR.x - cmToPxFn(1)},${hR.y + cmToPxFn(2)} ${hR.x},${hR.y} ` +
    `C${hR.x},${hR.y - cmToPxFn(1)} ${wR.x},${wR.y + cmToPxFn(1)} ${wR.x},${wR.y} ` +
    `C${wR.x},${wR.y - cmToPxFn(1)} ${bR.x - cmToPxFn(1)},${bR.y + cmToPxFn(2)} ${bR.x},${bR.y} ` +
    `C${bR.x + cmToPxFn(1)},${bR.y} ${sR.x - cmToPxFn(2)},${sL.y + cmToPxFn(3)} ${sR.x},${sR.y} ` +
    `Z`
  )
}

export { CANVAS_W, CANVAS_H, SCALE }
