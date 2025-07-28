
import type { ChartDataPoint, WorldBankApiResponse, Country, WorldBankCountryApiResponse } from '../types';

const API_BASE_URL = 'https://api.worldbank.org/v2';
const DATE_RANGE = `2000:${new Date().getFullYear()}`;

export const fetchAllCountries = async (): Promise<Country[]> => {
  // Fetching a large number per page to get all countries in one go.
  const url = `${API_BASE_URL}/country?format=json&per_page=350`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`World Bank API responded with status: ${response.status}`);
    }

    const data: WorldBankCountryApiResponse = await response.json();

    if (!data || !Array.isArray(data[1]) || data[1].length === 0) {
      return [];
    }
    
    // Filter out aggregates (regions, income levels, etc.) and keep only actual countries.
    // Also, sort them by name for better user experience in the dropdown.
    const countries: Country[] = data[1]
      .filter(item => item.region?.value !== 'Aggregates' && item.iso2Code)
      .map(item => ({
        name: item.name,
        code: item.id, // Use 'id' which is the 3-letter code (e.g., KOR, USA)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return countries;

  } catch (error) {
    console.error('Error fetching countries from World Bank API:', error);
    throw new Error('세계은행 API로부터 국가 목록을 가져오는 데 실패했습니다.');
  }
};


export const fetchWorldBankData = async (
  countryCode: string,
  indicatorCode: string
): Promise<ChartDataPoint[]> => {
  const url = `${API_BASE_URL}/country/${countryCode}/indicator/${indicatorCode}?format=json&date=${DATE_RANGE}&per_page=100`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`World Bank API responded with status: ${response.status}`);
    }

    const data: WorldBankApiResponse = await response.json();

    if (!data || !Array.isArray(data[1]) || data[1].length === 0) {
      return [];
    }
    
    // The data comes in reverse chronological order, so we reverse it.
    // We also filter out any years that have a null value.
    const formattedData: ChartDataPoint[] = data[1]
      .filter(item => item.value !== null)
      .map(item => ({
        year: item.date,
        value: item.value as number,
      }))
      .reverse();
      
    return formattedData;
  } catch (error) {
    console.error('Error fetching from World Bank API:', error);
    throw new Error('세계은행 API로부터 데이터를 가져오는 데 실패했습니다.');
  }
};
