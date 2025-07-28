
import React, { useState, useCallback, useEffect } from 'react';
import { INDICATORS } from './constants';
import type { Country, Indicator, ChartDataPoint, MultiCountryChartDataPoint } from './types';
import { fetchWorldBankData, fetchAllCountries } from './services/worldBankService';
import { analyzeComparativeDataWithGemini, validateApiKey } from './services/geminiService';
import ControlPanel from './components/ControlPanel';
import DataChart from './components/DataChart';
import AnalysisPanel from './components/AnalysisPanel';
import HelpModal from './components/HelpModal';

interface HeaderProps {
  isAiAnalysisEnabled: boolean;
  onAiAnalysisToggle: (enabled: boolean) => void;
  apiKeyStatus: 'idle' | 'checking' | 'valid' | 'invalid';
  isLoading: boolean;
  onHelpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAiAnalysisEnabled, onAiAnalysisToggle, apiKeyStatus, isLoading, onHelpClick }) => (
  <header className="py-5 px-8">
    <div className="container mx-auto flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-400" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M3.6 9h16.8" />
            <path d="M3.6 15h16.8" />
            <path d="M11.5 3a17 17 0 0 0 0 18" />
            <path d="M12.5 3a17 17 0 0 1 0 18" />
        </svg>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          세계은행 데이터 AI <span className="text-sky-400">비교 분석기</span>
        </h1>
        <button onClick={onHelpClick} className="text-slate-400 hover:text-sky-400 transition-colors" title="데이터 업데이트 주기 안내">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium text-slate-300">Gemini 기능</span>
        <label htmlFor="ai-toggle" className={`relative inline-flex items-center cursor-pointer ${apiKeyStatus !== 'valid' ? 'opacity-50' : ''}`} title={apiKeyStatus !== 'valid' ? 'AI 분석을 사용하려면 유효한 API 키가 필요합니다.' : ''}>
          <input
            type="checkbox"
            id="ai-toggle"
            className="sr-only peer"
            checked={isAiAnalysisEnabled}
            onChange={(e) => onAiAnalysisToggle(e.target.checked)}
            disabled={isLoading || apiKeyStatus !== 'valid'}
          />
          <div className={`w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all ${apiKeyStatus !== 'valid' ? 'cursor-not-allowed' : ''} peer-checked:bg-sky-600`}></div>
        </label>
      </div>
    </div>
  </header>
);

interface ApiKeyPanelProps {
  apiKey: string;
  apiKeyStatus: 'idle' | 'checking' | 'valid' | 'invalid';
  onApiKeySet: (key: string) => void;
  onApiKeyClear: () => void;
  isLoading: boolean;
}

