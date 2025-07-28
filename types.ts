export interface Country {
  name: string;
  code: string;
}

export interface Indicator {
  name: string;
  code: string;
}

export interface ChartDataPoint {
  year: string;
  value: number;
}

export interface MapDataPoint {
  id: string; // ISO_A3 country code
  value: number;
}

export interface MultiCountryChartDataPoint {
  year: string;
  [countryCode: string]: number | string;
}

export interface WorldBankApiResponse extends Array<any> {
  1: {
    indicator: { id: string; value: string };
    country: { id: string; value: string };
    countryiso3code: string;
    date: string;
    value: number | null;
    unit: string;
    obs_status: string;
    decimal: number;
  }[];
}

export interface WorldBankCountry {
  id: string;
  iso2Code: string;
  name: string;
  region: {
    id: string;
    iso2code: string;
    value: string;
  };
}

export interface WorldBankCountryApiResponse extends Array<any> {
    1: WorldBankCountry[];
}
