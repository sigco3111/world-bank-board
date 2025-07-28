
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Country, Indicator } from '../types';

interface ControlPanelProps {
  allCountries: Country[];
  indicators: Indicator[];
  selectedCountries: Country[];
  onCountryAdd: (country: Country) => void;
  onCountryRemove: (countryCode: string) => void;
  selectedIndicator: Indicator;
  setSelectedIndicator: (indicator: Indicator) => void;
  selectedIndicator2: Indicator | null;
  setSelectedIndicator2: (indicator: Indicator | null) => void;
  onFetchData: () => void;
  isLoading: boolean;
}

const CountrySelector: React.FC<{
  allCountries: Country[];
  selectedCountries: Country[];
  onCountryAdd: (country: Country) => void;
  onCountryRemove: (countryCode: string) => void;
  isLoading: boolean;
}> = ({ allCountries, selectedCountries, onCountryAdd, onCountryRemove, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const canSelectMore = selectedCountries.length < 3;
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = useMemo(() => {
    return allCountries
      .filter(
        (country) =>
          country.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedCountries.some((sc) => sc.code === country.code)
      )
      .slice(0, 50);
  }, [searchTerm, allCountries, selectedCountries]);

  const handleAdd = (country: Country) => {
    onCountryAdd(country);
    setSearchTerm('');
    setDropdownOpen(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        국가 (최대 3개 선택 가능)
      </label>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[34px]">
        {selectedCountries.map((country) => (
          <div
            key={country.code}
            className="flex items-center gap-2 bg-sky-600 text-white px-3 py-1.5 text-sm font-semibold rounded-full"
          >
            <span>{country.name}</span>
            <button
              onClick={() => onCountryRemove(country.code)}
              disabled={isLoading}
              className="text-sky-200 hover:text-white disabled:opacity-50"
              aria-label={`${country.name} 제거`}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="relative" ref={searchRef}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isDropdownOpen) {
              setDropdownOpen(true);
            }
          }}
          onFocus={() => setDropdownOpen(true)}
          disabled={!canSelectMore || isLoading}
          placeholder={canSelectMore ? '검색하여 국가 추가...' : '최대 3개 국가까지 선택 가능합니다.'}
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {isDropdownOpen && filteredCountries.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredCountries.map((country) => (
              <li
                key={country.code}
                onClick={() => handleAdd(country)}
                className="px-3 py-2 text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                {country.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const IndicatorSelector: React.FC<{
  indicators: Indicator[];
  selectedIndicator: Indicator;
  onIndicatorSelect: (indicator: Indicator) => void;
  isLoading: boolean;
  disabledIndicator?: Indicator | null;
  placeholder?: string;
}> = ({ indicators, selectedIndicator, onIndicatorSelect, isLoading, disabledIndicator, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredIndicators = useMemo(() =>
    indicators.filter(indicator =>
      indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      indicator.code !== disabledIndicator?.code
    ), [searchTerm, indicators, disabledIndicator]
  );

  const handleSelect = (indicator: Indicator) => {
    onIndicatorSelect(indicator);
    setDropdownOpen(false);
    setSearchTerm('');
  };

  const displayText = selectedIndicator?.name || placeholder || '지표 선택...';

  return (
    <div ref={selectorRef}>
      <label htmlFor={`indicator-select-button-${selectedIndicator?.code}`} className="block text-sm font-medium text-slate-300 mb-2">
        지표
      </label>
      <div className="relative">
        <button
          id={`indicator-select-button-${selectedIndicator?.code}`}
          type="button"
          onClick={() => setDropdownOpen(!isDropdownOpen)}
          disabled={isLoading}
          className="relative w-full cursor-pointer rounded-md bg-slate-700 border border-slate-600 py-2 pl-3 pr-10 text-left text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        >
          <span className={`block truncate ${!selectedIndicator && 'text-slate-400'}`}>{displayText}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zM10 17a.75.75 0 01-.53-.22l-3.5-3.5a.75.75 0 011.06-1.06L10 15.19l3.47-3.47a.75.75 0 011.06 1.06l-3.5 3.5A.75.75 0 0110 17z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        {isDropdownOpen && (
          <div className="absolute z-20 mt-1 w-full rounded-md bg-slate-800 shadow-lg border border-slate-600">
            <div className="p-2">
              <input
                type="text"
                autoFocus
                placeholder="지표 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              />
            </div>
            <ul className="max-h-60 w-full overflow-auto rounded-md text-base focus:outline-none sm:text-sm">
              {filteredIndicators.length > 0 ? filteredIndicators.map(indicator => (
                <li
                  key={indicator.code}
                  onClick={() => handleSelect(indicator)}
                  className="relative cursor-pointer select-none py-2 px-4 text-slate-200 hover:bg-slate-700"
                >
                  <span className="block truncate">{indicator.name}</span>
                </li>
              )) : <li className="text-center py-2 text-slate-400">검색 결과가 없습니다.</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  allCountries,
  indicators,
  selectedCountries,
  onCountryAdd,
  onCountryRemove,
  selectedIndicator,
  setSelectedIndicator,
  selectedIndicator2,
  setSelectedIndicator2,
  onFetchData,
  isLoading,
}) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700 h-full flex flex-col">
      <h2 className="text-xl font-bold text-sky-400 mb-6">데이터 선택</h2>
      <div className="space-y-6 flex-grow">
        <CountrySelector
          allCountries={allCountries}
          selectedCountries={selectedCountries}
          onCountryAdd={onCountryAdd}
          onCountryRemove={onCountryRemove}
          isLoading={isLoading}
        />
        <IndicatorSelector
          indicators={indicators}
          selectedIndicator={selectedIndicator}
          onIndicatorSelect={(indicator) => {
            if (selectedIndicator2 && selectedIndicator2.code === indicator.code) {
              setSelectedIndicator2(null);
            }
            setSelectedIndicator(indicator);
          }}
          isLoading={isLoading}
          disabledIndicator={selectedIndicator2}
        />
        
        {selectedIndicator2 ? (
          <div>
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">비교 지표 (Y2)</label>
                <button
                    onClick={() => setSelectedIndicator2(null)}
                    disabled={isLoading}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-700"
                    aria-label="비교 지표 제거"
                >
                    제거
                </button>
            </div>
             <IndicatorSelector
                indicators={indicators}
                selectedIndicator={selectedIndicator2}
                onIndicatorSelect={setSelectedIndicator2}
                isLoading={isLoading}
                disabledIndicator={selectedIndicator}
            />
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={() => {
                  const defaultSecondIndicator = indicators.find(i => i.code !== selectedIndicator.code) || indicators[1];
                  setSelectedIndicator2(defaultSecondIndicator);
              }}
              disabled={isLoading}
              className="w-full text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center justify-center gap-2 border-2 border-slate-600/80 border-dashed rounded-lg py-2 hover:bg-slate-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              비교 지표 추가 (이중 Y축)
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-700/50">
        <button
          onClick={onFetchData}
          disabled={isLoading || selectedCountries.length === 0}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-md transition-all duration-200 ease-in-out flex items-center justify-center disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              분석 중...
            </>
          ) : (
            '비교 분석 시작'
          )}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
