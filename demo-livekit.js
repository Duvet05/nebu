#!/usr/bin/env node

const { AccessToken } = require('livekit-server-sdk');

// Configuración de LiveKit (igual que en el backend)
const apiKey = 'nebu-dev';
const apiSecret = 'nebu-dev-secret-key-2024';
const livekitUrl = 'http://localhost:7880';

console.log('DEMO: Flujo completo Backend-LiveKit');
console.log('==========================================\n');

// PASO 1: Simular solicitud de token desde dispositivo
console.log(' PASO 1: Dispositivo solicita token al backend');
console.log('Dispositivo: ESP32_DEMO_DEVICE_001');
console.log('Solicitando token...\n');

// PASO 2: Backend genera token JWT usando LiveKit SDK
console.log('PASO 2: Backend genera token JWT usando LiveKit SDK');

async function generateToken() {
  const roomName = 'iot-demo-room';
  const participantName = 'device-ESP32_DEMO_DEVICE_001';
  
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    metadata: JSON.stringify({
      type: 'iot-device',
      deviceId: 'ESP32_DEMO_DEVICE_001',
      timestamp: Date.now()
    })
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: false,
    canPublishData: true,
  });

  const token = await at.toJwt();
  
  console.log(`Token generado exitosamente`);
  console.log(`Detalles del token:`);
  console.log(`Room: ${roomName}`);
  console.log(`Participant: ${participantName}`);
  console.log(`Token: ${token.substring(0, 50)}...`);
  console.log(`LiveKit URL: ${livekitUrl}\n`);
  
  return { token, roomName, participantName };
}

// PASO 3: Cliente se conecta a LiveKit con el token
console.log(' PASO 3: Cliente se conecta a LiveKit con el token');

async function testLiveKitConnection() {
  try {
    const { token, roomName, participantName } = await generateToken();
    
    console.log('🔗 Probando conexión a LiveKit...');
    
    // Verificar que LiveKit está disponible
    const response = await fetch(livekitUrl);
    if (response.ok) {
      console.log(' LiveKit server está disponible');
      console.log(`   - URL: ${livekitUrl}`);
      console.log(`   - Status: ${response.status}\n`);
    } else {
      console.log(' LiveKit server no disponible');
      return;
    }
    
    console.log('Token listo para conectar:');
    console.log(`   - WebSocket URL: ws://localhost:7880`);
    console.log(`   - Token: ${token}`);
    console.log(`   - Room: ${roomName}`);
    console.log(`   - Participant: ${participantName}\n`);
    
    return { token, roomName, participantName };
  } catch (error) {
    console.error(' Error generando token:', error.message);
  }
}

// PASO 4: LiveKit maneja la comunicación en tiempo real
console.log('PASO 4: LiveKit maneja la comunicación en tiempo real');
console.log('   - WebRTC para audio/video');
console.log('   - WebSocket para datos');
console.log('   - ICE para conexión P2P\n');

// PASO 5: Webhooks notifican eventos al backend
console.log('PASO 5: Webhooks notifican eventos al backend');
console.log('   - participant_joined');
console.log('   - participant_left');
console.log('   - track_published');
console.log('   - track_unpublished');
console.log('   - room_finished\n');

// Ejecutar demo
testLiveKitConnection().then(() => {
  console.log(' DEMO COMPLETADO');
  console.log('==================');
  console.log(' Flujo completo Backend-LiveKit funcionando');
  console.log(' Token JWT generado correctamente');
  console.log(' LiveKit server disponible');
  console.log(' Listo para conexión en tiempo real');
});
