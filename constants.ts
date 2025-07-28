import type { Indicator } from './types';

export const INDICATORS: Indicator[] = [
  // Economy & Growth
  { name: 'GDP (현재 US$)', code: 'NY.GDP.MKTP.CD' },
  { name: 'GDP 성장률 (연간 %)', code: 'NY.GDP.MKTP.KD.ZG' },
  { name: '1인당 GDP (현재 US$)', code: 'NY.GDP.PCAP.CD' },
  { name: '1인당 GNI, 아틀라스 방식 (현재 US$)', code: 'NY.GNP.PCAP.CD' },
  { name: '인플레이션, 소비자 물가 (연 %)', code: 'FP.CPI.TOTL.ZG' },
  { name: '상품 및 서비스 수출 (% of GDP)', code: 'NE.EXP.GNFS.ZS' },
  { name: '상품 및 서비스 수입 (% of GDP)', code: 'NE.IMP.GNFS.ZS' },
  { name: '외국인 직접 투자, 순유입 (% of GDP)', code: 'BX.KLT.DINV.WD.GD.ZS' },
  { name: '상장 기업의 시가 총액 (% of GDP)', code: 'CM.MKT.LCAP.GD.ZS' },
  
  // Population & Demographics
  { name: '인구, 총계', code: 'SP.POP.TOTL' },
  { name: '도시 인구 (% of total population)', code: 'SP.URB.TOTL.IN.ZS' },

  // Labor & Poverty
  { name: '실업률, 총계 (% of total labor force)', code: 'SL.UEM.TOTL.ZS'},
  { name: '노동력 참여율, 총계 (% of total population ages 15+)', code: 'SL.TLF.CACT.ZS' },
  { name: '여성 노동력 참여율 (% of female population ages 15+)', code: 'SL.TLF.CACT.FE.ZS' },
  { name: '하루 $2.15 미만 빈곤 인구 비율 (2017 PPP) (% of population)', code: 'SI.POV.DDAY' },
  
  // Health
  { name: '기대 수명 (세)', code: 'SP.DYN.LE00.IN' },
  { name: '유아 사망률 (1,000명당)', code: 'SP.DYN.IMRT.IN' },
  { name: '출산율 (여성 1인당 출생아 수)', code: 'SP.DYN.TFRT.IN' },
  { name: '병원 침상 수 (1,000명당)', code: 'SH.MED.BEDS.ZS' },
  { name: 'PM2.5 초미세먼지 농도 (평균 노출)', code: 'EN.ATM.PM25.MC.M3' },

  // Education
  { name: '초등 교육 등록률 (% gross)', code: 'SE.PRM.ENRR' },
  { name: '중등 교육 등록률 (% gross)', code: 'SE.SEC.ENRR' },
  
  // Environment
  { name: '산림 면적 (% of land area)', code: 'AG.LND.FRST.ZS' },
  { name: '전기 접근성 (% of population)', code: 'EG.ELC.ACCS.ZS' },

  // Technology & Infrastructure
  { name: '1인당 전력 소비량 (kWh)', code: 'EG.USE.ELEC.KH.PC' },
  { name: '인터넷 사용자 (% of population)', code: 'IT.NET.USER.ZS' },
  { name: '휴대폰 가입자 수 (100명당)', code: 'IT.CEL.SETS.P2' },
];

export const CHART_COLORS = ['#38bdf8', '#fb923c', '#4ade80', '#a78bfa']; // sky, orange, green, violet