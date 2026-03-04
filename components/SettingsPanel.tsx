'use client'

import { Settings2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export type PromptStyle = 'detailed' | 'concise' | 'cinematic' | 'technical' | 'artistic'
export type PromptLanguage = 'english' | 'indonesian'
export type PromptTarget = 'midjourney' | 'dalle' | 'stablediffusion' | 'sora' | 'runway' | 'general'

export interface PromptSettings {
  style: PromptStyle
  language: PromptLanguage
  target: PromptTarget
  includeNegative: boolean
  includeCamera: boolean
  includeLighting: boolean
  includeMood: boolean
  systemPrompt: string
}

interface SettingsPanelProps {
  settings: PromptSettings
  onChange: (settings: PromptSettings) => void
}

const STYLES: { value: PromptStyle; label: string; desc: string }[] = [
  { value: 'detailed', label: 'Detail Lengkap', desc: 'Deskripsi sangat menyeluruh' },
  { value: 'concise', label: 'Ringkas', desc: 'Prompt pendek & padat' },
  { value: 'cinematic', label: 'Sinematik', desc: 'Gaya sinema & film' },
  { value: 'technical', label: 'Teknikal', desc: 'Parameter teknis kamera' },
  { value: 'artistic', label: 'Artistik', desc: 'Gaya seni & estetika' },
]

const TARGETS: { value: PromptTarget; label: string }[] = [
  { value: 'general', label: 'General AI' },
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'dalle', label: 'DALL·E' },
  { value: 'stablediffusion', label: 'Stable Diffusion' },
  { value: 'sora', label: 'Sora (Video)' },
  { value: 'runway', label: 'Runway (Video)' },
]

const DEFAULT_SYSTEM_PROMPT = `You are an expert AI prompt engineer. Analyze the provided image or video frame and generate a highly detailed, descriptive prompt that captures:
- Subject and composition
- Visual style, colors, and aesthetics
- Lighting conditions and atmosphere
- Camera angle and perspective
- Mood and emotional tone
- Technical details (if relevant)

Output the prompt in a format optimized for the specified AI model. Be specific, vivid, and creative.`

export default function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const [showSystem, setShowSystem] = useState(false)

  const update = (partial: Partial<PromptSettings>) => onChange({ ...settings, ...partial })

  return (
    <div className="card-surface rounded-xl p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Pengaturan Prompt</h3>
      </div>

      {/* Style selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Gaya Prompt
        </label>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => update({ style: s.value })}
              className={cn(
                'flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-all',
                settings.style === s.value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              <span className="text-xs font-medium leading-tight">{s.label}</span>
              <span className="text-xs opacity-60 mt-0.5 leading-tight">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target AI */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Target AI Model
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {TARGETS.map((t) => (
            <button
              key={t.value}
              onClick={() => update({ target: t.value })}
              className={cn(
                'px-3 py-2 rounded-lg border text-xs font-medium transition-all',
                settings.target === t.value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Bahasa Output
        </label>
        <div className="flex gap-1.5">
          {(['english', 'indonesian'] as PromptLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => update({ language: lang })}
              className={cn(
                'flex-1 py-2 rounded-lg border text-sm font-medium transition-all',
                settings.language === lang
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              {lang === 'english' ? 'English' : 'Indonesia'}
            </button>
          ))}
        </div>
      </div>

      {/* Include options */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Elemen yang Disertakan
        </label>
        <div className="grid grid-cols-2 gap-2">
          <ToggleOption
            label="Negatif Prompt"
            checked={settings.includeNegative}
            onChange={(v) => update({ includeNegative: v })}
          />
          <ToggleOption
            label="Parameter Kamera"
            checked={settings.includeCamera}
            onChange={(v) => update({ includeCamera: v })}
          />
          <ToggleOption
            label="Detail Pencahayaan"
            checked={settings.includeLighting}
            onChange={(v) => update({ includeLighting: v })}
          />
          <ToggleOption
            label="Suasana & Mood"
            checked={settings.includeMood}
            onChange={(v) => update({ includeMood: v })}
          />
        </div>
      </div>

      {/* System Prompt (collapsible) */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowSystem((p) => !p)}
          className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
        >
          <span>System Prompt (Kustomisasi)</span>
          <ChevronDown
            className={cn('w-3.5 h-3.5 transition-transform', showSystem && 'rotate-180')}
          />
        </button>
        {showSystem && (
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => update({ systemPrompt: e.target.value })}
            rows={6}
            className="w-full rounded-lg border border-border bg-surface text-xs text-foreground p-3 font-mono resize-y focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground leading-relaxed"
            placeholder="Masukkan instruksi sistem kustom..."
            aria-label="System prompt kustom"
          />
        )}
        {showSystem && (
          <button
            onClick={() => update({ systemPrompt: DEFAULT_SYSTEM_PROMPT })}
            className="text-xs text-primary hover:text-primary/80 text-left transition-colors"
          >
            Reset ke default
          </button>
        )}
      </div>
    </div>
  )
}

function ToggleOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onChange(!checked)}
        className={cn(
          'relative w-9 h-5 rounded-full transition-all cursor-pointer shrink-0',
          checked ? 'bg-primary' : 'bg-surface-2 border border-border'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-foreground transition-transform shadow-sm',
            checked ? 'translate-x-4 bg-primary-foreground' : 'translate-x-0 bg-muted-foreground'
          )}
        />
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
    </label>
  )
}

export { DEFAULT_SYSTEM_PROMPT }
