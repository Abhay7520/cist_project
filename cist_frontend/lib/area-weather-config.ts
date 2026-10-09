/**
 * Area to Location & Coordinates mapping configuration for Weather Intelligence
 * Allows mapping any area or zone in the project to geographic coordinates & default weather baseline
 */

export interface AreaWeatherConfig {
  name: string;
  lat: number;
  lng: number;
  baseTemp: number; // in Celsius
  baseHumidity: number; // in %
  baseWind: number; // in km/h
  baseRain: number; // in mm
  condition: string;
  demandFactor: number; // multiplier on base electricity demand (e.g. 1.15)
  impactLevel: 'Low' | 'Moderate' | 'High';
}

export const AREA_WEATHER_MAP: Record<string, AreaWeatherConfig> = {
  'Hyderabad': {
    name: 'Hyderabad Central',
    lat: 17.3850,
    lng: 78.4867,
    baseTemp: 39.0,
    baseHumidity: 62,
    baseWind: 14,
    baseRain: 0.0,
    condition: 'Hot / Clear',
    demandFactor: 1.25,
    impactLevel: 'High',
  },
  'Secunderabad': {
    name: 'Secunderabad Metro',
    lat: 17.4399,
    lng: 78.4983,
    baseTemp: 37.5,
    baseHumidity: 58,
    baseWind: 12,
    baseRain: 0.0,
    condition: 'Sunny / Warm',
    demandFactor: 1.18,
    impactLevel: 'High',
  },
  'Cyberabad': {
    name: 'Cyberabad IT Hub',
    lat: 17.4435,
    lng: 78.3772,
    baseTemp: 38.2,
    baseHumidity: 60,
    baseWind: 15,
    baseRain: 0.0,
    condition: 'Hot / Partly Cloudy',
    demandFactor: 1.30,
    impactLevel: 'High',
  },
  'Warangal': {
    name: 'Warangal Zone',
    lat: 17.9689,
    lng: 79.5941,
    baseTemp: 34.0,
    baseHumidity: 68,
    baseWind: 10,
    baseRain: 2.5,
    condition: 'Partly Cloudy',
    demandFactor: 1.05,
    impactLevel: 'Moderate',
  },
  'Karimnagar': {
    name: 'Karimnagar North',
    lat: 18.4386,
    lng: 79.1288,
    baseTemp: 36.0,
    baseHumidity: 55,
    baseWind: 11,
    baseRain: 0.0,
    condition: 'Sunny',
    demandFactor: 1.12,
    impactLevel: 'Moderate',
  },
  'Zone 1': {
    name: 'Grid Zone 1 - Industrial',
    lat: 17.4000,
    lng: 78.4500,
    baseTemp: 38.5,
    baseHumidity: 64,
    baseWind: 16,
    baseRain: 0.0,
    condition: 'High Temperature',
    demandFactor: 1.28,
    impactLevel: 'High',
  },
  'Zone 2': {
    name: 'Grid Zone 2 - Commercial',
    lat: 17.4500,
    lng: 78.5000,
    baseTemp: 35.5,
    baseHumidity: 54,
    baseWind: 13,
    baseRain: 0.0,
    condition: 'Clear / Warm',
    demandFactor: 1.10,
    impactLevel: 'Moderate',
  },
  'Substation S6': {
    name: 'Substation S6 - South Industrial',
    lat: 17.3500,
    lng: 78.4000,
    baseTemp: 40.0,
    baseHumidity: 66,
    baseWind: 18,
    baseRain: 0.0,
    condition: 'Extreme Heat',
    demandFactor: 1.35,
    impactLevel: 'High',
  },
  'Banjara Hills': {
    name: 'Banjara Hills Zone',
    lat: 17.4156,
    lng: 78.4347,
    baseTemp: 36.8,
    baseHumidity: 59,
    baseWind: 12,
    baseRain: 0.0,
    condition: 'Hot / Clear',
    demandFactor: 1.15,
    impactLevel: 'Moderate',
  },
  'Hitech City': {
    name: 'Hitech City Corridor',
    lat: 17.4435,
    lng: 78.3820,
    baseTemp: 39.5,
    baseHumidity: 61,
    baseWind: 15,
    baseRain: 0.0,
    condition: 'Heatwave Warning',
    demandFactor: 1.32,
    impactLevel: 'High',
  },
};

/**
 * Get configuration for an area string with smooth fallback for custom or dataset areas
 */
export function getAreaWeatherConfig(areaName: string): AreaWeatherConfig {
  if (!areaName) {
    return AREA_WEATHER_MAP['Hyderabad'];
  }

  // Exact match
  if (AREA_WEATHER_MAP[areaName]) {
    return AREA_WEATHER_MAP[areaName];
  }

  // Case-insensitive substring match
  const lower = areaName.toLowerCase();
  const matchedKey = Object.keys(AREA_WEATHER_MAP).find(
    (key) => key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())
  );

  if (matchedKey) {
    return AREA_WEATHER_MAP[matchedKey];
  }

  // Hash-based deterministic fallback for any unknown area string
  let hash = 0;
  for (let i = 0; i < areaName.length; i++) {
    hash = (hash << 5) - hash + areaName.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const tempOffset = (positiveHash % 10) - 4; // -4 to +5
  const humidityOffset = (positiveHash % 20) - 10; // -10 to +9
  const baseTemp = Math.round((35.0 + tempOffset) * 10) / 10;
  const baseHumidity = Math.max(30, Math.min(90, 60 + humidityOffset));
  const impactLevel: 'Low' | 'Moderate' | 'High' =
    baseTemp > 38 ? 'High' : baseTemp > 34 ? 'Moderate' : 'Low';

  return {
    name: `${areaName} Region`,
    lat: 17.385 + (positiveHash % 100) * 0.005,
    lng: 78.486 + (positiveHash % 100) * 0.005,
    baseTemp,
    baseHumidity,
    baseWind: 10 + (positiveHash % 12),
    baseRain: positiveHash % 5 === 0 ? 1.5 : 0.0,
    condition: baseTemp > 38 ? 'Hot / Clear' : baseTemp > 34 ? 'Partly Cloudy' : 'Mild / Overcast',
    demandFactor: Math.round((1.0 + (baseTemp - 25) * 0.015) * 100) / 100,
    impactLevel,
  };
}
