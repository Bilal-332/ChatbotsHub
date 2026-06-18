import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ContentBlock } from '@/lib/blog/posts';

/**
 * Renders inline tokens inside paragraphs / list items:
 *  - [label](/path) → anchor (internal uses next/link, external opens new tab)
 *  - **bold** → <strong>
 */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>);
    }

    if (match[1] && match[2]) {
      const label = match[1];
      const href = match[2];
      const isExternal = /^https?:\/\//.test(href);
      nodes.push(
        isExternal ? (
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {label}
          </a>
        ) : (
          <Link
            key={key++}
            href={href}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {label}
          </Link>
        ),
      );
    } else if (match[3]) {
      nodes.push(
        <strong key={key++} className="font-semibold text-text-primary">
          {match[3]}
        </strong>,
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }

  return nodes;
}

export function BlogContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2
                key={i}
                className="mt-6 text-2xl font-bold tracking-tight text-text-primary md:text-3xl"
              >
                {block.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={i} className="mt-2 text-xl font-bold text-text-primary">
                {block.text}
              </h3>
            );
          case 'p':
            return (
              <p key={i} className="text-lg leading-relaxed text-text-secondary">
                {renderInline(block.text)}
              </p>
            );
          case 'ul':
            return (
              <ul key={i} className="flex flex-col gap-3 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-lg leading-relaxed text-text-secondary">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i} className="flex flex-col gap-3">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-lg leading-relaxed text-text-secondary">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                      {j + 1}
                    </span>
                    <span className="pt-0.5">{renderInline(item)}</span>
                  </li>
                ))}
              </ol>
            );
          case 'quote':
            return (
              <blockquote
                key={i}
                className="border-l-4 border-primary/50 bg-surface/40 px-6 py-4 text-lg font-medium italic text-text-primary"
              >
                {renderInline(block.text)}
              </blockquote>
            );
          case 'cta':
            return (
              <div
                key={i}
                className="my-4 flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                {block.text ? (
                  <p className="text-lg font-semibold text-text-primary">{block.text}</p>
                ) : null}
                <Link href={block.href} className="btn-primary shrink-0">
                  {block.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