const ApiKeyPanel: React.FC<ApiKeyPanelProps> = ({ apiKey, apiKeyStatus, onApiKeySet, onApiKeyClear, isLoading }) => {
    const [localApiKey, setLocalApiKey] = useState(apiKey);

    useEffect(() => {
        setLocalApiKey(apiKey);
    }, [apiKey]);
    
    const handleSave = () => { onApiKeySet(localApiKey); };
    const handleClear = () => { setLocalApiKey(''); onApiKeyClear(); };

    const StatusIndicator = () => {
        const statusMap = {
            valid: { text: 'Active', color: 'green' },
            invalid: { text: 'Invalid', color: 'red' },
            checking: { text: 'Checking...', color: 'yellow' },
            idle: { text: 'Inactive', color: 'slate' },
        };
        const currentStatus = statusMap[apiKeyStatus] || statusMap.idle;
        return (
            <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full bg-${currentStatus.color}-500 ${apiKeyStatus === 'checking' ? 'animate-pulse' : ''}`}></div>
                <span className="text-sm text-slate-300">{currentStatus.text}</span>
            </div>
        );
    };

    return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-4 w-full">
                <input
                    id="api-key-input"
                    type="password"
                    placeholder="Gemini API 키를 입력하세요..."
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    className="flex-grow bg-transparent text-slate-100 placeholder-slate-400 focus:outline-none text-sm"
                    disabled={isLoading || apiKeyStatus === 'checking'}
                    aria-label="Gemini API Key Input"
                />
                <button
                    onClick={handleSave}
                    disabled={isLoading || apiKeyStatus === 'checking' || localApiKey === apiKey}
                    className="bg-cyan-600 text-white font-semibold px-4 py-1.5 rounded-md text-sm transition hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                    저장
                </button>
                <button
                    onClick={handleClear}
                    disabled={isLoading || apiKeyStatus === 'checking' || !apiKey}
                    className="text-slate-400 font-semibold text-sm hover:text-white transition disabled:text-slate-600 disabled:cursor-not-allowed"
                >
                    삭제
                </button>
                <StatusIndicator />
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator>(INDICATORS[0]);
  const [selectedIndicator2, setSelectedIndicator2] = useState<Indicator | null>(null);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  
  // Chart-related state
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [chartData, setChartData] = useState<MultiCountryChartDataPoint[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [currentAnalysisTitle, setCurrentAnalysisTitle] = useState<string>('');
  const [isAiAnalysisEnabled, setIsAiAnalysisEnabled] = useState<boolean>(false);
  const [highlightedYear, setHighlightedYear] = useState<string | null>(null);

  // API Key state
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  
  // Modal state
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);


  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const countries = await fetchAllCountries();
        setAllCountries(countries);
      } catch (err) {
        setError('국가 목록을 불러오는 데 실패했습니다. 페이지를 새로고침 해주세요.');
      } finally {
        setIsAppLoading(false);
      }
    };

    const loadApiKey = async () => {
      const storedKey = localStorage.getItem('geminiApiKey');
      if (storedKey) {
        setApiKey(storedKey);
        setApiKeyStatus('checking');
        const isValid = await validateApiKey(storedKey);
        setApiKeyStatus(isValid ? 'valid' : 'invalid');
        if (!isValid) {
            setIsAiAnalysisEnabled(false);
        }
      }
    };

    loadInitialData();
    loadApiKey();
  }, []);


  const handleCountryAdd = (country: Country) => {
    setSelectedCountries(prev => {
      if (prev.length < 3 && !prev.some(c => c.code === country.code)) {
        return [...prev, country];
      }
      return prev;
    });
  };
  
  const handleCountryRemove = (countryCode: string) => {
    setSelectedCountries(prev => prev.filter(c => c.code !== countryCode));
  };

  const mergeDataForChart = (dataResults: { country: Country; indicator: Indicator; data: ChartDataPoint[] }[]): MultiCountryChartDataPoint[] => {
    const yearDataMap = new Map<string, MultiCountryChartDataPoint>();

    dataResults.forEach(({ country, indicator, data }) => {
      data.forEach(point => {
        if (!yearDataMap.has(point.year)) {
          yearDataMap.set(point.year, { year: point.year });
        }
        const yearData = yearDataMap.get(point.year)!;
        const dataKey = `${country.code}-${indicator.code}`;
        yearData[dataKey] = point.value;
      });
    });

    return Array.from(yearDataMap.values()).sort((a, b) => parseInt(a.year) - parseInt(b.year));
  };

  const handleApiKeySet = async (newKey: string) => {
    if (!newKey) {
      handleApiKeyClear();
      return;
    }
    setApiKey(newKey);
    localStorage.setItem('geminiApiKey', newKey);
    setApiKeyStatus('checking');
    const isValid = await validateApiKey(newKey);
    setApiKeyStatus(isValid ? 'valid' : 'invalid');
    if (!isValid) {
        setIsAiAnalysisEnabled(false);
    }
  };

  const handleApiKeyClear = () => {
    setApiKey('');
    setApiKeyStatus('idle');
    localStorage.removeItem('geminiApiKey');
    setIsAiAnalysisEnabled(false);
  };

  const handleFetchData = useCallback(async () => {
    if (selectedCountries.length === 0) {
      setError('최소 1개 이상의 국가를 선택해야 합니다.');
      return;
    }

    setIsLoading(true);
    setError('');
    setChartData([]);
    setAnalysis('');
    setHasSearched(true);
    setCurrentAnalysisTitle('');
    setHighlightedYear(null);

    const countryNames = selectedCountries.map(c => c.name).join(', ');
    let title = `${countryNames} - ${selectedIndicator.name}`;
    if (selectedIndicator2) {
      title += ` & ${selectedIndicator2.name}`;
    }
    
    if (isAiAnalysisEnabled) {
      setCurrentAnalysisTitle(title);
    }

    try {
      const dataFetchPromises: Promise<{ country: Country; indicator: Indicator; data: ChartDataPoint[] }>[] = [];
      
      selectedCountries.forEach(country => {
        dataFetchPromises.push(
          fetchWorldBankData(country.code, selectedIndicator.code)
            .then(data => ({ country, indicator: selectedIndicator, data }))
        );
        if (selectedIndicator2) {
          dataFetchPromises.push(
            fetchWorldBankData(country.code, selectedIndicator2.code)
              .then(data => ({ country, indicator: selectedIndicator2, data }))
          );
        }
      });
      
      const results = await Promise.all(dataFetchPromises);
      
      const validResults = results.filter(r => r.data.length > 0);

      if (validResults.length === 0) {
        setError('선택된 조건에 해당하는 데이터를 찾을 수 없습니다. 다른 국가나 지표를 선택해 주세요.');
        setIsLoading(false);
        return;
      }
      
      const mergedData = mergeDataForChart(validResults);
      setChartData(mergedData);
      
      if (isAiAnalysisEnabled && mergedData.length > 0) {
         if (apiKeyStatus !== 'valid') {
            setAnalysis('AI 분석을 사용하려면 유효한 Gemini API 키를 먼저 설정해야 합니다.');
            setIsLoading(false);
            return;
        }
        const geminiAnalysis = await analyzeComparativeDataWithGemini(
          validResults.map(r => r.country), 
          selectedIndicator, 
          selectedIndicator2,
          mergedData,
          apiKey
        );
        setAnalysis(geminiAnalysis);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      console.error(errorMessage);
      setError(`데이터 분석 중 오류 발생: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCountries, selectedIndicator, isAiAnalysisEnabled, selectedIndicator2, apiKey, apiKeyStatus]);

  if (isAppLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          <p className="mt-4 text-slate-300">국가 목록을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header
        isAiAnalysisEnabled={isAiAnalysisEnabled}
        onAiAnalysisToggle={setIsAiAnalysisEnabled}
        apiKeyStatus={apiKeyStatus}
        isLoading={isLoading}
        onHelpClick={() => setIsHelpModalOpen(true)}
      />
      <div className="container mx-auto px-4 md:px-8 pb-6">
        <ApiKeyPanel
            apiKey={apiKey}
            apiKeyStatus={apiKeyStatus}
            onApiKeySet={handleApiKeySet}
            onApiKeyClear={handleApiKeyClear}
            isLoading={isLoading}
        />
      </div>

      <main className="container mx-auto p-4 md:p-8 pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ControlPanel
              allCountries={allCountries}
              indicators={INDICATORS}
              selectedCountries={selectedCountries}
              onCountryAdd={handleCountryAdd}
              onCountryRemove={handleCountryRemove}
              selectedIndicator={selectedIndicator}
              setSelectedIndicator={setSelectedIndicator}
              selectedIndicator2={selectedIndicator2}
              setSelectedIndicator2={setSelectedIndicator2}
              onFetchData={handleFetchData}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-8">
            <DataChart 
              data={chartData} 
              isLoading={isLoading} 
              error={error} 
              hasSearched={hasSearched}
              indicator1={selectedIndicator}
              indicator2={selectedIndicator2}
              selectedCountries={selectedCountries}
              onYearSelect={setHighlightedYear}
            />
            <AnalysisPanel 
              analysis={analysis}
              isLoading={isLoading && chartData.length > 0 && isAiAnalysisEnabled} 
              error={error} 
              hasSearched={hasSearched}
              title={currentAnalysisTitle}
              aiAnalysisEnabled={isAiAnalysisEnabled}
              highlightedYear={highlightedYear}
              clearHighlight={() => setHighlightedYear(null)}
            />
          </div>
        </div>
      </main>
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      <footer className="text-center py-4 mt-8 text-slate-500 text-sm">
        <p>Powered by World Bank Open Data & Google Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;