import { API_URL } from './api-config'
import { getAreaWeatherConfig, AreaWeatherConfig } from './area-weather-config'

export interface WeatherData {
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  weatherCondition: string
  timestamp: string
  area?: string
  demandImpact?: 'Low' | 'Moderate' | 'High'
  impactScore?: number
  aiInsight?: string
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

/**
 * Weather Service API Layer
 * Connects frontend to backend Weather endpoints while providing robust mock fallbacks
 */
export class WeatherService {
  /**
   * Fetch weather data for a given Area/Zone
   */
  static async getWeatherData(area: string = 'Hyderabad'): Promise<WeatherData> {
    const config = getAreaWeatherConfig(area)

    try {
      const response = await fetch(`${API_URL}/weather?area=${encodeURIComponent(area)}`)
      if (response.ok) {
        const data = await response.json()
        if (!data.error) {
          return {
            temperature: Number(data.temperature ?? config.baseTemp),
            humidity: Number(data.humidity ?? config.baseHumidity),
            precipitation: Number(data.precipitation ?? config.baseRain),
            windSpeed: Number(data.windSpeed ?? config.baseWind),
            weatherCondition: String(data.weatherCondition ?? config.condition),
            timestamp: String(data.timestamp ?? new Date().toISOString()),
            area: area,
            demandImpact: (data.demandImpact as 'Low' | 'Moderate' | 'High') || config.impactLevel,
            impactScore: data.impactScore ?? Math.round((config.baseTemp - 20) * 1.5),
            aiInsight: data.aiInsight || this.generateDefaultInsight(config.baseTemp, config.baseHumidity, area),
            forecast: data.forecast || this.generateHourlyWeatherForecast(config)
          }
        }
      }
    } catch (err) {
      console.warn(`[WeatherService] Backend connection unavailable, using area-aware simulation for '${area}'`, err)
    }

    // Deterministic area-specific mock fallback
    return {
      temperature: config.baseTemp,
      humidity: config.baseHumidity,
      precipitation: config.baseRain,
      windSpeed: config.baseWind,
      weatherCondition: config.condition,
      timestamp: new Date().toISOString(),
      area: area,
      demandImpact: config.impactLevel,
      impactScore: Math.round((config.baseTemp - 20) * 1.5),
      aiInsight: this.generateDefaultInsight(config.baseTemp, config.baseHumidity, area),
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
      // Nonlinear HVAC cooling surge at higher temps
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
      return `High temperature conditions (${temp}°C) in ${area} are increasing electricity consumption significantly, particularly during peak hours due to intense air conditioning load.`
    } else if (temp >= 32) {
      return `Moderate to high temperature (${temp}°C) and ${humidity}% humidity in ${area} is expected to drive steady HVAC cooling demand during afternoon peak hours.`
    } else {
      return `Mild weather conditions in ${area} are keeping baseline cooling demand within optimal operational thresholds.`
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
        description: `High ambient temperature (${temp}°C) elevates commercial and residential HVAC compressor usage.`,
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
