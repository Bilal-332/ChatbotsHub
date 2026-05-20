'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { useSearchParams } from 'next/navigation';

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
}

function formatAssistantMessage(content: string): string[] {
  return content
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
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
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationIdRef = useRef<string>('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storageKey = `chatbotshub:conversation:${apiKey || 'anonymous'}`;
    let existing = null;
    try {
      existing = window.localStorage.getItem(storageKey);
    } catch (e) {
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
    } catch (e) {
      // Ignore exception in cross-origin iframes
    }
  }, [apiKey]);

  useEffect(() => {
    // Load workspace settings via the public settings endpoint
    if (!apiKey) return;
    axios
      .get<{ data: ChatSettings }>(`${API_BASE}/organizations/public?apiKey=${apiKey}`)
      .then((r) => {
        if (r.data?.data) setSettings(r.data.data);
      })
      .catch(() => {}); // Silently fail – use defaults
  }, [apiKey, API_BASE]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: 'welcome',
            role: 'assistant',
            content: settings.welcomeMessage,
          },
        ];
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

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post<{
        data: { answer: string; hasContext: boolean };
      }>(
        `${API_BASE}/chat/query`,
        {
          question,
          conversationId: conversationIdRef.current || undefined,
        },
        { headers: { 'x-api-key': apiKey } },
      );

      const { answer, hasContext } = response.data.data;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: answer,
          hasContext,
        },
      ]);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMsg =
        axiosError.response?.data?.message ??
        'Sorry, I encountered an error. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: errorMsg,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const primaryColor = settings.primaryColor;

  return (
    <div className="flex h-screen flex-col bg-white font-sans">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{settings.chatbotName}</p>
          <p className="text-xs text-white/70">AI-powered assistant</p>
        </div>
        <div className="ml-auto h-2 w-2 rounded-full bg-green-400" title="Online" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                msg.role === 'user' ? 'bg-gray-200' : ''
              }`}
              style={msg.role === 'assistant' ? { backgroundColor: primaryColor } : {}}
            >
              {msg.role === 'user' ? (
                <User className="h-4 w-4 text-gray-600" />
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-tr-sm bg-gray-100 text-gray-800'
                  : 'rounded-tl-sm text-white'
              }`}
              style={msg.role === 'assistant' ? { backgroundColor: primaryColor } : {}}
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
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              <Bot className="h-4 w-4 text-white" />
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

      {/* Input */}
      <div className="border-t border-gray-100 px-4 py-3">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-transparent focus:ring-2"
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
            href="https://chatbotshub.io"
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
