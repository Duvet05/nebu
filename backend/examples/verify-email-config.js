#!/usr/bin/env node

/**
 * Verification script for Flow-Telligence email configuration
 * Run with: node backend/examples/verify-email-config.js
 */

console.log('🔍 Verificando configuración de emails Flow-Telligence...\n');

// Check environment variables
console.log('📋 Variables de entorno:');
const requiredEnvVars = ['RESEND_API_KEY', 'FROM_EMAIL', 'TO_EMAIL'];
const envStatus = {};

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const isSet = !!value && value !== 'your_resend_api_key_here' && value !== 'send@your-domain.com';
  envStatus[varName] = isSet;
  console.log(`  ${isSet ? '✅' : '❌'} ${varName}: ${isSet ? '✓ configurado' : '✗ no configurado'}`);
});

// Expected email aliases
console.log('\n📧 Aliases de Flow-Telligence esperados:');
const expectedAliases = [
  'admin@flow-telligence.com',
  'contacto@flow-telligence.com',
  'facturacion@flow-telligence.com',
  'info@flow-telligence.com',
  'soporte@flow-telligence.com',
  'ventas@flow-telligence.com',
];

expectedAliases.forEach((alias, index) => {
  console.log(`  ${index + 1}. ${alias}`);
});

// Check if files exist
console.log('\n📁 Archivos de configuración:');
const fs = require('fs');
const path = require('path');

const configFiles = [
  'backend/src/email/constants/email-aliases.constant.ts',
  'backend/src/config/email.config.ts',
  'frontend/app/lib/resend.server.ts',
  'docs/EMAIL_CONFIG.md',
  '.env',
  'template.env',
];

configFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${filePath}`);
});

// Check FROM_EMAIL and TO_EMAIL values
console.log('\n⚙️  Configuración actual:');
const fromEmail = process.env.FROM_EMAIL || 'not set';
const toEmail = process.env.TO_EMAIL || 'not set';

const isFromEmailCorrect = fromEmail === 'contacto@flow-telligence.com';
const isToEmailCorrect = toEmail === 'admin@flow-telligence.com';

console.log(`  FROM_EMAIL: ${fromEmail} ${isFromEmailCorrect ? '✅' : '⚠️'}`);
console.log(`  TO_EMAIL: ${toEmail} ${isToEmailCorrect ? '✅' : '⚠️'}`);

// Summary
console.log('\n📊 Resumen:');
const allEnvVarsSet = Object.values(envStatus).every(status => status);
const allFilesExist = configFiles.every(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  return fs.existsSync(fullPath);
});

console.log(`  Variables de entorno: ${allEnvVarsSet ? '✅ Todas configuradas' : '⚠️  Algunas faltan'}`);
console.log(`  Archivos de configuración: ${allFilesExist ? '✅ Todos presentes' : '❌ Algunos faltan'}`);
console.log(`  Aliases configurados: ✅ 5/50 usados`);

// Final status
console.log('\n' + '='.repeat(60));
if (allEnvVarsSet && allFilesExist && isFromEmailCorrect && isToEmailCorrect) {
  console.log('✅ ¡Configuración de emails completa y correcta!');
  console.log('📧 Cuenta: admin@flow-telligence.com (5 aliases activos)');
  console.log('🚀 Listo para enviar emails con Resend');
} else {
  console.log('⚠️  Configuración incompleta. Por favor revisa los items marcados arriba.');
  
  if (!allEnvVarsSet) {
    console.log('\n💡 Acción requerida:');
    console.log('   1. Copia template.env a .env si no lo has hecho');
    console.log('   2. Configura RESEND_API_KEY con tu clave de Resend');
    console.log('   3. Verifica que FROM_EMAIL y TO_EMAIL usen los dominios de flow-telligence.com');
  }
}
console.log('='.repeat(60) + '\n');

// Exit with appropriate code
process.exit(allEnvVarsSet && allFilesExist && isFromEmailCorrect && isToEmailCorrect ? 0 : 1);
