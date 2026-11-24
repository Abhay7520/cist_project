import { API_URL } from './api-config'
import { getAreaWeatherConfig, AreaWeatherConfig, AREA_WEATHER_MAP } from './area-weather-config'

export interface WeatherData {
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  cloudCover: number
  visibility: number
  weatherCondition: string
  timestamp: string
  area?: string
  demandImpact?: 'Low' | 'Moderate' | 'High'
  impactScore?: number
  aiInsight?: string
  isLive?: boolean
  source?: string
  forecast?: Array<{
    time: string
    temperature: number
    condition: string
    precipitationProb: number
  }>
}

export interface WeatherImpactAnalysis {
  area: string
  temperature: number
  humidity: number
  expectedImpact: 'Low' | 'Moderate' | 'High'
  impactPercentage: string
  aiInsight: string
  factors: Array<{
    title: string
    impact: string
    description: string
    severity: 'high' | 'medium' | 'low'
  }>
}

export interface WeatherAlert {
  id: string | number
  title: string
  area: string
  time: string
  severity: 'critical' | 'warning' | 'normal'
  reason: string
  status: 'working' | 'acknowledged' | 'resolved'
  weatherMetric: string
}

function interpretWmoCode(code: number): string {
  if (code === 0) return 'Clear Sky'
  if (code === 1) return 'Mainly Clear'
  if (code === 2) return 'Partly Cloudy'
  if (code === 3) return 'Overcast'
  if (code >= 45 && code <= 48) return 'Foggy'
  if (code >= 51 && code <= 55) return 'Drizzle'
  if (code >= 61 && code <= 65) return 'Rain'
  if (code >= 80 && code <= 82) return 'Rain Showers'
  if (code >= 95) return 'Thunderstorm'
  return 'Clear / Warm'
}

/**
 * Weather Service API Layer
 * Connects frontend to Live Real-World Weather (Open-Meteo) and Backend Weather endpoints,
 * with deterministic area fallbacks for offline execution.
 */
export class WeatherService {
  /**
   * Derive estimated cloud cover percentage from condition string
   */
  static deriveCloudCover(condition: string): number {
    const c = (condition || '').toLowerCase()
    if (c.includes('overcast')) return 85
    if (c.includes('cloud')) return 60
    if (c.includes('rain') || c.includes('drizzle')) return 75
    if (c.includes('thunder')) return 90
    if (c.includes('clear') || c.includes('sunny')) return 5
    return 20
  }

  /**
   * Derive estimated visibility (in km) from condition string
   */
  static deriveVisibility(condition: string): number {
    const c = (condition || '').toLowerCase()
    if (c.includes('fog')) return 2.5
    if (c.includes('thunder') || c.includes('rain')) return 5.0
    if (c.includes('cloud')) return 9.0
    return 15.0
  }

  /**
   * Fetch original live weather data for a given Area/Zone.
   * Prioritizes live real-world weather from Open-Meteo using the area's precise coordinates,
   * then backend /weather endpoint, with area-aware deterministic fallback.
   */
  static async getWeatherData(area: string = 'Hyderabad'): Promise<WeatherData> {
    const config = getAreaWeatherConfig(area)

    // 1. Try fetching original live weather from Open-Meteo in the client
    if (typeof window !== 'undefined' && config.lat && config.lng) {
      try {
        const liveUrl = `https://api.open-meteo.com/v1/forecast?latitude=${config.lat}&longitude=${config.lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,cloud_cover,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&forecast_days=2&timezone=auto`
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3500)
        
        const res = await fetch(liveUrl, { signal: controller.signal })
        clearTimeout(timeoutId)

        if (res.ok) {
          const liveJson = await res.json()
          if (liveJson && liveJson.current) {
            const cur = liveJson.current
            const liveTemp = Math.round(Number(cur.temperature_2m) * 10) / 10
            const liveHumidity = Math.round(Number(cur.relative_humidity_2m))
            const livePrecip = Math.round(Number(cur.precipitation || 0) * 10) / 10
            const liveWind = Math.round(Number(cur.wind_speed_10m || 0) * 10) / 10
            const liveCloud = cur.cloud_cover !== undefined ? Math.round(Number(cur.cloud_cover)) : this.deriveCloudCover('')
            const liveCondition = interpretWmoCode(Number(cur.weather_code || 0))
            const impactLevel: 'Low' | 'Moderate' | 'High' = liveTemp >= 38 ? 'High' : liveTemp >= 32 ? 'Moderate' : 'Low'

            // Build hourly forecast from original API hourly points if present
            let forecastPoints = []
            if (liveJson.hourly && Array.isArray(liveJson.hourly.time)) {
              const currentHour = new Date().getHours()
              for (let i = 0; i < liveJson.hourly.time.length && forecastPoints.length < 6; i++) {
                const hourDate = new Date(liveJson.hourly.time[i])
                const fHour = hourDate.getHours()
                if (fHour >= currentHour && (fHour - currentHour) % 3 === 0) {
                  forecastPoints.push({
                    time: `${fHour.toString().padStart(2, '0')}:00`,
                    temperature: Math.round(Number(liveJson.hourly.temperature_2m[i]) * 10) / 10,
                    condition: interpretWmoCode(Number(liveJson.hourly.weather_code?.[i] || 0)),
                    precipitationProb: Math.round(Number(liveJson.hourly.precipitation_probability?.[i] || 0))
                  })
                }
              }
            }

            if (forecastPoints.length === 0) {
              forecastPoints = this.generateHourlyWeatherForecast(config)
            }

            return {
              temperature: liveTemp,
              humidity: liveHumidity,
              precipitation: livePrecip,
              windSpeed: liveWind,
              cloudCover: liveCloud,
              visibility: this.deriveVisibility(liveCondition),
              weatherCondition: liveCondition,
              timestamp: new Date().toISOString(),
              area: area,
              demandImpact: impactLevel,
              impactScore: Math.round(Math.max(10, (liveTemp - 20) * 1.5)),
              aiInsight: this.generateDefaultInsight(liveTemp, liveHumidity, area),
              isLive: true,
              source: 'Original Live Weather (Open-Meteo)',
              forecast: forecastPoints
            }
          }
        }
      } catch (err) {
        // Fall through to backend or config fallback
      }
    }

