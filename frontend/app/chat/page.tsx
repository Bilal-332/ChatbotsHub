'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { useSearchParams } from 'next/navigation';
import { resolveAvatarUrl, isRtlText } from '@/lib/utils';
import type { SupportedLanguage } from '@/types/index';
import { LeadForm, type LeadFormValues } from '@/components/chat/LeadForm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  hasContext?: boolean;
}

interface ChatSettings {
  chatbotName: string;
  welcomeMessage: string;
  primaryColor: string;
  avatarUrl?: string | null;
  language?: SupportedLanguage;
}

function formatAssistantMessage(content: string): string[] {
  return content
    .split(/(?<=[.!?])\s+(?=[A-Z0-9\u0600-\u06FF])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getMessageFontClass(content: string, language?: SupportedLanguage): string {
  if (language === 'ur' || (language === 'auto' && isRtlText(content))) {
    if (/[\u0679\u0688\u0691\u0698\u06AF\u06BA\u06BE\u06C1\u06D2]/.test(content)) {
      return 'font-urdu';
    }
    return 'font-arabic';
  }
  if (language === 'ar') return 'font-arabic';
  if (isRtlText(content)) return 'font-arabic';
  return '';
}

function AvatarImage({
  src,
  alt,
  fallbackColor,
}: {
  src?: string | null;
  alt: string;
  fallbackColor: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={src}
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: fallbackColor }}
    >
      <Bot className="h-4 w-4 text-white" />
    </div>
  );
}

