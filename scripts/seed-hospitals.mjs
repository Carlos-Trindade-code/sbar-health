// Script para popular o banco com hospitais pré-cadastrados do Brasil
// Execute com: node scripts/seed-hospitals.mjs

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL não configurada');
  process.exit(1);
}

// Redes Hospitalares do Brasil
const hospitalNetworks = [
  // Privadas
  { name: 'Rede D\'Or São Luiz', code: 'REDOR', type: 'private', isPreRegistered: true },
  { name: 'Hospital Albert Einstein', code: 'EINSTEIN', type: 'private', isPreRegistered: true },
  { name: 'Hospital Sírio-Libanês', code: 'SIRIO', type: 'private', isPreRegistered: true },
  { name: 'Rede Mater Dei', code: 'MATERDEI', type: 'private', isPreRegistered: true },
  { name: 'Rede Hapvida NotreDame Intermédica', code: 'HAPVIDA', type: 'private', isPreRegistered: true },
  { name: 'Hospital Oswaldo Cruz', code: 'OSWALDOCRUZ', type: 'private', isPreRegistered: true },
  { name: 'Hospital Samaritano', code: 'SAMARITANO', type: 'private', isPreRegistered: true },
  { name: 'Hospital Moinhos de Vento', code: 'MOINHOS', type: 'private', isPreRegistered: true },
  { name: 'Hospital Copa Star', code: 'COPASTAR', type: 'private', isPreRegistered: true },
  { name: 'Rede Unimed', code: 'UNIMED', type: 'private', isPreRegistered: true },
  { name: 'Hospital Beneficência Portuguesa', code: 'BP', type: 'private', isPreRegistered: true },
  { name: 'Hospital Santa Catarina', code: 'SANTACATARINA', type: 'private', isPreRegistered: true },
  { name: 'Hospital São Camilo', code: 'SAOCAMILO', type: 'private', isPreRegistered: true },
  { name: 'Hospital Nove de Julho', code: 'NOVEDEJULHO', type: 'private', isPreRegistered: true },
  
  // Públicas
  { name: 'Hospital das Clínicas - USP', code: 'HCUSP', type: 'university', isPreRegistered: true },
  { name: 'Hospital das Clínicas - UFMG', code: 'HCUFMG', type: 'university', isPreRegistered: true },
  { name: 'Hospital das Clínicas - UFRJ', code: 'HCUFRJ', type: 'university', isPreRegistered: true },
  { name: 'Hospital das Clínicas - UFPE', code: 'HCUFPE', type: 'university', isPreRegistered: true },
  { name: 'Hospital das Clínicas - UFBA', code: 'HCUFBA', type: 'university', isPreRegistered: true },
  { name: 'Hospital das Clínicas - UNICAMP', code: 'HCUNICAMP', type: 'university', isPreRegistered: true },
  { name: 'Hospital Universitário - UFSC', code: 'HUUFSC', type: 'university', isPreRegistered: true },
  { name: 'Hospital de Base - DF', code: 'HBDF', type: 'public', isPreRegistered: true },
  { name: 'Santa Casa de Misericórdia', code: 'SANTACASA', type: 'mixed', isPreRegistered: true },
  { name: 'Hospital Municipal', code: 'MUNICIPAL', type: 'public', isPreRegistered: true },
  { name: 'UPA 24h', code: 'UPA', type: 'public', isPreRegistered: true },
];

