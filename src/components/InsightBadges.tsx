import type { Experiment } from '../interfaces/Experiment'
import { getInsights, testBaselineGain, trainTestGap } from '../utils/insights'

const formatPoints = (value: number) =>
  value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })

function InsightBadges({ experiment }: { experiment: Experiment }) {
  const { overfitting, noSignificantGain } = getInsights(experiment)

  if (!overfitting && !noSignificantGain) return null

  return (
    <div className="flex flex-wrap gap-2">
      {overfitting && (
        <span
          title={`Eğitim–test farkı ${formatPoints(trainTestGap(experiment))} puan`}
          className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400 ring-1 ring-red-500/40"
        >
          Overfitting
        </span>
      )}
      {noSignificantGain && (
        <span
          title={`Test–baseline farkı ${formatPoints(testBaselineGain(experiment))} puan`}
          className="rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-xs font-medium text-yellow-300 ring-1 ring-yellow-500/40"
        >
          Anlamlı fark yok
        </span>
      )}
    </div>
  )
}

export default InsightBadges
