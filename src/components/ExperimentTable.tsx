import type { Experiment } from '../interfaces/Experiment'
import { trainTestGap } from '../utils/insights'
import InsightBadges from './InsightBadges'

export type SortKey =
  | 'name'
  | 'dataset'
  | 'model'
  | 'trainScore'
  | 'testScore'
  | 'baselineScore'
  | 'gap'

export interface SortState {
  key: SortKey
  direction: 'asc' | 'desc'
}

export interface TableFilters {
  query: string
  onlyOverfitting: boolean
  onlyNoSignificantGain: boolean
}

interface ExperimentTableProps {
  experiments: Experiment[]
  sort: SortState | null
  onSortChange: (key: SortKey) => void
  filters: TableFilters
  onFiltersChange: (filters: TableFilters) => void
  onEdit: (experiment: Experiment) => void
  onDelete: (experiment: Experiment) => void
}

const COLUMNS: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: 'name', label: 'Ad', numeric: false },
  { key: 'dataset', label: 'Veri seti', numeric: false },
  { key: 'model', label: 'Model', numeric: false },
  { key: 'trainScore', label: 'Eğitim', numeric: true },
  { key: 'testScore', label: 'Test', numeric: true },
  { key: 'baselineScore', label: 'Baseline', numeric: true },
  { key: 'gap', label: 'Fark', numeric: true },
]

const formatScore = (value: number) =>
  Number.isFinite(value)
    ? value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'

function ExperimentTable({
  experiments,
  sort,
  onSortChange,
  filters,
  onFiltersChange,
  onEdit,
  onDelete,
}: ExperimentTableProps) {
  const cellValue = (e: Experiment, key: SortKey) => {
    if (key === 'gap') return formatScore(trainTestGap(e))
    const value = e[key]
    return typeof value === 'number' ? formatScore(value) : value
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-6">
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
          placeholder="Ad, model veya veri seti ara…"
          aria-label="Deney ara"
          className="w-full min-w-0 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 aria-invalid:border-red-500 sm:max-w-xs"
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={filters.onlyOverfitting}
            onChange={(e) => onFiltersChange({ ...filters, onlyOverfitting: e.target.checked })}
            className="h-4 w-4 shrink-0 accent-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          />
          Sadece overfitting olanlar
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={filters.onlyNoSignificantGain}
            onChange={(e) =>
              onFiltersChange({ ...filters, onlyNoSignificantGain: e.target.checked })
            }
            className="h-4 w-4 shrink-0 accent-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          />
          Sadece anlamlı fark olmayanlar
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="bg-slate-800 text-xs font-medium whitespace-nowrap uppercase tracking-wide text-slate-400">
            <tr>
              {COLUMNS.map(({ key, label, numeric }) => {
                const active = sort?.key === key
                return (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={
                      active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'
                    }
                    className={`px-4 py-3 font-medium ${numeric ? 'text-right' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => onSortChange(key)}
                      className={`inline-flex items-center gap-1 rounded-sm uppercase hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${active ? 'text-emerald-400' : ''}`}
                    >
                      {label}
                      <span aria-hidden="true" className="w-3">
                        {active ? (sort.direction === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </button>
                  </th>
                )
              })}
              <th scope="col" className="px-4 py-3 font-medium">
                Rozetler
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {experiments.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="px-4 py-10 text-center text-slate-400">
                  Eşleşen deney yok
                </td>
              </tr>
            ) : (
              experiments.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/50">
                  {COLUMNS.map(({ key, numeric }) => (
                    <td
                      key={key}
                      className={`px-4 py-3 ${numeric ? 'text-right tabular-nums' : ''} ${key === 'name' ? 'font-medium text-slate-100' : 'text-slate-300'}`}
                    >
                      {cellValue(e, key)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <InsightBadges experiment={e} />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onEdit(e)}
                      aria-label={`${e.name} deneyini düzenle`}
                      className="rounded-sm text-sm font-medium text-emerald-400 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(e)}
                      aria-label={`${e.name} deneyini sil`}
                      className="ml-4 rounded-sm text-sm font-medium text-red-400 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ExperimentTable
