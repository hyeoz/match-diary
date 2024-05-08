import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://localhost:1337/api', // TODO strapi 서버 URL 변경 필요
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
