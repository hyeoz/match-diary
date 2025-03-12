import { API } from '@/api';
import { useUserState } from '@/stores/user';
import { RecordType } from '@/type/record';

const { uniqueId } = useUserState.getState();

export const getRecordByDate = async (date: string) => {
  try {
    const res = await API.post<RecordType[]>('/user-record/date', {
      date,
      userId: uniqueId,
    });
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

export const getAllUserRecords = async () => {
  try {
    const res = await API.post<RecordType[]>('/user-records', {
      userId: uniqueId,
    });
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
