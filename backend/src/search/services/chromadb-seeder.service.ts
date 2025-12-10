import { Injectable, Logger } from '@nestjs/common';
import { ChromaDBService } from './chromadb.service';

/**
 * ChromaDB Seeder Service
 * Inicializa las colecciones con datos base y conocimiento educativo
 */
@Injectable()
export class ChromaDBSeederService {
  private readonly logger = new Logger(ChromaDBSeederService.name);

  constructor(private readonly chromaDBService: ChromaDBService) {}

  /**
   * Seed completo: Crea colecciones y agrega conocimiento base
   */
  async seedAll() {
    this.logger.log('🌱 Iniciando seed de ChromaDB...');

    try {
      // Las colecciones se crean automáticamente en ChromaDBService.onModuleInit()
      // Aquí solo agregamos el conocimiento base

      await this.seedKnowledgeBase();
      
      this.logger.log('✅ Seed de ChromaDB completado');
      return { success: true, message: 'ChromaDB seeded successfully' };
    } catch (error) {
      this.logger.error('❌ Error en seed de ChromaDB:', error.message);
      throw error;
    }
  }

  /**
   * Seed de la base de conocimiento educativa
   */
  async seedKnowledgeBase() {
    this.logger.log('📚 Seeding knowledge base...');

    const knowledge = [
      // ========================================
      // DINOSAURIOS
      // ========================================
      {
        id: 'dino_trex_basic',
        content: `El Tyrannosaurus Rex (T-Rex) fue uno de los dinosaurios carnívoros más grandes. 
Vivió hace aproximadamente 68-66 millones de años, durante el período Cretácico.
Medía hasta 12 metros de largo y pesaba alrededor de 8 toneladas.
A pesar de tener brazos muy pequeños, eran muy fuertes y tenían dos garras afiladas.
Tenía dientes enormes de hasta 30 centímetros de largo.
Era un excelente cazador con muy buena vista y olfato.`,
        metadata: {
          topic: 'dinosaurios',
          category: 'paleontología',
          ageRange: '5-12',
          verified: true,
          source: 'National Geographic Kids',
          language: 'es',
        },
      },
      {
        id: 'dino_extinction',
        content: `Los dinosaurios se extinguieron hace 66 millones de años.
La teoría más aceptada es que un meteorito gigante chocó contra la Tierra en lo que hoy es México.
El impacto creó una nube de polvo enorme que bloqueó el sol durante mucho tiempo.
Sin luz solar, las plantas murieron, y luego los herbívoros, y finalmente los carnívoros.
También hubo erupciones volcánicas masivas que ayudaron a cambiar el clima.
Los únicos dinosaurios que sobrevivieron fueron las aves, que son descendientes de dinosaurios.`,
        metadata: {
          topic: 'dinosaurios',
          category: 'paleontología',
          ageRange: '7-14',
          verified: true,
          source: 'Smithsonian Museum',
          language: 'es',
        },
      },
      {
        id: 'dino_herbivores',
        content: `Los dinosaurios herbívoros comían plantas y eran generalmente mucho más grandes que los carnívoros.
El Brachiosaurus podía alcanzar hasta 25 metros de altura, más alto que un edificio de 7 pisos.
Tenían dientes especiales para arrancar hojas y piedras en el estómago para ayudar a digerir.
Algunos como el Triceratops tenían cuernos y placas óseas para defenderse.
Vivían en manadas para protegerse de los depredadores.`,
        metadata: {
          topic: 'dinosaurios',
          category: 'paleontología',
          ageRange: '5-10',
          verified: true,
          language: 'es',
        },
      },

      // ========================================
      // SISTEMA SOLAR
      // ========================================
      {
        id: 'space_solar_system',
        content: `El Sistema Solar tiene 8 planetas que giran alrededor del Sol.
De más cercano a más lejano: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno.
Los primeros 4 son rocosos y pequeños. Los otros 4 son gigantes gaseosos.
El Sol es una estrella que contiene el 99.8% de toda la masa del Sistema Solar.
La Tierra es el único planeta conocido con vida.`,
        metadata: {
          topic: 'espacio',
          category: 'astronomía',
          ageRange: '6-12',
          verified: true,
          source: 'NASA Kids',
          language: 'es',
        },
      },
      {
        id: 'space_moon',
        content: `La Luna es el único satélite natural de la Tierra.
Está a unos 384,400 kilómetros de distancia.
Tarda 27 días en dar una vuelta completa alrededor de la Tierra.
No tiene luz propia, brilla porque refleja la luz del Sol.
Los humanos llegaron a la Luna por primera vez en 1969 con la misión Apollo 11.
En la Luna no hay aire, agua ni vida.`,
        metadata: {
          topic: 'espacio',
          category: 'astronomía',
          ageRange: '5-10',
          verified: true,
          source: 'NASA',
          language: 'es',
        },
      },

      // ========================================
      // ANIMALES
      // ========================================
      {
        id: 'animals_dolphins',
        content: `Los delfines son mamíferos marinos muy inteligentes.
Respiran aire como nosotros, tienen pulmones y deben salir a la superficie.
Usan ecolocalización para "ver" bajo el agua mediante sonidos.
Viven en grupos llamados manadas y se comunican entre ellos.
Son muy juguetones y pueden aprender trucos fácilmente.
Pueden nadar a velocidades de hasta 60 km/h.`,
        metadata: {
          topic: 'animales',
          category: 'biología marina',
          ageRange: '5-12',
          verified: true,
          language: 'es',
        },
      },
      {
        id: 'animals_photosynthesis',
        content: `Las plantas fabrican su propio alimento mediante la fotosíntesis.
Usan la luz del sol, agua y dióxido de carbono (CO2) del aire.
En sus hojas tienen clorofila, que les da el color verde.
El proceso produce oxígeno que liberan al aire, el que respiramos.
Sin plantas, no habría oxígeno en la Tierra para que respiremos.
Las plantas son la base de toda la cadena alimenticia.`,
        metadata: {
          topic: 'plantas',
          category: 'botánica',
          ageRange: '7-12',
          verified: true,
          language: 'es',
        },
      },

      // ========================================
      // CIENCIAS
      // ========================================
      {
        id: 'science_water_cycle',
        content: `El ciclo del agua es el movimiento continuo del agua en la Tierra.
El sol calienta el agua de océanos y ríos, que se evapora y sube al cielo.
En el cielo, el vapor se enfría y forma nubes (condensación).
Cuando las nubes están muy llenas, el agua cae como lluvia, nieve o granizo (precipitación).
El agua regresa a los océanos, ríos y lagos, y el ciclo comienza de nuevo.
Este ciclo ha estado funcionando durante millones de años.`,
        metadata: {
          topic: 'ciencias naturales',
          category: 'física',
          ageRange: '6-12',
          verified: true,
          language: 'es',
        },
      },
      {
        id: 'science_gravity',
        content: `La gravedad es la fuerza que atrae los objetos hacia la Tierra.
Por eso cuando sueltas algo, cae al suelo en lugar de flotar.
Isaac Newton descubrió la gravedad observando cómo caían las manzanas.
En la Luna hay menos gravedad, por eso los astronautas pueden saltar muy alto.
Sin gravedad, flotaríamos en el espacio como los astronautas.
La gravedad también mantiene a la Tierra girando alrededor del Sol.`,
        metadata: {
          topic: 'física',
          category: 'ciencias',
          ageRange: '7-12',
          verified: true,
          language: 'es',
        },
      },

      // ========================================
      // MATEMÁTICAS
      // ========================================
      {
        id: 'math_multiplication_tips',
        content: `La multiplicación es una forma rápida de sumar el mismo número varias veces.
Por ejemplo: 3 × 4 es lo mismo que 3 + 3 + 3 + 3 = 12.
Trucos útiles:
- Cualquier número multiplicado por 0 es 0
- Cualquier número multiplicado por 1 es el mismo número
- Multiplicar por 10 es fácil: solo agrega un 0 al final
- El orden no importa: 3 × 4 = 4 × 3
Las tablas de multiplicar se usan todos los días en la vida real.`,
        metadata: {
          topic: 'matemáticas',
          category: 'aritmética',
          ageRange: '7-10',
          verified: true,
          language: 'es',
        },
      },

      // ========================================
      // GEOGRAFÍA
      // ========================================
      {
        id: 'geo_oceans',
        content: `La Tierra tiene 5 océanos principales:
1. Océano Pacífico (el más grande)
2. Océano Atlántico
3. Océano Índico
4. Océano Ártico (el más frío)
5. Océano Antártico (rodea la Antártida)
Los océanos cubren el 71% de la superficie de la Tierra.
Contienen el 97% de toda el agua del planeta.
En los océanos vive la mayoría de las especies del planeta.`,
        metadata: {
          topic: 'geografía',
          category: 'ciencias de la tierra',
          ageRange: '8-12',
          verified: true,
          language: 'es',
        },
      },

      // ========================================
      // TECNOLOGÍA
      // ========================================
      {
        id: 'tech_internet',
        content: `Internet es una red mundial que conecta millones de computadoras.
Funciona enviando información en pequeños paquetes de datos.
Fue creada en 1969 por científicos estadounidenses.
Hoy en día, más de 5 mil millones de personas usan internet.
Gracias a internet podemos enviar mensajes, ver videos, aprender y jugar.
Es importante usar internet de forma segura y responsable.`,
        metadata: {
          topic: 'tecnología',
          category: 'informática',
          ageRange: '8-14',
          verified: true,
          language: 'es',
        },
      },

      // ========================================
      // HISTORIA
      // ========================================
      {
        id: 'history_ancient_egypt',
        content: `El Antiguo Egipto fue una de las civilizaciones más importantes de la historia.
Existió hace más de 5,000 años a orillas del río Nilo en África.
Construyeron las famosas pirámides de Giza, una de las 7 maravillas del mundo antiguo.
Los faraones eran los reyes de Egipto, considerados dioses vivientes.
Inventaron un sistema de escritura llamado jeroglíficos.
Momificaban a los muertos porque creían en la vida después de la muerte.`,
        metadata: {
          topic: 'historia',
          category: 'civilizaciones antiguas',
          ageRange: '8-14',
          verified: true,
          language: 'es',
        },
      },

      // ========================================
      // SALUD Y CUERPO HUMANO
      // ========================================
      {
        id: 'health_human_body',
        content: `El cuerpo humano es increíble y tiene muchos sistemas trabajando juntos:
- El corazón late unas 100,000 veces al día bombeando sangre
- Los pulmones procesan unos 8,000 litros de aire cada día
- El cerebro tiene 100 mil millones de neuronas
- Los huesos son más fuertes que el acero pero son más ligeros
- La piel es el órgano más grande del cuerpo
Es importante cuidar nuestro cuerpo comiendo bien, haciendo ejercicio y durmiendo suficiente.`,
        metadata: {
          topic: 'salud',
          category: 'anatomía',
          ageRange: '7-12',
          verified: true,
          language: 'es',
        },
      },
    ];

    // Agregar todo el conocimiento a ChromaDB
    let addedCount = 0;
    for (const item of knowledge) {
      try {
        await this.chromaDBService.addKnowledge(item.id, item.content, item.metadata);
        addedCount++;
      } catch (error) {
        // Si ya existe, está bien (idempotente)
        if (error.message?.includes('already exists')) {
          this.logger.debug(`Knowledge ${item.id} already exists, skipping`);
        } else {
          this.logger.error(`Error adding knowledge ${item.id}:`, error.message);
        }
      }
    }

    this.logger.log(`✅ ${addedCount} items de conocimiento agregados/actualizados`);
  }

  /**
   * Limpiar todas las colecciones (solo desarrollo)
   */
  async clearAll() {
    this.logger.warn('⚠️  Limpiando todas las colecciones...');
    await this.chromaDBService.clearAllCollections();
  }
}
