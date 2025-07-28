import React, { useState, useMemo, memo } from 'react';
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import type { MapDataPoint } from '../types';

const GEO_URL = "https://cdn.jsdelivr.net/gh/zcreativelabs/react-simple-maps@master/topojson-maps/world-110m.json";

interface MapChartProps {
  data: MapDataPoint[];
  isLoading: boolean;
  error: string;
  indicatorName: string;
  year: string;
}

const formatNumber = (num: number | undefined): string => {
  if (typeof num !== 'number' || isNaN(num)) return '';
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const MapPlaceholder: React.FC<{ message: string; icon?: React.ReactNode }> = ({ message, icon }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-800/30 rounded-lg">
        {icon}
        <p className="mt-4 text-center px-4">{message}</p>
    </div>
);

const MemoizedGeography = memo(({ geo, color, onMouseEnter, onMouseLeave }: any) => {
    return (
        <Geography
            geography={geo}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
                default: { fill: color, outline: 'none', stroke: '#475569', strokeWidth: 0.5 },
                hover: { fill: '#0ea5e9', outline: 'none', stroke: '#e2e8f0', strokeWidth: 1 },
                pressed: { fill: '#0284c7', outline: 'none' },
            }}
        />
    );
});


const MapChart: React.FC<MapChartProps> = ({ data, isLoading, error, indicatorName, year }) => {
    const [tooltipContent, setTooltipContent] = useState('');

    const colorScale = useMemo(() => {
        if (!data || data.length === 0) {
            return null;
        }
        const values = data.map(d => d.value);
        if (values.length === 0) {
            return null;
        }
        return scaleQuantile<string>()
            .domain(values)
            .range(['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1']);
    }, [data]);
    
    const renderContent = () => {
        return (
            <ComposableMap
                projection="geoNaturalEarth1"
                projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
                className="w-full h-full"
            >
                <Sphere fill="#1e293b" stroke="#475569" strokeWidth={0.5} id="sphere"/>
                <Graticule stroke="#334155" strokeWidth={0.5} step={[15, 15]} />
                <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const d = data.find(s => s.id === geo.properties.ISO_A3);
                            const color = (d && colorScale) ? colorScale(d.value) : '#334155';
                            return (
                                <MemoizedGeography
                                    key={geo.rsmKey}
                                    geo={geo}
                                    color={color}
                                    onMouseEnter={() => {
                                        const { NAME } = geo.properties;
                                        setTooltipContent(`${NAME}: ${d ? formatNumber(d.value) : 'N/A'}`);
                                    }}
                                    onMouseLeave={() => {
                                        setTooltipContent('');
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>
        );
    };

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 relative min-h-[500px]">
            <h2 className="text-xl font-bold text-sky-400 mb-1">{indicatorName}</h2>
            <p className="text-sm text-slate-400 mb-4">전 세계 분포 ({year}년)</p>
            <div className="w-full h-[500px] relative">
                {renderContent()}
                {isLoading && <MapPlaceholder message="지도 데이터를 불러오는 중입니다..." icon={<svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>} />}
                {error && !isLoading && <MapPlaceholder message={error} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>} />}
            </div>
            {tooltipContent && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[300px] bg-slate-900/80 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-md shadow-lg pointer-events-none">
                    {tooltipContent}
                </div>
            )}
            {data.length > 0 && !isLoading && !error && colorScale && (
                <div className="absolute bottom-4 right-4 bg-slate-800/70 p-2 rounded-md text-xs text-slate-200">
                    <div className="font-bold mb-1">범례</div>
                    {colorScale.range().map((color, i) => {
                        const [min, max] = colorScale.invertExtent(color);
                        return (
                            <div key={i} className="flex items-center">
                                <div className="w-4 h-4 mr-2" style={{ backgroundColor: color }}></div>
                                <span>{formatNumber(min)} - {formatNumber(max)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MapChart;