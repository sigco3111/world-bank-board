import React from 'react';

interface YearSliderProps {
  year: string;
  onYearChange: (year: string) => void;
  min: number;
  max: number;
  disabled: boolean;
}

const YearSlider: React.FC<YearSliderProps> = ({ year, onYearChange, min, max, disabled }) => {
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700">
      <label htmlFor="year-slider" className="block text-sm font-medium text-slate-300 mb-2">
        연도 선택: <span className="font-bold text-sky-400 text-base">{year}</span>
      </label>
      <input
        id="year-slider"
        type="range"
        min={min}
        max={max}
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
        disabled={disabled}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-200 [&::-webkit-slider-thumb]:transition-all
                   [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-sky-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-sky-200"
        aria-label="Year Selector"
      />
    </div>
  );
};

export default YearSlider;