export default function ChatWidgetPage() {
  const searchParams = useSearchParams();
  const apiKey = searchParams.get('apiKey') ?? '';
  const colorParam = searchParams.get('color') ?? '#6366f1';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    chatbotName: 'AI Assistant',
    welcomeMessage: 'Hello! I’m here to help. Ask me anything about your documents.',
    primaryColor: colorParam,
    language: 'auto',
  });

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationIdRef = useRef<string>('');
  const visitorIdRef = useRef<string>('');
  const detectedIntentRef = useRef<string>('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
  const avatarUrl = resolveAvatarUrl(settings.avatarUrl);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storageKey = `chatbotshub:conversation:${apiKey || 'anonymous'}`;
    let existing = null;
    try {
      existing = window.localStorage.getItem(storageKey);
    } catch {
      console.warn('localStorage access denied, using temporary session.');
    }

    if (existing) {
      conversationIdRef.current = existing;
      return;
    }

    const generatedId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    conversationIdRef.current = generatedId;
    try {
      window.localStorage.setItem(storageKey, generatedId);
    } catch {
      // Ignore in cross-origin iframes
    }
  }, [apiKey]);

  // Persistent visitor id (for unique-visitor analytics) + once-per-visitor
  // lead-capture flag, both scoped to this API key.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const newId = () =>
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const visitorKey = `chatbotshub:visitor:${apiKey || 'anonymous'}`;
    try {
      let visitorId = window.localStorage.getItem(visitorKey);
      if (!visitorId) {
        visitorId = newId();
        window.localStorage.setItem(visitorKey, visitorId);
      }
      visitorIdRef.current = visitorId;
    } catch {
      visitorIdRef.current = newId();
    }

    try {
      const captured = window.localStorage.getItem(`chatbotshub:lead-captured:${apiKey || 'anonymous'}`);
      if (captured === '1') {
        setLeadCaptured(true);
      }
    } catch {
      // Ignore in restricted iframes.
    }
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey) return;
    axios
      .get<{ success: boolean; data: ChatSettings }>(
        `${API_BASE}/organizations/public?apiKey=${encodeURIComponent(apiKey)}`,
      )
      .then((r) => {
        const data = r.data?.data;
        if (!data) return;
        setSettings((prev) => ({
          ...prev,
          ...data,
          avatarUrl: data.avatarUrl?.trim() || null,
        }));

        // Notify the embedding widget so the floating toggle button can adopt
        // the branding color configured in dashboard settings.
        if (
          data.primaryColor &&
          typeof window !== 'undefined' &&
          window.parent &&
          window.parent !== window
        ) {
          window.parent.postMessage(
            { type: 'chatbotshub:settings', primaryColor: data.primaryColor },
            '*',
          );
        }
      })
      .catch(() => {});
  }, [apiKey, API_BASE]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return [{ id: 'welcome', role: 'assistant', content: settings.welcomeMessage }];
      }
      if (prev[0].id === 'welcome' && prev[0].content !== settings.welcomeMessage) {
        const newMessages = [...prev];
        newMessages[0] = { ...newMessages[0], content: settings.welcomeMessage };
        return newMessages;
      }
      return prev;
    });
  }, [settings.welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Re-focus the input once the answer arrives and the field is enabled again.
  // Doing this here (rather than right after setIsLoading) guarantees the input
  // has re-rendered as enabled before we focus it.
  useEffect(() => {
    if (!isLoading && apiKey) {
      inputRef.current?.focus();
    }
  }, [isLoading, apiKey]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post<{
        data: { answer: string; hasContext: boolean };
      }>(
        `${API_BASE}/chat/query`,
        { question, conversationId: conversationIdRef.current || undefined },
        { headers: { 'x-api-key': apiKey, 'x-visitor-id': visitorIdRef.current } },
      );

      const { answer, hasContext } = response.data.data;
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: answer, hasContext },
      ]);

      void maybeTriggerLeadForm(question);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMsg =
        axiosError.response?.data?.message ?? 'Sorry, I encountered an error. Please try again.';
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: errorMsg },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Ask the backend to classify buyer intent; show the lead form when the
  // visitor signals pricing/contact interest and hasn't already been captured.
  const maybeTriggerLeadForm = async (question: string) => {
    if (leadCaptured || showLeadForm || !apiKey) return;
    try {
      const res = await axios.post<{
        data: { intent: string; shouldCaptureLead: boolean };
      }>(
        `${API_BASE}/leads/intent`,
        { message: question },
        { headers: { 'x-api-key': apiKey } },
      );
      if (res.data.data?.shouldCaptureLead) {
        detectedIntentRef.current = res.data.data.intent ?? '';
        setShowLeadForm(true);
      }
    } catch {
      // Intent detection is best-effort; never disrupt the conversation.
    }
  };

  const handleLeadSubmit = async (values: LeadFormValues) => {
    if (!apiKey) return;
    setLeadSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/leads`,
        {
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          company: values.company || undefined,
          message: values.message || undefined,
          conversationId: conversationIdRef.current || undefined,
          intent: detectedIntentRef.current || undefined,
        },
        { headers: { 'x-api-key': apiKey } },
      );

      setShowLeadForm(false);
      setLeadCaptured(true);
      try {
        window.localStorage.setItem(`chatbotshub:lead-captured:${apiKey || 'anonymous'}`, '1');
      } catch {
        // Ignore in restricted iframes.
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: 'Thank you! Your details have been received. Our team will reach out to you soon. How else can I help?',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: 'Sorry, something went wrong submitting your details. Please try again.',
        },
      ]);
    } finally {
      setLeadSubmitting(false);
    }
  };

  const primaryColor = settings.primaryColor;
  const inputRtl = settings.language === 'ar' || settings.language === 'ur';

  return (
    <div className="flex h-screen flex-col bg-white font-sans">
      <div
        className="flex items-center gap-3 px-4 py-3 shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20">
          <AvatarImage src={avatarUrl} alt={settings.chatbotName} fallbackColor={primaryColor} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{settings.chatbotName}</p>
          <p className="text-xs text-white/70">AI-powered assistant</p>
        </div>
        <div className="ml-auto h-2 w-2 rounded-full bg-green-400" title="Online" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => {
          const fontClass = getMessageFontClass(msg.content, settings.language);
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ${
                  msg.role === 'user' ? 'bg-gray-200' : ''
                }`}
                style={msg.role === 'assistant' ? { backgroundColor: primaryColor } : {}}
              >
                {msg.role === 'user' ? (
                  <User className="h-4 w-4 text-gray-600" />
                ) : avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="" fallbackColor={primaryColor} />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${fontClass} ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-gray-100 text-gray-800'
                    : 'rounded-tl-sm text-white'
                }`}
                style={msg.role === 'assistant' ? { backgroundColor: primaryColor } : {}}
                dir={fontClass ? 'rtl' : 'ltr'}
              >
                {msg.role === 'assistant' ? (
                  <div className="space-y-2">
                    {formatAssistantMessage(msg.content).map((sentence, index) => (
                      <p key={`${msg.id}-${index}`} className="m-0">
                        {sentence}
                      </p>
                    ))}
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="" fallbackColor={primaryColor} />
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>
            <div
              className="flex items-center gap-1 rounded-2xl rounded-tl-sm px-4 py-3"
              style={{ backgroundColor: primaryColor }}
            >
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span className="text-sm text-white">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showLeadForm && (
        <LeadForm
          primaryColor={primaryColor}
          isSubmitting={leadSubmitting}
          onSubmit={handleLeadSubmit}
          onDismiss={() => setShowLeadForm(false)}
        />
      )}

      <div className="border-t border-gray-100 px-4 py-3">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            dir={inputRtl || isRtlText(input) ? 'rtl' : 'ltr'}
            className={`min-w-0 flex-1 rounded-full text-black border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-transparent focus:ring-2 ${
              inputRtl || isRtlText(input) ? 'font-arabic' : ''
            }`}
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            disabled={isLoading || !apiKey}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !apiKey}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-1.5 text-center text-[10px] text-gray-400">
          Powered by{' '}
          <a
            href="https://chatbotshub.me"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            ChatbotsHub
          </a>
        </p>
      </div>
    </div>
  );
}
