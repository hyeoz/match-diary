import axios from 'axios';
import {
  REACT_APP_EC2_URI,
  REACT_APP_GEMINI_API_KEY,
  REACT_APP_GEMINI_URI,
  REACT_APP_WEATHER_URI,
} from '@env';

export const API = axios.create({
  baseURL: REACT_APP_EC2_URI,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const WeatherAPI = axios.create({
  baseURL: REACT_APP_WEATHER_URI,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const GeminiAPI = axios.create({
  baseURL: REACT_APP_GEMINI_URI,
  headers: {
    'Content-Type': 'application/json',
    'X-goog-api-key': REACT_APP_GEMINI_API_KEY,
  },
});

// API.interceptors.response.use(
//   (response: AxiosResponse) => {
//     return {
//       data: response.data,
//       status: response.status,
//       statusText: response.statusText,
//     } as AxiosResponse;
//   },
//   error => {
//     return Promise.reject(error);
//   },
// );
