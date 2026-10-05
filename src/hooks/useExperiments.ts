import { useCallback, useEffect, useState } from 'react'
import type { Experiment, ExperimentInput } from '../interfaces/Experiment'
import { seedExperiments } from '../data/seed'

const STORAGE_KEY = 'modelledger:experiments'

// JSON.stringify NaN'ı null'a çevirir; okurken bilinmeyen skorları tekrar NaN yap
const toScore = (value: unknown) => (typeof value === 'number' ? value : NaN)

function loadExperiments(): Experiment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    // Anahtar hiç yoksa ilk açılıştır: demo verisini yükle
    if (raw === null) return seedExperiments
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return (parsed as Experiment[]).map((e) => ({
      ...e,
      trainScore: toScore(e.trainScore),
      testScore: toScore(e.testScore),
      baselineScore: toScore(e.baselineScore),
    }))
  } catch {
    return []
  }
}

export function useExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>(loadExperiments)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(experiments))
    } catch {
      // Kota dolu veya depolama kapalı: uygulama çalışmaya devam eder
    }
  }, [experiments])

  const addExperiment = useCallback((input: ExperimentInput) => {
    const experiment: Experiment = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setExperiments((prev) => [...prev, experiment])
  }, [])

  const updateExperiment = useCallback((id: string, input: ExperimentInput) => {
    setExperiments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...input, id: e.id, createdAt: e.createdAt } : e)),
    )
  }, [])

  const deleteExperiment = useCallback((id: string) => {
    setExperiments((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { experiments, addExperiment, updateExperiment, deleteExperiment }
}
