import axios from 'axios';
import { SearchResponse } from './types';

const API_BASE_URL = 'http://127.0.0.1:3001';

export const searchVacancies = async (
  query: string,
  region: string,
  numVacancies: number
): Promise<SearchResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/search`, {
      query,
      region,
      num_vacancies: numVacancies
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении результатов');
    }
    throw error;
  }
}; 