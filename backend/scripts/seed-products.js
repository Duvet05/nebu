const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  user: process.env.DATABASE_USERNAME || 'nebu',
  password: process.env.DATABASE_PASSWORD || 'nebu123',
  database: process.env.DATABASE_NAME || 'nebu_db',
});

async function seed() {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Verificar productos existentes
    const countResult = await client.query('SELECT COUNT(*) FROM product_catalog');
    const existingCount = parseInt(countResult.rows[0].count);
    
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} productos, saltando seed`);
      await client.end();
      process.exit(0);
    }
    
    // Leer CSV
    const csvPath = __dirname + '/products-seed.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    console.log(`📊 CSV encontrado con ${lines.length - 1} productos`);
    console.log('💾 Insertando productos...');
    
    let inserted = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Parse CSV line (manejo simple de comillas)
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current);
      
      // Mapear valores
      const slug = values[0];
      const name = values[1];
      const concept = values[2];
      const originalCharacter = values[3] === 'true';
      const description = values[4];
      const price = parseFloat(values[5]);
      const depositAmount = parseFloat(values[6]);
      const inStock = values[7] === 'true';
      const preOrder = values[8] === 'true';
      const images = values[9] || '[]';
      const colors = values[10] || '[]';
      const features = values[11] || '[]';
      const category = values[12];
      const badge = values[13];
      const active = values[14] === 'true';
      
      // Insertar producto (usando comillas dobles para columnas camelCase)
      await client.query(`
        INSERT INTO product_catalog (
          slug, name, concept, "originalCharacter", description,
          price, "depositAmount", "inStock", "preOrder",
          images, colors, features, category, badge, active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        slug, name, concept, originalCharacter, description,
        price, depositAmount, inStock, preOrder,
        images, colors, features, category, badge, active
      ]);
      
      inserted++;
    }
    
    console.log(`✅ Seed completado: ${inserted} productos insertados`);
    await client.end();
    process.exit(0);
    
  } catch (error) {
    console.error(`❌ Error durante el seed: ${error.message}`);
    await client.end();
    process.exit(1);
  }
}

seed();
