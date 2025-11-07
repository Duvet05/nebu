/**
 * Script de gestión de agentes
 *
 * Ejecutar con: npx ts-node scripts/manage-agents.ts [command] [options]
 *
 * Comandos:
 *   list                    - Listar todos los agentes
 *   show <id>               - Mostrar detalles de un agente
 *   rename <id> <newName>   - Renombrar un agente
 *   update-persona <id>     - Actualizar persona de un agente
 *   delete <id>             - Eliminar un agente
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AgentsService } from '../src/agents/agents.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const agentsService = app.get(AgentsService);

  const [, , command, ...args] = process.argv;

  try {
    switch (command) {
      case 'list':
        await listAgents(agentsService);
        break;

      case 'show':
        if (!args[0]) {
          console.error('❌ Error: Se requiere ID del agente');
          console.log('Uso: npx ts-node scripts/manage-agents.ts show <agent-id>');
          process.exit(1);
        }
        await showAgent(agentsService, args[0]);
        break;

      case 'rename':
        if (!args[0] || !args[1]) {
          console.error('❌ Error: Se requiere ID y nuevo nombre');
          console.log('Uso: npx ts-node scripts/manage-agents.ts rename <agent-id> <nuevo-nombre>');
          process.exit(1);
        }
        await renameAgent(agentsService, args[0], args.slice(1).join(' '));
        break;

      case 'update-persona':
        if (!args[0]) {
          console.error('❌ Error: Se requiere ID del agente');
          console.log('Uso: npx ts-node scripts/manage-agents.ts update-persona <agent-id>');
          process.exit(1);
        }
        await updatePersona(agentsService, args[0]);
        break;

      case 'delete':
        if (!args[0]) {
          console.error('❌ Error: Se requiere ID del agente');
          console.log('Uso: npx ts-node scripts/manage-agents.ts delete <agent-id>');
          process.exit(1);
        }
        await deleteAgent(agentsService, args[0]);
        break;

      case 'create-example':
        await createExampleAgent(agentsService);
        break;

      default:
        console.log('📚 Comandos disponibles:');
        console.log('  list                      - Listar todos los agentes');
        console.log('  show <id>                 - Mostrar detalles de un agente');
        console.log('  rename <id> <newName>     - Renombrar un agente');
        console.log('  update-persona <id>       - Actualizar persona de un agente');
        console.log('  delete <id>               - Eliminar un agente');
        console.log('  create-example            - Crear un agente de ejemplo');
        console.log('\nEjemplo: npx ts-node scripts/manage-agents.ts list');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function listAgents(agentsService: AgentsService) {
  console.log('📋 Listado de Agentes\n');

  const agents = await agentsService.findAll();

  if (agents.length === 0) {
    console.log('No hay agentes registrados.\n');
    console.log('💡 Tip: Crea uno con: npx ts-node scripts/manage-agents.ts create-example');
    return;
  }

  console.log(`Total: ${agents.length} agente(s)\n`);
  console.log('─'.repeat(80));

  agents.forEach((agent, index) => {
    console.log(`${index + 1}. ${agent.name}`);
    console.log(`   ID: ${agent.id}`);
    console.log(`   Descripción: ${agent.description || 'Sin descripción'}`);
    console.log(`   Público: ${agent.isPublic ? 'Sí' : 'No'}`);
    console.log(`   Creado: ${agent.createdAt.toISOString().split('T')[0]}`);

    if (agent.persona) {
      const persona = agent.persona as any;
      if (persona.tone) console.log(`   Tono: ${persona.tone}`);
      if (persona.expertise) console.log(`   Expertise: ${persona.expertise.join(', ')}`);
    }

    console.log('─'.repeat(80));
  });
}

async function showAgent(agentsService: AgentsService, id: string) {
  console.log(`🔍 Detalles del Agente: ${id}\n`);

  const agent = await agentsService.findOne(id);

  console.log('═'.repeat(80));
  console.log(`NOMBRE: ${agent.name}`);
  console.log('═'.repeat(80));
  console.log(`ID: ${agent.id}`);
  console.log(`Descripción: ${agent.description || 'Sin descripción'}`);
  console.log(`Público: ${agent.isPublic ? 'Sí' : 'No'}`);
  console.log(`Owner: ${agent.ownerUserId || 'N/A'}`);
  console.log(`Creado: ${agent.createdAt}`);
  console.log(`Actualizado: ${agent.updatedAt}`);
  console.log('');

  if (agent.persona) {
    console.log('─── PERSONA ───');
    console.log(JSON.stringify(agent.persona, null, 2));
    console.log('');
  }

  if (agent.voiceSettings) {
    console.log('─── VOICE SETTINGS ───');
    console.log(JSON.stringify(agent.voiceSettings, null, 2));
    console.log('');
  }

  console.log('═'.repeat(80));
}

async function renameAgent(agentsService: AgentsService, id: string, newName: string) {
  console.log(`✏️  Renombrando agente...\n`);

  const agent = await agentsService.findOne(id);
  console.log(`Nombre anterior: ${agent.name}`);
  console.log(`Nombre nuevo: ${newName}`);

  const updated = await agentsService.update(id, { name: newName });

  console.log(`\n✅ Agente renombrado exitosamente!`);
  console.log(`   ID: ${updated.id}`);
  console.log(`   Nombre: ${updated.name}`);
  console.log(`   Actualizado: ${updated.updatedAt}`);
}

async function updatePersona(agentsService: AgentsService, id: string) {
  console.log(`🎭 Actualizando persona del agente...\n`);

  const agent = await agentsService.findOne(id);
  console.log(`Agente: ${agent.name}`);
  console.log(`\nPersona actual:`);
  console.log(JSON.stringify(agent.persona, null, 2));

  // Ejemplo de actualización
  const newPersona = {
    ...(agent.persona as any || {}),
    instructions: "Instrucciones actualizadas por el script de gestión",
    tone: "super amigable y motivador",
    metadata: {
      ...(agent.persona as any)?.metadata,
      lastUpdated: new Date().toISOString(),
      updatedBy: "manage-agents script"
    }
  };

  const updated = await agentsService.update(id, { persona: newPersona });

  console.log(`\n✅ Persona actualizada exitosamente!`);
  console.log(`\nNueva persona:`);
  console.log(JSON.stringify(updated.persona, null, 2));
}

async function deleteAgent(agentsService: AgentsService, id: string) {
  console.log(`🗑️  Eliminando agente...\n`);

  const agent = await agentsService.findOne(id);
  console.log(`Agente a eliminar: ${agent.name} (${agent.id})`);
  console.log(`\n⚠️  ADVERTENCIA: Esta acción no se puede deshacer.`);
  console.log(`Las memorias asociadas quedarán como compartidas (agentId = NULL).\n`);

  await agentsService.remove(id);

  console.log(`✅ Agente eliminado exitosamente!`);
}

async function createExampleAgent(agentsService: AgentsService) {
  console.log(`✨ Creando agente de ejemplo...\n`);

  const exampleAgent = {
    name: "Robot Explorador",
    description: "Agente de ejemplo que enseña sobre el espacio y los planetas",
    persona: {
      instructions: "Eres un robot explorador espacial. Enseñas a los niños sobre el espacio, planetas, estrellas y astronomía de forma divertida.",
      tone: "entusiasta y científico",
      expertise: ["astronomía", "planetas", "estrellas", "exploración espacial"],
      constraints: [
        "Usar vocabulario simple apropiado para niños",
        "Incluir datos curiosos interesantes",
        "Hacer comparaciones con cosas cotidianas"
      ],
      personality: {
        traits: ["curioso", "aventurero", "educativo"],
        mood: "emocionado",
        empathy: 0.8,
        humor: 0.7
      },
      educational: {
        ageGroup: "6-12 años",
        learningStyle: ["visual", "auditivo"],
        difficulty: "principiante"
      },
      behavior: {
        proactive: true,
        askQuestions: true,
        giveExamples: true,
        usesMetaphors: true
      },
      metadata: {
        theme: "espacio",
        usesEmojis: true,
        topics: ["sistema solar", "galaxias", "astronautas", "naves espaciales"]
      }
    },
    voiceSettings: {
      provider: "elevenlabs",
      elevenlabs: {
        voiceId: "pNInz6obpgDQGcFmaJgB",
        stability: 0.5,
        similarityBoost: 0.75
      }
    },
    isPublic: true
  };

  const created = await agentsService.create(exampleAgent);

  console.log(`✅ Agente de ejemplo creado exitosamente!\n`);
  console.log(`   ID: ${created.id}`);
  console.log(`   Nombre: ${created.name}`);
  console.log(`   Descripción: ${created.description}`);
  console.log(`\n💡 Puedes ver los detalles con:`);
  console.log(`   npx ts-node scripts/manage-agents.ts show ${created.id}`);
}

main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