// Unidades Hospitalares (exemplos por rede)
const hospitalUnits = [
  // Mater Dei - MG
  { networkCode: 'MATERDEI', name: 'Mater Dei Contorno', code: 'MATERDEI-CONTORNO', city: 'Belo Horizonte', state: 'MG', neighborhood: 'Funcionários', type: 'private', bedsTotal: 400, bedsIcu: 60 },
  { networkCode: 'MATERDEI', name: 'Mater Dei Santo Agostinho', code: 'MATERDEI-STOAGOSTINHO', city: 'Belo Horizonte', state: 'MG', neighborhood: 'Santo Agostinho', type: 'private', bedsTotal: 300, bedsIcu: 45 },
  { networkCode: 'MATERDEI', name: 'Mater Dei Betim', code: 'MATERDEI-BETIM', city: 'Betim', state: 'MG', neighborhood: 'Centro', type: 'private', bedsTotal: 200, bedsIcu: 30 },
  { networkCode: 'MATERDEI', name: 'Mater Dei Salvador', code: 'MATERDEI-SALVADOR', city: 'Salvador', state: 'BA', neighborhood: 'Itaigara', type: 'private', bedsTotal: 250, bedsIcu: 40 },
  
  // Einstein - SP
  { networkCode: 'EINSTEIN', name: 'Hospital Israelita Albert Einstein - Morumbi', code: 'EINSTEIN-MORUMBI', city: 'São Paulo', state: 'SP', neighborhood: 'Morumbi', type: 'private', bedsTotal: 650, bedsIcu: 120 },
  { networkCode: 'EINSTEIN', name: 'Hospital Albert Einstein - Perdizes', code: 'EINSTEIN-PERDIZES', city: 'São Paulo', state: 'SP', neighborhood: 'Perdizes', type: 'private', bedsTotal: 150, bedsIcu: 25 },
  { networkCode: 'EINSTEIN', name: 'Hospital Albert Einstein - Goiânia', code: 'EINSTEIN-GOIANIA', city: 'Goiânia', state: 'GO', neighborhood: 'Setor Bueno', type: 'private', bedsTotal: 200, bedsIcu: 35 },
  
  // Sírio-Libanês - SP
  { networkCode: 'SIRIO', name: 'Hospital Sírio-Libanês - Bela Vista', code: 'SIRIO-BELAVISTA', city: 'São Paulo', state: 'SP', neighborhood: 'Bela Vista', type: 'private', bedsTotal: 500, bedsIcu: 100 },
  { networkCode: 'SIRIO', name: 'Hospital Sírio-Libanês - Itaim', code: 'SIRIO-ITAIM', city: 'São Paulo', state: 'SP', neighborhood: 'Itaim Bibi', type: 'private', bedsTotal: 200, bedsIcu: 40 },
  { networkCode: 'SIRIO', name: 'Hospital Sírio-Libanês - Brasília', code: 'SIRIO-BRASILIA', city: 'Brasília', state: 'DF', neighborhood: 'Asa Sul', type: 'private', bedsTotal: 300, bedsIcu: 60 },
  
  // Rede D'Or - RJ/SP
  { networkCode: 'REDOR', name: 'Hospital Copa D\'Or', code: 'REDOR-COPA', city: 'Rio de Janeiro', state: 'RJ', neighborhood: 'Copacabana', type: 'private', bedsTotal: 350, bedsIcu: 70 },
  { networkCode: 'REDOR', name: 'Hospital Barra D\'Or', code: 'REDOR-BARRA', city: 'Rio de Janeiro', state: 'RJ', neighborhood: 'Barra da Tijuca', type: 'private', bedsTotal: 400, bedsIcu: 80 },
  { networkCode: 'REDOR', name: 'Hospital São Luiz - Morumbi', code: 'REDOR-SAOLUIZ-MORUMBI', city: 'São Paulo', state: 'SP', neighborhood: 'Morumbi', type: 'private', bedsTotal: 300, bedsIcu: 55 },
  { networkCode: 'REDOR', name: 'Hospital São Luiz - Itaim', code: 'REDOR-SAOLUIZ-ITAIM', city: 'São Paulo', state: 'SP', neighborhood: 'Itaim Bibi', type: 'private', bedsTotal: 250, bedsIcu: 45 },
  { networkCode: 'REDOR', name: 'Hospital São Luiz - Anália Franco', code: 'REDOR-SAOLUIZ-ANALIA', city: 'São Paulo', state: 'SP', neighborhood: 'Anália Franco', type: 'private', bedsTotal: 200, bedsIcu: 35 },
  
  // HC USP
  { networkCode: 'HCUSP', name: 'Hospital das Clínicas - FMUSP', code: 'HCFMUSP', city: 'São Paulo', state: 'SP', neighborhood: 'Cerqueira César', type: 'public', bedsTotal: 2200, bedsIcu: 300 },
  { networkCode: 'HCUSP', name: 'Instituto do Coração - InCor', code: 'INCOR', city: 'São Paulo', state: 'SP', neighborhood: 'Cerqueira César', type: 'public', bedsTotal: 500, bedsIcu: 100 },
  { networkCode: 'HCUSP', name: 'Instituto do Câncer - ICESP', code: 'ICESP', city: 'São Paulo', state: 'SP', neighborhood: 'Cerqueira César', type: 'public', bedsTotal: 400, bedsIcu: 60 },
  { networkCode: 'HCUSP', name: 'Hospital das Clínicas - Ribeirão Preto', code: 'HCRP', city: 'Ribeirão Preto', state: 'SP', neighborhood: 'Monte Alegre', type: 'public', bedsTotal: 800, bedsIcu: 120 },
  
  // HC UFMG
  { networkCode: 'HCUFMG', name: 'Hospital das Clínicas - UFMG', code: 'HCUFMG-CENTRAL', city: 'Belo Horizonte', state: 'MG', neighborhood: 'Santa Efigênia', type: 'public', bedsTotal: 500, bedsIcu: 80 },
  
  // Beneficência Portuguesa - SP
  { networkCode: 'BP', name: 'Hospital Beneficência Portuguesa', code: 'BP-CENTRAL', city: 'São Paulo', state: 'SP', neighborhood: 'Bela Vista', type: 'private', bedsTotal: 800, bedsIcu: 150 },
  
  // Moinhos de Vento - RS
  { networkCode: 'MOINHOS', name: 'Hospital Moinhos de Vento', code: 'MOINHOS-POA', city: 'Porto Alegre', state: 'RS', neighborhood: 'Moinhos de Vento', type: 'private', bedsTotal: 400, bedsIcu: 80 },
  
  // Santa Casa
  { networkCode: 'SANTACASA', name: 'Santa Casa de São Paulo', code: 'SANTACASA-SP', city: 'São Paulo', state: 'SP', neighborhood: 'Centro', type: 'mixed', bedsTotal: 1000, bedsIcu: 150 },
  { networkCode: 'SANTACASA', name: 'Santa Casa de Belo Horizonte', code: 'SANTACASA-BH', city: 'Belo Horizonte', state: 'MG', neighborhood: 'Centro', type: 'mixed', bedsTotal: 600, bedsIcu: 90 },
  { networkCode: 'SANTACASA', name: 'Santa Casa de Porto Alegre', code: 'SANTACASA-POA', city: 'Porto Alegre', state: 'RS', neighborhood: 'Centro Histórico', type: 'mixed', bedsTotal: 700, bedsIcu: 100 },
  { networkCode: 'SANTACASA', name: 'Santa Casa do Rio de Janeiro', code: 'SANTACASA-RJ', city: 'Rio de Janeiro', state: 'RJ', neighborhood: 'Centro', type: 'mixed', bedsTotal: 500, bedsIcu: 70 },
];