    // 2. Try fetching from Backend /weather
    try {
      const response = await fetch(`${API_URL}/weather?area=${encodeURIComponent(area)}`)
      if (response.ok) {
        const data = await response.json()
        if (!data.error) {
          const condition = String(data.weatherCondition ?? config.condition)
          return {
            temperature: Number(data.temperature ?? config.baseTemp),
            humidity: Number(data.humidity ?? config.baseHumidity),
            precipitation: Number(data.precipitation ?? config.baseRain),
            windSpeed: Number(data.windSpeed ?? config.baseWind),
            cloudCover: Number(data.cloudCover ?? this.deriveCloudCover(condition)),
            visibility: Number(data.visibility ?? this.deriveVisibility(condition)),
            weatherCondition: condition,
            timestamp: String(data.timestamp ?? new Date().toISOString()),
            area: area,
            demandImpact: (data.demandImpact as 'Low' | 'Moderate' | 'High') || config.impactLevel,
            impactScore: data.impactScore ?? Math.round((config.baseTemp - 20) * 1.5),
            aiInsight: data.aiInsight || this.generateDefaultInsight(config.baseTemp, config.baseHumidity, area),
            isLive: data.is_live ?? false,
            source: data.is_live ? 'Backend Live Weather' : 'Area Climate Model',
            forecast: data.forecast || this.generateHourlyWeatherForecast(config)
          }
        }
      }
    } catch (err) {
      console.warn(`[WeatherService] Backend connection unavailable, using area-aware simulation for '${area}'`, err)
    }

