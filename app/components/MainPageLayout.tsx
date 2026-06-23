'use client';

import React from 'react';
import { Shield, Server, Smartphone, ArrowRight } from 'lucide-react';

interface MainPageLayoutProps {
  children: React.ReactNode;
  totalKeywords: number;
}

export default function MainPageLayout({ children, totalKeywords }: MainPageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* 1. 상단 글로벌 네비게이션 바 (GNB) */}
      <header className="border-b bg-white px-6 py-4 shadow-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-red-600" />
            <span className="text-xl font-black tracking-tight text-slate-900">VDefender</span>
          </div>
          <nav className="flex gap-6 text-sm font-semibold text-slate-600">
            <span className="text-green-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              On-Device 엔진 활성화
            </span>
          </nav>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        
        {/* On-Device 프라이버시 보호 안내 배너 */}
        <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-block rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 backdrop-blur-sm">
                Strictly Private
              </span>
              <h2 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">
                통화 내용은 절대 외부로 전송되지 않습니다.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300 leading-relaxed">
                VDefender는 민감한 통화 오디오 데이터를 웹 브라우저 샌드박스 및 기기 내부 엔진(On-Device)으로만 처리합니다. Central Server는 오직 보안 업데이트 데이터베이스(CRUD) 기능만 제공합니다.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-md text-center min-w-[140px]">
              <p className="text-xs text-slate-400">동기화된 키워드</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{totalKeywords.toLocaleString()} 개</p>
            </div>
          </div>

          {/* 시스템 데이터 흐름 시각화 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                <Server className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-white">1. VDefender 서버 (CRUD)</p>
                <p>최신 위협 단어 DB 업데이트 및 배포</p>
              </div>
            </div>
            <div className="items-center justify-center hidden md:flex">
              <ArrowRight className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-white">2. 로컬 브라우저 / 앱</p>
                <p>외부 유출 없는 독립형 실시간 STT 연산</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 자식 컴포넌트(STT 시뮬레이터, 검색창 등)가 렌더링되는 공간 */}
        <div className="space-y-6">
          {children}
        </div>
        
      </main>
    </div>
  );
}