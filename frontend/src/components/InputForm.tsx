import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { Upload, Link, Globe, Sparkles, X } from 'lucide-react'

interface Props {
  onSubmit: (pageUrl: string, adFile?: File, adUrl?: string) => void
  loading: boolean
}

export default function InputForm({ onSubmit, loading }: Props) {
  const [pageUrl, setPageUrl] = useState('')
  const [adMode, setAdMode] = useState<'upload' | 'url'>('upload')
  const [adUrl, setAdUrl] = useState('')
  const [adFile, setAdFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setAdFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pageUrl) return
    if (adMode === 'upload' && !adFile) return
    if (adMode === 'url' && !adUrl) return
    onSubmit(pageUrl, adMode === 'upload' ? adFile! : undefined, adMode === 'url' ? adUrl : undefined)
  }

  const canSubmit = pageUrl && ((adMode === 'upload' && adFile) || (adMode === 'url' && adUrl))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Ad Creative Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Ad Creative
        </label>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden mb-3">
          {(['upload', 'url'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAdMode(mode)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                adMode === mode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {mode === 'upload' ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Upload size={14} /> Upload Image
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Link size={14} /> Ad URL
                </span>
              )}
            </button>
          ))}
        </div>

        {adMode === 'upload' ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              dragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            {preview ? (
              <div className="relative p-2">
                <img src={preview} alt="Ad preview" className="w-full max-h-48 object-contain rounded-lg" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setAdFile(null); setPreview(null) }}
                  className="absolute top-3 right-3 bg-white rounded-full p-1 shadow text-slate-500 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Upload size={28} className="mb-2" />
                <p className="text-sm font-medium">Drop ad image here or click to browse</p>
                <p className="text-xs mt-1">PNG, JPG, WEBP up to 10MB</p>
              </div>
            )}
          </div>
        ) : (
          <input
            type="url"
            placeholder="https://example.com/ad-banner.jpg"
            value={adUrl}
            onChange={(e) => setAdUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        )}
      </div>

      {/* Landing Page URL */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Landing Page URL
        </label>
        <div className="relative">
          <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="url"
            placeholder="https://yoursite.com/landing-page"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            required
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit || loading}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          canSubmit && !loading
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Personalizing...
          </>
        ) : (
          <>
            <Sparkles size={15} />
            Personalize Landing Page
          </>
        )}
      </button>
    </form>
  )
}
