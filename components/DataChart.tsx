import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import type { MultiCountryChartDataPoint, Country, Indicator } from '../types';
import { CHART_COLORS } from '../constants';

interface DataChartProps {
  data: MultiCountryChartDataPoint[];
  isLoading: boolean;
  error: string;
  hasSearched: boolean;
  indicator1: Indicator;
  indicator2: Indicator | null;
  selectedCountries: Country[];
  onYearSelect: (year: string) => void;
}

type ChartType = 'line' | 'bar' | 'scatter';

const formatNumber = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) return '';
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const CustomTooltip: React.FC<any> = ({ active, payload, label, chartType, indicator1, indicator2 }) => {
  if (active && payload && payload.length) {
    if (chartType === 'scatter') {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-800/80 backdrop-blur-sm p-3 border border-slate-600 rounded-md shadow-lg text-sm">
                <p className="font-bold text-sky-400 mb-2">{data.name}</p>
                <p className="text-slate-200">{`${indicator1.name}: ${Number(data.value1).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}</p>
                <p className="text-slate-200">{`${indicator2.name}: ${Number(data.value2).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}</p>
            </div>
        )
    }

    const title = chartType === 'bar' ? label : `연도: ${label}`;
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm p-3 border border-slate-600 rounded-md shadow-lg text-sm">
        <p className="font-bold text-sky-400 mb-2">{title}</p>
        {payload.sort((a:any, b:any) => a.dataKey.localeCompare(b.dataKey)).map((p: any, index: number) => (
          <p key={index} className="text-slate-200 flex items-center gap-2" style={{ color: p.color || p.stroke }}>
             {chartType === 'line' && (p.payload.strokeDasharray ? <span className="text-base leading-none tracking-tighter">– –</span> : <span className="text-base leading-none">──</span>)}
            <span className="flex-grow">{`${p.name}: ${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartPlaceholder: React.FC<{ message: string; icon?: React.ReactNode }> = ({ message, icon }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
        {icon}
        <p className="mt-4 text-center px-4">{message}</p>
    </div>
);

const SortIcon: React.FC<{ direction: 'ascending' | 'descending' | null }> = ({ direction }) => {
    if (!direction) return <span className="text-slate-500">↕</span>;
    return direction === 'ascending' ? <span className="text-sky-400">▲</span> : <span className="text-sky-400">▼</span>;
};


const DataTable: React.FC<{
    data: MultiCountryChartDataPoint[];
    selectedCountries: Country[];
    indicator1: Indicator;
    indicator2: Indicator | null;
}> = ({ data, selectedCountries, indicator1, indicator2 }) => {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ key: 'year', direction: 'ascending' });

    const sortedData = useMemo(() => {
        let sortableData = [...data];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                
                if (aVal == null) return 1;
                if (bVal == null) return -1;

                if (Number(aVal) < Number(bVal)) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (Number(aVal) > Number(bVal)) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="overflow-x-auto mt-4 max-h-96">
            <table className="w-full text-sm text-left text-slate-300 table-auto">
                <thead className="text-xs text-sky-300 uppercase bg-slate-700/50 sticky top-0 backdrop-blur-sm">
                    <tr>
                        <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('year')}>
                            <div className="flex items-center gap-2">
                                Year
                                {sortConfig.key === 'year' ? <SortIcon direction={sortConfig.direction} /> : <SortIcon direction={null} />}
                            </div>
                        </th>
                        {selectedCountries.map(c => (
                           <React.Fragment key={c.code}>
                               <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort(`${c.code}-${indicator1.code}`)}>
                                 <div className="flex items-center gap-2" title={indicator1.name}>
                                  {c.name} (Y1)
                                  {sortConfig.key === `${c.code}-${indicator1.code}` ? <SortIcon direction={sortConfig.direction} /> : <SortIcon direction={null}/>}
                                 </div>
                               </th>
                               {indicator2 && (
                                   <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort(`${c.code}-${indicator2.code}`)}>
                                       <div className="flex items-center gap-2" title={indicator2.name}>
                                           {c.name} (Y2)
                                           {sortConfig.key === `${c.code}-${indicator2.code}` ? <SortIcon direction={sortConfig.direction} /> : <SortIcon direction={null} />}
                                       </div>
                                   </th>
                               )}
                           </React.Fragment>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, index) => (
                        <tr key={index} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="px-4 py-4 font-medium text-slate-100">{row.year}</td>
                            {selectedCountries.map(c => (
                               <React.Fragment key={c.code}>
                                   <td className="px-4 py-4">
                                       {row[`${c.code}-${indicator1.code}`] != null ? Number(row[`${c.code}-${indicator1.code}`]).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A'}
                                   </td>
                                   {indicator2 && (
                                       <td className="px-4 py-4">
                                           {row[`${c.code}-${indicator2.code}`] != null ? Number(row[`${c.code}-${indicator2.code}`]).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A'}
                                       </td>
                                   )}
                               </React.Fragment>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ChartSwitcher: React.FC<{
  selected: ChartType;
  onSelect: (type: ChartType) => void;
  disabled: boolean;
  scatterDisabled: boolean;
}> = ({ selected, onSelect, disabled, scatterDisabled }) => {
    const options: { id: ChartType; label: string; disabled?: boolean; title?: string }[] = [
        { id: 'line', label: '시계열 추세' },
        { id: 'bar', label: '최신 데이터 비교' },
        { id: 'scatter', label: '지표 상관 분석', disabled: scatterDisabled, title: scatterDisabled ? "비교 지표(Y2)를 선택해야 활성화됩니다." : "두 지표 간의 상관관계와 분포를 분석합니다." },
    ];

    return (
        <div className="bg-slate-700/50 p-1 rounded-lg flex items-center justify-center space-x-1 mb-4" title={disabled ? "데이터를 먼저 불러와주세요." : ""}>
            {options.map(opt => (
                <button
                    key={opt.id}
                    onClick={() => onSelect(opt.id)}
                    disabled={disabled || opt.disabled}
                    title={opt.title}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800
                        ${selected === opt.id ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/70'}
                        ${(disabled || opt.disabled) ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

const DataChart: React.FC<DataChartProps> = ({ data, isLoading, error, hasSearched, indicator1, indicator2, selectedCountries, onYearSelect }) => {
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('line');

  // Memoized data for Bar Chart
  const { barChartData, latestYearForBar } = useMemo(() => {
    if (data.length === 0) return { barChartData: [], latestYearForBar: null };

    let latestYearData = null;
    let year = null;
    for (let i = data.length - 1; i >= 0; i--) {
      const yearData = data[i];
      const hasData = selectedCountries.some(c =>
        yearData[`${c.code}-${indicator1.code}`] != null ||
        (indicator2 && yearData[`${c.code}-${indicator2.code}`] != null)
      );
      if (hasData) {
        latestYearData = yearData;
        year = yearData.year;
        break;
      }
    }

    if (!latestYearData) return { barChartData: [], latestYearForBar: null };

    const chartData = selectedCountries.map(country => {
      const entry: { [key: string]: string | number | null } = { name: country.name };
      const value1 = latestYearData?.[`${country.code}-${indicator1.code}`];
      entry[indicator1.name] = typeof value1 === 'number' ? value1 : null;
      if (indicator2) {
        const value2 = latestYearData?.[`${country.code}-${indicator2.code}`];
        entry[indicator2.name] = typeof value2 === 'number' ? value2 : null;
      }
      return entry;
    });

    return { barChartData: chartData, latestYearForBar: year };
  }, [data, selectedCountries, indicator1, indicator2]);

  // Memoized data for Scatter Chart
  const { scatterChartData, latestYearForScatter } = useMemo(() => {
    if (!indicator2 || data.length === 0 || selectedCountries.length === 0) return { scatterChartData: [], latestYearForScatter: null };
    
    let latestCommonDataPoint = null;
    let year = null;
    for (let i = data.length - 1; i >= 0; i--) {
        const point = data[i];
        const allCountriesHaveData = selectedCountries.every(c =>
            point[`${c.code}-${indicator1.code}`] != null &&
            point[`${c.code}-${indicator2.code}`] != null
        );
        if (allCountriesHaveData) {
            latestCommonDataPoint = point;
            year = point.year;
            break;
        }
    }

    if (!latestCommonDataPoint) return { scatterChartData: [], latestYearForScatter: null };
    
    const chartData = selectedCountries.map(c => ({
        name: c.name,
        value1: latestCommonDataPoint?.[`${c.code}-${indicator1.code}`] as number,
        value2: latestCommonDataPoint?.[`${c.code}-${indicator2.code}`] as number,
    }));

    return { scatterChartData: chartData, latestYearForScatter: year };

  }, [data, selectedCountries, indicator1, indicator2]);
  
  const chartTitles = {
    line: "시계열 추세 분석",
    bar: `최신 데이터 비교 (${latestYearForBar || 'N/A'})`,
    scatter: `지표 상관 분석 (${latestYearForScatter || 'N/A'})`
  }

  const renderContent = () => {
    if (isLoading) return <ChartPlaceholder message="데이터를 불러오는 중입니다..." icon={<svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>} />;
    if (error) return <ChartPlaceholder message={error} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>} />;
    if (!hasSearched) return <ChartPlaceholder message="비교할 국가와 지표를 선택하고 '분석 시작'을 눌러주세요." icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>} />;

    // Line Chart
    if (chartType === 'line') {
      if (data.length === 0) return <ChartPlaceholder message="시계열 데이터가 없습니다." />;
      return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: indicator2 ? 40 : 30, left: 20, bottom: 5 }} onClick={(e) => { if (e && e.activeLabel) { onYearSelect(e.activeLabel); }}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 12 }} padding={{ left: 10, right: 10 }} />
              <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 12 }} tickFormatter={formatNumber} domain={['auto', 'auto']} />
              {indicator2 && <YAxis yAxisId="right" orientation="right" stroke="#fb923c" tick={{ fontSize: 12 }} tickFormatter={formatNumber} domain={['auto', 'auto']} />}
              <Tooltip content={<CustomTooltip chartType="line" />} />
              <Legend wrapperStyle={{fontSize: "12px", lineHeight: "1.2em", paddingLeft: "10px", paddingRight: "10px" }} />
              {selectedCountries.map((country, index) => {
                  const color = CHART_COLORS[index % CHART_COLORS.length];
                  return (
                      <React.Fragment key={country.code}>
                          <Line yAxisId="left" type="monotone" dataKey={`${country.code}-${indicator1.code}`} name={`${country.name} (${indicator1.name})`} stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} connectNulls />
                          {indicator2 && <Line yAxisId="right" type="monotone" dataKey={`${country.code}-${indicator2.code}`} name={`${country.name} (${indicator2.name})`} stroke={color} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} activeDot={{ r: 6 }} connectNulls />}
                      </React.Fragment>
                  )
              })}
            </LineChart>
          </ResponsiveContainer>
      );
    }

    // Bar Chart
    if (chartType === 'bar') {
        if (barChartData.length === 0) return <ChartPlaceholder message="최신 비교 데이터를 표시할 수 없습니다." />;
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={formatNumber} />
                    <Tooltip content={<CustomTooltip chartType="bar" />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}/>
                    <Legend />
                    <Bar dataKey={indicator1.name} fill={CHART_COLORS[0]} name={`${indicator1.name} (Y1)`} />
                    {indicator2 && <Bar dataKey={indicator2.name} fill={CHART_COLORS[1]} name={`${indicator2.name} (Y2)`} />}
                </BarChart>
            </ResponsiveContainer>
        );
    }
    
    // Scatter Chart
    if (chartType === 'scatter') {
        if (scatterChartData.length === 0) return <ChartPlaceholder message="지표 상관 데이터를 표시할 수 없습니다. 모든 국가에 대해 두 지표의 공통 연도 데이터가 필요합니다." />;
        return (
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" dataKey="value1" name={indicator1.name} stroke="#94a3b8" tickFormatter={formatNumber} domain={['auto', 'auto']} label={{ value: indicator1.name, position: 'insideBottom', offset: -15, fill: '#94a3b8' }} />
                    <YAxis type="number" dataKey="value2" name={indicator2?.name} stroke="#94a3b8" tickFormatter={formatNumber} domain={['auto', 'auto']} label={{ value: indicator2?.name, angle: -90, position: 'insideLeft', offset: -10, fill: '#94a3b8' }} />
                    <ZAxis type="category" dataKey="name" name="Country" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip chartType="scatter" indicator1={indicator1} indicator2={indicator2} />} />
                    <Legend />
                    <Scatter name="국가" data={scatterChartData}>
                        {scatterChartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        );
    }
    
    return null;
  };
  
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-sky-400">
              {chartTitles[chartType]}
          </h2>
          <ChartSwitcher 
            selected={chartType} 
            onSelect={setChartType}
            disabled={!hasSearched || isLoading || !!error}
            scatterDisabled={!indicator2}
          />
      </div>
      
      <div className="aspect-w-16 aspect-h-9 min-h-[400px]">
        <div className="h-[350px]">
            {renderContent()}
        </div>
      </div>

       {data.length > 0 && !isLoading && chartType === 'line' && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <button
            onClick={() => setIsTableVisible(!isTableVisible)}
            className="text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-2"
            aria-expanded={isTableVisible}
          >
            {isTableVisible ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            )}
            {isTableVisible ? '데이터 테이블 숨기기' : '데이터 테이블 표시'}
          </button>
          {isTableVisible && <DataTable data={data} selectedCountries={selectedCountries} indicator1={indicator1} indicator2={indicator2} />}
        </div>
      )}
    </div>
  );
};

export default DataChart;