'use client';

import { useState } from 'react';
import MainPageLayout from './components/MainPageLayout';
import CallSttSimulator from './components/CallSttSimulator';

export default function MainPage() {
  const [localAlert, setLocalAlert] = useState<string | null>(null);
  
  // 예시용 로컬 동기화 키워드 개수 및 목록
  const totalKeywords = 1420;
  const localKeywords = ['서울중앙지검', '대포통장', '금융감독원', '안전계좌', '이체'];

  const handleKeywordDetection = (text: string) => {
    const matchedKeyword = localKeywords.find((keyword) => text.includes(keyword));

    if (matchedKeyword) {
      setLocalAlert(`⚠️ 위험 감지: 통화 중 피싱 키워드 [${matchedKeyword}]가 탐지되었습니다!`);
    }
  };

  return (
    <MainPageLayout totalKeywords={totalKeywords}>
      {/* 위험 알림창 배너 */}
      {localAlert && (
        <div className="bg-red-500 text-white p-4 rounded-xl font-bold shadow-md transition-all animate-pulse">
          {localAlert}
        </div>
      )}

      {/* 실시간 STT 모듈이 레이아웃 내부 children으로 전달됨 */}
      <CallSttSimulator onKeywordDetected={handleKeywordDetection} />
    </MainPageLayout>
  );
}