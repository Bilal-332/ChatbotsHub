import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders an assistant message as Markdown (ChatGPT-style formatting).
 * Styled for white text on the chatbot's colored bubble background, so links
 * and code use translucent white surfaces for contrast.
 */
export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="space-y-2 break-words text-sm leading-relaxed [&_p]:m-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="m-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-1 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="m-0">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => <h1 className="mb-1 mt-2 text-base font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-1 mt-2 text-base font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-1 mt-2 text-sm font-bold">{children}</h3>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-current/40 pl-3 opacity-90">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const isBlock = (className ?? '').includes('language-');
            if (isBlock) {
              return (
                <code className="block overflow-x-auto whitespace-pre rounded-lg bg-black/20 p-3 font-mono text-xs">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-black/20 px-1.5 py-0.5 font-mono text-[0.85em]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="my-1">{children}</pre>,
          table: ({ children }) => (
            <div className="my-1 overflow-x-auto">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-white/30 px-2 py-1 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-white/20 px-2 py-1">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
