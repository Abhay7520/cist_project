"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, X, Clock, MapPin, 
  Volume2, VolumeX, ChevronDown, Wrench, Eye, CheckCheck, History, Zap,
  Thermometer, CloudSun, ShieldAlert, Sparkles, Filter
} from 'lucide-react'
import { API_URL } from '@/lib/api-config'
import { useGridMind } from '@/lib/gridmind-context'
import { VERIFIED_LOCATIONS_LIST } from '@/lib/location-catalog'

type AlertStatus = 'working' | 'acknowledged' | 'resolved'
type AlertSeverity = 'critical' | 'warning' | 'normal'
type AlertCategory = 'all' | 'observed_incident' | 'forecast_warning'

interface AlertItem {
  id: string
  type: 'observed_incident' | 'forecast_warning'
  severity: AlertSeverity
  location: string
  title: string
  description: string
  trigger: string
  suggested_action: string
  category: 'Observed Incident' | 'Forecast Warning'
  timestamp: string
  status: AlertStatus
  statusHistory?: { status: AlertStatus; timestamp: string; user?: string }[]
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    color: 'text-[oklch(0.6_0.22_25)]',
    bg: 'bg-[oklch(0.6_0.22_25)]/10',
    border: 'border-[oklch(0.6_0.22_25)]/30',
    label: 'Critical',
    pulse: true
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-[oklch(0.75_0.18_60)]',
    bg: 'bg-[oklch(0.75_0.18_60)]/10',
    border: 'border-[oklch(0.75_0.18_60)]/30',
    label: 'Warning',
    pulse: false
  },
  normal: {
    icon: Info,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    label: 'Informational',
    pulse: false
  }
}

const statusConfig = {
  working: {
    icon: Wrench,
    color: 'text-[oklch(0.75_0.18_60)]',
    bg: 'bg-[oklch(0.75_0.18_60)]/15',
    border: 'border-[oklch(0.75_0.18_60)]/40',
    glow: 'glow-orange',
    label: 'Working'
  },
  acknowledged: {
    icon: Eye,
    color: 'text-primary',
    bg: 'bg-primary/15',
    border: 'border-primary/40',
    glow: 'glow-blue',
    label: 'Acknowledged'
  },
  resolved: {
    icon: CheckCheck,
    color: 'text-accent',
    bg: 'bg-accent/15',
    border: 'border-accent/40',
    glow: '',
    label: 'Resolved'
  }
}

