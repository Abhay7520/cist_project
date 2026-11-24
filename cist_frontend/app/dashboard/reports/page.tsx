"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, Download, Calendar, TrendingUp, Zap, Activity, Brain, 
  Loader2, Sparkles, BarChart3, PieChart, LineChart, FileDown, 
  Table, ChevronDown, MapPin, Building2, CheckCircle2, AlertTriangle,
  CloudSun, Thermometer, Droplets, ShieldCheck, Database, Server
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts'
import { API_URL } from '@/lib/api-config'
import { useGridMind } from '@/lib/gridmind-context'
import { VERIFIED_LOCATIONS_LIST } from '@/lib/location-catalog'

type ReportType = 'demand' | 'performance' | 'renewable' | 'weather_impact'
type DateRange = 'week' | 'month' | 'quarter'

interface ReportConfig {
  id: ReportType
  title: string
  description: string
  icon: typeof TrendingUp
}

const reportTypes: ReportConfig[] = [
  {
    id: 'demand',
    title: 'Demand Analysis',
    description: 'Measured feeder loading vs XGBoost forecast peaks across operational intervals',
    icon: TrendingUp
  },
  {
    id: 'weather_impact',
    title: 'Weather Impact on Electricity Demand',
    description: 'Temperature and cooling degree response calculated by XGBoost regressor',
    icon: CloudSun
  },
  {
    id: 'renewable',
    title: 'Renewable Energy Integration',
    description: 'Documented solar capacity contribution and net grid demand offsets',
    icon: Zap
  },
  {
    id: 'performance',
    title: 'Grid Substation Health',
    description: 'Transformer loading margins, thermal stress, and telemetry verification',
    icon: Activity
  }
]

const COLORS = ['oklch(0.8 0.18 90)', 'oklch(0.7 0.18 200)', 'oklch(0.75 0.2 160)', 'oklch(0.65 0.15 280)']

