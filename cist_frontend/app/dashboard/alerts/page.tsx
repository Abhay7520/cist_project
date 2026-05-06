"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, X, Clock, MapPin, 
  Volume2, VolumeX, ChevronDown, Wrench, Eye, CheckCheck, History, Zap
} from 'lucide-react'

type AlertStatus = 'working' | 'acknowledged' | 'resolved'
type AlertSeverity = 'critical' | 'warning' | 'normal'

interface StatusUpdate {
  status: AlertStatus
  timestamp: Date
  user?: string
}

interface Alert {
  id: number
  severity: AlertSeverity
  title: string
  description: string
  location: string
  timestamp: Date
  status: AlertStatus
  statusHistory: StatusUpdate[]
}

const generateAlerts = (): Alert[] => [
  {
    id: 1,
    severity: 'critical',
    title: 'Substation Overload',
    description: 'Critical load threshold exceeded. Automatic load shedding may be initiated.',
    location: 'Substation S6 - South Industrial',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'working',
    statusHistory: [{ status: 'working', timestamp: new Date(Date.now() - 5 * 60 * 1000) }]
  },
  {
    id: 2,
    severity: 'critical',
    title: 'Power Surge Detected',
    description: 'Abnormal voltage spike detected in main transformer. Protection relay activated.',
    location: 'Substation S2 - Industrial Zone A',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    status: 'working',
    statusHistory: [{ status: 'working', timestamp: new Date(Date.now() - 8 * 60 * 1000) }]
  },
  {
    id: 3,
    severity: 'warning',
    title: 'High Temperature Warning',
    description: 'Transformer temperature at 78°C, approaching critical threshold of 85°C.',
    location: 'Substation S6 - South Industrial',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    status: 'acknowledged',
    statusHistory: [
      { status: 'working', timestamp: new Date(Date.now() - 25 * 60 * 1000) },
      { status: 'acknowledged', timestamp: new Date(Date.now() - 15 * 60 * 1000), user: 'Operator A' }
    ]
  },
  {
    id: 4,
    severity: 'warning',
    title: 'Load Imbalance Detected',
    description: 'Phase imbalance of 12% detected on three-phase supply. Monitoring required.',
    location: 'Substation S9 - Southeast Complex',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: 'working',
    statusHistory: [{ status: 'working', timestamp: new Date(Date.now() - 45 * 60 * 1000) }]
  },
  {
    id: 5,
    severity: 'normal',
    title: 'Scheduled Maintenance Reminder',
    description: 'Planned maintenance window for Line 23 starting in 2 hours.',
    location: 'Industrial Zone - Line 23',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    status: 'acknowledged',
    statusHistory: [
      { status: 'working', timestamp: new Date(Date.now() - 60 * 60 * 1000) },
      { status: 'acknowledged', timestamp: new Date(Date.now() - 30 * 60 * 1000), user: 'System' }
    ]
  },
  {
    id: 6,
    severity: 'warning',
    title: 'Renewable Output Fluctuation',
    description: 'Solar generation dropped 25% due to cloud cover. Grid compensation active.',
    location: 'Solar Farm Alpha',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'resolved',
    statusHistory: [
      { status: 'working', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { status: 'acknowledged', timestamp: new Date(Date.now() - 90 * 60 * 1000), user: 'Operator B' },
      { status: 'resolved', timestamp: new Date(Date.now() - 60 * 60 * 1000), user: 'System' }
    ]
  },
  {
    id: 7,
    severity: 'critical',
    title: 'Communication Link Failure',
    description: 'SCADA communication lost with remote terminal unit. Manual monitoring required.',
    location: 'Substation S8 - Southwest Zone',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    status: 'resolved',
    statusHistory: [
      { status: 'working', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      { status: 'acknowledged', timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), user: 'Operator C' },
      { status: 'resolved', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), user: 'Tech Team' }
    ]
  },
  {
    id: 8,
    severity: 'normal',
    title: 'Voltage Regulation Active',
    description: 'Automatic voltage regulator engaged to maintain grid stability.',
    location: 'Substation S5 - East Residential',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'resolved',
    statusHistory: [
      { status: 'working', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      { status: 'resolved', timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000), user: 'System' }
    ]
  }
]

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
    label: 'Normal',
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

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(generateAlerts())
  const [statusFilter, setStatusFilter] = useState<'all' | AlertStatus>('all')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [expandedTimeline, setExpandedTimeline] = useState<number | null>(null)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

  const filteredAlerts = statusFilter === 'all' 
    ? alerts 
    : alerts.filter(a => a.status === statusFilter)

  const updateAlertStatus = (id: number, newStatus: AlertStatus) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id === id && alert.status !== newStatus) {
        return {
          ...alert,
          status: newStatus,
          statusHistory: [
            ...alert.statusHistory,
            { status: newStatus, timestamp: new Date(), user: 'Current User' }
          ]
        }
      }
      return alert
    }))
    setOpenDropdown(null)
  }

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const workingCount = alerts.filter(a => a.status === 'working').length
  const acknowledgedCount = alerts.filter(a => a.status === 'acknowledged').length
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length
  const criticalWorkingCount = alerts.filter(a => a.severity === 'critical' && a.status === 'working').length

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null)
    if (openDropdown !== null) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdown])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
            <Bell className="w-7 h-7 text-primary" />
            Alert Management Center
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Interactive incident management and tracking system
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled 
                ? 'bg-primary/10 border-primary/30 text-primary' 
                : 'bg-secondary/50 border-border/50 text-muted-foreground'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          {/* Alert summary badges */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50">
            {criticalWorkingCount > 0 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-[oklch(0.6_0.22_25)]/20 text-[oklch(0.6_0.22_25)]"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
                  {criticalWorkingCount}
                </span>
              </motion.div>
            )}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[oklch(0.75_0.18_60)]/20 text-[oklch(0.75_0.18_60)]">
              <Wrench className="w-4 h-4" />
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
                {workingCount}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-secondary/30 border border-border/50 w-fit">
        {[
          { value: 'all', label: 'All Alerts', count: alerts.length, icon: Bell },
          { value: 'working', label: 'Working', count: workingCount, icon: Wrench },
          { value: 'acknowledged', label: 'Acknowledged', count: acknowledgedCount, icon: Eye },
          { value: 'resolved', label: 'Resolved', count: resolvedCount, icon: CheckCheck }
        ].map((tab) => {
          const isActive = statusFilter === tab.value
          const statusStyle = tab.value !== 'all' ? statusConfig[tab.value as AlertStatus] : null
          
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value as typeof statusFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? statusStyle ? `${statusStyle.bg} ${statusStyle.color} ${statusStyle.border} border` : 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-foreground/10' : 'bg-secondary'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Progress Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-panel rounded-xl p-4 border border-border/50"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Alert Resolution Progress
          </span>
          <span className="text-sm font-medium text-foreground" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
            {resolvedCount}/{alerts.length} Resolved
          </span>
        </div>
        <div className="h-3 bg-secondary/50 rounded-full overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(workingCount / alerts.length) * 100}%` }}
            className="h-full bg-[oklch(0.75_0.18_60)]"
            transition={{ duration: 0.5 }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(acknowledgedCount / alerts.length) * 100}%` }}
            className="h-full bg-primary"
            transition={{ duration: 0.5, delay: 0.1 }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(resolvedCount / alerts.length) * 100}%` }}
            className="h-full bg-accent"
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_60)]" />
            <span>Working ({workingCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Acknowledged ({acknowledgedCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span>Resolved ({resolvedCount})</span>
          </div>
        </div>
      </motion.div>

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((alert, index) => {
            const severity = severityConfig[alert.severity]
            const status = statusConfig[alert.status]
            const SeverityIcon = severity.icon
            const StatusIcon = status.icon

            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
                className={`glass-panel rounded-xl p-5 border-2 relative transition-all duration-500 ${status.border} ${
                  alert.status === 'resolved' ? 'opacity-70' : ''
                } ${alert.status === 'working' && alert.severity === 'critical' ? 'glow-red' : status.glow}`}
                style={{ zIndex: openDropdown === alert.id ? 50 : 1 }}
              >
                {/* Animated background for working status */}
                {alert.status === 'working' && (
                  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    <motion.div
                      animate={{ opacity: [0.05, 0.15, 0.05] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute inset-0 ${alert.severity === 'critical' ? 'bg-[oklch(0.6_0.22_25)]' : 'bg-[oklch(0.75_0.18_60)]'}`}
                    />
                  </div>
                )}
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 relative">
                  {/* Left: Severity indicator */}
                  <div className={`p-3 rounded-xl ${severity.bg} border ${severity.border} shrink-0 self-start`}>
                    <SeverityIcon className={`w-5 h-5 ${severity.color}`} />
                  </div>

                  {/* Middle: Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${severity.bg} ${severity.color} uppercase tracking-wider font-semibold`}>
                            {severity.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color} flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
                          {alert.title}
                        </h3>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenDropdown(openDropdown === alert.id ? null : alert.id)
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${status.bg} ${status.border} ${status.color} hover:brightness-110`}
                            style={{ fontFamily: 'var(--font-rajdhani)' }}
                          >
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{status.label}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === alert.id ? 'rotate-180' : ''}`} />
                          </button>
                          
                          <AnimatePresence>
                            {openDropdown === alert.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                className="absolute right-0 top-full mt-2 w-56 rounded-xl backdrop-blur-xl border border-primary/40 z-[9999]"
                                style={{
                                  background: 'linear-gradient(180deg, oklch(0.14 0.02 250 / 0.98), oklch(0.11 0.02 250 / 0.98))',
                                  boxShadow: '0 0 40px oklch(0.7 0.18 200 / 0.25), 0 20px 50px oklch(0 0 0 / 0.6), inset 0 1px 0 oklch(1 0 0 / 0.05)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Header */}
                                <div className="px-4 py-2.5 border-b border-primary/20">
                                  <span className="text-xs font-semibold text-primary uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                    Update Status
                                  </span>
                                </div>
                                
                                {/* Scrollable Options Container */}
                                <div className="p-2 space-y-1">
                                  {(['working', 'acknowledged', 'resolved'] as AlertStatus[]).map((statusOption, idx) => {
                                    const optionConfig = statusConfig[statusOption]
                                    const OptionIcon = optionConfig.icon
                                    const isSelected = alert.status === statusOption
                                    
                                    return (
                                      <motion.button
                                        key={statusOption}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => updateAlertStatus(alert.id, statusOption)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                                          isSelected 
                                            ? `${optionConfig.bg} ${optionConfig.color} border-2 ${optionConfig.border}` 
                                            : 'hover:bg-secondary/60 text-muted-foreground hover:text-foreground border-2 border-transparent'
                                        }`}
                                        style={{ 
                                          fontFamily: 'var(--font-rajdhani)',
                                          boxShadow: isSelected ? `0 0 20px ${statusOption === 'working' ? 'oklch(0.75 0.18 60 / 0.35)' : statusOption === 'acknowledged' ? 'oklch(0.7 0.18 200 / 0.35)' : 'oklch(0.75 0.2 160 / 0.35)'}` : 'none'
                                        }}
                                      >
                                        <div className={`p-2 rounded-lg transition-all ${isSelected ? optionConfig.bg : 'bg-secondary/40 group-hover:bg-secondary/60'}`}>
                                          <OptionIcon className={`w-4 h-4 transition-colors ${isSelected ? optionConfig.color : 'text-muted-foreground group-hover:text-foreground'}`} />
                                        </div>
                                        <div className="flex-1 text-left">
                                          <span className="font-bold text-sm block">{optionConfig.label}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {statusOption === 'working' && 'In progress'}
                                            {statusOption === 'acknowledged' && 'Being reviewed'}
                                            {statusOption === 'resolved' && 'Issue fixed'}
                                          </span>
                                        </div>
                                        {isSelected && (
                                          <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                            className={`p-1 rounded-full ${optionConfig.bg} border ${optionConfig.border}`}
                                          >
                                            <CheckCircle2 className={`w-4 h-4 ${optionConfig.color}`} />
                                          </motion.div>
                                        )}
                                      </motion.button>
                                    )
                                  })}
                                </div>
                                
                                {/* Footer glow line */}
                                <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      {alert.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span style={{ fontFamily: 'var(--font-rajdhani)' }}>{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span style={{ fontFamily: 'var(--font-rajdhani)' }}>{formatTimeAgo(alert.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span style={{ fontFamily: 'var(--font-rajdhani)' }}>ID: {alert.id.toString().padStart(4, '0')}</span>
                      </div>
                    </div>

                    {/* Timeline Toggle */}
                    <button
                      onClick={() => setExpandedTimeline(expandedTimeline === alert.id ? null : alert.id)}
                      className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-all"
                      style={{ fontFamily: 'var(--font-rajdhani)' }}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Status Timeline ({alert.statusHistory.length} updates)</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedTimeline === alert.id ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Timeline Expanded */}
                    <AnimatePresence>
                      {expandedTimeline === alert.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pl-4 border-l-2 border-border/50 space-y-3">
                            {alert.statusHistory.map((update, i) => {
                              const updateStatus = statusConfig[update.status]
                              const UpdateIcon = updateStatus.icon
                              
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex items-center gap-3"
                                >
                                  <div className={`w-2 h-2 rounded-full ${updateStatus.bg.replace('/15', '')} -ml-[calc(0.5rem+1px)]`} />
                                  <div className={`p-1.5 rounded-lg ${updateStatus.bg}`}>
                                    <UpdateIcon className={`w-3 h-3 ${updateStatus.color}`} />
                                  </div>
                                  <div className="flex-1">
                                    <span className={`text-xs font-medium ${updateStatus.color}`}>
                                      {updateStatus.label}
                                    </span>
                                    {update.user && (
                                      <span className="text-xs text-muted-foreground ml-2">
                                        by {update.user}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(update.timestamp)}
                                  </span>
                                </motion.div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 w-fit mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
              All Clear
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              No alerts matching the current filter
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
