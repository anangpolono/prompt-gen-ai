'use client'

import { useState } from 'react'
import { Copy, Check, Download, Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GeneratedPrompt {
  id: string
  mainPrompt: string
  negativePrompt?: string
  cameraSettings?: string
  lightingDetails?: string
  moodAtmosphere?: string
  tags?: string[]
  model: string
  timestamp: Date
  fileName: string
  fileType: 'image' | 'video'
}

interface PromptOutputProps {
  prompt: GeneratedPrompt | null
  isLoading: boolean
  onRegenerate: () => void
}

export default function PromptOutput({ prompt, isLoading, onRegenerate }: PromptOutputProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']))

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch {
      console.error('[v0] Failed to copy to clipboard')
    }
  }

  const copyAll = async () => {
    if (!prompt) return
    const parts = [
      `POSITIVE PROMPT:\n${prompt.mainPrompt}`,
      prompt.negativePrompt && `\nNEGATIVE PROMPT:\n${prompt.negativePrompt}`,
      prompt.cameraSettings && `\nCAMERA SETTINGS:\n${prompt.cameraSettings}`,
      prompt.lightingDetails && `\nLIGHTING:\n${prompt.lightingDetails}`,
      prompt.moodAtmosphere && `\nMOOD & ATMOSPHERE:\n${prompt.moodAtmosphere}`,
      prompt.tags && `\nTAGS:\n${prompt.tags.join(', ')}`,
    ]
      .filter(Boolean)
      .join('\n')
    await copyToClipboard(parts, 'all')
  }

  const downloadTxt = () => {
    if (!prompt) return
    const content = [
      `PROMPTGEN AI — Generated Prompt`,
      `Generated: ${prompt.timestamp.toLocaleString()}`,
      `File: ${prompt.fileName}`,
      `Model: ${prompt.model}`,
      `\n---\n`,
      `POSITIVE PROMPT:\n${prompt.mainPrompt}`,
      prompt.negativePrompt && `\nNEGATIVE PROMPT:\n${prompt.negativePrompt}`,
      prompt.cameraSettings && `\nCAMERA SETTINGS:\n${prompt.cameraSettings}`,
      prompt.lightingDetails && `\nLIGHTING:\n${prompt.lightingDetails}`,
      prompt.moodAtmosphere && `\nMOOD & ATMOSPHERE:\n${prompt.moodAtmosphere}`,
      prompt.tags && `\nTAGS:\n${prompt.tags.join(', ')}`,
    ]
      .filter(Boolean)
      .join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompt-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="card-surface rounded-xl p-6 flex flex-col gap-4 min-h-[400px]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <h3 className="text-sm font-semibold text-foreground">Hasil Prompt</h3>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 gap-5 py-12">
          {/* Animated loader */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 animate-ping absolute inset-0" />
            <div className="w-16 h-16 rounded-full border-2 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Menganalisis konten...</p>
            <p className="text-xs text-muted-foreground mt-1">AI sedang memproses visual Anda</p>
          </div>
          {/* Skeleton lines */}
          <div className="w-full flex flex-col gap-2.5">
            {[1, 0.9, 0.95, 0.7, 0.85].map((w, i) => (
              <div
                key={i}
                className="h-3 bg-surface-2 rounded-full animate-pulse"
                style={{ width: `${w * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="card-surface rounded-xl p-6 flex flex-col gap-4 min-h-[400px]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">Hasil Prompt</h3>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 gap-4 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl border border-dashed border-border flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-border" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Belum ada hasil</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload gambar atau video dan klik <span className="text-primary">"Generate Prompt"</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-surface rounded-xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Hasil Prompt</h3>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-surface-2 border border-border">
            {prompt.model}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            aria-label="Regenerate prompt"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Ulang
          </button>
          <button
            onClick={downloadTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            aria-label="Download prompt"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh
          </button>
          <button
            onClick={copyAll}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all neon-button',
              copiedSection === 'all' && 'opacity-80'
            )}
            aria-label="Salin semua prompt"
          >
            {copiedSection === 'all' ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copiedSection === 'all' ? 'Disalin!' : 'Salin Semua'}
          </button>
        </div>
      </div>

      {/* Main Prompt */}
      <PromptSection
        id="main"
        label="Positive Prompt"
        content={prompt.mainPrompt}
        expanded={expandedSections.has('main')}
        onToggle={() => toggleSection('main')}
        onCopy={() => copyToClipboard(prompt.mainPrompt, 'main')}
        copied={copiedSection === 'main'}
        highlight
        tags={prompt.tags}
      />

      {/* Optional sections */}
      {prompt.negativePrompt && (
        <PromptSection
          id="negative"
          label="Negative Prompt"
          content={prompt.negativePrompt}
          expanded={expandedSections.has('negative')}
          onToggle={() => toggleSection('negative')}
          onCopy={() => copyToClipboard(prompt.negativePrompt!, 'negative')}
          copied={copiedSection === 'negative'}
          variant="destructive"
        />
      )}

      {prompt.cameraSettings && (
        <PromptSection
          id="camera"
          label="Parameter Kamera"
          content={prompt.cameraSettings}
          expanded={expandedSections.has('camera')}
          onToggle={() => toggleSection('camera')}
          onCopy={() => copyToClipboard(prompt.cameraSettings!, 'camera')}
          copied={copiedSection === 'camera'}
        />
      )}

      {prompt.lightingDetails && (
        <PromptSection
          id="lighting"
          label="Detail Pencahayaan"
          content={prompt.lightingDetails}
          expanded={expandedSections.has('lighting')}
          onToggle={() => toggleSection('lighting')}
          onCopy={() => copyToClipboard(prompt.lightingDetails!, 'lighting')}
          copied={copiedSection === 'lighting'}
        />
      )}

      {prompt.moodAtmosphere && (
        <PromptSection
          id="mood"
          label="Suasana & Mood"
          content={prompt.moodAtmosphere}
          expanded={expandedSections.has('mood')}
          onToggle={() => toggleSection('mood')}
          onCopy={() => copyToClipboard(prompt.moodAtmosphere!, 'mood')}
          copied={copiedSection === 'mood'}
        />
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
        <span>Sumber: {prompt.fileName}</span>
        <span>{prompt.timestamp.toLocaleTimeString('id-ID')}</span>
      </div>
    </div>
  )
}

function PromptSection({
  id,
  label,
  content,
  expanded,
  onToggle,
  onCopy,
  copied,
  highlight,
  variant,
  tags,
}: {
  id: string
  label: string
  content: string
  expanded: boolean
  onToggle: () => void
  onCopy: () => void
  copied: boolean
  highlight?: boolean
  variant?: 'destructive'
  tags?: string[]
}) {
  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden transition-all',
        highlight ? 'border-primary/30 bg-primary/5' : 'border-border bg-surface',
        variant === 'destructive' && 'border-destructive/30 bg-destructive/5'
      )}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none"
        onClick={onToggle}
      >
        <span
          className={cn(
            'text-xs font-semibold uppercase tracking-wider',
            highlight ? 'text-primary' : 'text-muted-foreground',
            variant === 'destructive' && 'text-destructive'
          )}
        >
          {label}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCopy()
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-all"
            aria-label={`Salin ${label}`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Disalin' : 'Salin'}
          </button>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-foreground leading-relaxed font-mono whitespace-pre-wrap">
            {content}
          </p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full border border-primary/20 bg-primary/5 text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
