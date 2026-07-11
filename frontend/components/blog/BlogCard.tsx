import { Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { BlogImage } from '@/components/blog/BlogImage';
import { getPostCoverPath, type BlogCardPost } from '@/lib/blog/posts';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function BlogCard({ post, priority = false }: { post: BlogCardPost; priority?: boolean }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
      aria-label={`Read: ${post.title} (opens in new tab)`}
    >
      <GlassCard className="flex h-full flex-col overflow-hidden !p-0">
        <div className="relative aspect-[1200/630] w-full overflow-hidden bg-surface">
          <BlogImage
            src={post.coverImage}
            fallbackSrc={getPostCoverPath(post.slug)}
            alt={post.coverAlt}
            priority={priority}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <span className="badge badge-blue w-fit">{post.category}</span>

          <h2 className="text-xl font-bold leading-snug text-text-primary transition-colors group-hover:text-primary">
            {post.title}
          </h2>

          <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
            {post.excerpt}
          </p>

          <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readingMinutes} min read
            </span>
            <ArrowUpRight className="ml-auto h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </GlassCard>
    </a>
  );
}
