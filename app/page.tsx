'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Loader2, AlertTriangle, Zap } from 'lucide-react'
import Header from '@/components/Header'
import UploadZone, { type UploadedFile } from '@/components/UploadZone'
import SettingsPanel, { type PromptSettings, DEFAULT_SYSTEM_PROMPT } from '@/components/SettingsPanel'
import PromptOutput, { type GeneratedPrompt } from '@/components/PromptOutput'
import HistoryPanel from '@/components/HistoryPanel'
import StepGuide from '@/components/StepGuide'
import { cn } from '@/lib/utils'

const defaultSettings: PromptSettings = {
  style: 'detailed',
  language: 'english',
  target: 'general',
  includeNegative: true,
  includeCamera: true,
  includeLighting: true,
  includeMood: true,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
}

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [settings, setSettings] = useState<PromptSettings>(defaultSettings)
  const [currentPrompt, setCurrentPrompt] = useState<GeneratedPrompt | null>(null)
  const [history, setHistory] = useState<GeneratedPrompt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!selectedFile) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: selectedFile.base64,
          fileType: selectedFile.type,
          fileName: selectedFile.file.name,
          style: settings.style,
          target: settings.target,
          language: settings.language,
          includeNegative: settings.includeNegative,
          includeCamera: settings.includeCamera,
          includeLighting: settings.includeLighting,
          includeMood: settings.includeMood,
          systemPrompt: settings.systemPrompt,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghasilkan prompt')
      }

      const newPrompt: GeneratedPrompt = {
        id: crypto.randomUUID(),
        mainPrompt: data.prompt.mainPrompt || '',
        negativePrompt: settings.includeNegative ? data.prompt.negativePrompt : undefined,
        cameraSettings: settings.includeCamera ? data.prompt.cameraSettings : undefined,
        lightingDetails: settings.includeLighting ? data.prompt.lightingDetails : undefined,
        moodAtmosphere: settings.includeMood ? data.prompt.moodAtmosphere : undefined,
        tags: data.prompt.tags || [],
        model: data.model,
        timestamp: new Date(),
        fileName: selectedFile.file.name,
        fileType: selectedFile.type,
      }

      setCurrentPrompt(newPrompt)
      setHistory((prev) => [newPrompt, ...prev].slice(0, 20))
    } catch (err: unknown) {
      console.error('[v0] Generate error:', err)
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [selectedFile, settings])

  const handleRegenerate = useCallback(() => {
    if (selectedFile) handleGenerate()
  }, [selectedFile, handleGenerate])

  const handleHistorySelect = useCallback((prompt: GeneratedPrompt) => {
    setCurrentPrompt(prompt)
    // Scroll to output
    document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleClearHistory = useCallback(() => {
    setHistory([])
    setCurrentPrompt(null)
  }, [])

  const canGenerate = !!selectedFile && !isLoading

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative py-14 sm:py-20 overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 grid-bg opacity-40" />
        {/* Radial neon glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'oklch(0.72 0.19 195)' }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wide">
              AI VISUAL PROMPT GENERATOR
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-balance">
            Ubah{' '}
            <span className="neon-text">Gambar & Video</span>
            <br />
            Menjadi Prompt Detail
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl text-balance leading-relaxed">
            Upload visual Anda dan biarkan AI Vision menganalisis setiap detail — komposisi, cahaya,
            warna, gaya — lalu menghasilkan prompt siap pakai untuk Midjourney, DALL·E, Stable
            Diffusion, Sora, dan lainnya.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Analisis Visual AI', 'Multi-Platform', 'Negative Prompt', 'Download .txt', 'Riwayat Prompt'].map(
              (feat) => (
                <span
                  key={feat}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-surface border border-border text-muted-foreground"
                >
                  {feat}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Main Generator Section */}
      <section id="generator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          {/* Left Column — Upload + Settings */}
          <div className="flex flex-col gap-5">
            {/* Upload Card */}
            <div className="card-surface rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <h2 className="text-sm font-semibold text-foreground">Upload Media</h2>
              </div>
              <UploadZone
                onFileSelected={setSelectedFile}
                selectedFile={selectedFile}
                disabled={isLoading}
              />
            </div>

            {/* Settings Card */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 px-1 mb-1">
                <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <h2 className="text-sm font-semibold text-foreground">Konfigurasi Prompt</h2>
              </div>
              <SettingsPanel settings={settings} onChange={setSettings} />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={cn(
                'relative flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-base transition-all',
                canGenerate
                  ? 'neon-button cursor-pointer'
                  : 'bg-surface border border-border text-muted-foreground cursor-not-allowed opacity-50'
              )}
              aria-label="Generate prompt dari media yang diupload"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menganalisis Visual...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>
                    {canGenerate ? 'Generate Prompt Sekarang' : 'Upload Media Terlebih Dahulu'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Right Column — Output + History */}
          <div className="flex flex-col gap-5" id="output-section">
            {/* Output step badge */}
            <div className="flex items-center gap-2 px-1">
              <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <h2 className="text-sm font-semibold text-foreground">Hasil Prompt</h2>
            </div>

            {/* Error alert */}
            {error && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Gagal menghasilkan prompt</p>
                  <p className="text-xs mt-0.5 opacity-80">{error}</p>
                </div>
              </div>
            )}

            {/* Prompt output */}
            <PromptOutput
              prompt={currentPrompt}
              isLoading={isLoading}
              onRegenerate={handleRegenerate}
            />

            {/* History */}
            <HistoryPanel
              history={history}
              onSelect={handleHistorySelect}
              onClear={handleClearHistory}
              selectedId={currentPrompt?.id}
            />
          </div>
        </div>
      </section>

      {/* Step Guide */}
      <div className="border-t border-border">
        <StepGuide />
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-muted-foreground">
          Dibangun dengan{' '}
          <span className="text-primary">Next.js</span>,{' '}
          <span className="text-primary">Claude Sonnet 4 Vision</span> &{' '}
          <span className="text-primary">Tailwind CSS</span>
        </p>
      </footer>
    </div>
  )
}
