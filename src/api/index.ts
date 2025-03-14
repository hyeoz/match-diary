import axios, { AxiosResponse } from 'axios';
import { REACT_APP_EC2_URI } from '@env';

export const API = axios.create({
  baseURL: REACT_APP_EC2_URI,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const WeatherAPI = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
  headers: {
    'Content-Type': 'application/json',
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
