"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, Download, Calendar, TrendingUp, Zap, Activity, Brain, 
  Loader2, Sparkles, BarChart3, PieChart, LineChart, FileDown, 
  Table, ChevronDown, MapPin, Building2, CheckCircle2, AlertTriangle
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  LineChart as RechartsLineChart,
  Line
} from 'recharts'
import { API_URL } from '@/lib/api-config'

type ReportType = 'demand' | 'performance' | 'renewable'
type DateRange = 'week' | 'month' | 'quarter' | 'year'

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
    description: 'Electricity demand patterns, peak usage analysis, and consumption trends',
    icon: TrendingUp
  },
  {
    id: 'performance',
    title: 'Grid Performance',
    description: 'System efficiency, uptime metrics, response times, and operational health',
    icon: Activity
  },
  {
    id: 'renewable',
    title: 'Renewable Energy Usage',
    description: 'Solar, wind, and hydro generation statistics with sustainability metrics',
    icon: Zap
  }
]

// We'll populate these from the dataset

// Generate mock data based on report type
const generateDemandData = (range: DateRange) => {
  const points = range === 'week' ? 7 : range === 'month' ? 30 : range === 'quarter' ? 12 : 12
  const labels = range === 'week' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : range === 'month' 
    ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return labels.slice(0, points).map((label, i) => ({
    name: label,
    actual: Math.round(2200 + Math.sin(i / 2) * 400 + Math.random() * 300),
    predicted: Math.round(2300 + Math.sin(i / 2) * 350 + Math.random() * 200),
    peak: Math.round(2800 + Math.cos(i / 3) * 200 + Math.random() * 150)
  }))
}

const generatePerformanceData = () => [
  { name: 'Uptime', value: 99.97, target: 99.9 },
  { name: 'Efficiency', value: 94.2, target: 92 },
  { name: 'Load Factor', value: 78.5, target: 75 },
  { name: 'Power Quality', value: 98.1, target: 97 }
]

const generateRenewableData = () => [
  { name: 'Solar', value: 42, color: 'oklch(0.8 0.18 90)' },
  { name: 'Wind', value: 35, color: 'oklch(0.7 0.18 200)' },
  { name: 'Hydro', value: 18, color: 'oklch(0.75 0.2 160)' },
  { name: 'Non-Renewable', value: 5, color: 'oklch(0.5 0.1 250)' }
]

const generateEnergyDistribution = () => [
  { name: 'Residential', value: 35 },
  { name: 'Industrial', value: 40 },
  { name: 'Commercial', value: 18 },
  { name: 'Public', value: 7 }
]

const aiInsights: Record<ReportType, string[]> = {
  demand: [
    'Demand increased by 18% compared to the previous period, primarily driven by temperature variations.',
    'Peak demand consistently occurs between 6-8 PM, suggesting residential usage patterns dominate.',
    'Industrial zone shows 12% reduction in off-peak consumption, indicating improved efficiency.',
    'AI model predicts 8% demand growth next quarter based on historical patterns and weather forecasts.'
  ],
  performance: [
    'System uptime exceeded target by 0.07%, maintaining excellent grid stability.',
    'Average response time improved by 15% following recent infrastructure upgrades.',
    'Load balancing efficiency increased due to AI-optimized distribution algorithms.',
    'Predictive maintenance prevented 3 potential outages this period.'
  ],
  renewable: [
    'Renewable energy contribution reached an all-time high of 95% of total generation.',
    'Solar output increased 22% due to favorable weather conditions and new panel installations.',
    'Wind generation showed 15% variability, compensated effectively by grid storage.',
    'Carbon emissions reduced by 28% compared to the same period last year.'
  ]
}

