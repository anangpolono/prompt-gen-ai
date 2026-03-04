'use client'

import { Clock, Trash2, Image as ImageIcon, Video, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GeneratedPrompt } from './PromptOutput'

interface HistoryPanelProps {
  history: GeneratedPrompt[]
  onSelect: (prompt: GeneratedPrompt) => void
  onClear: () => void
  selectedId?: string
}

export default function HistoryPanel({ history, onSelect, onClear, selectedId }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="card-surface rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">Riwayat</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
          <div className="w-10 h-10 rounded-xl border border-dashed border-border flex items-center justify-center">
            <Clock className="w-5 h-5 text-border" />
          </div>
          <p className="text-xs text-muted-foreground">Belum ada riwayat prompt</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-surface rounded-xl p-5 flex flex-col gap-3" id="history">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Riwayat</h3>
          <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-full bg-surface-2 border border-border">
            {history.length}
          </span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          aria-label="Hapus semua riwayat"
        >
          <Trash2 className="w-3 h-3" />
          Hapus Semua
        </button>
      </div>

      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all group',
              selectedId === item.id
                ? 'border-primary/40 bg-primary/5'
                : 'border-transparent hover:border-border hover:bg-surface'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg border shrink-0',
                selectedId === item.id ? 'border-primary/30 bg-primary/10' : 'border-border bg-surface-2'
              )}
            >
              {item.fileType === 'image' ? (
                <ImageIcon className="w-4 h-4 text-primary" />
              ) : (
                <Video className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{item.fileName}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">
                {item.mainPrompt.substring(0, 80)}...
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {item.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <ChevronRight
              className={cn(
                'w-3.5 h-3.5 shrink-0 transition-all',
                selectedId === item.id ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
