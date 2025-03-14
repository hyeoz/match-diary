import dayjs from 'dayjs';
import { WeatherAPI } from '@/api/index';

type OpenWeatherDataType = {
  daily: { time: string[]; weathercode: number[] };
  daily_units: { time: string; weathercode: string };
  elevation: number;
  generationtime_ms: number;
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
};

export const getWeatherIcon = async (
  lat: number,
  lon: number,
  date?: string,
) => {
  try {
    const res = await WeatherAPI.get<OpenWeatherDataType>(
      `/forecast?daily=weathercode&latitude=${lat}&longitude=${lon}${
        date
          ? `&start_date=${dayjs(date).format('YYYY-MM-DD')}&end_date=${dayjs(
              date,
            ).format('YYYY-MM-DD')}`
          : ''
      }`,
    );

    switch (res.data.daily.weathercode[0]) {
      case 0:
        return '🌞';
      case 1:
        return '🌤';
      case 2:
        return '⛅';
      case 3:
        return '☁️';
      case 45:
      case 48:
        return '🌫';
      case 51:
      case 53:
      case 55:
        return '🌧';
      case 61:
      case 63:
      case 65:
        return '☔';
      case 66:
      case 67:
        return '🧊🌧';
      case 71:
      case 73:
      case 75:
        return '❄️';
      case 95:
      case 96:
      case 99:
        return '⛈️';
      default:
        return '🌞';
    }
  } catch (error) {
    console.error(error);
    return '☀️';
  }
};
