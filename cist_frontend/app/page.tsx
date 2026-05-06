"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnergyGridBackground } from '@/components/energy-grid-background'
import { Zap, Lock, User, ArrowRight, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1500))
    router.push('/dashboard')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <EnergyGridBackground />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
      
      {/* Login container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo and title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(56, 189, 248, 0.4)',
                  '0 0 40px rgba(56, 189, 248, 0.6)',
                  '0 0 20px rgba(56, 189, 248, 0.4)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 rounded-xl bg-primary/10 border border-primary/30"
            >
              <Zap className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold tracking-wider text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            POWERGRID AI
          </h1>
          <p className="text-muted-foreground mt-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Intelligent Electricity Management System
          </p>
        </motion.div>

        {/* Login form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-panel rounded-2xl p-8 glow-blue"
        >
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground uppercase tracking-widest" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Secure Access Portal
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Operator ID
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@powergrid.ai"
                  className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  style={{ fontFamily: 'var(--font-rajdhani)' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Access Code
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure access code"
                  className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  style={{ fontFamily: 'var(--font-rajdhani)' }}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                    <span>AUTHENTICATING</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span>INITIALIZE SESSION</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Status indicator */}
          <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-accent"
              />
              <span className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                System Online
              </span>
            </div>
            <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              v2.4.1
            </span>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-muted-foreground mt-6"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          Authorized personnel only. All access attempts are logged.
        </motion.p>
      </motion.div>
    </div>
  )
}
