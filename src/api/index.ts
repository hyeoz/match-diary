import axios from 'axios';
import {
  REACT_APP_NAVER_CLIENT_ID,
  REACT_APP_NAVER_CLIENT_SECRET_KEY,
} from '@env';

export const API = axios.create({
  baseURL: 'https://match-diary-backend-79e304d3a79e.herokuapp.com/api',
});

export const NAVER_API = axios.create({
  baseURL: 'https://naveropenapi.apigw.ntruss.com',
  headers: {
    'X-NCP-APIGW-API-KEY-ID': REACT_APP_NAVER_CLIENT_ID,
    'X-NCP-APIGW-API-KEY': REACT_APP_NAVER_CLIENT_SECRET_KEY,
  },
});

export type StrapiType<T> = {
  data: StrapiDataType<T>[];
  meta: StrapiMetaType;
};

type StrapiDataType<T> = {
  attributes: T;
  id: number;
};
type StrapiMetaType = {
  pagination: {
    page: number;
    pageCount: number;
    pageSize: number;
    total: number;
  };
};