async function seedHospitals() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    console.log('🏥 Iniciando seed de hospitais pré-cadastrados...\n');
    
    // Inserir redes hospitalares
    console.log('📋 Inserindo redes hospitalares...');
    for (const network of hospitalNetworks) {
      try {
        await connection.execute(
          `INSERT INTO hospital_networks (name, code, type, isPreRegistered, active) 
           VALUES (?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [network.name, network.code, network.type, network.isPreRegistered, true]
        );
        console.log(`  ✓ ${network.name}`);
      } catch (err) {
        console.log(`  ⚠ ${network.name} (já existe ou erro: ${err.message})`);
      }
    }
    
    // Buscar IDs das redes
    const [networks] = await connection.execute('SELECT id, code FROM hospital_networks');
    const networkMap = new Map(networks.map(n => [n.code, n.id]));
    
    // Inserir unidades hospitalares
    console.log('\n🏨 Inserindo unidades hospitalares...');
    for (const unit of hospitalUnits) {
      const networkId = networkMap.get(unit.networkCode);
      try {
        await connection.execute(
          `INSERT INTO hospitals (networkId, name, code, city, state, neighborhood, type, bedsTotal, bedsIcu, isPreRegistered, active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [networkId, unit.name, unit.code, unit.city, unit.state, unit.neighborhood, unit.type, unit.bedsTotal, unit.bedsIcu, true, true]
        );
        console.log(`  ✓ ${unit.name} (${unit.city}/${unit.state})`);
      } catch (err) {
        console.log(`  ⚠ ${unit.name} (já existe ou erro: ${err.message})`);
      }
    }
    
    // Estatísticas finais
    const [networkCount] = await connection.execute('SELECT COUNT(*) as count FROM hospital_networks WHERE isPreRegistered = 1');
    const [hospitalCount] = await connection.execute('SELECT COUNT(*) as count FROM hospitals WHERE isPreRegistered = 1');
    
    console.log('\n✅ Seed concluído!');
    console.log(`   ${networkCount[0].count} redes hospitalares`);
    console.log(`   ${hospitalCount[0].count} unidades hospitalares`);
    
  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedHospitals().catch(console.error);
