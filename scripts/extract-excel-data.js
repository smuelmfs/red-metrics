const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ler a planilha Excel
const workbook = XLSX.readFile(path.join(__dirname, '..', 'RED_Objectivos_Minimos_Departamentos_v11_Pronta.xlsx'));

const extractedData = {
  departments: [],
  plannedHours: [],
  objectives: [],
  retainers: [],
  retainerCatalog: [],
  globalSettings: []
};

// 1. Extrair Departamentos (aba "Depts")
console.log('📋 Extraindo Departamentos...');
const deptsSheet = workbook.Sheets['Depts'];
const deptsData = XLSX.utils.sheet_to_json(deptsSheet, { header: 1, defval: null });

// Encontrar linha de cabeçalho (geralmente linha 3 ou 4)
let headerRow = 0;
for (let i = 0; i < Math.min(10, deptsData.length); i++) {
  if (deptsData[i] && deptsData[i][0] && deptsData[i][0].toString().toLowerCase().includes('departamento')) {
    headerRow = i;
    break;
  }
}

// Procurar por "Nome" ou "Departamento" na primeira coluna
for (let i = 3; i < deptsData.length; i++) {
  const row = deptsData[i];
  if (!row || !row[0] || typeof row[0] !== 'string') continue;
  
  const name = row[0].toString().trim();
  if (!name || name.length < 2) continue;
  
  // Tentar extrair dados (assumindo estrutura: Nome, Código, HC, Taxa, etc.)
  const code = row[1] ? row[1].toString().trim() : null;
  const hc = row[2] ? parseFloat(row[2]) : null;
  const rate = row[3] ? parseFloat(row[3]) : null;
  const utilization = row[4] ? parseFloat(row[4]) : 0.65;
  
  if (name && hc && rate) {
    extractedData.departments.push({
      name,
      code: code || null,
      billableHeadcount: Math.round(hc),
      averageHourlyRate: rate,
      targetUtilization: utilization || 0.65
    });
  }
}
console.log(`✅ ${extractedData.departments.length} departamentos encontrados`);

// 2. Extrair Catálogo de Avenças (aba "Catálogo Avenças")
console.log('\n📋 Extraindo Catálogo de Avenças...');
const catalogSheet = workbook.Sheets['Catálogo Avenças'];
const catalogData = XLSX.utils.sheet_to_json(catalogSheet, { header: 1, defval: null });

// Linha 3 parece ser o cabeçalho
for (let i = 4; i < catalogData.length; i++) {
  const row = catalogData[i];
  if (!row || !row[0]) continue;
  
  const name = row[0] ? row[0].toString().trim() : null;
  const deptName = row[1] ? row[1].toString().trim() : null;
  const monthlyPrice = row[2] ? parseFloat(row[2]) : null;
  const hoursPerMonth = row[3] ? parseFloat(row[3]) : null;
  
  if (name && deptName && monthlyPrice && hoursPerMonth) {
    extractedData.retainerCatalog.push({
      name,
      departmentName: deptName,
      monthlyPrice,
      hoursPerMonth,
      internalHourlyCost: row[4] ? parseFloat(row[4]) : null,
      monthlyCost: row[5] ? parseFloat(row[5]) : null,
      monthlyMargin: row[6] ? parseFloat(row[6]) : null,
      marginPercentage: row[7] ? parseFloat(row[7]) : null
    });
  }
}
console.log(`✅ ${extractedData.retainerCatalog.length} itens do catálogo encontrados`);

// 3. Extrair Avenças Ativas (aba "Avenças")
console.log('\n📋 Extraindo Avenças Ativas...');
const retainersSheet = workbook.Sheets['Avenças'];
const retainersData = XLSX.utils.sheet_to_json(retainersSheet, { header: 1, defval: null });

// Procurar dados a partir da linha 4
for (let i = 4; i < retainersData.length; i++) {
  const row = retainersData[i];
  if (!row || !row[0]) continue;
  
  const name = row[0] ? row[0].toString().trim() : null;
  const catalogName = row[1] ? row[1].toString().trim() : null;
  const deptName = row[2] ? row[2].toString().trim() : null;
  const monthlyPrice = row[3] ? parseFloat(row[3]) : null;
  const quantity = row[4] ? parseInt(row[4]) : 1;
  
  if (name && deptName && monthlyPrice) {
    extractedData.retainers.push({
      name,
      catalogName: catalogName || null,
      departmentName: deptName,
      monthlyPrice,
      quantity,
      hoursPerMonth: row[5] ? parseFloat(row[5]) : null,
      startDate: new Date().toISOString().split('T')[0] // Data atual como padrão
    });
  }
}
console.log(`✅ ${extractedData.retainers.length} avenças encontradas`);

// 4. Extrair Horas Planejadas (aba "Horas Faturáveis – Dept")
console.log('\n📋 Extraindo Horas Planejadas...');
const hoursSheet = workbook.Sheets['Horas Faturáveis – Dept'];
const hoursData = XLSX.utils.sheet_to_json(hoursSheet, { header: 1, defval: null });

// Procurar cabeçalho com "Mês" ou "Departamento"
let hoursHeaderRow = 0;
for (let i = 3; i < Math.min(10, hoursData.length); i++) {
  if (hoursData[i] && hoursData[i][0] && 
      (hoursData[i][0].toString().toLowerCase().includes('mês') || 
       hoursData[i][0].toString().toLowerCase().includes('departamento'))) {
    hoursHeaderRow = i;
    break;
  }
}

for (let i = hoursHeaderRow + 1; i < hoursData.length; i++) {
  const row = hoursData[i];
  if (!row || !row[0]) continue;
  
  const monthStr = row[0] ? row[0].toString().trim() : null;
  const deptName = row[1] ? row[1].toString().trim() : null;
  const hc = row[2] ? parseFloat(row[2]) : null;
  const actualHours = row[3] ? parseFloat(row[3]) : null;
  const projectRevenue = row[4] ? parseFloat(row[4]) : null;
  
  if (monthStr && deptName) {
    // Tentar parsear data (formato pode ser "2024-01" ou "Jan/2024")
    let month, year;
    if (monthStr.includes('-')) {
      const parts = monthStr.split('-');
      year = parseInt(parts[0]);
      month = parseInt(parts[1]);
    } else if (monthStr.includes('/')) {
      const parts = monthStr.split('/');
      month = parseInt(parts[0]);
      year = parseInt(parts[1]);
    }
    
    if (month && year && deptName) {
      extractedData.plannedHours.push({
        departmentName: deptName,
        month,
        year,
        billableHeadcount: hc ? Math.round(hc) : null,
        actualBillableHours: actualHours || null,
        projectRevenue: projectRevenue || null
      });
    }
  }
}
console.log(`✅ ${extractedData.plannedHours.length} registros de horas encontrados`);

// Salvar dados extraídos em JSON
const outputPath = path.join(__dirname, '..', 'extracted-data.json');
fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2));
console.log(`\n💾 Dados extraídos salvos em: ${outputPath}`);

// Mostrar resumo
console.log('\n📊 RESUMO DOS DADOS EXTRAÍDOS:');
console.log(`- Departamentos: ${extractedData.departments.length}`);
console.log(`- Catálogo Avenças: ${extractedData.retainerCatalog.length}`);
console.log(`- Avenças Ativas: ${extractedData.retainers.length}`);
console.log(`- Horas Planejadas: ${extractedData.plannedHours.length}`);

