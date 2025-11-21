interface FontLink {
  rel: string;
  href?: string;
  as?: string;
  type?: string;
  crossOrigin?: string;
}

export function getFontLinks(): FontLink[] {
  // Solo cargar las variantes de fuente que realmente se usan
  // Esto reduce significativamente el peso de las fuentes
  const fontWeights = {
    nunito: [400, 600, 700],     // Reducido de 300-900
    fredoka: [400, 600],          // Reducido de 300-700
    quicksand: [400, 600]         // Reducido de 300-700
  };
  
  // Construir URL optimizada de Google Fonts
  const fontFamilies = [
    `Nunito:wght@${fontWeights.nunito.join(';')}`,
    `Fredoka:wght@${fontWeights.fredoka.join(';')}`,
    `Quicksand:wght@${fontWeights.quicksand.join(';')}`
  ];
  
  const fontsUrl = `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f}`).join('&')}&display=swap`;
  
  return [
    // Preconnect para mejorar la velocidad de carga
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com"
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    // Preload de la hoja de estilos de fuentes
    {
      rel: "preload",
      as: "style",
      href: fontsUrl,
    },
    // Cargar la hoja de estilos
    {
      rel: "stylesheet",
      href: fontsUrl,
    },
  ];
}

// Función para obtener font-face declarations optimizadas (para critical CSS)
export function getCriticalFontCSS(): string {
  return `
    /* Critical Font Loading */
    @font-face {
      font-family: 'Nunito';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: local('Nunito Regular'), local('Nunito-Regular');
    }
    
    @font-face {
      font-family: 'Nunito';
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: local('Nunito SemiBold'), local('Nunito-SemiBold');
    }
    
    @font-face {
      font-family: 'Nunito';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: local('Nunito Bold'), local('Nunito-Bold');
    }
    
    /* Font loading strategy */
    .fonts-loading {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    .fonts-loaded {
      font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  `;
}

// Función para detectar cuando las fuentes están cargadas
export function initFontLoader(): void {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    document.fonts.ready.then(() => {
      document.documentElement.classList.remove('fonts-loading');
      document.documentElement.classList.add('fonts-loaded');
    });
  }
}