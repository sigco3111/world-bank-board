import React, { useRef, useEffect } from 'react';

interface AnalysisPanelProps {
  analysis: string;
  isLoading: boolean;
  error: string;
  hasSearched: boolean;
  title: string;
  aiAnalysisEnabled: boolean;
  highlightedYear: string | null;
  clearHighlight: () => void;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
    </div>
);

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading, hasSearched, title, aiAnalysisEnabled, highlightedYear, clearHighlight }) => {
  const analysisContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevHighlight = analysisContentRef.current?.querySelector('.analysis-highlight');
    if (prevHighlight) {
        prevHighlight.classList.remove('analysis-highlight', 'bg-sky-800', 'p-1', 'rounded-md', 'transition-all');
    }

    if (highlightedYear && analysisContentRef.current) {
        const targetElement = analysisContentRef.current.querySelector(`#analysis-ref-${highlightedYear}`);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const highlightClasses = ['analysis-highlight', 'bg-sky-800/60', 'p-1', 'rounded-md', 'transition-all', 'duration-300'];
            targetElement.classList.add(...highlightClasses);

            const timer = setTimeout(() => {
                targetElement.classList.remove(...highlightClasses);
                clearHighlight();
            }, 3000);

            return () => clearTimeout(timer);
        } else {
             const timer = setTimeout(() => {
                clearHighlight();
            }, 500);
            return () => clearTimeout(timer);
        }
    }
  }, [highlightedYear, clearHighlight, analysis]);


  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }
    if (analysis) {
        const formattedAnalysis = analysis
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-sky-400">$1</strong>')
            .replace(/(?<!\d)(20\d{2}|19\d{2})(?!\d)/g, (year) => `<span id="analysis-ref-${year}">${year}</span>`)
            .replace(/-\s(.*?)(?=\n-|\n\n|$)/g, '<li class="ml-4 mb-2 list-disc">$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/\n/g, '<br />')
            .replace(/<br \/>\s*<ul>/g, '<ul>')
            .replace(/<\/ul>\s*<br \/>/g, '</ul>')
            .replace(/<br \/>\s*<br \/>/g, '<br />');

      return <div className="text-slate-300 leading-relaxed prose prose-invert prose-p:my-2 prose-headings:text-sky-300 prose-ul:my-2" dangerouslySetInnerHTML={{ __html: formattedAnalysis }} />;
    }
    if (hasSearched) {
        if (!aiAnalysisEnabled) {
            return <p className="text-slate-400">AI 분석이 비활성화되었습니다. 제어 패널에서 토글을 켜고 다시 시도해 주세요.</p>;
        }
        return <p className="text-slate-400">차트 데이터를 기반으로 한 분석을 생성할 수 없습니다.</p>;
    }
    return <p className="text-slate-400">데이터를 선택하고 분석을 시작하면 AI 분석 결과가 여기에 표시됩니다.</p>;
  };
  
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700 min-h-[200px]">
      <div className="flex items-center gap-3 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10c0-4.42-2.87-8.1-6.84-9.54"></path>
            <path d="M12 2v2"></path><path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path><path d="M20 12h2"></path>
            <path d="m4.93 19.07 1.41-1.41"></path><path d="m17.66 6.34 1.41-1.41"></path>
            <path d="M12 6a6 6 0 1 0 6 6c0-2.21-1.2-4.16-3-5.19"></path>
        </svg>
        <h2 className="text-xl font-bold text-sky-400">AI 비교 분석 리포트</h2>
      </div>
      {title && hasSearched && aiAnalysisEnabled && <p className="text-sm text-slate-400 mb-4 font-semibold">{title}</p>}
      <div ref={analysisContentRef}>{renderContent()}</div>
    </div>
  );
};

export default AnalysisPanel;