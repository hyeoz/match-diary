import { API } from '@/api';
import { MatchDataType } from '@/type/match';

export const getMatchByDate = async (date: string) => {
  try {
    const res = await API.get<MatchDataType[]>(`/match/filter?date=${date}`);
    return {
      data: res.data,
      status: res.status,
      statusText: res.statusText,
    };
  } catch (error) {
    console.error(error, 'GET MATCH BY DATE');
    return {
      data: [],
      status: error,
      statusText: error,
    };
  }
};

export const getMatchById = async (id?: number) => {
  if (!id) {
    return;
  }
  try {
    const res = await API.get<MatchDataType>(`/match/${id}`);
    return {
      data: res.data,
      status: res.status,
      statusText: res.statusText,
    };
  } catch (error) {
    console.error(error);
    return {
      data: [],
      status: error,
      statusText: error,
    };
  }
};