export default function AlertsPage() {
  const { selectedLocationId, setSelectedLocationId, selectedLocation } = useGridMind()
  
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | AlertStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<AlertCategory>('all')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)

    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_URL}/alerts?location_id=${selectedLocationId}`)
        if (!res.ok) throw new Error('Failed to fetch alerts')
        const data = await res.json()
        if (!isCancelled && data.alerts) {
          // Initialize alert status tracking
          const initialized = data.alerts.map((a: any) => ({
            ...a,
            status: a.status === 'resolved' ? 'resolved' : 'working',
            statusHistory: [
              {
                status: a.status === 'resolved' ? 'resolved' : 'working',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                user: a.type === 'forecast_warning' ? 'AI Forecasting Engine' : 'SCADA Telemetry Archive'
              }
            ]
          }))
          // Deduplicate by ID
          const seen = new Set<string>()
          const deduplicated: AlertItem[] = []
          for (const item of initialized) {
            if (!seen.has(item.id)) {
              seen.add(item.id)
              deduplicated.push(item)
            }
          }
          setAlerts(deduplicated)
        }
      } catch (err) {
        console.error('Failed to load alerts:', err)
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchAlerts()
    return () => {
      isCancelled = true
    }
  }, [selectedLocationId])

  const updateAlertStatus = (id: string, newStatus: AlertStatus) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id === id && alert.status !== newStatus) {
        const history = alert.statusHistory || []
        return {
          ...alert,
          status: newStatus,
          statusHistory: [
            ...history,
            {
              status: newStatus,
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              user: 'Grid Controller Operator'
            }
          ]
        }
      }
      return alert
    }))
    setOpenDropdown(null)
  }

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  // Filter alerts by status and category
  const filteredAlerts = alerts.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || a.type === categoryFilter
    return matchesStatus && matchesCategory
  })

  const workingCount = alerts.filter(a => a.status === 'working').length
  const acknowledgedCount = alerts.filter(a => a.status === 'acknowledged').length
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length
  const observedCount = alerts.filter(a => a.type === 'observed_incident').length
  const forecastCount = alerts.filter(a => a.type === 'forecast_warning').length

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null)
    if (openDropdown !== null) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdown])

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Traceable Alert Center
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground border border-border/50">
              [Observed vs Forecast Separated]
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
            <Bell className="w-7 h-7 text-primary" />
            Grid Alert & Incident Center
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Real measured incidents from distribution snapshots and AI-forecasted capacity & thermal warnings
          </p>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-3 glass-panel p-2.5 rounded-xl border border-border/60">
          <MapPin className="w-5 h-5 text-primary shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Distribution Node</span>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="bg-transparent text-sm font-bold text-foreground border-none outline-none cursor-pointer pr-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {VERIFIED_LOCATIONS_LIST.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-card text-foreground">
                  {loc.name} ({loc.circle})
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Filter and Category Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-secondary/30 border border-border/50">
          {[
            { value: 'all', label: 'All Alerts', count: alerts.length, icon: Bell },
            { value: 'working', label: 'Working', count: workingCount, icon: Wrench },
            { value: 'acknowledged', label: 'Acknowledged', count: acknowledgedCount, icon: Eye },
            { value: 'resolved', label: 'Resolved', count: resolvedCount, icon: CheckCheck }
          ].map((tab) => {
            const isActive = statusFilter === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value as typeof statusFilter)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all font-semibold ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
                style={{ fontFamily: 'var(--font-rajdhani)' }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/20' : 'bg-secondary'}`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Category Split (Observed Incidents vs Forecast Warnings) */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-secondary/30 border border-border/50">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              categoryFilter === 'all'
                ? 'bg-secondary text-foreground border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          >
            All Types ({alerts.length})
          </button>
          <button
            onClick={() => setCategoryFilter('observed_incident')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              categoryFilter === 'observed_incident'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          >
            <Clock className="w-3 h-3 text-amber-400" />
            Observed Incidents ({observedCount})
          </button>
          <button
            onClick={() => setCategoryFilter('forecast_warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              categoryFilter === 'forecast_warning'
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          >
            <Sparkles className="w-3 h-3 text-primary" />
            Forecast Warnings ({forecastCount})
          </button>
        </div>
      </div>

      {/* Progress & Category Summary */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-panel rounded-xl p-4 border border-border/50"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Resolution Pipeline for {selectedLocation.name}
          </span>
          <span className="text-xs font-bold text-foreground font-mono">
            {resolvedCount}/{alerts.length} Closed
          </span>
        </div>
        <div className="h-2.5 bg-secondary/50 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${alerts.length ? (workingCount / alerts.length) * 100 : 0}%` }}
            className="h-full bg-[oklch(0.75_0.18_60)]"
          />
          <div
            style={{ width: `${alerts.length ? (acknowledgedCount / alerts.length) * 100 : 0}%` }}
            className="h-full bg-primary"
          />
          <div
            style={{ width: `${alerts.length ? (resolvedCount / alerts.length) * 100 : 0}%` }}
            className="h-full bg-accent"
          />
        </div>
      </motion.div>

      {/* Alerts List */}
      <div className="space-y-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((alert, index) => {
            const severity = severityConfig[alert.severity] || severityConfig.normal
            const status = statusConfig[alert.status] || statusConfig.working
            const isObserved = alert.type === 'observed_incident'
            const StatusIcon = status.icon

            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-panel rounded-xl p-5 border-2 relative transition-all duration-300 ${status.border} ${
                  alert.status === 'resolved' ? 'opacity-70' : ''
                }`}
                style={{ zIndex: openDropdown === alert.id ? 90 : 10 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Category & Severity Badge */}
                  <div className={`p-3 rounded-xl shrink-0 ${isObserved ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400' : 'bg-primary/15 border border-primary/40 text-primary'}`}>
                    {isObserved ? <Clock className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {/* Distinction Badge */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isObserved
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-primary/20 text-primary border border-primary/40'
                          }`}>
                            [{alert.category}]
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${severity.bg} ${severity.color}`}>
                            {severity.label}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${status.bg} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                          {alert.title}
                        </h3>
                      </div>

                      {/* Dropdown for Status Update */}
                      <div className="relative shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenDropdown(openDropdown === alert.id ? null : alert.id)
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${status.bg} ${status.border} ${status.color} hover:brightness-110 shadow-sm`}
                          style={{ fontFamily: 'var(--font-rajdhani)' }}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{status.label}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === alert.id ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {openDropdown === alert.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              className="absolute right-0 top-full mt-2 w-56 rounded-xl backdrop-blur-2xl border-2 border-primary/50 z-[99999] shadow-2xl p-2 bg-card"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {(['working', 'acknowledged', 'resolved'] as AlertStatus[]).map((st) => {
                                const cfg = statusConfig[st]
                                const Icon = cfg.icon
                                const isSel = alert.status === st
                                return (
                                  <button
                                    key={st}
                                    onClick={() => updateAlertStatus(alert.id, st)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                      isSel ? `${cfg.bg} ${cfg.color} border ${cfg.border}` : 'hover:bg-secondary/70 text-muted-foreground'
                                    }`}
                                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{cfg.label}</span>
                                    {isSel && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-accent" />}
                                  </button>
                                )
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      {alert.description}
                    </p>

                    {/* Operational Trigger & Suggested Action */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3">
                      <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">
                          Trigger Condition:
                        </span>
                        <span className="text-foreground font-mono font-semibold text-[11px]">
                          {alert.trigger}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">
                          Suggested Action:
                        </span>
                        <span className="text-primary font-semibold text-[11px]">
                          {alert.suggested_action}
                        </span>
                      </div>
                    </div>

                    {/* Meta info row */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>{alert.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <Zap className="w-3 h-3 text-primary" />
                        <span>UID: {alert.id}</span>
                      </div>
                    </div>

                    {/* Status Timeline History */}
                    {alert.statusHistory && alert.statusHistory.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-border/30 text-[11px]">
                        <button
                          onClick={() => setExpandedTimeline(expandedTimeline === alert.id ? null : alert.id)}
                          className="flex items-center gap-1.5 text-primary hover:underline font-bold"
                          style={{ fontFamily: 'var(--font-rajdhani)' }}
                        >
                          <History className="w-3 h-3" />
                          <span>Audit Trail ({alert.statusHistory.length} logs)</span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${expandedTimeline === alert.id ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {expandedTimeline === alert.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-2 space-y-1.5 pl-3 border-l-2 border-primary/30"
                            >
                              {alert.statusHistory.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-muted-foreground text-[10px]">
                                  <span className="font-bold text-foreground capitalize">{item.status}</span>
                                  <span>at {item.timestamp}</span>
                                  {item.user && <span className="text-primary">by {item.user}</span>}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredAlerts.length === 0 && !isLoading && (
          <div className="text-center py-12 glass-panel rounded-xl border border-border/40">
            <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
            <h4 className="font-bold text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
              No Active Alerts
            </h4>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              All alerts in this category have been acknowledged or resolved.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
