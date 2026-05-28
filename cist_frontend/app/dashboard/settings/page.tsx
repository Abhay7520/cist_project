"use client"

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api-config'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  User, 
  Save, 
  ChevronRight,
  Monitor,
  Cpu,
  Globe,
  Lock,
  FileText
} from 'lucide-react'

const sections = [
  { id: 'general', title: 'General', icon: Settings, description: 'System identity and regional settings' },
  { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Alert thresholds and delivery methods' },
  { id: 'data', title: 'Data Source', icon: Database, description: 'Dataset management and sync intervals' },
  { id: 'appearance', title: 'Appearance', icon: Palette, description: 'Theme and visualization preferences' },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    system_name: 'TGSPDCL Main Hub',
    region_code: 'HYD-CENTRAL-01',
    sync_interval: 5,
    load_threshold: 90,
    efficiency_threshold: 92,
    theme: 'glass'
  })

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`)
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async (updatedSettings = settings) => {
    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      })
      if (res.ok) {
        console.log('Settings saved successfully')
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setTimeout(() => setIsSaving(false), 800)
    }
  }

  const handleChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    
    if (key === 'theme') {
      // Immediate visual feedback
      document.body.classList.toggle('theme-minimal', value === 'minimal')
      // Auto-save theme preference
      handleSave(newSettings)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
            <Settings className="w-7 h-7 text-primary" />
            System Settings
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Configure grid monitoring and AI parameters
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold transition-all shadow-lg shadow-primary/20"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          {isSaving ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Save className="w-5 h-5" />
            </motion.div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {sections.map((section) => {
            const isActive = activeSection === section.id
            return (
              <motion.button
                key={section.id}
                whileHover={{ x: 5 }}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left border ${
                  isActive 
                    ? 'bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/5' 
                    : 'bg-secondary/20 border-border/50 text-muted-foreground hover:bg-secondary/40'
                }`}
              >
                <section.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                    {section.title}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 truncate" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    {section.description}
                  </p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </motion.button>
            )
          })}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel rounded-2xl p-8 border border-border/50"
          >
            {activeSection === 'general' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 pb-4 border-b border-border/30">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Monitor className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>System Configuration</h2>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>Identify your grid node and region</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1" style={{ fontFamily: 'var(--font-heading)' }}>Control Center Name</label>
                    <input 
                      type="text" 
                      value={settings.system_name}
                      onChange={(e) => handleChange('system_name', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1" style={{ fontFamily: 'var(--font-heading)' }}>Region Code</label>
                    <input 
                      type="text" 
                      value={settings.region_code}
                      onChange={(e) => handleChange('region_code', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1" style={{ fontFamily: 'var(--font-heading)' }}>Timezone</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                      <option>Asia/Kolkata (IST)</option>
                      <option>UTC (Greenwich)</option>
                      <option>Asia/Dubai</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1" style={{ fontFamily: 'var(--font-heading)' }}>System Language</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                      <option>English (Universal)</option>
                      <option>Hindi (Localized)</option>
                      <option>Telugu (Regional)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 pb-4 border-b border-border/30">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Bell className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>Notification Settings</h2>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>Configure alert triggers and priority</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { key: 'load_threshold', label: 'Critical Load Alert', desc: 'Notify when a section exceeds threshold', suffix: '%' },
                    { key: 'efficiency_threshold', label: 'Efficiency Drop Warning', desc: 'Alert when grid efficiency falls below threshold', suffix: '%' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/30">
                      <div>
                        <p className="text-sm font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>{item.label}</p>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <input 
                          type="number" 
                          value={(settings as any)[item.key]} 
                          onChange={(e) => handleChange(item.key, parseInt(e.target.value))}
                          className="w-16 px-2 py-1 rounded bg-primary/10 border border-primary/30 text-primary text-xs font-bold text-center outline-none"
                        />
                        <div className="w-12 h-6 bg-accent rounded-full relative p-1 cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 pb-4 border-b border-border/30">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>Data Source Configuration</h2>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>Manage your electrical grid dataset</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <FileText className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>Active Dataset</p>
                        <p className="text-xs text-muted-foreground font-mono">TGSPDCL_Modified.csv</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline">Change File</button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1" style={{ fontFamily: 'var(--font-heading)' }}>Sync Interval (Seconds)</label>
                    <div className="flex gap-4">
                      {[5, 10, 30, 60].map(s => (
                        <button 
                          key={s} 
                          onClick={() => handleChange('sync_interval', s)}
                          className={`flex-1 py-2 rounded-lg border transition-all ${settings.sync_interval === s ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary/30 border-border/50 text-muted-foreground'}`}
                          style={{ fontFamily: 'var(--font-rajdhani)' }}
                        >
                          {s}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 pb-4 border-b border-border/30">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Palette className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>Visual Preferences</h2>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>Customize your dashboard interface</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => handleChange('theme', 'glass')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-4 cursor-pointer ${
                      settings.theme === 'glass' ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' : 'bg-secondary/10 border-border/50 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="w-full h-24 rounded-lg bg-black/40 border border-white/10 relative overflow-hidden">
                      <div className="absolute top-2 left-2 w-8 h-2 bg-primary/40 rounded" />
                      <div className="absolute top-6 left-2 w-12 h-8 bg-white/5 rounded" />
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                    </div>
                    <span className={`text-sm font-bold ${settings.theme === 'glass' ? 'text-primary' : 'text-muted-foreground'}`}>Glassmorphism (Default)</span>
                  </div>
                  <div 
                    onClick={() => handleChange('theme', 'minimal')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-4 cursor-pointer ${
                      settings.theme === 'minimal' ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' : 'bg-secondary/10 border-border/50 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="w-full h-24 rounded-lg bg-secondary/20 border border-border/50 relative overflow-hidden">
                      <div className="absolute top-2 left-2 w-8 h-2 bg-foreground/10 rounded" />
                    </div>
                    <span className={`text-sm font-bold ${settings.theme === 'minimal' ? 'text-primary' : 'text-muted-foreground'}`}>Minimalist (Clean)</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Help Card */}
          <div className="glass-panel rounded-2xl p-6 border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>Administrator Mode Active</h4>
                <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  You are currently modifying global system parameters. Some changes may require a dashboard restart to take full effect. 
                  Always verify critical load thresholds before saving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
