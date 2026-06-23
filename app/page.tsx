'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, CheckCircle, RefreshCw, Search, ArrowRight, Server, Smartphone } from 'lucide-react';

export default function MainPage() {
  // 모바일 로컬 동기화 및 키워드 데이터 상태 (예시 데이터)
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState('최신 상태 (방금 전 업데이트)');
  const [totalKeywords, setTotalKeywords] = useState(1420);
  const [searchResult, setSearchResult] = useState<{ found: boolean; word?: string; level?: string } | null>(null);

  // 실시간 기기 내부 매칭 시뮬레이션 및 DB 검색용 함수
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // 실제 환경에서는 백엔드 API 호출 또는 로컬 상태 필터링
    const mockKeywords = [
      { word: '검찰청', level: '심각' },
      { word: '대포통장', level: '심각' },
      { word: '금융감독원', level: '위험' },
      { word: '안전계좌', level: '위험' },
    ];

    const match = mockKeywords.find(k => searchQuery.includes(k.word));
    if (match) {
      setSearchResult({ found: true, word: match.word, level: match.level });
    } else {
      setSearchResult({ found: false });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* GNB / 상단 헤더 */}
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-red-600" />
            <span className="text-xl font-black tracking-tight text-slate-900">VDefender</span>
          </div>
          <nav className="flex gap-4 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-red-600">보안 가이드</a>
            <a href="#keywords" className="hover:text-red-600">키워드 제보</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* 1. On-Device 민감정보 보호 배너 */}
        <section className="mb-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-block rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 backdrop-blur-sm">
                100% On-Device 프라이버시 보호
              </span>
              <h2 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">
                통화 내용은 절대 외부로 전송되지 않습니다.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300 leading-relaxed">
                VDefender는 민감할 수 있는 통화 음성과 변환된 텍스트를 오직 사용자의 스마트폰 내부에서만 처리합니다. 
                중앙 서버는 안전한 업데이트 데이터베이스(CRUD) 역할만 수행합니다.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-md">
              <div className="text-center">
                <p className="text-xs text-slate-400">동기화된 탐지 키워드</p>
                <p className="text-2xl font-bold text-red-400">{totalKeywords.toLocaleString()}개</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <button 
                onClick={() => setSyncStatus('동기화 완료')}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 아키텍처 흐름 시각화 카드 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                <Server className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-white">1. VDefender DB (Server)</p>
                <p>최신 피싱 수법 및 키워드 CRUD 관리</p>
              </div>
            </div>
            <div className="flex items-center justify-center hidden md:flex">
              <ArrowRight className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-white">2. 내 스마트폰 (On-Device)</p>
                <p>실시간 오프라인 STT & 키워드 매칭 차단</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 핵심 기능: 피싱 키워드 모의 검색기 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Search className="h-5 w-5 text-slate-500" />
              의심 문구 사전 검색
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              통화 중 들었던 단어나 문장이 VDefender 데이터베이스에 등록된 피싱 위협 문구인지 확인해보세요.
            </p>

            <form onSubmit={handleSearch} className="mt-6 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="예: 서울중앙지검 검사입니다, 대포통장 관련하여..."
                className="flex-grow rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
              <button type="submit" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
                검색
              </button>
            </form>

            {/* 검색 결과 표시 */}
            {searchResult && (
              <div className={`mt-6 rounded-xl p-4 border transition-all ${
                searchResult.found ? 'bg-red-50/50 border-red-200 text-red-900' : 'bg-green-50/50 border-green-200 text-green-900'
              }`}>
                {searchResult.found ? (
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-bold">⚠️ 위험 문구 감지 ({searchResult.level})</p>
                      <p className="mt-1 text-sm text-red-700">
                        입력하신 문장에 포함된 <strong>&quot;{searchResult.word}&quot;</strong> 문구는 실제 보이스피싱 사기 수법에서 빈번하게 탐지되는 핵심 키워드입니다. 기기에서 실시간 차단 알림이 동작합니다.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-bold">✅ 안전한 문구 또는 데이터 미등록</p>
                      <p className="mt-1 text-sm text-green-700">
                        현재 데이터베이스에 명시적으로 등록되지 않은 키워드입니다. 다만 신종 수법일 수 있으므로 낯선 금융 거래 유도 시 주의하세요.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. 모바일 연동 및 동기화 상태 현황판 */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">앱 동기화 현황</h3>
              <p className="mt-1 text-sm text-slate-500">스마트폰 네이티브 엔진과 연결 상태</p>
              
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center text-sm border-b pb-2">
                  <span className="text-slate-500">디바이스 연결</span>
                  <span className="font-semibold text-green-600 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    정상 연결됨
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b pb-2">
                  <span className="text-slate-500">동기화 상태</span>
                  <span className="font-medium text-slate-700 text-xs">{syncStatus}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">로컬 STT 엔진</span>
                  <span className="font-semibold text-slate-700">온디바이스 최적화 완료</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 leading-relaxed">
                ℹ️ <strong>VDefender 알림 조건:</strong> 스마트폰 내부 라이브러리가 실시간 음성 인식을 수행 중, 동기화된 키워드가 매칭되면 즉시 로컬 알림을 푸시합니다.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}