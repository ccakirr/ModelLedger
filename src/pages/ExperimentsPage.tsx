import { useMemo, useState } from 'react'
import ExperimentForm from '../components/ExperimentForm'
import ExperimentTable, {
  type SortKey,
  type SortState,
  type TableFilters,
} from '../components/ExperimentTable'
import { useExperiments } from '../hooks/useExperiments'
import type { Experiment, ExperimentInput } from '../interfaces/Experiment'
import { getInsights, trainTestGap } from '../utils/insights'

type FormState = { mode: 'create' } | { mode: 'edit'; experiment: Experiment } | null

const sortValue = (e: Experiment, key: SortKey) => (key === 'gap' ? trainTestGap(e) : e[key])

function ExperimentsPage() {
  const { experiments, addExperiment, updateExperiment, deleteExperiment } = useExperiments()
  const [formState, setFormState] = useState<FormState>(null)
  const [sort, setSort] = useState<SortState | null>(null)
  const [filters, setFilters] = useState<TableFilters>({
    query: '',
    onlyOverfitting: false,
    onlyNoSignificantGain: false,
  })

  const filteredExperiments = useMemo(() => {
    const query = filters.query.trim().toLocaleLowerCase('tr')
    return experiments.filter((e) => {
      const { overfitting, noSignificantGain } = getInsights(e)
      if (filters.onlyOverfitting && !overfitting) return false
      if (filters.onlyNoSignificantGain && !noSignificantGain) return false
      if (query === '') return true
      return [e.name, e.model, e.dataset].some((field) =>
        field.toLocaleLowerCase('tr').includes(query),
      )
    })
  }, [experiments, filters])

  const visibleExperiments = useMemo(() => {
    if (!sort) return filteredExperiments
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...filteredExperiments].sort((a, b) => {
      const va = sortValue(a, sort.key)
      const vb = sortValue(b, sort.key)
      if (typeof va === 'number' && typeof vb === 'number') {
        // Bilinmeyen (NaN) değerler yönden bağımsız olarak en sona
        const aMissing = Number.isNaN(va)
        const bMissing = Number.isNaN(vb)
        if (aMissing || bMissing) return Number(aMissing) - Number(bMissing)
        return (va - vb) * factor
      }
      return String(va).localeCompare(String(vb), 'tr') * factor
    })
  }, [filteredExperiments, sort])

  const handleSortChange = (key: SortKey) =>
    setSort((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    )

  const handleSubmit = (input: ExperimentInput) => {
    if (formState?.mode === 'edit') updateExperiment(formState.experiment.id, input)
    else addExperiment(input)
    setFormState(null)
  }

  const handleDelete = (experiment: Experiment) => {
    if (window.confirm(`"${experiment.name}" deneyi silinsin mi?`)) {
      deleteExperiment(experiment.id)
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">Deneyler</h1>
          {!formState && (
            <button
              type="button"
              onClick={() => setFormState({ mode: 'create' })}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
            >
              Yeni Deney
            </button>
          )}
        </div>

        {formState && (
          <section className="mt-6 rounded-lg border border-slate-700 p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {formState.mode === 'edit' ? 'Deneyi Düzenle' : 'Yeni Deney'}
            </h2>
            <ExperimentForm
              key={formState.mode === 'edit' ? formState.experiment.id : 'create'}
              initialValues={formState.mode === 'edit' ? formState.experiment : undefined}
              onSubmit={handleSubmit}
              onCancel={() => setFormState(null)}
            />
          </section>
        )}

        <section className="mt-6">
          <ExperimentTable
            experiments={visibleExperiments}
            sort={sort}
            onSortChange={handleSortChange}
            filters={filters}
            onFiltersChange={setFilters}
            onEdit={(experiment) => setFormState({ mode: 'edit', experiment })}
            onDelete={handleDelete}
          />
        </section>
      </div>
    </main>
  )
}

export default ExperimentsPage
