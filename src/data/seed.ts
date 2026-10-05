import type { Experiment } from '../interfaces/Experiment'

const BANKA_BASELINE: number = 50 
const KRIPTO_EGITIM: number = 50 
const KRIPTO_DUMMY_EGITIM: number = 50 
const KRIPTO_DUMMY_BASELINE: number = 50 

export const seedExperiments: Experiment[] = [
  {
    id: 'seed-banka-random-forest',
    name: 'Örnek - Banka Modeli',
    dataset: 'ornek-banka-musteri.csv',
    model: 'Random Forest (örnek)',
    hyperparameters: {
      n_estimators: '100',
      max_depth: 'None',
      random_state: '42',
    },
    trainScore: 99.98,
    testScore: 80.11,
    baselineScore: BANKA_BASELINE,
    createdAt: '2026-01-01T09:00:00.000Z',
  },
  {
    id: 'seed-kripto-dummy',
    name: 'Örnek - Kripto Modeli (Dummy)',
    dataset: 'ornek-kripto-fiyat.csv',
    model: 'Dummy Classifier',
    hyperparameters: {
      strategy: 'most_frequent',
    },
    trainScore: KRIPTO_DUMMY_EGITIM,
    testScore: 50.05,
    baselineScore: KRIPTO_DUMMY_BASELINE,
    createdAt: '2026-01-02T09:00:00.000Z',
  },
  {
    id: 'seed-kripto-logreg',
    name: 'Örnek - Kripto Modeli (LogReg)',
    dataset: 'ornek-kripto-fiyat.csv',
    model: 'Logistic Regression',
    hyperparameters: {
      C: '1.0',
      max_iter: '1000',
      solver: 'lbfgs',
    },
    trainScore: KRIPTO_EGITIM,
    testScore: 50.38,
    baselineScore: 50.05,
    createdAt: '2026-01-03T09:00:00.000Z',
  },
]
