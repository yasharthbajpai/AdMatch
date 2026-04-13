import { useState } from 'react'
import { ArrowLeftRight, Eye, ExternalLink } from 'lucide-react'
import { previewUrl } from '../api/client'

interface Props {
  sessionId: string
  originalUrl: string
}

export default function ResultViewer({ sessionId, originalUrl }: Props) {
  const [view, setView] = useState<'split' | 'personalized' | 'original'>('split')
  const personalizedSrc = previewUrl(sessionId)

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 shrink-0">
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
          {([
            { id: 'split', label: 'Split', icon: <ArrowLeftRight size={12} /> },
            { id: 'original', label: 'Original', icon: <Eye size={12} /> },
            { id: 'personalized', label: 'Personalized', icon: <Eye size={12} /> },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setView(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                view === opt.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        <a
          href={personalizedSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Open full page <ExternalLink size={11} />
        </a>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex min-h-0">
        {view === 'split' ? (
          <>
            <div className="flex-1 flex flex-col border-r border-slate-200">
              <div className="bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 text-center">ORIGINAL</div>
              <iframe
                src={originalUrl}
                title="Original page"
                className="flex-1 w-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <div className="bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 text-center">PERSONALIZED</div>
              <iframe
                src={personalizedSrc}
                title="Personalized page"
                className="flex-1 w-full border-0"
              />
            </div>
          </>
        ) : view === 'original' ? (
          <iframe
            src={originalUrl}
            title="Original page"
            className="flex-1 w-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <iframe
            src={personalizedSrc}
            title="Personalized page"
            className="flex-1 w-full border-0"
          />
        )}
      </div>
    </div>
  )
}