    // 3. Deterministic area-specific mock fallback
    return {
      temperature: config.baseTemp,
      humidity: config.baseHumidity,
      precipitation: config.baseRain,
      windSpeed: config.baseWind,
      cloudCover: this.deriveCloudCover(config.condition),
      visibility: this.deriveVisibility(config.condition),
      weatherCondition: config.condition,
      timestamp: new Date().toISOString(),
      area: area,
      demandImpact: config.impactLevel,
      impactScore: Math.round((config.baseTemp - 20) * 1.5),
      aiInsight: this.generateDefaultInsight(config.baseTemp, config.baseHumidity, area),
      isLive: false,
      source: 'Area Baseline Model',
      forecast: this.generateHourlyWeatherForecast(config)
    }
  }

  /**
   * Fetch weather impact analysis for AI demand forecast
   */
  static async getWeatherImpact(
    area: string = 'Hyderabad',
    tempOverride?: number,
    humidityOverride?: number
  ): Promise<WeatherImpactAnalysis> {
    const config = getAreaWeatherConfig(area)
    const temp = tempOverride ?? config.baseTemp
    const humidity = humidityOverride ?? config.baseHumidity

    try {
      const url = new URL(`${API_URL}/weather-impact`)
      url.searchParams.append('area', area)
      if (tempOverride !== undefined) url.searchParams.append('temperature', tempOverride.toString())
      if (humidityOverride !== undefined) url.searchParams.append('humidity', humidityOverride.toString())

      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        if (!data.error) {
          return {
            area: data.area || area,
            temperature: Number(data.temperature ?? temp),
            humidity: Number(data.humidity ?? humidity),
            expectedImpact: (data.expectedImpact as 'Low' | 'Moderate' | 'High') || config.impactLevel,
            impactPercentage: data.impactPercentage || `+${Math.round((temp - 25) * 1.8)}%`,
            aiInsight: data.aiInsight || this.generateDefaultInsight(temp, humidity, area),
            factors: data.factors || this.generateImpactFactors(temp, humidity)
          }
        }
      }
    } catch (err) {
      console.warn(`[WeatherService] Impact API offline for '${area}', returning structured mock analysis`, err)
    }

    const impactPct = Math.max(2, Math.round((temp - 25) * 1.8))
    const expectedImpact: 'Low' | 'Moderate' | 'High' = temp >= 38 ? 'High' : temp >= 32 ? 'Moderate' : 'Low'

    return {
      area: area,
      temperature: temp,
      humidity: humidity,
      expectedImpact,
      impactPercentage: `+${impactPct}%`,
      aiInsight: this.generateDefaultInsight(temp, humidity, area),
      factors: this.generateImpactFactors(temp, humidity)
    }
  }

  /**
   * Fetch Temperature vs Electricity Demand visualization chart data
   */
  static async getTemperatureVsDemandChartData(area: string = 'Hyderabad'): Promise<
    Array<{ temperature: number; demand: number; expectedDemand: number }>
  > {
    const config = getAreaWeatherConfig(area)
    const baseGridDemand = 2200 * config.demandFactor

    const temperatures = [20, 24, 28, 32, 36, 40, 44]
    return temperatures.map((temp) => {
      const coolingLoad = Math.pow(Math.max(0, temp - 22), 1.6) * 42
      const demand = Math.round(baseGridDemand + coolingLoad)
      const expectedDemand = Math.round(demand * 1.04)

      return {
        temperature: temp,
        demand,
        expectedDemand
      }
    })
  }

  /**
   * Helper to generate AI insight summary
   */
  private static generateDefaultInsight(temp: number, humidity: number, area: string): string {
    if (temp >= 38) {
      return `Original high temperature (${temp}°C) in ${area} is elevating cooling consumption significantly during peak afternoon and evening hours.`
    } else if (temp >= 32) {
      return `Original temperature (${temp}°C) and ${humidity}% humidity in ${area} is driving steady HVAC cooling demand across commercial and domestic sectors.`
    } else {
      return `Original mild weather conditions in ${area} (${temp}°C, ${humidity}% humidity) keep baseline cooling demand within optimal operational thresholds.`
    }
  }

  /**
   * Generate hourly forecast points
   */
  private static generateHourlyWeatherForecast(config: AreaWeatherConfig) {
    const hours = ['09:00', '12:00', '15:00', '18:00', '21:00', '00:00']
    return hours.map((time, i) => {
      const tempVariation = Math.sin((i / hours.length) * Math.PI) * 5
      return {
        time,
        temperature: Math.round((config.baseTemp - 2 + tempVariation) * 10) / 10,
        condition: config.condition,
        precipitationProb: Math.round(config.baseRain > 0 ? 40 + i * 10 : Math.max(0, 15 - i * 2))
      }
    })
  }

  /**
   * Impact factors breakdown
   */
  private static generateImpactFactors(temp: number, humidity: number) {
    return [
      {
        title: 'Thermal Cooling Demand',
        impact: `+${Math.round(Math.max(0, temp - 25) * 25)} MW`,
        description: `Ambient temperature (${temp}°C) elevates commercial and residential HVAC compressor usage.`,
        severity: temp > 36 ? ('high' as const) : ('medium' as const)
      },
      {
        title: 'Humidity Index (Heat Index)',
        impact: `+${Math.round(humidity * 2.5)} MW`,
        description: `Relative humidity at ${humidity}% increases apparent temperature index, prolonging cooling cycles.`,
        severity: humidity > 60 ? ('high' as const) : ('low' as const)
      },
      {
        title: 'Grid Substation Thermal Stress',
        impact: temp > 38 ? 'High Risk' : 'Normal',
        description: 'Substation transformers operating near rated thermal limit due to sustained elevated temperature.',
        severity: temp > 38 ? ('high' as const) : ('low' as const)
      }
    ]
  }
}
