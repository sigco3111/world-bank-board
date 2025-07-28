
import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-2xl border border-slate-700 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h2 id="help-modal-title" className="text-xl font-bold text-sky-400 mb-4">
            세계은행 데이터 업데이트 주기 안내
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="닫기">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-slate-300 space-y-4 leading-relaxed">
          <p>
            세계은행 데이터가 최신 연도보다 1~2년 정도 늦게 표시되는 것은 일반적인 현상입니다. 데이터가 사용자에게 제공되기까지 여러 단계를 거치기 때문입니다.
          </p>
          <ol className="list-decimal list-inside space-y-3 pl-2">
            <li>
              <strong className="text-slate-100">데이터 수집 과정:</strong> 세계은행은 전 세계 각국의 통계 기관으로부터 데이터를 수집합니다. 각 나라가 연간 데이터를 집계, 검증하고 세계은행에 보고하기까지 상당한 시간이 소요됩니다. 예를 들어, 2023년 GDP 데이터는 2024년 중반 이후에나 발표되는 경우가 많습니다.
            </li>
            <li>
              <strong className="text-slate-100">데이터 표준화 및 검증:</strong> 수집된 데이터를 모든 국가가 동일한 기준에서 비교될 수 있도록 표준화하고 검증하는 작업을 거칩니다. 이 과정 역시 시간이 걸리는 중요한 단계입니다.
            </li>
            <li>
              <strong className="text-slate-100">지표별 업데이트 주기:</strong> 모든 지표의 업데이트 주기가 다릅니다. 인구나 GDP 같은 주요 경제 지표는 비교적 빨리 업데이트되지만, 특정 설문조사나 연구 기반의 지표(예: 빈곤율, 교육 수준)는 업데이트 주기가 더 길 수 있습니다.
            </li>
          </ol>
          <p className="pt-2">
            현재 앱은 항상 가장 최신 데이터를 요청하지만, 위와 같은 이유로 실제 차트에 표시되는 데이터는 1~2년 전의 것일 수 있습니다. 이는 데이터 자체의 특성이며, 앱은 가능한 가장 최신 정보를 보여주고 있습니다.
          </p>
        </div>
        <div className="mt-6 text-right">
            <button
                onClick={onClose}
                className="bg-sky-600 text-white font-semibold px-5 py-2 rounded-md text-sm transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
            >
                확인
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
