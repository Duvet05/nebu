# ️ LiveKit Local Setup - Nebu Mobile

LiveKit es un servidor de tiempo real para audio/video que se ejecuta localmente en tu stack de desarrollo.

##  Configuración Actual

### Puertos Expuestos
- **7880**: API HTTP de LiveKit
- **7881**: RTMP (streaming)
- **7882**: WebRTC UDP
- **50000-50200**: Rango de puertos ICE para WebRTC

### URLs de Desarrollo
- **API**: `http://localhost:7880`
- **WebSocket**: `ws://localhost:7880`
- **Con Traefik**: `https://livekit.localhost`

##  Credenciales de Desarrollo

```yaml
API Key: nebu-dev
Secret: nebu-dev-secret-key-2024
```

 **IMPORTANTE**: Estas credenciales son solo para desarrollo. Cambiar en producción.

##  Integración con Mobile App

### 1. Configuración en React Native

```typescript
// services/livekitService.ts
import { Room, RoomEvent, RemoteParticipant, LocalParticipant } from 'livekit-client';

const LIVEKIT_URL = __DEV__ ? 'ws://localhost:7880' : 'wss://livekit.tu-dominio.com';
const API_KEY = 'nebu-dev';
const SECRET_KEY = 'nebu-dev-secret-key-2024';

export class LiveKitService {
  private room: Room | null = null;

  async connect(roomName: string, participantName: string) {
    // Generar token JWT
    const token = await this.generateToken(roomName, participantName);
    
    this.room = new Room();
    await this.room.connect(LIVEKIT_URL, token);
    
    return this.room;
  }

  private async generateToken(roomName: string, participantName: string) {
    // Llamar a tu backend para generar el token JWT
    const response = await fetch('/api/v1/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, participantName })
    });
    
    const { token } = await response.json();
    return token;
  }
}
```

### 2. Backend - Generar Tokens JWT

```typescript
// backend/src/livekit/livekit.service.ts
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LiveKitService {
  private readonly apiKey = 'nebu-dev';
  private readonly apiSecret = 'nebu-dev-secret-key-2024';
  private readonly livekitUrl = 'http://livekit:7880';

  generateToken(roomName: string, participantName: string): string {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: participantName,
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    return at.toJwt();
  }
}
```

## ️ Comandos Útiles

### Iniciar LiveKit
```bash
# Con todo el stack
make dev

# Solo LiveKit
docker-compose up livekit -d

# Ver logs
docker-compose logs -f livekit
```

### Testing
```bash
# Verificar que LiveKit está corriendo
curl http://localhost:7880/

# Ver estado de las salas
curl http://localhost:7880/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Configuración Avanzada

### Variables de Entorno
Agregar a tu `.env`:

```bash
# LiveKit Configuration
LIVEKIT_API_KEY=nebu-dev
LIVEKIT_SECRET_KEY=nebu-dev-secret-key-2024
LIVEKIT_URL=http://livekit:7880
LIVEKIT_WS_URL=ws://localhost:7880
```

### Webhooks (Opcional)
Para recibir eventos de LiveKit en tu backend:

```yaml
# livekit.yaml
webhook:
  urls:
    - "http://backend:3001/api/v1/livekit/webhook"
  api_key: nebu-dev
```

##  Producción

Para producción, necesitarás:

1. **Certificados SSL**: LiveKit requiere HTTPS en producción
2. **IP Externa**: Configurar `use_external_ip: true`
3. **Credenciales Seguras**: Cambiar API keys
4. **TURN Servers**: Para NAT traversal
5. **Load Balancer**: Para múltiples instancias

### Ejemplo Producción
```yaml
# docker-compose.prod.yml
livekit:
  environment:
    - LIVEKIT_CONFIG=/etc/livekit.prod.yaml
  volumes:
    - ./livekit/livekit.prod.yaml:/etc/livekit.prod.yaml:ro
```

## Casos de Uso en Nebu

1. **Voice Agent**: Comunicación tiempo real con IA
2. **IoT Audio Streaming**: Transmitir audio desde dispositivos
3. **Remote Control**: Control remoto con feedback de audio
4. **Monitoring**: Monitoreo en tiempo real con audio/video
5. **Collaborative Features**: Múltiples usuarios interactuando

##  Troubleshooting

### Problema: No se puede conectar
```bash
# Verificar que el puerto está abierto
netstat -tlnp | grep 7880

# Verificar logs
docker-compose logs livekit
```

### Problema: Audio no funciona
- Verificar permisos de micrófono en la app
- Revisar configuración de codecs de audio
- Verificar firewall para puertos UDP

### Problema: WebRTC no conecta
- Verificar rango de puertos ICE (50000-50200)
- Configurar STUN/TURN servers correctamente
- Revisar configuración de red Docker

---

 **Documentación Oficial**: https://docs.livekit.io/
**SDK React Native**: https://github.com/livekit/client-sdk-react-native
