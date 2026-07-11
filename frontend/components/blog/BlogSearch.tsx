'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { BlogCard } from '@/components/blog/BlogCard';
import type { BlogSearchPost } from '@/lib/blog/posts';

export function BlogSearch({ posts }: { posts: BlogSearchPost[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) => {
      const haystack = [
        post.title,
        post.excerpt,
        post.description,
        post.category,
        ...post.keywords,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query]);

  return (
    <section aria-label="Blog posts">
      <div className="mb-10">
        <label htmlFor="blog-search" className="sr-only">
          Search blog posts
        </label>
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles by topic, keyword, or category…"
            className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-11 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-secondary transition-colors hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-3 text-sm text-text-secondary" aria-live="polite">
          {query
            ? `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'} for “${query}”`
            : `${posts.length} articles`}
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <BlogCard key={post.slug} post={post} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-text-primary">No articles match “{query}”.</p>
          <p className="mt-2 text-sm text-text-secondary">
            Try a different keyword, or{' '}
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-primary underline-offset-4 hover:underline"
            >
              clear the search
            </button>
            .
          </p>
        </div>
      )}
    </section>
  );
}
