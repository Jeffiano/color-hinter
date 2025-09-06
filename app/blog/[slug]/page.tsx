import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostData, getAllPostSlugs } from '@/lib/posts';

// 简单的日期格式化函数
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

interface Props {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = getAllPostSlugs();
  return posts.map((post) => ({
    slug: post.params.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  try {
    const { slug } = await params;
    const post = await getPostData(slug);

    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Navigation */}
          <div className="mb-8">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-400 mb-6">
              <time dateTime={post.date} className="text-lg">
                {formatDate(post.date)}
              </time>
              <span className="hidden sm:block">•</span>
              <span className="text-lg">By {post.author}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              {post.excerpt}
            </p>
          </header>

          {/* Article Content */}
          <article className="max-w-none">
            <div 
              className="blog-content prose prose-lg prose-invert max-w-none
                        [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mb-6 [&>h1]:mt-8
                        [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mb-4 [&>h2]:mt-6
                        [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mb-3 [&>h3]:mt-4
                        [&>p]:text-gray-300 [&>p]:leading-relaxed [&>p]:mb-4
                        [&>ul]:text-gray-300 [&>ul]:mb-4 [&>ul]:pl-6
                        [&>li]:mb-2 [&>li]:list-disc
                        [&>pre]:bg-gray-900 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:mb-4 [&>pre]:overflow-x-auto
                        [&>code]:bg-gray-800 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm
                        [&>strong]:font-bold [&>strong]:text-white
                        [&>em]:italic [&>em]:text-gray-200
                        [&>a]:text-blue-400 [&>a]:hover:text-blue-300"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-white/10">
            <div className="flex justify-between items-center">
              <Link 
                href="/blog"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                ← Back to all posts
              </Link>
              
              <Link 
                href="/"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Try the Color Mixer →
              </Link>
            </div>
          </footer>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
