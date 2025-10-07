import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BlogListPage } from '@/components/Blog/BlogListPage';
import { PageSEO } from '@/components/SEO/PageSEO';
import { SEO_CONFIG } from '@/lib/seo';
import { AutomationType } from '@/types/blog';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Lightbulb, TrendingUp } from 'lucide-react';

interface BlogPageProps {
  params: { locale: string };
  searchParams: { 
    page?: string; 
    category?: string; 
    automation?: string;
    difficulty?: string;
    search?: string;
  };
}

export async function generateMetadata({ 
  params: { locale },
  searchParams 
}: BlogPageProps): Promise<Metadata> {
  const t = await getTranslations('blog');
  
  const title = searchParams.category 
    ? `${searchParams.category} - Blog de Automatización | Outliers Academy`
    : SEO_CONFIG.PAGE_TITLES.blog?.[locale as 'es' | 'en'] || 'Blog de Automatización - Outliers Academy';
    
  const description = searchParams.automation
    ? `Aprende ${searchParams.automation} paso a paso. Tutoriales, casos de estudio y herramientas para automatizar tu negocio.`
    : 'Descubre cómo automatizar tu negocio con tutoriales prácticos, casos de estudio reales y herramientas profesionales. Ahorra tiempo y dinero.';

  return {
    title,
    description,
    keywords: [
      'blog automatización',
      'tutoriales automatización',
      'casos de estudio automation',
      'zapier tutoriales',
      'make.com guías',
      'automatización negocio',
      'herramientas automation',
      'outliers academy blog'
    ].join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/blog`,
      images: ['/images/blog-og.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/blog-og.jpg'],
    },
    alternates: {
      canonical: `/blog`,
      languages: {
        'es': `/es/blog`,
        'en': `/en/blog`,
      },
    },
  };
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const t = await getTranslations('blog');
  
  // Convert search params to proper types
  const filters = {
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
    category: searchParams.category,
    automationType: searchParams.automation as AutomationType | undefined,
    difficultyLevel: searchParams.difficulty,
    search: searchParams.search,
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Outliers Academy Blog - Automatización de Negocios",
    "description": "Blog especializado en automatización de negocios, tutoriales de herramientas como Zapier, Make.com y casos de estudio reales.",
    "url": `https://outliersacademy.com/${params.locale}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "Outliers Academy",
      "logo": "https://outliersacademy.com/icons/logo.png"
    },
    "inLanguage": params.locale === 'es' ? 'es-ES' : 'en-US',
    "about": [
      {
        "@type": "Thing",
        "name": "Business Automation"
      },
      {
        "@type": "Thing", 
        "name": "Workflow Optimization"
      },
      {
        "@type": "Thing",
        "name": "Process Automation"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        {/* Hero Section - Estilo Pricing Mejorado */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl"></div>
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 bg-white/20 border-white/30 text-white">
                {t('title', { default: 'Comunidad de Automatización' })}
              </Badge>
              
              <h1 className="h1-hero text-white mb-6">
                {t('hero.title', { 
                  default: 'Aprende Automatización que Funciona' 
                })}
              </h1>
              <p className="p-lead text-white/90 mb-12 max-w-2xl mx-auto">
                {t('hero.subtitle', { 
                  default: 'Tutoriales paso a paso, casos de estudio reales y herramientas que te ahorran tiempo y dinero' 
                })}
              </p>
              
              {/* Stats con colores y iconos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-1">150+</div>
                  <div className="text-sm text-white/80">{t('stats.tutorials', { default: 'Tutoriales' })}</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-1">50+</div>
                  <div className="text-sm text-white/80">{t('stats.caseStudies', { default: 'Casos de Estudio' })}</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="w-12 h-12 bg-pink-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-1">10k+</div>
                  <div className="text-sm text-white/80">{t('stats.hoursSaved', { default: 'Horas Ahorradas' })}</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-1">$2M+</div>
                  <div className="text-sm text-white/80">{t('stats.savings', { default: 'En Ahorros' })}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts List */}
        <BlogListPage filters={filters} locale={params.locale} />
      </div>
    </>
  );
}