export default function ReportsPage() {
  const { selectedLocationId, setSelectedLocationId, selectedLocation } = useGridMind()

  const [selectedReport, setSelectedReport] = useState<ReportType>('demand')
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [reportData, setReportData] = useState<any>(null)

  // Generate real data report from backend
  const generateReport = async () => {
    setIsGenerating(true)
    setReportGenerated(false)
    setGenerationProgress(10)
    
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 20
      })
    }, 150)

    try {
      const url = new URL(`${API_URL}/report-data`)
      url.searchParams.append('report_type', selectedReport)
      url.searchParams.append('location_id', selectedLocationId)
      url.searchParams.append('range', dateRange)

      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        setReportData(data)
      } else {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch (err) {
      console.error('Failed to fetch report data:', err)
    } finally {
      clearInterval(progressInterval)
      setGenerationProgress(100)
      await new Promise(resolve => setTimeout(resolve, 250))
      setIsGenerating(false)
      setReportGenerated(true)
    }
  }

  const exportSummaryTxt = () => {
    if (!reportData) return
    const content = `========================================================================
GRIDMIND DISTRIBUTION AUDIT & FORECAST REPORT
========================================================================
Node Location: ${reportData.location} (${reportData.circle} Circle, Section: ${reportData.section})
Report Type:   ${reportData.report_type.toUpperCase()}
Time Window:   ${reportData.period.toUpperCase()}
Generated:     ${reportData.generated_timestamp}

DATA PROVENANCE & ARCHITECTURE:
${(reportData.data_provenance || []).map((p: string, i: number) => `  [${i+1}] ${p}`).join('\n')}
Live SCADA Status: Unavailable (Historical snapshot & Open-Meteo REST feed active)

OPERATIONAL METRICS:
  * ${reportData.metrics?.m1_label}: ${reportData.metrics?.m1_val}
  * ${reportData.metrics?.m2_label}: ${reportData.metrics?.m2_val}
  * ${reportData.metrics?.m3_label}: ${reportData.metrics?.m3_val}
  * ${reportData.metrics?.m4_label}: ${reportData.metrics?.m4_val}

ACTIVE DISPATCH RECOMMENDATIONS:
${(reportData.active_recommendations || []).map((r: string, i: number) => `  * ${r}`).join('\n')}

========================================================================
End of Automated Report
========================================================================`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `GridMind_Report_${selectedLocationId}_${dateRange}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

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
              <Database className="w-3 h-3" /> Audit & Provenance Reports
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground border border-border/50">
              [Measured vs Forecast Traceability]
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
            <FileText className="w-7 h-7 text-primary" />
            Grid Audit & Demand Reports
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Comprehensive reporting citing historical feeder datasets, weather feeds, and XGBoost regressor outputs
          </p>
        </div>

        {/* Synchronized Location Selector */}
        <div className="flex items-center gap-3 glass-panel p-2.5 rounded-xl border border-border/60">
          <MapPin className="w-5 h-5 text-primary shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Distribution Node</span>
            <select
              value={selectedLocationId}
              onChange={(e) => {
                setSelectedLocationId(e.target.value)
                setReportGenerated(false)
              }}
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

      {/* Configuration Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 border border-border/50"
      >
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
          <BarChart3 className="w-5 h-5 text-primary" />
          Select Report Scope & Horizon
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Type */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Analysis Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportTypes.map((report) => {
                const isSelected = selectedReport === report.id
                return (
                  <button
                    key={report.id}
                    onClick={() => {
                      setSelectedReport(report.id)
                      setReportGenerated(false)
                    }}
                    className={`p-3.5 rounded-xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'bg-primary/10 border-primary/60 shadow-sm' 
                        : 'bg-secondary/30 border-border/50 hover:border-primary/30'
                    }`}
                  >
                    <report.icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h4 className={`font-bold text-xs ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                      {report.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      {report.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time Horizon & Parameters */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Analysis Horizon
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'week', label: '7-Day Profile' },
                  { value: 'month', label: '30-Day Evaluation' },
                  { value: 'quarter', label: 'Quarterly Aggregation' }
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      setDateRange(range.value as DateRange)
                      setReportGenerated(false)
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                      dateRange === range.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary/30 border-border/50 text-muted-foreground hover:text-foreground'
                    }`}
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40 text-xs space-y-1">
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold">Target Substation</span>
              <p className="font-bold text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                {selectedLocation.name} — {selectedLocation.section}
              </p>
              <p className="text-muted-foreground text-[11px]">
                Circle: {selectedLocation.circle} | Section: {selectedLocation.section} | Coordinates: {selectedLocation?.lat?.toFixed(4) ?? '17.4156'}°N, {selectedLocation?.lng?.toFixed(4) ?? '78.4347'}°E
              </p>
            </div>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <motion.button
            onClick={generateReport}
            disabled={isGenerating}
            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
            whileTap={{ scale: isGenerating ? 1 : 0.98 }}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              isGenerating ? 'bg-primary/50 text-white cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
            }`}
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Assembling Telemetry & Forecasts ({generationProgress}%)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Verified Audit Report</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Report Output */}
      <AnimatePresence>
        {reportGenerated && reportData && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            className="space-y-6"
          >
            {/* Report Header & Action Bar */}
            <div className="glass-panel rounded-xl p-5 border border-primary/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span className="text-xs text-accent font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Report Compiled from Verified Datasets
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  {reportTypes.find(r => r.id === selectedReport)?.title} Report: {reportData.location}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  Administrative Section: <strong>{reportData.section}</strong> ({reportData.circle} Circle) • Period: <strong>{reportData.period.toUpperCase()}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={exportSummaryTxt}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 transition-all text-xs font-bold"
                  style={{ fontFamily: 'var(--font-rajdhani)' }}
                >
                  <FileDown className="w-4 h-4" />
                  Export Audit (.TXT)
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/70 transition-all text-xs font-bold"
                  style={{ fontFamily: 'var(--font-rajdhani)' }}
                >
                  <Download className="w-4 h-4" />
                  Print / PDF
                </button>
              </div>
            </div>

            {/* Data Provenance Box (Requirement 2 & 7) */}
            <div className="p-4 rounded-xl bg-blue-500/10 border-2 border-blue-500/30 space-y-2">
              <h4 className="font-bold text-blue-400 text-xs flex items-center gap-2 uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Verified Data Sources & Provenance Trace
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                {(reportData.data_provenance || []).map((p: string, i: number) => (
                  <li key={i} className="leading-relaxed">
                    <strong className="text-foreground">{p}</strong>
                  </li>
                ))}
                <li>
                  Live SCADA Status: <strong className="text-amber-400">Unavailable (Telemetry gap documented; historical snapshot & Open-Meteo REST feed active)</strong>
                </li>
              </ul>
            </div>

            {/* Key Traceable Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: reportData.metrics.m1_label, value: reportData.metrics.m1_val, color: 'text-foreground' },
                { label: reportData.metrics.m2_label, value: reportData.metrics.m2_val, color: 'text-primary' },
                { label: reportData.metrics.m3_label, value: reportData.metrics.m3_val, color: 'text-amber-400' },
                { label: reportData.metrics.m4_label, value: reportData.metrics.m4_val, color: 'text-accent' }
              ].map((m, idx) => (
                <div key={idx} className="glass-panel rounded-xl p-4 border border-border/50">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider block font-semibold" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    {m.label}
                  </span>
                  <p className={`text-lg font-bold font-mono mt-1 ${m.color}`} style={{ fontFamily: 'var(--font-heading)' }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Trend Chart */}
            <div className="glass-panel rounded-xl p-6 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    {reportData.period.toUpperCase()} Loading Profile: Observed vs Predicted
                  </h3>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Historical recorded feeder measurements [Measured] and AI-forecasted peak demand [Forecast]
                  </p>
                </div>
              </div>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData.trend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 250)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="oklch(0.65 0.02 250)"
                      tick={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)' }}
                    />
                    <YAxis 
                      stroke="oklch(0.65 0.02 250)"
                      tick={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)' }}
                      unit=" kW"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload
                          return (
                            <div className="p-3 rounded-lg border border-primary/30 bg-card/95 backdrop-blur-md shadow-xl text-xs space-y-1">
                              <p className="font-bold text-foreground pb-1 border-b border-border/40">{label} ({item.status})</p>
                              <p className="text-primary font-mono font-semibold">Observed: {item.actual} kW [Measured]</p>
                              <p className="text-accent font-mono font-semibold">Forecast: {item.predicted} kW [Forecast]</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend wrapperStyle={{ fontFamily: 'var(--font-rajdhani)', fontSize: '12px' }} />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="oklch(0.7 0.18 200)"
                      strokeWidth={2}
                      fill="url(#actualGrad)"
                      name="Observed Feeder Load (kW) [Measured]"
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="oklch(0.75 0.2 160)"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fill="url(#predGrad)"
                      name="Forecast Peak (kW) [Forecast]"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Recommendations Box */}
            <div className="glass-panel rounded-xl p-5 border border-border/50">
              <h4 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Brain className="w-4 h-4 text-primary" />
                Model-Derived Operational Advisories
              </h4>
              <div className="space-y-2">
                {(reportData.active_recommendations || []).map((rec: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/90 font-medium leading-relaxed" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      {rec}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
