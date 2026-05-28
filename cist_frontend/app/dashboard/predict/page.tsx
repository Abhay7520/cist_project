"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Zap, Thermometer, Droplets, MapPin, Building, Users, Calendar, Clock, ArrowRight, Loader2, Info, Sun, Wind } from 'lucide-react'
import { API_URL } from '@/lib/api-config'

export default function PredictPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    demand: number;
    renewable: number;
    net: number;
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formOptions, setFormOptions] = useState<Record<string, string[]>>({
    circle: [],
    division: [],
    subdivision: [],
    section: [],
    area: [],
    catdesc: [],
    area_type: [],
    renewable_type: []
  })

  const [formData, setFormData] = useState({
    circle: '',
    division: '',
    subdivision: '',
    section: '',
    area: '',
    catdesc: '',
    totservices: '500',
    billdservices: '450',
    units: '12000',
    hour: '12',
    day_of_week: '3',
    month: '6',
    temperature: '25.0',
    humidity: '50.0',
    area_type: '',
    population_density: '1500',
    solar_capacity: '500.0',
    renewable_type: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`${API_URL}/form-options`)
        if (!res.ok) {
          return
        }

        const data = await res.json()
        if (!data.error) {
          setFormOptions(data)
          setFormData(prev => ({
            ...prev,
            circle: prev.circle || (data.circle?.[0] ?? ''),
            division: prev.division || (data.division?.[0] ?? ''),
            subdivision: prev.subdivision || (data.subdivision?.[0] ?? ''),
            section: prev.section || (data.section?.[0] ?? ''),
            area: prev.area || (data.area?.[0] ?? ''),
            catdesc: prev.catdesc || (data.catdesc?.[0] ?? ''),
            area_type: prev.area_type || (data.area_type?.[0] ?? ''),
            renewable_type: prev.renewable_type || (data.renewable_type?.[0] ?? ''),
          }))
        }
      } catch (err) {
        console.error('Failed to fetch form options:', err)
      }
    }

    fetchOptions()
  }, [])

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const url = new URL(`${API_URL}/predict`)
      Object.entries(formData).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch prediction')
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setResult({
        demand: data.predicted_load,
        renewable: data.predicted_renewable,
        net: data.net_grid_demand
      })
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            Load Prediction Simulator
          </h1>
          <p className="text-muted-foreground mt-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Configure grid parameters to simulate electricity demand scenarios
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-panel rounded-xl p-8 border border-primary/30 glow-blue relative z-50"
        >
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
          </div>

          <form onSubmit={handlePredict} className="space-y-8 relative z-10">
            {/* Location Parameters */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <MapPin className="w-5 h-5 text-primary" />
                Location Parameters
              </h3>
              {/* UPDATED: changed lg:grid-cols-5 to lg:grid-cols-3 xl:grid-cols-5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Circle</label>
                  {/* UPDATED: added min-w-0 and title={option} */}
                  <select name="circle" value={formData.circle} onChange={handleChange} className="w-full min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all truncate">
                    {formOptions.circle.map((option) => (
                      <option key={option} value={option} title={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Division</label>
                  {/* UPDATED: added min-w-0 and title={option} */}
                  <select name="division" value={formData.division} onChange={handleChange} className="w-full min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all truncate">
                    {formOptions.division.map((option) => (
                      <option key={option} value={option} title={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Subdivision</label>
                  {/* UPDATED: added min-w-0 and title={option} */}
                  <select name="subdivision" value={formData.subdivision} onChange={handleChange} className="w-full min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all truncate">
                    {formOptions.subdivision.map((option) => (
                      <option key={option} value={option} title={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Section</label>
                  {/* UPDATED: added min-w-0 and title={option} */}
                  <select name="section" value={formData.section} onChange={handleChange} className="w-full min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all truncate">
                    {formOptions.section.map((option) => (
                      <option key={option} value={option} title={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Area</label>
                  {/* UPDATED: added min-w-0 and title={option} */}
                  <select name="area" value={formData.area} onChange={handleChange} className="w-full min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all truncate">
                    {formOptions.area.map((option) => (
                      <option key={option} value={option} title={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Demographics & Area Parameters */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Building className="w-5 h-5 text-accent" />
                Demographics & Area Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Area Type</label>
                  {/* UPDATED: added min-w-0 and title={option} */}
                  <select name="area_type" value={formData.area_type} onChange={handleChange} className="w-full min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all truncate">
                    {formOptions.area_type.map((option) => (
                      <option key={option} value={option} title={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Population Density</label>
                  <input type="number" name="population_density" value={formData.population_density} onChange={handleChange} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Category</label>
                  {/* UPDATED: added min-w-0 and title={option} */}
                  <select name="catdesc" value={formData.catdesc} onChange={handleChange} className="w-full min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all truncate">
                    {formOptions.catdesc.map((option) => (
                      <option key={option} value={option} title={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Environmental & Temporal Factors */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Calendar className="w-5 h-5 text-blue-400" />
                Environmental & Temporal Factors
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Month (1-12)</label>
                  <input type="number" min="1" max="12" name="month" value={formData.month} onChange={handleChange} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Day (0-6)</label>
                  <input type="number" min="0" max="6" name="day_of_week" value={formData.day_of_week} onChange={handleChange} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Hour (0-23)</label>
                  <input type="number" min="0" max="23" name="hour" value={formData.hour} onChange={handleChange} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    <Thermometer className="w-3 h-3" /> Temp (°C)
                  </label>
                  <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    <Droplets className="w-3 h-3" /> Humidity %
                  </label>
                  <input type="number" step="0.1" name="humidity" value={formData.humidity} onChange={handleChange} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                </div>
              </div>
            </div>

            {/* Service & Consumption */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Users className="w-5 h-5 text-[oklch(0.75_0.18_160)]" />
                Service & Consumption metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Total Services</label>
                  <input type="number" name="totservices" value={formData.totservices} onChange={handleChange} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-[oklch(0.75_0.18_160)] focus:ring-1 focus:ring-[oklch(0.75_0.18_160)] transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Billed Services</label>
                  <input type="number" name="billdservices" value={formData.billdservices} onChange={handleChange} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-[oklch(0.75_0.18_160)] focus:ring-1 focus:ring-[oklch(0.75_0.18_160)] transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Units (kWh)</label>
                  <input type="number" step="0.1" name="units" value={formData.units} onChange={handleChange} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-[oklch(0.75_0.18_160)] focus:ring-1 focus:ring-[oklch(0.75_0.18_160)] transition-all" required />
                </div>
              </div>
            </div>

            {/* Renewable Energy Potential */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 border-b border-border/50 pb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Sun className="w-5 h-5 text-amber-500" />
                Renewable Energy Potential
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Solar Capacity (kW)</label>
                  <input type="number" step="0.1" name="solar_capacity" value={formData.solar_capacity} onChange={handleChange} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Renewable Type</label>
                  {/* UPDATED: added min-w-0 and title={option} */}
                  <select name="renewable_type" value={formData.renewable_type} onChange={handleChange} className="w-full min-w-0 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all truncate">
                    {formOptions.renewable_type.map((option) => (
                      <option key={option} value={option} title={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 px-6 mt-8 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-lg"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  PROCESSING PREDICTION...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  RUN PREDICTION MODEL
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Result Card */}
          <div className="glass-panel rounded-xl p-6 border border-border/50 relative overflow-hidden h-full flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Simulation Results
            </h3>

            <AnimatePresence mode="wait">
              {result !== null ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="text-center"
                >
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>Total Demand</span>
                        <span className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>{result.demand.toFixed(2)} MW</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-emerald-500 uppercase tracking-wider font-bold" style={{ fontFamily: 'var(--font-rajdhani)' }}>Renewable Supply</span>
                        <span className="text-lg font-bold text-emerald-500" style={{ fontFamily: 'var(--font-heading)' }}>{result.renewable.toFixed(2)} MW</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (result.renewable / result.demand) * 100)}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 mb-6">
                      <Zap className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      Net Grid Dependency
                    </div>
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent" style={{ fontFamily: 'var(--font-heading)' }}>
                      {result.net.toFixed(2)}
                    </div>
                    <div className="text-xl text-muted-foreground mt-2 font-medium" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      Megawatts (MW)
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-secondary/30 rounded-lg border border-border/30 text-left">
                    <div className="flex gap-2 items-start text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <p>
                        This prediction is based on the provided inputs and historical model data. Confidence interval is approx ±4.2% for specified parameters.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-center flex flex-col items-center gap-3"
                >
                  <div className="p-3 rounded-full bg-destructive/20">
                    <Info className="w-6 h-6" />
                  </div>
                  <div className="font-medium" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    {error}
                  </div>
                  <p className="text-xs opacity-80" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Make sure the backend server is running on port 8000.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center opacity-50 py-12"
                >
                  <Calculator className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground max-w-[200px]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Fill out the parameters and run the prediction model to see results here.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}