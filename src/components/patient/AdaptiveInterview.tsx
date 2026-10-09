import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, RotateCcw, Sparkles, User, AlertCircle, Bot } from 'lucide-react';
import { InterviewSession, InterviewMessage, Patient } from '../../types';

interface AdaptiveInterviewProps {
  session: InterviewSession;
  patient: Patient;
  onSendMessage: (text: string, isVoice?: boolean) => Promise<void>;
  loading: boolean;
}

export const AdaptiveInterview: React.FC<AdaptiveInterviewProps> = ({
  session,
  patient,
  onSendMessage,
  loading,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [audioTranscript, setAudioTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalTranscript = event.results[i][0].transcript;
            setInputText((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
            setAudioTranscript(finalTranscript);
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) {
          setAudioTranscript(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone in browser or use text input.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech was detected. Please try speaking again.');
        } else {
          setSpeechError(`Voice input: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Scroll to bottom on message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, loading]);

  const handleToggleVoice = () => {
    if (!speechSupported) {
      setSpeechError('Speech recognition is not supported in this browser. Please use text input.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setAudioTranscript('');
      setSpeechError(null);
      try {
        recognitionRef.current?.start();
      } catch (err: any) {
        console.warn('Recognition start exception:', err);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;

    const textToSend = inputText.trim();
    setInputText('');
    setAudioTranscript('');
    await onSendMessage(textToSend, isRecording || !!audioTranscript);
  };

  const handleSelectQuickReply = async (reply: string) => {
    if (loading) return;
    await onSendMessage(reply, false);
  };

  // Extract last AI message's suggested replies
  const lastAiMessage = [...session.messages].reverse().find((m) => m.sender === 'ai');
  const quickReplies = lastAiMessage?.suggestedReplies || [];

  return (
    <div className="flex flex-col h-[640px] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Interview Header & Progress */}
      <div className="bg-slate-50/80 px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              AI Adaptive Pre-Consultation Interview
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Patient: {patient.fullName} (ID: {patient.patientId})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dynamic questions adapt to clinical duration, severity, and previous history. AI does not diagnose.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-2 sm:self-center">
          <div className="w-28 sm:w-36 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-600 h-full transition-all duration-300"
              style={{ width: `${session.progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-medium text-slate-600 tabular-nums">
            {session.progressPercent}%
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
        {session.messages.map((message) => {
          const isAi = message.sender === 'ai';
          return (
            <div
              key={message.id}
              className={`flex gap-3 max-w-2xl ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isAi
                    ? 'bg-cyan-800 text-white'
                    : 'bg-teal-700 text-white'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div
                  className={`rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isAi
                      ? 'bg-white border border-slate-200/90 text-slate-800'
                      : 'bg-cyan-700 text-white font-normal'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>

                  {message.evidenceTag && (
                    <div className="mt-2 pt-2 border-t border-cyan-600/40 text-[11px] text-cyan-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Flagged for doctor verification: Key allergy statement</span>
                    </div>
                  )}
                </div>

                {/* Metadata timestamp */}
                <div
                  className={`flex items-center gap-1.5 text-[10px] text-slate-400 px-1 ${
                    isAi ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <span>{isAi ? 'MediKiosk Clinical Assistant' : patient.fullName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{message.timestamp}</span>
                  {message.isVoice && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-cyan-700">Voice Transcribed</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-xl items-center">
            <div className="w-7 h-7 rounded-full bg-cyan-800 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-600 animate-ping" />
              <span>Analyzing clinical context and formulating follow-up...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Replies */}
      {quickReplies.length > 0 && !loading && session.status !== 'completed' && (
        <div className="px-4 py-2 bg-slate-50/90 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
            Suggested quick replies:
          </span>
          <div className="flex items-center gap-1.5">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectQuickReply(reply)}
                className="text-xs px-2.5 py-1 bg-white hover:bg-cyan-50 text-cyan-900 border border-slate-200 hover:border-cyan-300 rounded-md transition-colors whitespace-nowrap shadow-2xs"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Recording / Transcription Indicator */}
      {isRecording && (
        <div className="bg-rose-50 border-t border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
            <span className="font-medium">Listening... speak clearly into your microphone</span>
            {audioTranscript && (
              <span className="text-slate-600 italic">"{audioTranscript}"</span>
            )}
          </div>
          <button
            onClick={handleToggleVoice}
            className="text-xs font-semibold px-2 py-0.5 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
          >
            Stop Recording
          </button>
        </div>
      )}

      {speechError && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-1.5 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-[11px] text-amber-900 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        {/* Voice Button */}
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`p-2.5 rounded-lg border transition-colors shrink-0 ${
            isRecording
              ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
          title={speechSupported ? 'Record speech (STT)' : 'Voice input not supported in this browser'}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isRecording
              ? 'Transcribing speech...'
              : session.status === 'completed'
              ? 'Interview complete. You may add further symptoms or notes...'
              : 'Describe your symptoms, fever level, cough, or answer AI questions...'
          }
          className="flex-1 px-3.5 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 bg-white"
        />

        {/* Clear Button */}
        {inputText && (
          <button
            type="button"
            onClick={() => setInputText('')}
            className="text-slate-400 hover:text-slate-600 p-1"
            title="Clear text"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
