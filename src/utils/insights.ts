import type { Experiment } from '../interfaces/Experiment'

export const OVERFITTING_THRESHOLD = 10
export const SIGNIFICANT_GAIN_THRESHOLD = 1

// Kayan nokta hatasını giderir: 64.01 - 54.01 = 10.000000000000007 → 10
function roundDiff(value: number): number {
  return Math.round(value * 1e6) / 1e6
}

export function trainTestGap(e: Experiment): number {
  return roundDiff(e.trainScore - e.testScore)
}

export function testBaselineGain(e: Experiment): number {
  return roundDiff(e.testScore - e.baselineScore)
}

export function getInsights(e: Experiment): { overfitting: boolean; noSignificantGain: boolean } {
  return {
    overfitting: trainTestGap(e) > OVERFITTING_THRESHOLD,
    noSignificantGain: testBaselineGain(e) < SIGNIFICANT_GAIN_THRESHOLD,
  }
}
