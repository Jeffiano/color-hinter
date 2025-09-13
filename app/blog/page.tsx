import Link from 'next/link';
import { Metadata } from 'next';
import { getSortedPostsData } from '@/lib/posts';
import { siteConfig } from '@/lib/seo';

// SEO 元数据
export const metadata: Metadata = {
  title: 'Color Theory Blog - Expert Guides & Tutorials',
  description: 'Comprehensive color theory guides, RGB tutorials, and digital photography tips. Learn color grading, white balance, and advanced photo editing techniques from experts.',
  keywords: [
    'color theory blog',
    'RGB tutorials',
    'digital photography guides',
    'color grading tutorials',
    'white balance guides',
    'photo editing tips',
    'color correction blog',
    'photography education'
  ],
  openGraph: {
    title: 'Color Theory Blog - Expert Guides & Tutorials',
    description: 'Master color theory with our comprehensive guides and tutorials on RGB, color grading, and digital photography.',
    url: `${siteConfig.url}/blog`,
    type: 'website',
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'Color Theory Blog'
      }
    ]
  }
};

// 简单的日期格式化函数
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default async function BlogPage() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Color Theory Blog
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Insights, tutorials, and deep dives into the fascinating world of color theory, design, and digital art.
          </p>
        </div>

        {/* Back to main */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Color Mixer
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-8">
          {posts.map((post) => (
            <article 
              key={post.slug}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <time dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                  <span>•</span>
                  <span>By {post.author}</span>
                </div>
                
                <h2 className="text-2xl font-bold mb-3 text-white hover:text-blue-300 transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No posts yet. Stay tuned for exciting content!</p>
          </div>
        )}
      </div>
    </div>
  );
}
