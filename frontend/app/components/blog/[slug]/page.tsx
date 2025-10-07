import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BlogPostPage } from '@/components/Blog/BlogPostPage';
import { frontendApi } from '@/lib/frontend-api';

interface BlogPostProps {
  params: { 
    locale: string; 
    slug: string; 
  };
}

export async function generateMetadata({ 
  params: { locale, slug } 
}: BlogPostProps): Promise<Metadata> {
  try {
    const post = await frontendApi.blog.getPost(slug);
    
    if (!post) {
      return {
        title: 'Post no encontrado',
        description: 'El post del blog que buscas no existe.',
      };
    }

    const title = `${post.title} | Outliers Academy Blog`;                                                            
    const description = post.metaDescription || post.excerpt || post.title;
    
    // Generate rich keywords based on post content
    const keywords = [
      ...(post.metaKeywords || []),
      ...(post.tags || []),
      ...(post.automationTools || []),
      `${post.automationType} tutorial`,
      `${post.automationType} automatización`,
      'outliers academy',
      'tutorial automatización',
      'caso de estudio'
    ].filter(Boolean).join(', ');

    return {
      title,
      description,
      keywords,
      authors: [{ name: post.author.name }],
      openGraph: {
        title,
        description,
        type: 'article',
        url: `/blog/${slug}`,
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        images: post.featuredImage ? [
          {
            url: post.featuredImage,
            alt: post.featuredImageAlt || post.title,
            width: 1200,
            height: 630,
          }
        ] : ['/images/blog-default-og.jpg'],
        authors: [post.author.name],
        tags: post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: post.featuredImage ? [post.featuredImage] : ['/images/blog-default-og.jpg'],
        creator: `@${post.author.name.replace(/\s+/g, '').toLowerCase()}`,
      },
      alternates: {
        canonical: `/blog/${slug}`,
        languages: {
          'es': `/es/blog/${slug}`,
          'en': `/en/blog/${slug}`,
        },
      },
    };
  } catch (error) {
    return {
      title: 'Error al cargar el post',
      description: 'Hubo un problema al cargar el contenido.',
    };
  }
}

export default async function BlogPostPageRoute({ params }: BlogPostProps) {
  const t = await getTranslations('blog');
  
  try {
    const [post, relatedPosts] = await Promise.all([
      frontendApi.blog.getPost(params.slug),
      [] // TODO: Implement getRelatedPosts in frontendApi
    ]);

    if (!post) {
      notFound();
    }

    // Generate Article Structured Data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt || post.metaDescription,
      "image": post.featuredImage || "https://outliersacademy.com/images/blog-default.jpg",
      "author": {
        "@type": "Person",
        "name": post.author.name,
        "url": `https://outliersacademy.com/author/${post.author.id}`
      },
      "publisher": {
        "@type": "Organization",
        "name": "Outliers Academy",
        "logo": {
          "@type": "ImageObject",
          "url": "https://outliersacademy.com/icons/logo.png"
        }
      },
      "datePublished": post.publishedAt,
      "dateModified": post.updatedAt,
      "url": `https://outliersacademy.com/${params.locale}/blog/${params.slug}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://outliersacademy.com/${params.locale}/blog/${params.slug}`
      },
      "keywords": post.tags?.join(', '),
      "articleSection": post.category?.name,
      "wordCount": post.content ? post.content.split(/\s+/).length : 0,
      "timeRequired": `PT${post.readingTime || 5}M`,
      
      // 🚀 AUTOMATION-SPECIFIC STRUCTURED DATA
      "about": [
        {
          "@type": "Thing",
          "name": post.automationType?.replace('_', ' '),
          "description": `Tutorial sobre ${post.automationType?.replace('_', ' ')}`
        },
        ...(post.automationTools || []).map((tool: string) => ({
          "@type": "SoftwareApplication",
          "name": tool,
          "applicationCategory": "Business Automation Tool"
        }))
      ],
      
      // Educational Content
      "teaches": post.outcomes || [],
      "educationalLevel": post.difficultyLevel,
      
      // Business Value
      "potentialAction": {
        "@type": "LearnAction",
        "result": {
          "@type": "Thing",
          "name": "Business Process Automation",
          "description": `Learn to automate ${post.automationType?.replace('_', ' ')} processes`
        }
      },

      // Aggregate Rating (if we have engagement data)
      ...(post.likeCount > 0 && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": Math.min(5, Math.max(1, (post.likeCount / Math.max(1, post.viewCount)) * 5)),
          "reviewCount": post.commentCount || 1,
          "bestRating": 5,
          "worstRating": 1
        }
      })
    };

    // HowTo Structured Data for tutorial posts
    const howToStructuredData = post.outcomes && post.outcomes.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": post.title,
      "description": post.excerpt || post.metaDescription,
      "image": post.featuredImage,
      "totalTime": post.implementationTime,
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": "0"
      },
      "supply": (post.prerequisites || []).map((prereq: string) => ({
        "@type": "HowToSupply",
        "name": prereq
      })),
      "tool": (post.automationTools || []).map((tool: string) => ({
        "@type": "HowToTool",
        "name": tool
      })),
      "step": post.outcomes.map((outcome: string, index: number) => ({
        "@type": "HowToStep",
        "name": `Step ${index + 1}`,
        "text": outcome,
        "url": `${post.url}#step-${index + 1}`
      }))
    } : null;

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        
        {howToStructuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(howToStructuredData)
            }}
          />
        )}

        <BlogPostPage 
          post={post} 
          relatedPosts={relatedPosts}
          locale={params.locale}
        />
      </>
    );
    
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
}

// Generate static params for popular posts (optional optimization)
export async function generateStaticParams() {
  try {
    // This would fetch popular post slugs for static generation
    // const popularPosts = await getPopularPosts(20);
    // return popularPosts.map(post => ({ slug: post.slug }));
    return [];
  } catch (error) {
    return [];
  }
}
