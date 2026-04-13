import { ChevronDown, ChevronUp, Lightbulb, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { ChangeItem } from '../api/client'

interface Props {
  changes: ChangeItem[]
  summary: string
}

const CRO_COLORS: Record<string, string> = {
  'message match': 'bg-violet-100 text-violet-700',
  urgency: 'bg-amber-100 text-amber-700',
  'social proof': 'bg-green-100 text-green-700',
  specificity: 'bg-blue-100 text-blue-700',
  'benefit-focused': 'bg-teal-100 text-teal-700',
}

function croBadgeClass(principle: string): string {
  const key = Object.keys(CRO_COLORS).find((k) =>
    principle.toLowerCase().includes(k),
  )
  return key ? CRO_COLORS[key] : 'bg-slate-100 text-slate-600'
}

export default function DiffPanel({ changes, summary }: Props) {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="flex flex-col h-full">
      {/* Summary */}
      <div className="p-4 border-b border-slate-200 bg-indigo-50">
        <div className="flex items-start gap-2">
          <Lightbulb size={15} className="text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-800 font-medium leading-relaxed">{summary}</p>
        </div>
      </div>

      {/* Change count */}
      <div className="px-4 py-2.5 border-b border-slate-100 bg-white">
        <p className="text-xs font-semibold text-slate-500">
          {changes.length} CHANGE{changes.length !== 1 ? 'S' : ''} APPLIED
        </p>
      </div>

      {/* Changes list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {changes.map((change, i) => (
          <div key={i} className="bg-white">
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors"
            >
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-slate-500 truncate mb-1">{change.selector}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${croBadgeClass(change.cro_principle)}`}>
                  {change.cro_principle}
                </span>
              </div>
              {expanded === i ? (
                <ChevronUp size={14} className="text-slate-400 shrink-0 mt-1" />
              ) : (
                <ChevronDown size={14} className="text-slate-400 shrink-0 mt-1" />
              )}
            </button>

            {expanded === i && (
              <div className="px-4 pb-4 space-y-2.5">
                <div className="grid grid-cols-1 gap-2">
                  <div className="rounded-lg bg-red-50 border border-red-100 p-2.5">
                    <p className="text-[10px] font-semibold text-red-400 mb-1">BEFORE</p>
                    <p className="text-xs text-red-800 leading-relaxed">{change.original_text}</p>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight size={14} className="text-slate-400 rotate-90" />
                  </div>
                  <div className="rounded-lg bg-green-50 border border-green-100 p-2.5">
                    <p className="text-[10px] font-semibold text-green-500 mb-1">AFTER</p>
                    <p className="text-xs text-green-800 leading-relaxed font-medium">{change.new_text}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[10px] font-semibold text-slate-400 mb-1">WHY</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{change.reason}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
