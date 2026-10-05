import { useState } from 'react'
import ExperimentForm from '../components/ExperimentForm'
import { useExperiments } from '../hooks/useExperiments'
import type { ExperimentInput } from '../interfaces/Experiment'

function ExperimentsPage() {
  const { addExperiment } = useExperiments()
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleCreate = (input: ExperimentInput) => {
    addExperiment(input)
    setIsFormOpen(false)
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">Deneyler</h1>
          {!isFormOpen && (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
            >
              Yeni Deney
            </button>
          )}
        </div>
        <section className="mt-6 rounded-lg border border-slate-700 p-6">
          {isFormOpen && (
            <>
              <h2 className="mb-4 text-lg font-semibold">Yeni Deney</h2>
              <ExperimentForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default ExperimentsPage