const COLORS = ['oklch(0.8 0.18 90)', 'oklch(0.7 0.18 200)', 'oklch(0.75 0.2 160)', 'oklch(0.65 0.15 280)']

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('demand')
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [region, setRegion] = useState('all')
  const [substation, setSubstation] = useState('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([{ id: 'all', name: 'All Regions' }])
  const [substations, setSubstations] = useState<{ id: string; name: string }[]>([{ id: 'all', name: 'All Substations' }])
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`${API_URL}/form-options`)
        if (res.ok) {
          const data = await res.json()
          if (data.circle) {
            setRegions([
              { id: 'all', name: 'All Circles' },
              ...data.circle.map((c: string) => ({ id: c, name: c }))
            ])
          }
          if (data.section) {
            setSubstations([
              { id: 'all', name: 'All Sections' },
              ...data.section.map((s: string) => ({ id: s, name: s }))
            ])
          }
        }
      } catch (err) {
        console.error('Failed to fetch options:', err)
      }
    }
    fetchOptions()
  }, [])

  // Simulate report generation
  const generateReport = async () => {
    setIsGenerating(true)
    setReportGenerated(false)
    setGenerationProgress(0)
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 15
      })
    }, 200)

    // Fetch real data from backend
    try {
      const url = new URL(`${API_URL}/report-data`)
      url.searchParams.append('report_type', selectedReport)
      url.searchParams.append('circle', region)
      url.searchParams.append('section', substation)
      url.searchParams.append('range', dateRange)

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setReportData(data)
      }
    } catch (err) {
      console.error('Failed to fetch report data:', err)
    }

    clearInterval(progressInterval)
    setGenerationProgress(100)
    
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setIsGenerating(false)
    setReportGenerated(true)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null)
    if (openDropdown !== null) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdown])

  const demandData = generateDemandData(dateRange)
  const performanceData = generatePerformanceData()
  const renewableData = generateRenewableData()
  const distributionData = generateEnergyDistribution()

  const getMetrics = () => {
    if (reportData && reportData.metrics) {
      const { metrics } = reportData
      return [
        { label: metrics.m1_label || 'Metric 1', value: metrics.m1_val || '-', change: '+2.1%', positive: true },
        { label: metrics.m2_label || 'Metric 2', value: metrics.m2_val || '-', change: '+0.5%', positive: false },
        { label: metrics.m3_label || 'Metric 3', value: metrics.m3_val || '-', change: '+5.2%', positive: true },
        { label: metrics.m4_label || 'Metric 4', value: metrics.m4_val || '-', change: '+1.8%', positive: true }
      ]
    }

    switch (selectedReport) {
      case 'demand':
        return [
          { label: 'Peak Demand', value: '2,847 MW', change: '+5.2%', positive: false },
          { label: 'Average Usage', value: '2,342 MW', change: '+3.1%', positive: false },
          { label: 'Load Factor', value: '82.3%', change: '+2.4%', positive: true },
          { label: 'Forecast Accuracy', value: '96.7%', change: '+1.2%', positive: true }
        ]
      case 'performance':
        return [
          { label: 'System Uptime', value: '99.97%', change: '+0.02%', positive: true },
          { label: 'Avg Response', value: '45ms', change: '-12ms', positive: true },
          { label: 'Efficiency', value: '94.2%', change: '+1.8%', positive: true },
          { label: 'Incidents', value: '3', change: '-5', positive: true }
        ]
      case 'renewable':
        return [
          { label: 'Renewable Mix', value: '95%', change: '+8%', positive: true },
          { label: 'Solar Output', value: '892 MW', change: '+22%', positive: true },
          { label: 'Wind Output', value: '745 MW', change: '+15%', positive: true },
          { label: 'CO2 Saved', value: '12.4k t', change: '+28%', positive: true }
        ]
    }
  }

  const currentInsights = aiInsights[selectedReport]
  const metrics = getMetrics()

  // Custom dropdown component
  const Dropdown = ({ 
    value, 
    options, 
    onChange, 
    id, 
    icon: Icon 
  }: { 
    value: string
    options: { id: string; name: string }[]
    onChange: (value: string) => void
    id: string
    icon: typeof MapPin
  }) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpenDropdown(openDropdown === id ? null : id)
        }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all text-left"
        style={{ fontFamily: 'var(--font-rajdhani)' }}
      >
        <Icon className="w-5 h-5 text-primary" />
        <span className="flex-1 text-foreground">{options.find(o => o.id === value)?.name}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openDropdown === id ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {openDropdown === id && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 rounded-xl bg-card border border-border/50 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onChange(option.id)
                  setOpenDropdown(null)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                  value === option.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                }`}
                style={{ fontFamily: 'var(--font-rajdhani)' }}
              >
                {option.name}
                {value === option.id && <CheckCircle2 className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
            <FileText className="w-7 h-7 text-primary" />
            Dynamic Report Generator
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            AI-powered analytics and customizable report generation
          </p>
        </div>
      </motion.div>

      {/* Report Selection Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 border border-border/50"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
          <BarChart3 className="w-5 h-5 text-primary" />
          Report Configuration
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Report Type & Date Range */}
          <div className="space-y-4">
            {/* Report Type Selection */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Report Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {reportTypes.map((report) => {
                  const isSelected = selectedReport === report.id
                  return (
                    <button
                      key={report.id}
                      onClick={() => {
                        setSelectedReport(report.id)
                        setReportGenerated(false)
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected 
                          ? 'bg-primary/10 border-primary/50 glow-blue' 
                          : 'bg-secondary/30 border-border/50 hover:border-primary/30'
                      }`}
                    >
                      <report.icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h4 className={`font-medium text-sm ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        {report.title}
                      </h4>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                {reportTypes.find(r => r.id === selectedReport)?.description}
              </p>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Date Range
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'week', label: 'Last Week' },
                  { value: 'month', label: 'Last Month' },
                  { value: 'quarter', label: 'Last Quarter' },
                  { value: 'year', label: 'Last Year' }
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      setDateRange(range.value as DateRange)
                      setReportGenerated(false)
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      dateRange === range.value
                        ? 'bg-primary/10 border-primary/50 text-primary'
                        : 'bg-secondary/30 border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30'
                    }`}
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <Calendar className="w-4 h-4" />
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Filters */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Region Filter
              </label>
              <Dropdown
                value={region}
                options={regions}
                onChange={(v) => { setRegion(v); setReportGenerated(false) }}
                id="region"
                icon={MapPin}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Substation Filter
              </label>
              <Dropdown
                value={substation}
                options={substations}
                onChange={(v) => { setSubstation(v); setReportGenerated(false) }}
                id="substation"
                icon={Building2}
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <motion.button
            onClick={generateReport}
            disabled={isGenerating}
            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
            whileTap={{ scale: isGenerating ? 1 : 0.98 }}
            className={`relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all overflow-hidden ${
              isGenerating 
                ? 'bg-primary/50 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary/90 glow-blue'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
                <span className="text-primary-foreground">Generating Report...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-primary-foreground" />
                <span className="text-primary-foreground">Generate Report</span>
              </>
            )}
            
            {/* Progress bar overlay */}
            {isGenerating && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${generationProgress}%` }}
                className="absolute bottom-0 left-0 h-1 bg-primary-foreground/30"
              />
            )}
          </motion.button>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              <Brain className="w-4 h-4 animate-pulse text-primary" />
              <span>AI analyzing {Math.round(generationProgress)}% of data points...</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Report Output Section */}
      <AnimatePresence>
        {reportGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Report Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-xl p-6 border border-primary/30 glow-blue"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {reportData?.error ? (
                      <>
                        <AlertTriangle className="w-5 h-5 text-[oklch(0.75_0.18_60)]" />
                        <span className="text-sm text-[oklch(0.75_0.18_60)] font-medium" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          Partial Data: {reportData.error}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                        <span className="text-sm text-accent font-medium" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          Report Generated Successfully
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    {reportTypes.find(r => r.id === selectedReport)?.title} Report
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                
                {/* Export Buttons */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <FileDown className="w-4 h-4" />
                    Download PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const url = new URL(`${API_URL}/download-csv`)
                      url.searchParams.append('circle', region)
                      url.searchParams.append('section', substation)
                      window.open(url.toString(), '_blank')
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <Table className="w-4 h-4" />
                    Export CSV
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.1 }}
                  className="glass-panel rounded-xl p-4 border border-border/50"
                >
                  <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    {metric.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                      {metric.value}
                    </span>
                    <span className={`text-sm ${metric.positive ? 'text-accent' : 'text-[oklch(0.75_0.18_60)]'}`}>
                      {metric.change}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Insight Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-panel rounded-xl p-6 border border-primary/30 relative overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 energy-flow opacity-30 pointer-events-none" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    AI Insights
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                    Powered by Neural Analytics
                  </span>
                </div>
                
                <div className="space-y-3">
                  {(reportData && reportData.metrics ? [
                    `Average system load for ${region === 'all' ? 'all regions' : region} is ${reportData.metrics.avg_load} MW.`,
                    `Grid efficiency is currently at ${reportData.metrics.efficiency}%, showing ${reportData.metrics.efficiency > 92 ? 'optimal' : 'sub-optimal'} performance.`,
                    `Total consumption of ${Math.round(reportData.metrics.total_units / 1000)}k kWh recorded across ${substation === 'all' ? 'all sections' : substation}.`,
                    `AI models suggest ${reportData.metrics.avg_load > 1000 ? 'high' : 'normal'} priority for maintenance in ${region}.`
                  ] : [
                    "AI is analyzing grid patterns for the selected filters...",
                    "Select specific regions or substations to receive deeper insights.",
                    "Ensure the backend server is running for real-time analytics."
                  ]).map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <Sparkles className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <p className="text-sm text-foreground/90" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        {insight}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line/Area Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-panel rounded-xl p-6 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <LineChart className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    {selectedReport === 'demand' ? 'Demand Trends' : selectedReport === 'performance' ? 'Performance Over Time' : 'Generation Trends'}
                  </h3>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData?.trend || demandData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 250)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="oklch(0.65 0.02 250)"
                        tick={{ fontSize: 10, fontFamily: 'var(--font-rajdhani)' }}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="oklch(0.65 0.02 250)"
                        tick={{ fontSize: 10, fontFamily: 'var(--font-rajdhani)' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'oklch(0.15 0.02 250 / 0.95)',
                          border: '1px solid oklch(0.7 0.18 200 / 0.3)',
                          borderRadius: '8px',
                          fontFamily: 'var(--font-rajdhani)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontFamily: 'var(--font-rajdhani)', fontSize: '11px' }} />
                      <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="oklch(0.7 0.18 200)"
                        fill="url(#actualGradient)"
                        name="Actual (MW)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="predicted"
                        stroke="oklch(0.75 0.2 160)"
                        fill="url(#predictedGradient)"
                        name="Predicted (MW)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-panel rounded-xl p-6 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    Energy Distribution
                  </h3>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData?.distribution || distributionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 250)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="oklch(0.65 0.02 250)"
                        tick={{ fontSize: 10, fontFamily: 'var(--font-rajdhani)' }}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="oklch(0.65 0.02 250)"
                        tick={{ fontSize: 10, fontFamily: 'var(--font-rajdhani)' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'oklch(0.15 0.02 250 / 0.95)',
                          border: '1px solid oklch(0.7 0.18 200 / 0.3)',
                          borderRadius: '8px',
                          fontFamily: 'var(--font-rajdhani)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Usage (%)"
                        radius={[4, 4, 0, 0]}
                      >
                        {distributionData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="glass-panel rounded-xl p-6 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    {selectedReport === 'renewable' ? 'Energy Source Mix' : 'Renewable vs Non-Renewable'}
                  </h3>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={reportData?.renewable_mix || renewableData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {renewableData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'oklch(0.15 0.02 250 / 0.95)',
                          border: '1px solid oklch(0.7 0.18 200 / 0.3)',
                          borderRadius: '8px',
                          fontFamily: 'var(--font-rajdhani)'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Performance Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="glass-panel rounded-xl p-6 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    Performance vs Target
                  </h3>
                </div>
                <div className="space-y-4">
                  {performanceData.map((item, index) => {
                    const percentage = (item.value / item.target) * 100
                    const isAboveTarget = item.value >= item.target
                    
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                              {item.value}%
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              isAboveTarget ? 'bg-accent/20 text-accent' : 'bg-[oklch(0.75_0.18_60)]/20 text-[oklch(0.75_0.18_60)]'
                            }`}>
                              Target: {item.target}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 0.8, delay: 0.9 + index * 0.1 }}
                            className={`h-full rounded-full ${isAboveTarget ? 'bg-accent' : 'bg-[oklch(0.75_0.18_60)]'}`}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!reportGenerated && !isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel rounded-xl p-12 border border-border/50 text-center"
        >
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 w-fit mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Configure Your Report
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Select a report type, date range, and filters above, then click &quot;Generate Report&quot; to create your customized analytics report with AI-powered insights.
          </p>
        </motion.div>
      )}
    </div>
  )
}
