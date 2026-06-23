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
  
  const recognitionRef = useRef<any>(null);
  // 마이크 하드웨어 자원을 완전히 닫아주기 위한 스트림 레퍼런스
  const streamRef = useRef<MediaStream | null>(null);

  // 마이크 하드웨어 트랙 자원을 안전하게 해제하는 헬퍼 함수
  const releaseMicrophone = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('이 브라우저는 온디바이스 Speech-to-Text 기능을 지원하지 않습니다. (Chrome 권장)');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
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

      if (finalResult) {
        setTranscript((prev) => prev + ' ' + finalResult);
        onKeywordDetected(finalResult);
      }
      setInterimTranscript(interimResult);
    };

    // 💡 권한 거부 및 시스템 오버레이 예외 처리 세분화
    recognition.onerror = (event: any) => {
      console.error('STT 에러 발생:', event.error);
      setIsCalling(false);
      releaseMicrophone();

      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          setError('❌ 마이크 권한이 거부되었습니다. 주소창 왼쪽 설정(자물쇠)에서 마이크를 [허용]으로 변경 후 새로고침 해주세요.');
          break;
        case 'audio-capture':
          setError('⚠️ 시스템 오류: 다른 앱(통화, 녹음기)이나 블루라이트 필터/화면 오버레이 앱이 마이크를 독점하고 있습니다. 해당 앱들을 닫고 다시 시도해 주세요.');
          break;
        case 'no-speech':
          // 대화가 잠시 멈췄을 때 발생하는 일시적 경고이므로 상태를 완전히 끄지 않습니다.
          console.log('음성이 감지되지 않음');
          break;
        default:
          setError(`❌ 음성 인식 자원 오류 (${event.error}). 다시 시도해 주세요.`);
      }
    };

    recognition.onend = () => {
      // 비정상적인 스트림 단절 시 재기동 처리부 (사용자가 직접 종료하지 않은 경우)
      if (isCalling) {
        try {
          recognition.start();
        } catch (e) {
          console.error('STT 재시작 실패:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      releaseMicrophone();
    };
  }, [isCalling]);

  // 가상 통화 시작 (권한 체크 및 선점)
  const startCallSimulation = async () => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('NOT_SUPPORTED');
      }

      // 💡 브라우저 하드웨어 수준에서 먼저 오디오 세션을 요청하여 권한 및 충돌 상태를 검증
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true, // 하울링/에코 제어
          noiseSuppression: true  // 노이즈 필터링
        }
      });
      
      streamRef.current = stream;
      setIsCalling(true);
      
      // 검증이 완료된 직후 STT 엔진 연동 구동
      recognitionRef.current?.start();
    } catch (e: any) {
      console.error('하드웨어 미디어 접근 실패:', e);
      setIsCalling(false);
      releaseMicrophone();

      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setError('❌ 마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크를 허용해 주세요.');
      } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
        setError('⚠️ 시스템 오류: 다른 앱이나 투명 오버레이를 닫은 후 다시 시도해 보십시오.');
      } else if (e.message === 'NOT_SUPPORTED') {
        setError('❌ 보안 컨텍스트 오류: 보안 연결(HTTPS) 또는 localhost 환경이 아닙니다.');
      } else {
        setError('❌ 마이크 하드웨어를 시작할 수 없습니다.');
      }
    }
  };

  // 가상 통화 종료
  const stopCallSimulation = () => {
    setIsCalling(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    // 💡 사용한 마이크 오디오 채널 자원을 즉각 운영체제에 완벽히 반환
    releaseMicrophone();
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
        
        <span className="text-slate-100">{transcript}</span>
        <span className="text-slate-400 font-medium"> {interimTranscript}</span>
      </div>
    </div>
  );
}