import { describe, expect, it } from 'vitest'
import type { Experiment } from '../interfaces/Experiment'
import { getInsights } from './insights'

function makeExperiment(trainScore: number, testScore: number, baselineScore: number): Experiment {
  return {
    id: 'test',
    name: 'test',
    dataset: 'test.csv',
    model: 'test',
    hyperparameters: {},
    trainScore,
    testScore,
    baselineScore,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('getInsights - overfitting (train - test > 10)', () => {
  it('tam 10.0 fark overfitting sayılmaz', () => {
    expect(getInsights(makeExperiment(90, 80, 0)).overfitting).toBe(false)
  })

  it('kayan nokta hatasıyla tam 10.0 fark overfitting sayılmaz', () => {
    // 64.01 - 54.01 = 10.000000000000007
    expect(getInsights(makeExperiment(64.01, 54.01, 0)).overfitting).toBe(false)
  })

  it('10.01 fark overfitting sayılır', () => {
    expect(getInsights(makeExperiment(90.01, 80, 0)).overfitting).toBe(true)
  })
})

describe('getInsights - noSignificantGain (test - baseline < 1)', () => {
  it('tam 1.0 fark uyarı almaz', () => {
    expect(getInsights(makeExperiment(0, 51, 50)).noSignificantGain).toBe(false)
  })

  it('kayan nokta hatasıyla tam 1.0 fark uyarı almaz', () => {
    // 64.02 - 63.02 = 0.9999999999999929
    expect(getInsights(makeExperiment(0, 64.02, 63.02)).noSignificantGain).toBe(false)
  })

  it('0.99 fark uyarı alır', () => {
    expect(getInsights(makeExperiment(0, 50.99, 50)).noSignificantGain).toBe(true)
  })
})
