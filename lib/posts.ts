import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'posts');

// 简单的前置 matter 解析器
function parseFrontMatter(content: string) {
  const lines = content.split('\n').map(line => line.replace(/\r/g, ''));
  
  if (lines[0] !== '---') {
    return { data: {}, content };
  }

  let frontMatterEndIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      frontMatterEndIndex = i;
      break;
    }
  }

  if (frontMatterEndIndex === -1) {
    return { data: {}, content };
  }

  const frontMatterLines = lines.slice(1, frontMatterEndIndex);
  const contentLines = lines.slice(frontMatterEndIndex + 1);
  
  const data: { [key: string]: string | string[] } = {};
  frontMatterLines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // 处理数组 (tags)
      if (value.startsWith('[') && value.endsWith(']')) {
        data[key] = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
      } else {
        data[key] = value;
      }
    }
  });

  return { data, content: contentLines.join('\n') };
}

// 简单的 markdown 转 HTML
function markdownToHtml(markdown: string): string {
  // 清理内容，移除开头和结尾的空白
  const cleanContent = markdown.trim();
  
  // 按行处理，然后重新组织成段落
  const lines = cleanContent.split('\n');
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过空行
    if (!line) {
      processedLines.push('');
      continue;
    }
    
    // 处理标题
    if (line.startsWith('### ')) {
      processedLines.push(`<h3 class="text-xl font-semibold mb-4 mt-6">${line.substring(4)}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      processedLines.push(`<h2 class="text-2xl font-bold mb-6 mt-8">${line.substring(3)}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      processedLines.push(`<h1 class="text-3xl font-bold mb-8">${line.substring(2)}</h1>`);
      continue;
    }
    
    // 处理图片（独立行）
    if (line.startsWith('![') && line.includes('](')) {
      const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch) {
        const [, alt, src] = imgMatch;
        processedLines.push(`<img src="${src}" alt="${alt}" class="w-full max-w-2xl mx-auto rounded-lg shadow-lg my-6" />`);
        continue;
      }
    }
    
    // 其他行保持原样，稍后处理
    processedLines.push(line);
  }
  
  // 重新组合成内容
  const reconstructed = processedLines.join('\n');
  
  // 现在按段落分割处理
  const paragraphs = reconstructed.split('\n\n');
  const processedParagraphs = paragraphs.map(para => {
    // 跳过空段落
    if (!para.trim()) return '';
    
    // 如果段落已经是HTML标签（标题、图片），直接返回
    if (para.trim().startsWith('<h') || para.trim().startsWith('<img')) {
      return para.trim();
    }
    
    // 如果段落已经是HTML标签（标题、图片），直接返回
    if (para.trim().startsWith('<h') || para.trim().startsWith('<img')) {
      return para.trim();
    }
    
    // 处理代码块
    if (para.startsWith('```')) {
      const lines = para.split('\n');
      const language = lines[0].substring(3);
      const codeContent = lines.slice(1, -1).join('\n');
      return `<pre class="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto my-4"><code class="language-${language}">${codeContent}</code></pre>`;
    }
    
    // 处理列表
    if (para.includes('\n- ') || para.startsWith('- ')) {
      const listItems = para.split('\n')
        .filter(line => line.startsWith('- '))
        .map(line => {
          const content = line.substring(2)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 rounded">$1</code>');
          return `<li class="mb-2">${content}</li>`;
        })
        .join('');
      return `<ul class="list-disc list-inside my-4 space-y-2">${listItems}</ul>`;
    }
    
    // 处理普通段落
    const processed = para
      // 图片
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="inline-block max-w-full rounded-lg" />')
      // 粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 斜体（注意顺序，避免与粗体冲突）
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
      // 行内代码
      .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 rounded">$1</code>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
      // 换行
      .replace(/\n/g, '<br>');
    
    return `<p class="mb-4 leading-relaxed">${processed}</p>`;
  });
  
  return processedParagraphs.filter(p => p).join('\n');
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
}

export function getSortedPostsData(): BlogPostMeta[] {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  
  // Include the remaining two articles
  const targetFiles = [
    'rgb-basics.md',
    'white-balance.md'
  ];
  const filteredFileNames = fileNames.filter(fileName => targetFiles.includes(fileName));
  
  const allPostsData = filteredFileNames.map((fileName) => {
    // Remove ".md" from file name to get slug
    const slug = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use our custom parser to parse the post metadata section
    const matterResult = parseFrontMatter(fileContents);

    // Combine the data with the slug
    return {
      slug,
      title: (matterResult.data.title as string) || 'Untitled',
      date: (matterResult.data.date as string) || '2024-01-01',
      excerpt: (matterResult.data.excerpt as string) || 'No excerpt available',
      author: (matterResult.data.author as string) || 'Unknown author',
      tags: (matterResult.data.tags as string[]) || [],
    };
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  
  // Include the remaining two articles
  const targetFiles = [
    'rgb-basics.md',
    'white-balance.md'
  ];
  const filteredFileNames = fileNames.filter(fileName => targetFiles.includes(fileName));
  
  return filteredFileNames.map((fileName) => {
    return {
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(slug: string): Promise<BlogPost> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use our custom parser to parse the post metadata section
  const matterResult = parseFrontMatter(fileContents);

  // Use our simple markdown to HTML converter
  const contentHtml = markdownToHtml(matterResult.content);

  // Combine the data with the slug and the contentHtml
  return {
    slug,
    title: matterResult.data.title as string,
    date: matterResult.data.date as string,
    excerpt: matterResult.data.excerpt as string,
    author: matterResult.data.author as string,
    tags: (matterResult.data.tags as string[]) || [],
    content: contentHtml,
  };
}
