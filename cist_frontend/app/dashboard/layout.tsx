"use client"

import { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  LayoutDashboard, 
  Brain, 
  Sun, 
  Map, 
  Bell, 
  FileText, 
  Settings,
  ChevronLeft,
  LogOut,
  Activity,
  Calculator
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ParticleBackground } from '@/components/particle-background'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Brain, label: 'AI Forecast', href: '/dashboard/forecast' },
  { icon: Calculator, label: 'Predict Load', href: '/dashboard/predict' },
  { icon: Sun, label: 'Renewables', href: '/dashboard/renewables' },
  { icon: Map, label: 'Grid Map', href: '/dashboard/grid-map' },
  { icon: Bell, label: 'Alerts', href: '/dashboard/alerts' },
  { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState('glass')
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    
    // Fetch theme from settings
    const fetchTheme = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/settings')
        if (res.ok) {
          const data = await res.json()
          setTheme(data.theme || 'glass')
        }
      } catch (err) {
        console.error('Failed to fetch theme:', err)
      }
    }
    fetchTheme()
  }, [])

  return (
    <div className={`min-h-screen flex bg-background relative transition-all duration-700 ${theme === 'minimal' ? 'theme-minimal' : ''}`}>
      {theme === 'glass' && <ParticleBackground />}
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        className="relative z-20 h-screen flex flex-col glass-panel border-r border-border/50 shrink-0"
      >
        {/* Logo */}
        <div className="p-4 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-3">
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 10px rgba(56, 189, 248, 0.3)',
                  '0 0 20px rgba(56, 189, 248, 0.5)',
                  '0 0 10px rgba(56, 189, 248, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 rounded-lg bg-primary/10 border border-primary/30"
            >
              <Zap className="w-6 h-6 text-primary" />
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold tracking-wider text-foreground whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  POWERGRID
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all relative group ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/30"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className="w-5 h-5 relative z-10 shrink-0" />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="relative z-10 text-sm tracking-wide whitespace-nowrap"
                          style={{ fontFamily: 'var(--font-rajdhani)' }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-border/50 space-y-1">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <Settings className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm tracking-wide whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-rajdhani)' }}
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm tracking-wide whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-rajdhani)' }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 p-1.5 bg-secondary border border-border rounded-full hover:bg-secondary/80 transition-colors"
        >
          <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }}>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </button>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top bar */}
        <header className="h-16 glass-panel border-b border-border/50 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-accent"
              />
              <span className="text-xs text-accent font-medium tracking-wider uppercase" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                System Stable
              </span>
            </div>
            <div className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              <Activity className="w-4 h-4 inline mr-2" />
              Real-time monitoring active
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Control Center
              </div>
              <div className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                {mounted ? new Date().toLocaleString() : ''}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-sm font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                OP
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
