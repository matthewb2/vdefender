'use client';

import { useState, useEffect } from 'react';
import MainPageLayout from './components/MainPageLayout';
import CallSttSimulator from './components/CallSttSimulator';
import { Bell } from 'lucide-react';

export default function MainPage() {
  const [localAlert, setLocalAlert] = useState<string | null>(null);
  const [permission, setPermission] = useState<string>('default');
  
  const totalKeywords = 1420;
  const localKeywords = ['서울중앙지검', '대포통장', '금융감독원', '안전계좌', '이체'];

  // 마운트 시 현재 알림 권한 상태 체크
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // 사용자가 직접 버튼을 클릭했을 때만 호출하도록 분리
  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림 기능을 지원하지 않습니다.');
      return;
    }

    try {
      // 상호작용(클릭) 내부에서 안전하게 요청
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'denied') {
        alert('알림 권한이 거부되었습니다. 브라우저 주소창 왼쪽에 있는 설정(자물쇠 아이콘)에서 직접 허용해 주세요.');
      }
    } catch (error) {
      console.error('권한 요청 실패:', error);
    }
  };

  const handleKeywordDetection = (text: string) => {
    const matchedKeyword = localKeywords.find((keyword) => text.includes(keyword));

    if (matchedKeyword) {
      setLocalAlert(`⚠️ 위험 감지: 통화 중 피싱 키워드 [${matchedKeyword}]가 탐지되었습니다!`);
      
      // 권한이 승인된 상태일 때만 시스템 브라우저 푸시 전송
      if (Notification.permission === 'granted') {
        new Notification('VDefender 피싱 경고', {
          body: `통화 중 의심 키워드 [${matchedKeyword}]가 감지되었습니다. 주의하세요!`,
        });
      }
    }
  };

  return (
    <MainPageLayout totalKeywords={totalKeywords}>
      {/* 알림 권한 설정 유도 배너 */}
      {permission !== 'granted' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="text-sm">
            <p className="font-bold">🔔 실시간 알림 권한이 필요합니다.</p>
            <p className="text-xs text-amber-700 mt-0.5">통화 중 피싱 의심 문구가 감지되었을 때 즉시 화면에 경고 팝업을 띄우기 위해 권한이 필요합니다.</p>
          </div>
          <button 
            onClick={handleRequestPermission}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            <Bell className="h-3.5 w-3.5" /> 권한 허용하기
          </button>
        </div>
      )}

      {localAlert && (
        <div className="bg-red-500 text-white p-4 rounded-xl font-bold shadow-md transition-all animate-pulse">
          {localAlert}
        </div>
      )}

      <CallSttSimulator onKeywordDetected={handleKeywordDetection} />
    </MainPageLayout>
  );
}