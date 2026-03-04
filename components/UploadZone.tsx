'use client'

import { useCallback, useState, useRef } from 'react'
import { Upload, Image as ImageIcon, Video, X, FileVideo, FileImage, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type UploadedFile = {
  file: File
  preview: string
  type: 'image' | 'video'
  base64: string
}

interface UploadZoneProps {
  onFileSelected: (file: UploadedFile | null) => void
  selectedFile: UploadedFile | null
  disabled?: boolean
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime']
const MAX_FILE_SIZE_MB = 20

export default function UploadZone({ onFileSelected, selectedFile, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image')
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    async (file: File) => {
      setError(null)
      const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type)
      const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type)

      if (!isImage && !isVideo) {
        setError('Format file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, MP4, atau WEBM.')
        return
      }

      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > MAX_FILE_SIZE_MB) {
        setError(`Ukuran file terlalu besar. Maksimum ${MAX_FILE_SIZE_MB}MB.`)
        return
      }

      const preview = URL.createObjectURL(file)

      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      onFileSelected({
        file,
        preview,
        type: isImage ? 'image' : 'video',
        base64,
      })
    },
    [onFileSelected]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [disabled, processFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleRemove = useCallback(() => {
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.preview)
    }
    onFileSelected(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [selectedFile, onFileSelected])

  const acceptAttr =
    activeTab === 'image'
      ? ACCEPTED_IMAGE_TYPES.join(',')
      : ACCEPTED_VIDEO_TYPES.join(',')

  return (
    <div className="flex flex-col gap-4">
      {/* Tab toggle */}
      <div className="flex items-center gap-1 p-1 bg-surface rounded-lg w-fit">
        <TabButton
          active={activeTab === 'image'}
          onClick={() => {
            setActiveTab('image')
            if (selectedFile?.type === 'video') handleRemove()
          }}
          icon={<ImageIcon className="w-3.5 h-3.5" />}
          label="Gambar"
        />
        <TabButton
          active={activeTab === 'video'}
          onClick={() => {
            setActiveTab('video')
            if (selectedFile?.type === 'image') handleRemove()
          }}
          icon={<Video className="w-3.5 h-3.5" />}
          label="Video"
        />
      </div>

      {/* Drop Zone */}
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-surface',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          role="button"
          tabIndex={0}
          aria-label="Upload file area"
          onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        >
          {/* Background grid decoration */}
          <div className="absolute inset-0 rounded-xl overflow-hidden opacity-30 grid-bg" />

          <div
            className={cn(
              'relative flex items-center justify-center w-16 h-16 rounded-2xl border border-border bg-surface-2 transition-all',
              isDragging && 'border-primary text-primary scale-110'
            )}
          >
            {activeTab === 'image' ? (
              <FileImage className={cn('w-8 h-8', isDragging ? 'text-primary' : 'text-muted-foreground')} />
            ) : (
              <FileVideo className={cn('w-8 h-8', isDragging ? 'text-primary' : 'text-muted-foreground')} />
            )}
          </div>

          <div className="relative text-center">
            <p className="font-semibold text-foreground text-balance">
              Drag & drop {activeTab === 'image' ? 'gambar' : 'video'} di sini
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              atau{' '}
              <span className="text-primary font-medium underline underline-offset-2 cursor-pointer">
                klik untuk memilih file
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {activeTab === 'image'
                ? 'JPG, PNG, WEBP, GIF — Maks. 20MB'
                : 'MP4, WEBM, MOV — Maks. 20MB'}
            </p>
          </div>

          {isDragging && (
            <div className="absolute inset-0 rounded-xl border-2 border-primary bg-primary/5 animate-pulse" />
          )}

          <input
            ref={inputRef}
            type="file"
            accept={acceptAttr}
            className="hidden"
            onChange={handleInputChange}
            disabled={disabled}
            aria-label="File input"
          />
        </div>
      ) : (
        <div className="relative rounded-xl border border-border overflow-hidden bg-surface">
          {/* Preview */}
          {selectedFile.type === 'image' ? (
            <div className="relative aspect-video flex items-center justify-center bg-surface-2">
              <img
                src={selectedFile.preview}
                alt="Preview gambar yang diunggah"
                className="max-w-full max-h-[320px] object-contain"
              />
            </div>
          ) : (
            <div className="relative aspect-video bg-surface-2">
              <video
                src={selectedFile.preview}
                controls
                className="w-full h-full object-contain"
                aria-label="Preview video yang diunggah"
              />
            </div>
          )}

          {/* File info bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2 min-w-0">
              {selectedFile.type === 'image' ? (
                <ImageIcon className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Video className="w-4 h-4 text-primary shrink-0" />
              )}
              <span className="text-sm text-foreground truncate">{selectedFile.file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                ({(selectedFile.file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            <button
              onClick={handleRemove}
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Hapus file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
