'use client'

import { Upload, Settings, Sparkles, Copy, CheckCircle } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: <Upload className="w-5 h-5" />,
    title: 'Upload Media',
    desc: 'Drag & drop atau pilih gambar (JPG, PNG, WEBP) atau video (MP4, WEBM) dari perangkat Anda.',
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
  },
  {
    number: '02',
    icon: <Settings className="w-5 h-5" />,
    title: 'Atur Pengaturan',
    desc: 'Pilih gaya prompt, target AI model (Midjourney, DALL·E, Stable Diffusion), bahasa output, dan elemen yang ingin disertakan.',
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
  },
  {
    number: '03',
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Generate Prompt',
    desc: 'Klik tombol "Generate Prompt". AI Vision akan menganalisis konten visual Anda secara mendalam menggunakan Claude Sonnet 4.',
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
  },
  {
    number: '04',
    icon: <Copy className="w-5 h-5" />,
    title: 'Salin & Gunakan',
    desc: 'Salin prompt yang dihasilkan ke clipboard atau unduh sebagai file .txt. Gunakan langsung di platform AI pilihan Anda.',
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
  },
]

export default function StepGuide() {
  return (
    <section id="guide" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Title */}
      <div className="flex flex-col items-center text-center gap-3 mb-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <CheckCircle className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Cara Penggunaan</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">
          Dari Visual ke Prompt dalam{' '}
          <span className="neon-text">4 Langkah Mudah</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl text-balance">
          Teknologi AI Vision kami menganalisis setiap detail visual dan mengubahnya menjadi
          prompt yang siap pakai untuk berbagai platform AI generatif.
        </p>
      </div>

      {/* Steps grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((step, idx) => (
          <div
            key={step.number}
            className="relative card-surface rounded-xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-all"
          >
            {/* Connector line (not on last item) */}
            {idx < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-8 -right-2 w-4 h-px bg-border z-10" />
            )}

            {/* Step number + icon */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl border ${step.bg} ${step.color}`}>
                {step.icon}
              </div>
              <span className="text-2xl font-black text-border">{step.number}</span>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tech stack badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
        {[
          'Claude Sonnet 4',
          'Vision AI',
          'Midjourney',
          'DALL·E 3',
          'Stable Diffusion',
          'Sora',
          'Runway',
        ].map((tech) => (
          <span
            key={tech}
            className="px-3 py-1 text-xs font-medium rounded-full border border-border bg-surface text-muted-foreground"
          >
            {tech}
          </span>
        ))}
      </div>
    </section>
  )
}
