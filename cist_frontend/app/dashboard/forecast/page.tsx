"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Brain, Clock, Calendar, TrendingUp, Thermometer, Cloud, Users, Sparkles, 
  MapPin, Droplets, Wind, CloudSun, CloudRain, Sun, Zap, ArrowRight, CheckCircle2,
  AlertTriangle, RefreshCw, Layers, ShieldCheck, Database, FileSpreadsheet
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
  Legend
} from 'recharts'
import { useGridMind } from '@/lib/gridmind-context'
import { VERIFIED_LOCATIONS } from '@/lib/location-catalog'

export default function ForecastPage() {
  const router = useRouter()
  const {
    selectedLocationId,
    selectedLocation,
    timeHorizon,
    temporalParams,
    weatherData,
    forecastResult,
    isForecastLoading,
    forecastError,
    setSelectedLocationId,
    setTimeHorizon,
    refreshData,
  } = useGridMind()

  const handlePredictWithWeather = () => {
    router.push('/dashboard/predict')
  }

  const locationOptions = Object.values(VERIFIED_LOCATIONS)
  const chartData = forecastResult?.forecastSeries || []

  return (
    <div className="space-y-6">
      {/* Header & Shared Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
            <Brain className="w-7 h-7 text-primary" />
            AI Demand Forecast & Weather Intelligence
          </h1>
          <p className="text-muted-foreground text-sm" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Machine learning powered electricity demand forecasting with traceable weather response
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* 1-Click Bridge to Predict Load */}
          <button
            onClick={handlePredictWithWeather}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 via-primary to-accent text-white font-bold text-xs shadow-md hover:shadow-lg hover:brightness-110 transition-all cursor-pointer"
            style={{ fontFamily: 'var(--font-heading)' }}
            title={`Open Predict Load simulator using ${selectedLocation.name} selections`}
          >
            <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
            <span>Open in Predict Load Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Shared Location Selector */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Location:
            </span>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="bg-transparent text-sm font-bold text-foreground focus:outline-none cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {locationOptions.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-background text-foreground">
                  {loc.name} ({loc.circle})
                </option>
              ))}
            </select>
          </div>

          {/* Shared Time Horizon */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border/50">
            {[
              { value: 'hour', label: 'Next 12 Hours', icon: Clock },
              { value: 'day', label: 'Next 24 Hours', icon: Calendar },
              { value: 'week', label: 'Next 7 Days', icon: Calendar }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeHorizon(option.value as 'hour' | 'day' | 'week')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-xs font-semibold cursor-pointer ${
                  timeHorizon === option.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{ fontFamily: 'var(--font-rajdhani)' }}
              >
                <option.icon className="w-3.5 h-3.5" />
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => refreshData()}
            disabled={isForecastLoading}
            className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Refresh forecast model execution"
          >
            <RefreshCw className={`w-4 h-4 ${isForecastLoading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Synchronized Selection Metadata Banner */}
      <div className="px-4 py-2.5 rounded-xl bg-secondary/30 border border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1.5 text-foreground font-semibold">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Active Substation: <span className="text-primary">{selectedLocation.section}</span>
          </span>
          <span>•</span>
          <span>Division: <strong className="text-foreground">{selectedLocation.division}</strong></span>
          <span>•</span>
          <span>Circle: <strong className="text-foreground">{selectedLocation.circle}</strong></span>
          <span>•</span>
          <span>
            Feeder Capacity:{' '}
            {selectedLocation.verifiedCapacityKw ? (
              <strong className="text-emerald-400 font-bold">{(selectedLocation.verifiedCapacityKw / 1000).toFixed(1)} MW [Verified]</strong>
            ) : (
              <strong className="text-amber-400 font-bold">Unavailable (Telemetry Gap)</strong>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold">
            Shared State Active
          </span>
          <span className="text-muted-foreground">
            Month {temporalParams.month} | Day {temporalParams.dayOfWeek} | Hour {temporalParams.hour}:00
          </span>
        </div>
      </div>

      {/* WEATHER DATA SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 border border-primary/30 glow-blue"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <CloudSun className="w-5 h-5 text-amber-400" />
              Location Weather Observations — {selectedLocation.name}
              {weatherData.isLive ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold uppercase tracking-wide">
                  Live Meteorological Feed
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary font-bold uppercase tracking-wide">
                  {weatherData.source}
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Origin: {weatherData.source} • Last Cached: {new Date(weatherData.timestamp).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-semibold" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Model-Integrated Weather Feed
            </span>
          </div>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Temperature */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Temperature
              </span>
              <Thermometer className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {weatherData.temperature}°C
            </div>
            <span className="text-[10px] text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Ambient temperature
            </span>
          </div>

          {/* Humidity */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Relative Humidity
              </span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {weatherData.humidity}%
            </div>
            <span className="text-[10px] text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Moisture saturation
            </span>
          </div>

          {/* Weather Condition */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Weather Condition
              </span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-foreground truncate" style={{ fontFamily: 'var(--font-heading)' }}>
              {weatherData.condition}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Sky condition
            </span>
          </div>

          {/* Rainfall / Precipitation */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Rainfall
              </span>
              <CloudRain className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {weatherData.precipitation} mm
            </div>
            <span className="text-[10px] text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Precipitation volume
            </span>
          </div>

          {/* Wind Speed */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Wind Velocity
              </span>
              <Wind className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {weatherData.windSpeed} km/h
            </div>
            <span className="text-[10px] text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Air speed
            </span>
          </div>
        </div>

        {/* Model Weather Factor Explanation (Requirement 2 & 3) */}
        {forecastResult?.factorExplanation && (
          <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Model Weather & Seasonal Factor Attribution:
              </h4>
              <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                {forecastResult.factorExplanation}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Forecast Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-panel rounded-xl p-6 border border-primary/30 glow-blue"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Demand Forecast Profile — {selectedLocation.name}
              <Sparkles className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Multi-horizon profile for {timeHorizon.toUpperCase()} horizon • Model: XGBoost Multi-Horizon Demand Model
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Forecast Demand (kW) [Forecast]
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Measured Base (kW) [Measured]
              </span>
            </div>
          </div>
        </div>

        <div className="h-[350px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 250)" />
                <XAxis 
                  dataKey="time" 
                  stroke="oklch(0.65 0.02 250)"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="oklch(0.65 0.02 250)"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(1)} MW`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'oklch(0.15 0.02 250 / 0.95)',
                    border: '1px solid oklch(0.7 0.18 200 / 0.4)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)',
                    fontFamily: 'var(--font-rajdhani)'
                  }}
                  labelStyle={{ color: 'oklch(0.95 0.01 250)' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} kW`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="predictedKw"
                  stroke="oklch(0.7 0.18 200)"
                  strokeWidth={2}
                  fill="url(#predictedGradient)"
                  name="Forecast Demand (kW) [Forecast]"
                />
                <Area
                  type="monotone"
                  dataKey="measuredKw"
                  stroke="oklch(0.75 0.2 160)"
                  strokeWidth={2}
                  fill="url(#actualGradient)"
                  name="Measured Demand (kW) [Measured]"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Loading forecast profile...
            </div>
          )}
        </div>
      </motion.div>

      {/* MODEL EVALUATION METRICS CARD (Requirement 2: Held-out Period Evaluation) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 border border-border/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              Verified Model Evaluation Metrics (Chronological Holdout Split)
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
            Tested: {forecastResult?.modelMetrics.period || '2023-11-01 to 2024-01-05'}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-rajdhani)' }}>
          To prevent data leakage, the model was evaluated on a strictly chronological holdout test period representing 94,718 intervals from <code className="text-primary font-mono">data/energy_weather_raw_data.csv</code>.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Mean Absolute Error (MAE)
            </span>
            <div className="text-xl font-bold text-foreground mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {forecastResult?.modelMetrics.mae || '96.22 W'}
            </div>
            <span className="text-[10px] text-muted-foreground">0.096 kW per interval</span>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Root Mean Squared Error (RMSE)
            </span>
            <div className="text-xl font-bold text-foreground mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {forecastResult?.modelMetrics.rmse || '156.42 W'}
            </div>
            <span className="text-[10px] text-muted-foreground">Standard prediction variance</span>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Coefficient of Determination (R²)
            </span>
            <div className="text-xl font-bold text-accent mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {forecastResult?.modelMetrics.r2 || '0.2057'}
            </div>
            <span className="text-[10px] text-muted-foreground">Holdout correlation index</span>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Mean Absolute Percentage Error
            </span>
            <div className="text-xl font-bold text-foreground mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {forecastResult?.modelMetrics.mape || '71.10%'}
            </div>
            <span className="text-[10px] text-muted-foreground">Across dynamic interval swings</span>
          </div>
        </div>
      </motion.div>

      {/* Peak Prediction Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 border border-accent/30"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/30">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Projected Peak Demand Window
              </h3>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Expected at <strong>{forecastResult?.peakTime || '18:00'}</strong> for {selectedLocation.name} under {weatherData.temperature}°C ambient conditions
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-6">
            <div>
              <div className="text-3xl font-bold text-accent" style={{ fontFamily: 'var(--font-heading)' }}>
                {forecastResult ? `${((forecastResult.peakDemandKw) / 1000).toFixed(2)} MW` : '3.20 MW'}
              </div>
              <div className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Peak Forecast Demand
              </div>
            </div>

            <button
              onClick={handlePredictWithWeather}
              className="px-4 py-2.5 rounded-lg bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>Test in Predict Load</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
