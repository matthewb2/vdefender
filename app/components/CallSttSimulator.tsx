'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Phone, PhoneOff, AlertTriangle } from 'lucide-react';

interface CallSttSimulatorProps {
  onKeywordDetected: (transcript: string) => void;
}

export default function CallSttSimulator({ onKeywordDetected }: CallSttSimulatorProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // SpeechRecognition 객체를 유지하기 위한 ref
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 브라우저 지원 여부 확인 (Chrome, Edge, Safari 등 지원)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('이 브라우저는 온디바이스 Speech-to-Text 기능을 지원하지 않습니다. (Chrome 권장)');
      return;
    }

    const recognition = new SpeechRecognition();
    // true 설정 시 음성 인식이 끊기지 않고 계속 수신됨 (통화 모니터링 필수 옵션)
    recognition.continuous = true;
    // 실시간으로 변환 중인 중간 결과도 수신 (중간 매칭 속도 향상)
    recognition.interimResults = true;
    // 한국어 설정
    recognition.lang = 'ko-KR';

    recognition.onresult = (event: any) => {
      let finalResult = '';
      let interimResult = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalResult += event.results[i][0].transcript;
        } else {
          interimResult += event.results[i][0].transcript;
        }
      }

      // 확정된 텍스트가 나오면 누적 기록
      if (finalResult) {
        setTranscript((prev) => prev + ' ' + finalResult);
        // 부모 컴포넌트에 확정 텍스트를 전달하여 피싱 키워드가 있는지 검사
        onKeywordDetected(finalResult);
      }
      
      // 현재 말하고 있는 도중의 임시 텍스트 상태 업데이트
      setInterimTranscript(interimResult);
    };

    recognition.onerror = (event: any) => {
      console.error('STT 에러 발생:', event.error);
      if (event.error === 'not-allowed') {
        setError('마이크 권한이 거부되었습니다. 통화 음성 수신을 위해 마이크를 허용해주세요.');
      }
    };

    recognition.onend = () => {
      // 통화 중인데 엔진이 불의의 이유로 꺼졌다면 재시작
      if (isCalling) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isCalling]);

  // 가상 통화 시작 (가상으로 수신 음성 가로채기 시작)
  const startCallSimulation = () => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setIsCalling(true);
    
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error(e);
    }
  };

  // 가상 통화 종료
  const stopCallSimulation = () => {
    setIsCalling(false);
    recognitionRef.current?.stop();
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">실시간 통화 음성 인식 시뮬레이터</h3>
          <p className="text-xs text-slate-500 mt-0.5">마이크를 통해 실시간 대화를 나누면 기기 내부에서 즉시 텍스트로 래핑됩니다.</p>
        </div>
        
        {isCalling ? (
          <button
            onClick={stopCallSimulation}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            <PhoneOff className="h-4 w-4" /> 통화 종료
          </button>
        ) : (
          <button
            onClick={startCallSimulation}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            <Phone className="h-4 w-4" /> 가상 통화 시작
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 통화 내용 렌더링 화면 */}
      <div className="mt-4 min-h-[150px] max-h-[250px] overflow-y-auto rounded-xl bg-slate-950 p-4 font-mono text-sm leading-relaxed shadow-inner">
        {isCalling && !transcript && !interimTranscript && (
          <p className="text-slate-500 animate-pulse flex items-center gap-2">
            <Mic className="h-4 w-4 text-green-500" /> 통화 음성 대기 중... 말씀해 주세요.
          </p>
        )}
        {!isCalling && (
          <p className="text-slate-600 flex items-center gap-2">
            <MicOff className="h-4 w-4" /> 통화가 연결되면 이곳에 변환된 텍스트가 실시간 표시됩니다.
          </p>
        )}
        
        {/* 누적된 확정 문구 */}
        <span className="text-slate-100">{transcript}</span>
        {/* 현재 인식 중인 미확정 문구 (흐리게 표시) */}
        <span className="text-slate-400 font-medium"> {interimTranscript}</span>
      </div>
    </div>
  );
}