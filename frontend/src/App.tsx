import { useState } from 'react'
import { Sparkles, RotateCcw, AlertCircle } from 'lucide-react'
import InputForm from './components/InputForm'
import ResultViewer from './components/ResultViewer'
import DiffPanel from './components/DiffPanel'
import { personalizePage, type PersonalizeResponse } from './api/client'
import './index.css'

type Stage = 'idle' | 'loading' | 'result' | 'error'

const LOADING_STEPS = [
  'Fetching your landing page...',
  'Analyzing ad creative with Gemini...',
  'Identifying editable page elements...',
  'Planning personalization strategy...',
  'Applying surgical copy changes...',
  'Validating output...',
]

export default function App() {
  const [stage, setStage] = useState<Stage>('idle')
  const [result, setResult] = useState<PersonalizeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingStep, setLoadingStep] = useState(0)

  const handleSubmit = async (pageUrl: string, adFile?: File, adUrl?: string) => {
    setStage('loading')
    setError(null)
    setLoadingStep(0)

    const interval = setInterval(() => {
      setLoadingStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s))
    }, 4000)

    try {
      const data = await personalizePage(pageUrl, adFile, adUrl)
      setResult(data)
      setStage('result')
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (e as Error)?.message ||
        'Something went wrong. Please try again.'
      setError(msg)
      setStage('error')
    } finally {
      clearInterval(interval)
    }
  }

  const reset = () => {
    setStage('idle')
    setResult(null)
    setError(null)
    setLoadingStep(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">AdMatch</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
              AI Personalizer
            </span>
          </div>
          {stage === 'result' && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              <RotateCcw size={14} /> New Session
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      {stage === 'idle' || stage === 'loading' || stage === 'error' ? (
        <main className="max-w-xl mx-auto px-6 py-16">
          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Personalize your landing page <br />
              <span className="text-indigo-600">to match your ad</span>
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
              Upload your ad creative and paste your landing page URL. Gemini AI will surgically rewrite your page copy to match the ad — boosting message match and conversions.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-6">
            {stage === 'loading' ? (
              <div className="flex flex-col items-center py-10 gap-5">
                <div className="relative w-14 h-14">
                  <svg className="animate-spin w-14 h-14 text-indigo-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={18} className="text-indigo-600" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-800 mb-1">{LOADING_STEPS[loadingStep]}</p>
                  <p className="text-xs text-slate-400">This typically takes 20–40 seconds</p>
                </div>
                <div className="flex gap-1.5">
                  {LOADING_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i <= loadingStep ? 'bg-indigo-500 w-6' : 'bg-slate-200 w-3'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : stage === 'error' ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle size={22} className="text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 mb-1">Something went wrong</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={reset}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <InputForm onSubmit={handleSubmit} loading={false} />
            )}
          </div>

          {/* How it works */}
          {stage === 'idle' && (
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { step: '1', label: 'Upload Ad', desc: 'Image or URL of your ad creative' },
                { step: '2', label: 'Paste URL', desc: 'Your existing landing page URL' },
                { step: '3', label: 'Get Results', desc: 'AI-personalized page in seconds' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center">
                    {item.step}
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      ) : (
        /* Results Layout */
        <main className="h-[calc(100vh-57px)] flex">
          {/* Left: Diff panel */}
          <aside className="w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-white">
              <h2 className="text-sm font-bold text-slate-800">Changes Applied</h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{result!.original_url}</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <DiffPanel changes={result!.changes} summary={result!.summary} />
            </div>
          </aside>

          {/* Right: Page preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ResultViewer sessionId={result!.session_id} originalUrl={result!.original_url} />
          </div>
        </main>
      )}
    </div>
  )
}
