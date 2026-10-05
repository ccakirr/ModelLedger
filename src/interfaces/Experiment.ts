export interface Experiment {
  id: string
  name: string
  dataset: string
  model: string
  hyperparameters: Record<string, string>
  /** 0-100 arası yüzde */
  trainScore: number
  /** 0-100 arası yüzde */
  testScore: number
  /** 0-100 arası yüzde */
  baselineScore: number
  /** ISO 8601 tarih string'i */
  createdAt: string
}

export type ExperimentInput = Omit<Experiment, 'id' | 'createdAt'>
