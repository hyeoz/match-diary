import { API } from '.';
import { MatchDataType } from '@/type/default';

export const getMatchByDate = async (date: string) => {
  try {
    const res = await API.get<MatchDataType[]>(`/match?date=${date}`);
    return {
      data: res.data,
      status: res.status,
      statusText: res.statusText,
    };
  } catch (error) {
    return {
      data: [],
      status: error,
      statusText: error,
    };
  }
};
