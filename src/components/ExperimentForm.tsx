import { useState, type FormEvent } from 'react'
import type { ExperimentInput } from '../interfaces/Experiment'

type TextField = 'name' | 'dataset' | 'model'
type ScoreField = 'trainScore' | 'testScore' | 'baselineScore'

interface HyperparameterRow {
  id: string
  key: string
  value: string
}

interface FormValues extends Record<TextField | ScoreField, string> {
  hyperparameters: HyperparameterRow[]
}

interface FormErrors extends Partial<Record<TextField | ScoreField, string>> {
  /** Satır id'sine göre hiperparametre hataları */
  hyperparameters?: Record<string, string>
}

interface ExperimentFormProps {
  initialValues?: ExperimentInput
  onSubmit: (input: ExperimentInput) => void
  onCancel?: () => void
}

const TEXT_FIELDS: { name: TextField; label: string; placeholder: string }[] = [
  { name: 'name', label: 'Deney adı', placeholder: 'ör. Banka churn v2' },
  { name: 'dataset', label: 'Veri seti', placeholder: 'ör. musteri.csv' },
  { name: 'model', label: 'Model', placeholder: 'ör. Random Forest' },
]

const SCORE_FIELDS: { name: ScoreField; label: string }[] = [
  { name: 'trainScore', label: 'Eğitim skoru (%)' },
  { name: 'testScore', label: 'Test skoru (%)' },
  { name: 'baselineScore', label: 'Baseline skoru (%)' },
]

const inputClass =
  'w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'

const newRow = (key = '', value = ''): HyperparameterRow => ({ id: crypto.randomUUID(), key, value })

function toFormValues(initial?: ExperimentInput): FormValues {
  const score = (v: number | undefined) => (v !== undefined && Number.isFinite(v) ? String(v) : '')
  const rows = Object.entries(initial?.hyperparameters ?? {}).map(([k, v]) => newRow(k, v))
  return {
    name: initial?.name ?? '',
    dataset: initial?.dataset ?? '',
    model: initial?.model ?? '',
    trainScore: score(initial?.trainScore),
    testScore: score(initial?.testScore),
    baselineScore: score(initial?.baselineScore),
    hyperparameters: rows.length > 0 ? rows : [newRow()],
  }
}

function validate(values: FormValues): { errors: FormErrors; input?: ExperimentInput } {
  const errors: FormErrors = {}

  for (const { name, label } of TEXT_FIELDS) {
    if (values[name].trim() === '') errors[name] = `${label} boş olamaz.`
  }

  const scores = {} as Record<ScoreField, number>
  for (const { name } of SCORE_FIELDS) {
    const raw = values[name].trim().replace(',', '.')
    const parsed = Number(raw)
    if (raw === '') errors[name] = 'Skor boş olamaz.'
    else if (!Number.isFinite(parsed)) errors[name] = 'Geçerli bir sayı girin.'
    else if (parsed < 0 || parsed > 100) errors[name] = 'Skor 0 ile 100 arasında olmalı.'
    else scores[name] = parsed
  }

  const hyperparameters = new Map<string, string>()
  const rowErrors: Record<string, string> = {}
  for (const row of values.hyperparameters) {
    const key = row.key.trim()
    const value = row.value.trim()
    if (key === '' && value === '') continue
    if (key === '') rowErrors[row.id] = 'Anahtar boş olamaz.'
    else if (hyperparameters.has(key)) rowErrors[row.id] = 'Bu anahtar zaten kullanılıyor.'
    else hyperparameters.set(key, value)
  }
  if (Object.keys(rowErrors).length > 0) errors.hyperparameters = rowErrors

  if (Object.keys(errors).length > 0) return { errors }

  return {
    errors,
    input: {
      name: values.name.trim(),
      dataset: values.dataset.trim(),
      model: values.model.trim(),
      hyperparameters: Object.fromEntries(hyperparameters),
      ...scores,
    },
  }
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1 text-xs text-red-400">
      {message}
    </p>
  )
}

function ExperimentForm({ initialValues, onSubmit, onCancel }: ExperimentFormProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(initialValues))
  const [submitted, setSubmitted] = useState(false)

  // İlk gönderim denemesinden sonra hatalar yazdıkça güncellenir
  const errors = submitted ? validate(values).errors : {}

  const setField = (name: TextField | ScoreField, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }))

  const updateRow = (id: string, patch: Partial<Omit<HyperparameterRow, 'id'>>) =>
    setValues((prev) => ({
      ...prev,
      hyperparameters: prev.hyperparameters.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }))

  const addRow = () =>
    setValues((prev) => ({ ...prev, hyperparameters: [...prev.hyperparameters, newRow()] }))

  const removeRow = (id: string) =>
    setValues((prev) => ({
      ...prev,
      hyperparameters: prev.hyperparameters.filter((r) => r.id !== id),
    }))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    const { input } = validate(values)
    if (input) onSubmit(input)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {TEXT_FIELDS.map(({ name, label, placeholder }) => (
          <div key={name}>
            <label htmlFor={`exp-${name}`} className="mb-1 block text-sm font-medium text-slate-300">
              {label}
            </label>
            <input
              id={`exp-${name}`}
              type="text"
              value={values[name]}
              onChange={(e) => setField(name, e.target.value)}
              placeholder={placeholder}
              aria-invalid={!!errors[name]}
              aria-describedby={errors[name] ? `exp-${name}-error` : undefined}
              className={inputClass}
            />
            <FieldError id={`exp-${name}-error`} message={errors[name]} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {SCORE_FIELDS.map(({ name, label }) => (
          <div key={name}>
            <label htmlFor={`exp-${name}`} className="mb-1 block text-sm font-medium text-slate-300">
              {label}
            </label>
            <input
              id={`exp-${name}`}
              type="text"
              inputMode="decimal"
              value={values[name]}
              onChange={(e) => setField(name, e.target.value)}
              placeholder="0 - 100"
              aria-invalid={!!errors[name]}
              aria-describedby={errors[name] ? `exp-${name}-error` : undefined}
              className={inputClass}
            />
            <FieldError id={`exp-${name}-error`} message={errors[name]} />
          </div>
        ))}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-300">Hiperparametreler</legend>
        <div className="space-y-2">
          {values.hyperparameters.map((row, index) => {
            const rowError = errors.hyperparameters?.[row.id]
            return (
              <div key={row.id}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={row.key}
                    onChange={(e) => updateRow(row.id, { key: e.target.value })}
                    placeholder="anahtar"
                    aria-label={`${index + 1}. hiperparametre anahtarı`}
                    aria-invalid={!!rowError}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateRow(row.id, { value: e.target.value })}
                    placeholder="değer"
                    aria-label={`${index + 1}. hiperparametre değeri`}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label={`${index + 1}. hiperparametreyi sil`}
                    className="shrink-0 rounded-md border border-slate-600 px-3 text-sm text-slate-400 hover:border-red-500 hover:text-red-400"
                  >
                    Sil
                  </button>
                </div>
                <FieldError id={`exp-hp-${row.id}-error`} message={rowError} />
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-2 text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          + Satır ekle
        </button>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            İptal
          </button>
        )}
        <button
          type="submit"
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
        >
          Kaydet
        </button>
      </div>
    </form>
  )
}

export default ExperimentForm
