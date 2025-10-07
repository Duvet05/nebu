'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CourseSearch } from '@/components/CourseSearch';
import { frontendApi } from '@/lib/frontend-api';
import type { CourseGroup } from '@/lib/types/api';

interface CatalogPageProps {
  params: { locale: string }
}

export default function CatalogPage({ params }: CatalogPageProps) {
  const t = useTranslations('catalog');
  const tCommon = useTranslations('common');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{ [groupName: string]: string }>({});
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalCourses, setTotalCourses] = useState(0);
  const [filteredCourses, setFilteredCourses] = useState(0);
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch course groups from API
  useEffect(() => {
    const fetchCourseGroups = async () => {
      try {
        const data = await frontendApi.courseGroups.getGroups();
        setCourseGroups(data.courseGroups || []);
      } catch (error) {
        console.error('Error fetching course groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseGroups();
  }, []);

  const sortOptions = [
    { id: 'popular', name: t('sort.popular') },
    { id: 'newest', name: t('sort.newest') },
    { id: 'rating', name: t('sort.rating') },
    { id: 'price-low', name: t('sort.priceLow') },
    { id: 'price-high', name: t('sort.priceHigh') }
  ];

  // Course counts will be managed by CourseSearch component
  const handleResultsChange = useCallback((total: number, filtered: number) => {
    setTotalCourses(total);
    setFilteredCourses(filtered);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedFilters({});
  }, []);

  const handleFilterChange = (groupName: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [groupName]: value === 'all' ? '' : value
    }));
  };

  // Get active filters for display
  const activeFilters = Object.entries(selectedFilters).filter(([_, value]) => value !== '');

  // Get the main filter groups (first 4)
  const mainGroups = courseGroups.slice(0, 4);
  const secondaryGroups = courseGroups.slice(4, 8);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black">
      {/* Gradientes de fondo que cambian con el tema */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradiente principal */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-50/30 to-pink-50/20 dark:from-blue-600/30 dark:via-purple-600/20 dark:to-pink-600/10 pointer-events-none"></div>
        
        {/* Elementos decorativos con gradientes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/60 via-purple-200/40 to-transparent dark:from-blue-400/40 dark:via-purple-500/30 dark:to-transparent rounded-full blur-3xl animate-pulse pointer-events-none"></div>
        <div className="absolute top-20 right-0 w-80 h-80 bg-gradient-to-bl from-pink-200/50 via-purple-200/30 to-transparent dark:from-pink-400/30 dark:via-purple-400/20 dark:to-transparent rounded-full blur-3xl animate-pulse pointer-events-none" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-indigo-200/40 via-blue-200/25 to-transparent dark:from-indigo-400/25 dark:via-blue-400/15 dark:to-transparent rounded-full blur-3xl animate-pulse pointer-events-none" style={{animationDelay: '4s'}}></div>
        
        {/* Patrón de puntos decorativo */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none">
          <div className="absolute top-32 left-20 w-2 h-2 bg-gray-600 dark:bg-white rounded-full animate-ping"></div>
          <div className="absolute top-64 right-32 w-1 h-1 bg-blue-500 dark:bg-blue-300 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-500 dark:bg-purple-300 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-80 left-3/4 w-1 h-1 bg-pink-500 dark:bg-pink-300 rounded-full animate-ping" style={{animationDelay: '5s'}}></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          {/* Header mejorado */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-100 dark:to-purple-200 bg-clip-text text-transparent">
                {t('title') || 'Catálogo de Cursos'}
              </span>
            </h1>
            
            <p className="text-xl font-sans text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium">
              {t('description') || 'Descubre el curso perfecto para llevar tus habilidades al siguiente nivel'}
            </p>
          </div>

          {/* Panel de filtros mejorado */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-white/20 p-8 mb-12">
            {/* Primera fila de filtros */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <div className="lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {t('search.label') || 'Buscar cursos'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl leading-5 bg-white/80 dark:bg-gray-700/80 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 text-gray-800 dark:text-gray-200 font-medium"
                    placeholder={t('search.placeholder') || 'Buscar por título, tecnología o instructor...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filtros dinámicos principales (primeros 2) */}
              {!loading && mainGroups.slice(0, 2).map((group) => (
                <div key={group.id}>
                  <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                    {group.name}
                  </label>
                  <select
                    className="w-full py-4 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 font-medium"
                    value={selectedFilters[group.name] || 'all'}
                    onChange={(e) => handleFilterChange(group.name, e.target.value)}
                  >
                    <option value="all">
                      Todos los {group.name.toLowerCase()}
                    </option>
                    {group.tags.map((tag, index) => (
                      <option key={index} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Segunda fila de filtros */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filtros dinámicos secundarios */}
              {!loading && mainGroups.slice(2, 4).map((group) => (
                <div key={group.id}>
                  <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                    {group.name}
                  </label>
                  <select
                    className="w-full py-4 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 font-medium"
                    value={selectedFilters[group.name] || 'all'}
                    onChange={(e) => handleFilterChange(group.name, e.target.value)}
                  >
                    <option value="all">
                      Todos los {group.name.toLowerCase()}
                    </option>
                    {group.tags.map((tag, index) => (
                      <option key={index} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Más filtros si hay grupos secundarios */}
              {!loading && secondaryGroups.slice(0, 2).map((group) => (
                <div key={group.id}>
                  <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                    {group.name}
                  </label>
                  <select
                    className="w-full py-4 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 font-medium"
                    value={selectedFilters[group.name] || 'all'}
                    onChange={(e) => handleFilterChange(group.name, e.target.value)}
                  >
                    <option value="all">
                      Todos los {group.name.toLowerCase()}
                    </option>
                    {group.tags.map((tag, index) => (
                      <option key={index} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Controles de ordenamiento y vista */}
            <div className="flex flex-wrap items-center justify-between mt-8 pt-8 border-t-2 border-gray-200/50 dark:border-gray-600/50 gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {t('sort.label') || 'Ordenar por:'}
                </span>
                <select
                  className="py-3 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 text-sm font-medium min-w-[180px]"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {t('view.label') || 'Ver como:'}
                </span>
                <div className="flex border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden shadow-md">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-3 transition-all duration-300 transform ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105'
                    }`}
                    title={t('view.grid') || 'Vista en cuadrícula'}
                  >
                    <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-3 transition-all duration-300 transform ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105'
                    }`}
                    title={t('view.list') || 'Vista de lista'}
                  >
                    <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros activos mejorados */}
          {(searchTerm || activeFilters.length > 0) && (
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                {t('activeFilters') || 'Filtros activos:'}
              </span>
              
              {searchTerm && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
                  {t('searchFilter') || 'Búsqueda'}: &quot;{searchTerm}&quot;
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              
              {activeFilters.map(([groupName, value], index) => (
                <span key={`${groupName}-${value}`} className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-full text-sm font-medium shadow-lg backdrop-blur-sm ${
                  index % 3 === 0 ? 'bg-gradient-to-r from-purple-500/90 to-purple-600/90' :
                  index % 3 === 1 ? 'bg-gradient-to-r from-pink-500/90 to-pink-600/90' :
                  'bg-gradient-to-r from-indigo-500/90 to-indigo-600/90'
                }`}>
                  {groupName}: {value}
                  <button
                    onClick={() => handleFilterChange(groupName, 'all')}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white underline font-medium transition-colors"
              >
                {t('clearFilters') || 'Limpiar filtros'}
              </button>
            </div>
          )}

          {/* Contador de resultados mejorado */}
          <div className="mb-8">
            <p className="text-gray-700 dark:text-white/90 font-medium text-lg">
              {t('results.showing')} <span className="font-bold text-blue-600 dark:text-blue-300">{filteredCourses}</span> {t('results.of')} <span className="font-bold text-blue-600 dark:text-blue-300">{totalCourses}</span> {t('results.available')}
            </p>
          </div>

          {/* Grid de cursos */}
          <div className="text-center py-16">
            <div className="bg-muted/50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
              📚 Catálogo en Construcción
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md mx-auto text-lg">
              Estamos preparando una experiencia de aprendizaje increíble para ti. Pronto tendrás acceso a nuestros cursos especializados.
            </p>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Preparando contenido...' : 'Próximamente disponible'}
            </p>
          </div>

          {/* Paginación mejorada */}
          <div className="mt-20 flex justify-center">
            <nav className="flex items-center space-x-4">
              <button 
                className="group px-8 py-4 text-sm font-bold bg-gradient-to-r from-gray-400/80 to-gray-500/80 dark:from-gray-600/80 dark:to-gray-700/80 text-gray-700 dark:text-white/60 rounded-2xl shadow-lg border border-gray-300/30 dark:border-white/10 cursor-not-allowed backdrop-blur-sm" 
                disabled
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t('pagination.previous') || 'Anterior'}
                </div>
              </button>
              
              <button className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 border-2 border-white/30 backdrop-blur-sm">
                1
              </button>
              
              <button className="group px-8 py-4 text-sm font-bold bg-gradient-to-r from-gray-100/90 to-gray-200/90 dark:from-white/90 dark:to-white/80 text-gray-800 dark:text-gray-800 hover:from-blue-500 hover:to-purple-500 hover:text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-300/30 dark:border-white/30 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  {t('pagination.next') || 'Siguiente'}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
} 