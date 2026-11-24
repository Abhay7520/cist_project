"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator, Zap, Thermometer, Droplets, MapPin, Building, Users, Calendar,
  Clock, ArrowRight, Loader2, Info, Sun, Wind, CloudSun, RefreshCw, Sparkles, CheckCircle2,
  AlertTriangle, ShieldAlert, Battery, HelpCircle, Layers, CheckCheck
} from 'lucide-react'
import { useGridMind, RecommendationItem } from '@/lib/gridmind-context'
import { VERIFIED_LOCATIONS } from '@/lib/location-catalog'
import { API_URL } from '@/lib/api-config'

export default function PredictPage() {
  const {
    selectedLocationId,
    selectedLocation,
    timeHorizon,
    temporalParams,
    weatherData,
    weatherMode,
    predictResult,
    isPredictLoading,
    predictError,
    setSelectedLocationId,
    setTemporalParams,
    updateWeatherInputs,
    refreshData,
  } = useGridMind()

  const [activeTab, setActiveTab] = useState<'weather' | 'grid'>('weather')

  // Local editable form fields synced from shared context
  const [localTemp, setLocalTemp] = useState<string>(weatherData.temperature.toString())
  const [localHum, setLocalHum] = useState<string>(weatherData.humidity.toString())
  const [localPrecip, setLocalPrecip] = useState<string>(weatherData.precipitation.toString())
  const [localHour, setLocalHour] = useState<string>(temporalParams.hour.toString())
  const [localMonth, setLocalMonth] = useState<string>(temporalParams.month.toString())
  const [localUnits, setLocalUnits] = useState<string>('14000')
  const [localServices, setLocalServices] = useState<string>('1200')
  const [scenarioModified, setScenarioModified] = useState(false)

  // Keep local fields in sync with shared context unless user is typing
  useEffect(() => {
    setLocalTemp(weatherData.temperature.toString())
    setLocalHum(weatherData.humidity.toString())
    setLocalPrecip(weatherData.precipitation.toString())
    setLocalHour(temporalParams.hour.toString())
    setLocalMonth(temporalParams.month.toString())
  }, [weatherData.temperature, weatherData.humidity, weatherData.precipitation, temporalParams.hour, temporalParams.month])

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value
    setSelectedLocationId(newId)
    setScenarioModified(false)
  }

  const handleApplyScenario = (e: React.FormEvent) => {
    e.preventDefault()
    setScenarioModified(true)
    setTemporalParams({
      hour: parseInt(localHour) || 14,
      month: parseInt(localMonth) || 6,
    })
    updateWeatherInputs({
      temperature: parseFloat(localTemp) || 32.0,
      humidity: parseFloat(localHum) || 55.0,
      precipitation: parseFloat(localPrecip) || 0.0,
      condition: parseFloat(localPrecip) > 0 ? 'Rain' : (parseFloat(localTemp) >= 38 ? 'Hot / Clear' : 'Clear Sky'),
    })
  }

  const locationOptions = Object.values(VERIFIED_LOCATIONS)
  const recommendations: RecommendationItem[] = predictResult?.recommendations || []

  const demandKw = typeof predictResult?.predictedLoadKw === 'number' ? predictResult.predictedLoadKw : 2800.0
  const renewableKw = predictResult?.renewableSupplyKw
  const hasRenewable = typeof renewableKw === 'number'
  const netDemandKw = predictResult?.netGridDemandKw
  const hasNetDemand = typeof netDemandKw === 'number'
  const solarUsedKw =
    typeof predictResult?.predictedLoadKw === 'number' &&
      typeof renewableKw === 'number' &&
      typeof netDemandKw === 'number'
      ? Math.min(predictResult.predictedLoadKw, renewableKw)
      : null

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header & Mode Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            Electricity Load Prediction & Operator Decision Support
          </h1>
          <p className="text-muted-foreground text-sm mt-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Synchronized load simulation with actionable operator advisories and verified capacity limits
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-secondary/40 border border-border/50">
          <button
            onClick={() => setActiveTab('weather')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'weather'
                ? 'bg-gradient-to-r from-amber-500/20 to-primary/20 border border-amber-500/40 text-amber-400 shadow-md'
                : 'text-muted-foreground hover:text-foreground'
              }`}
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          >
            <CloudSun className="w-4 h-4 text-amber-400" />
            <span>Weather Intelligence Mode</span>
          </button>

          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'grid'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
              }`}
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          >
            <Calculator className="w-4 h-4" />
            <span>Grid Parameters View</span>
          </button>
        </div>
      </motion.div>

      {/* Synchronized Selection & Provenance Notification */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/15 via-secondary/30 to-accent/15 border border-primary/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Shared State Synchronized with AI Forecast
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold uppercase">
                Active Selection: {selectedLocation.name}
              </span>
            </h4>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Target Substation: <strong className="text-foreground">{selectedLocation.section}</strong> • Circle: <strong className="text-foreground">{selectedLocation.circle}</strong> • Division: <strong className="text-foreground">{selectedLocation.division}</strong>
            </p>
          </div>
        </div>

        {weatherMode === 'scenario' && (
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold">
            Scenario Simulation (User-Specified Parameters)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-panel rounded-xl p-8 border border-primary/30 glow-blue relative z-10"
        >
          <form onSubmit={handleApplyScenario} className="space-y-6">
            {/* Location Selector (Shared Selection) */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2 border-b border-border/50 pb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <MapPin className="w-4 h-4 text-primary" />
                Location & Feeder Parameters (Shared with AI Forecast)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-primary font-bold uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Selected Location
                  </label>
                  <select
                    value={selectedLocationId}
                    onChange={handleLocationChange}
                    className="w-full px-3 py-2.5 bg-input border-2 border-primary/40 rounded-lg text-sm font-bold text-foreground focus:outline-none focus:border-accent transition-all cursor-pointer"
                  >
                    {locationOptions.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.circle})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Substation Section Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedLocation.section}
                    className="w-full px-3 py-2.5 bg-secondary/40 border border-border/50 rounded-lg text-sm text-muted-foreground font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Environmental & Weather Scenario Inputs */}
            <div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  <CloudSun className="w-4 h-4 text-amber-400" />
                  Weather & Temporal Parameters (Scenario Simulation)
                </h3>
                {weatherMode === 'scenario' ? (
                  <span className="text-[11px] text-amber-400 font-semibold">User Scenario Active</span>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-semibold">Auto-Synced with Live/Baseline Weather</span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Temperature */}
                <div className="space-y-1.5">
                  <label className="text-xs text-amber-400 font-bold uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={localTemp}
                    onChange={(e) => setLocalTemp(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-amber-500/40 rounded-lg text-sm font-bold text-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Humidity */}
                <div className="space-y-1.5">
                  <label className="text-xs text-cyan-400 font-bold uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Humidity (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={localHum}
                    onChange={(e) => setLocalHum(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-cyan-500/40 rounded-lg text-sm font-bold text-foreground focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Rainfall */}
                <div className="space-y-1.5">
                  <label className="text-xs text-blue-400 font-bold uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Rainfall (mm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={localPrecip}
                    onChange={(e) => setLocalPrecip(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-blue-500/40 rounded-lg text-sm font-bold text-foreground focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Hour */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Hour (0–23)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={localHour}
                    onChange={(e) => setLocalHour(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Grid & Consumer Loading Inputs */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2 border-b border-border/50 pb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Users className="w-4 h-4 text-emerald-400" />
                Consumption & Distribution Service Inputs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Total Services (Meters)
                  </label>
                  <input
                    type="number"
                    value={localServices}
                    onChange={(e) => setLocalServices(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Billed Units (kWh)
                  </label>
                  <input
                    type="number"
                    value={localUnits}
                    onChange={(e) => setLocalUnits(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Documented Solar Capacity
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedLocation.documentedSolarCapacityKw ? `${selectedLocation.documentedSolarCapacityKw} kW` : 'Unavailable'}
                    className="w-full px-3 py-2 bg-secondary/40 border border-border/50 rounded-lg text-sm text-muted-foreground font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Submit / Run Simulation Button */}
            <button
              type="submit"
              disabled={isPredictLoading}
              className="w-full py-3.5 px-6 rounded-xl font-bold tracking-wider flex items-center justify-center gap-2 text-white bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-105 transition-all cursor-pointer text-sm"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isPredictLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  EVALUATING MODEL INFERENCES...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  RUN PREDICTION & ACTIONABLE ADVISORY FOR {selectedLocation.name.toUpperCase()}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Prediction Results & Actionable Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Summary Card */}
          <div className="glass-panel rounded-xl p-6 border border-border/50">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Predicted Demand & Supply Mix
            </h3>

            <div className="space-y-4">
              {/* Total Forecast Demand */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Total Forecast Demand
                  </span>
                  <span className="text-xs text-primary font-mono font-bold">[Forecast]</span>
                </div>
                <div className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  {(demandKw / 1000).toFixed(2)} MW
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {demandKw.toLocaleString()} kW aggregate load
                </span>
              </div>

              {/* Renewable Solar Supply */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-emerald-400 uppercase tracking-wider font-bold" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Renewable Solar Supply
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-bold">
                    {hasRenewable ? '[Forecast Generation]' : '[Unavailable]'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-emerald-400" style={{ fontFamily: 'var(--font-heading)' }}>
                  {hasRenewable && renewableKw !== undefined ? `${(renewableKw / 1000).toFixed(2)} MW` : 'Unavailable'}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {hasRenewable && renewableKw !== undefined
                    ? `${renewableKw.toLocaleString()} kW solar offset`
                    : 'No verified solar capacity documented for location'}
                </span>
              </div>

              {/* Net Grid Dependency */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Net Grid Dependency
                  </span>
                  <span className="text-xs text-accent font-mono font-bold">
                    {hasNetDemand ? '[Calculated Net]' : '[Unavailable]'}
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent" style={{ fontFamily: 'var(--font-heading)' }}>
                  {hasNetDemand && netDemandKw !== undefined ? `${(netDemandKw / 1000).toFixed(2)} MW` : 'Unavailable'}
                </div>
                <span className="text-xs text-muted-foreground">
                  {solarUsedKw !== null && typeof netDemandKw === 'number'
                    ? `Use ${solarUsedKw.toLocaleString()} kW of estimated solar first. Supply the remaining ${netDemandKw.toLocaleString()} kW from the grid.`
                    : 'Solar allocation and remaining grid power are unavailable for this simulation.'}
                </span>x
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ACTIONABLE DECISION-SUPPORT RECOMMENDATIONS (Requirement 3 & 5) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 border border-primary/30"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Actionable Operator Decision-Support Advisories
            </h3>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Decision-support recommendations evaluated against verified capacity limits, thermal thresholds, and documented assets
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground font-mono">
            {recommendations.length} Active Rules Evaluated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => {
            const isMissing = rec.status === 'unavailable'
            const isActive = rec.status === 'active'

            return (
              <div
                key={rec.id}
                className={`p-5 rounded-xl border transition-all ${isMissing
                    ? 'bg-secondary/20 border-border/60 opacity-80'
                    : isActive
                      ? 'bg-amber-500/10 border-amber-500/40 glow-orange'
                      : 'bg-secondary/30 border-border/50'
                  }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {isMissing ? (
                      <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : isActive ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                      {rec.type.toUpperCase()} ADVISORY
                    </span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${isMissing
                        ? 'bg-secondary text-muted-foreground'
                        : isActive
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-primary/20 text-primary'
                      }`}
                  >
                    {rec.status}
                  </span>
                </div>

                {/* 4-Part Strict Format */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-bold" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      What to do:
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">{rec.action}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-bold" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      When to do it:
                    </span>
                    <p className="text-muted-foreground font-mono mt-0.5">{rec.timing}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-bold" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      Why it is recommended:
                    </span>
                    <p className="text-muted-foreground mt-0.5">{rec.reason}</p>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      Triggering Value / Threshold:
                    </span>
                    <span className="font-mono text-[11px] text-primary font-bold">
                      {rec.thresholdValue}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}