import { GoogleGenAI } from '@google/genai';
import type { Country, Indicator, MultiCountryChartDataPoint } from '../types';

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use a very low-cost model and a simple prompt to validate.
    // Disable thinking for a faster, cheaper validation call.
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hi',
      config: {
          thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
};


export const analyzeComparativeDataWithGemini = async (
  countries: Country[],
  indicator1: Indicator,
  indicator2: Indicator | null,
  data: MultiCountryChartDataPoint[],
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('Gemini API 키가 제공되지 않았습니다. 제어 패널에서 키를 입력해주세요.');
  }
  const ai = new GoogleGenAI({ apiKey });

  const countryNames = [...new Set(countries.map(c => c.name))].join(', ');
  
  const dataSummary = [...new Set(countries.map(c => c.code))].map(countryCode => {
    const countryName = countries.find(c=> c.code === countryCode)!.name;

    const indicator1Data = data.map(dp => {
        const key = `${countryCode}-${indicator1.code}`;
        const value = dp[key];
        return value !== undefined && value !== null ? `${dp.year}: ${Number(value).toLocaleString()}` : null;
    }).filter(Boolean).join('; ');

    let summary = `- ${countryName}:\n  - ${indicator1.name}: ${indicator1Data}`;

    if (indicator2) {
        const indicator2Data = data.map(dp => {
            const key = `${countryCode}-${indicator2.code}`;
            const value = dp[key];
            return value !== undefined && value !== null ? `${dp.year}: ${Number(value).toLocaleString()}` : null;
        }).filter(Boolean).join('; ');
        summary += `\n  - ${indicator2.name}: ${indicator2Data}`;
    }

    return summary;
  }).join('\n');

  const prompt = indicator2 ? `
  당신은 세계은행 데이터를 분석하는 전문 데이터 분석가입니다. 다음 데이터를 바탕으로 선택된 국가들의 두 가지 지표를 **상호 비교 및 대조하고, 두 지표 간의 상관관계를 심층 분석**해주세요. 설명은 전문가적이면서도 일반인이 이해하기 쉽게 한국어로 작성해야 합니다.

  - 비교 대상 국가: ${countryNames}
  - 분석 지표 1 (Y1 축): ${indicator1.name}
  - 분석 지표 2 (Y2 축): ${indicator2.name}
  - 기간: ${data[0]?.year}년부터 ${data[data.length - 1]?.year}년까지
  - 데이터:
  ${dataSummary}

  **상관관계 비교 분석 리포트 요구사항:**
  1.  **종합적인 추세 비교:** 각 국가별로 두 지표의 전체적인 데이터 추세를 요약하고, 국가 간의 유사점과 차이점을 명확히 비교해주세요.
  2.  **상관관계 및 주요 변곡점 분석:** 국가별로 두 지표 간에 어떤 상관관계(예: 양의 상관, 음의 상관, 무관)가 나타나는지 분석해주세요. 또한, 두 지표의 추세가 함께 움직이거나 확연히 달라지는 '결정적 시기(변곡점)'가 있었다면 그 시점과 가능한 배경(경제적, 사회적 사건 등)을 분석해주세요.
  3.  **결론 및 종합 해석:** 분석 내용을 종합하여, 이러한 지표들의 움직임과 상관관계가 각 국가의 경제 또는 사회적 상황에서 무엇을 의미하는지 간략하게 해석하며 결론을 내려주세요.
  4.  **형식:** 전체적인 분석 내용은 마크다운 형식으로, 각 항목을 명확하게 구분하여 작성해주세요.
  ` : `
  당신은 세계은행 데이터를 분석하는 전문 데이터 분석가입니다. 다음 데이터를 바탕으로 선택된 국가들의 특정 지표를 **상호 비교 및 대조하여** 분석해주세요. 설명은 전문가적이면서도 일반인이 이해하기 쉽게 한국어로 작성해야 합니다.

  - 비교 대상 국가: ${countryNames}
  - 분석 지표: ${indicator1.name}
  - 기간: ${data[0]?.year}년부터 ${data[data.length - 1]?.year}년까지
  - 데이터:
  ${dataSummary}

  **비교 분석 리포트 요구사항:**
  1.  **종합적인 추세 비교:** 각 국가의 전체적인 데이터 추세(예: 꾸준한 성장, 변동성, 특정 시점의 급변 등)를 요약하고, 국가 간의 유사점과 차이점을 명확히 비교해주세요.
  2.  **주요 특징 및 변곡점 분석:** 국가별로 가장 눈에 띄는 최고점이나 최저점을 언급하고, 여러 국가의 추세가 유사하게 움직이거나 혹은 확연히 달라지는 '결정적 시기(변곡점)'가 있었다면 그 시점과 가능한 배경을 분석해주세요.
  3.  **결론 및 종합 해석:** 분석 내용을 종합하여, 이러한 추세의 차이와 공통점이 각 국가의 경제 또는 사회적 상황에서 무엇을 의미하는지 간략하게 해석하며 결론을 내려주세요.
  4.  **형식:** 전체적인 분석 내용은 마크다운 형식으로, 각 항목을 명확하게 구분하여 작성해주세요.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error('Error with Gemini API:', error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('invalid'))) {
         throw new Error('제공된 Gemini API 키가 유효하지 않습니다. 확인 후 다시 시도해주세요.');
    }
    throw new Error('Gemini AI 비교 분석 중 오류가 발생했습니다.');
  }
};