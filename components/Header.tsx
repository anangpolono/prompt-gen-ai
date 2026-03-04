'use client'

import { Sparkles, Zap, Github, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg neon-border bg-surface">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-foreground">
                PromptGen
              </span>
              <span className="text-lg font-bold tracking-tight neon-text">AI</span>
              <Badge className="hidden sm:flex bg-primary/10 text-primary border border-primary/20 text-xs px-2 py-0 h-5">
                BETA
              </Badge>
            </div>
          </div>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="#generator" icon={<Zap className="w-3.5 h-3.5" />} label="Generator" />
            <NavLink href="#guide" icon={<BookOpen className="w-3.5 h-3.5" />} label="Panduan" />
            <NavLink href="#history" icon={<Sparkles className="w-3.5 h-3.5" />} label="Riwayat" />
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Model: Claude Sonnet 4</span>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-surface rounded-md transition-all"
    >
      {icon}
      {label}
    </a>
  )
}
