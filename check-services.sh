#!/bin/bash
echo "=== VERIFICACIÓN DE SERVICIOS Y URLS ===" > services-report.txt
echo "Fecha: $(date)" >> services-report.txt
echo "" >> services-report.txt

echo "1. Estado de contenedores:" >> services-report.txt
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" >> services-report.txt
echo "" >> services-report.txt

echo "2. Testing URLs principales:" >> services-report.txt

echo "    Backend Health:" >> services-report.txt
curl -s -o /dev/null -w "   Status: %{http_code} - %{url_effective}\n" http://localhost:3001/api/v1/health >> services-report.txt 2>&1

echo "   📚 Swagger UI:" >> services-report.txt
curl -s -o /dev/null -w "   Status: %{http_code} - %{url_effective}\n" http://localhost:3001/api/docs >> services-report.txt 2>&1

echo "   🎙️ LiveKit:" >> services-report.txt
curl -s -o /dev/null -w "   Status: %{http_code} - %{url_effective}\n" http://localhost:7880/ >> services-report.txt 2>&1

echo "    Traefik:" >> services-report.txt
curl -s -o /dev/null -w "   Status: %{http_code} - %{url_effective}\n" http://localhost:8080/ping >> services-report.txt 2>&1

echo "" >> services-report.txt
echo "3. URLs disponibles:" >> services-report.txt
echo "    Backend API: http://localhost:3001" >> services-report.txt
echo "   📚 Swagger UI: http://localhost:3001/api/docs" >> services-report.txt
echo "   🔍 API Health: http://localhost:3001/api/v1/health" >> services-report.txt
echo "   🎙️ LiveKit: http://localhost:7880" >> services-report.txt
echo "    Traefik: http://localhost:8080" >> services-report.txt
echo "" >> services-report.txt

echo "4. Logs recientes del backend:" >> services-report.txt
docker logs nebu-mobile-backend --tail=5 >> services-report.txt 2>&1

echo "VERIFICACIÓN COMPLETADA"
