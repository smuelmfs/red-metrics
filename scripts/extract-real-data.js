const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const workbook = XLSX.readFile(path.join(__dirname, '..', 'RED_Objectivos_Minimos_Departamentos_v11_Pronta.xlsx'));

const extractedData = {
  departments: [],
  retainerCatalog: [],
  retainers: [],
  plannedHours: []
};

// 1. DEPARTAMENTOS (aba "Depts")
console.log('📋 Extraindo Departamentos...');
const deptsSheet = workbook.Sheets['Depts'];
const deptsData = XLSX.utils.sheet_to_json(deptsSheet, { header: 1, defval: null });

// Linha 4 é o cabeçalho, dados começam na linha 5 (índice 4)
for (let i = 4; i < deptsData.length; i++) {
  const row = deptsData[i];
  if (!row || !row[0]) continue;
  
  const name = row[0] ? row[0].toString().trim() : null;
  if (!name || name === 'TOTAL' || name.length < 2) continue;
  
  const hc = row[1] ? parseFloat(row[1]) : null;
  const costPerPerson = row[2] ? parseFloat(row[2]) : null;
  const utilization = row[3] ? parseFloat(row[3]) : null;
  const hourlyRate = row[4] ? parseFloat(row[4]) : null;
  
  // Só adicionar se tiver nome e pelo menos HC ou taxa
  if (name && (hc !== null || hourlyRate !== null)) {
    extractedData.departments.push({
      name,
      billableHeadcount: hc ? Math.round(hc) : 0,
      costPerPersonPerMonth: costPerPerson || null,
      targetUtilization: utilization || 0.65,
      averageHourlyRate: hourlyRate || 0
    });
  }
}
console.log(`✅ ${extractedData.departments.length} departamentos encontrados`);
extractedData.departments.forEach(d => console.log(`   - ${d.name} (HC: ${d.billableHeadcount}, Taxa: €${d.averageHourlyRate}/h)`));

// 2. CATÁLOGO DE AVENÇAS (aba "Catálogo Avenças")
console.log('\n📋 Extraindo Catálogo de Avenças...');
const catalogSheet = workbook.Sheets['Catálogo Avenças'];
const catalogData = XLSX.utils.sheet_to_json(catalogSheet, { header: 1, defval: null });

// Linha 3 é o cabeçalho, dados começam na linha 4 (índice 3)
for (let i = 3; i < catalogData.length; i++) {
  const row = catalogData[i];
  if (!row || !row[0]) continue;
  
  const name = row[0] ? row[0].toString().trim() : null;
  if (!name || name.length < 2) continue;
  
  const deptName = row[1] ? row[1].toString().trim() : null;
  const monthlyPrice = row[2] ? parseFloat(row[2]) : null;
  const hoursPerMonth = row[3] ? parseFloat(row[3]) : null;
  const baseHours = row[8] ? parseFloat(row[8]) : null;
  const basePrice = row[9] ? parseFloat(row[9]) : null;
  
  // Usar preço base se mensal não estiver disponível
  const finalPrice = monthlyPrice || basePrice;
  
  if (name && deptName && (finalPrice || hoursPerMonth)) {
    extractedData.retainerCatalog.push({
      name,
      departmentName: deptName,
      monthlyPrice: finalPrice || null,
      hoursPerMonth: hoursPerMonth || null,
      baseHours: baseHours || hoursPerMonth || null,
      basePrice: basePrice || finalPrice || null
    });
  }
}
console.log(`✅ ${extractedData.retainerCatalog.length} itens do catálogo encontrados`);
extractedData.retainerCatalog.forEach(c => console.log(`   - ${c.name} (${c.departmentName}): €${c.monthlyPrice || c.basePrice || 'N/A'}/mês, ${c.hoursPerMonth || c.baseHours || 'N/A'}h`));

// 3. AVENÇAS ATIVAS (aba "Avenças")
console.log('\n📋 Extraindo Avenças Ativas...');
const retainersSheet = workbook.Sheets['Avenças'];
const retainersData = XLSX.utils.sheet_to_json(retainersSheet, { header: 1, defval: null });

// Linha 5 é o cabeçalho, dados começam na linha 6 (índice 5)
for (let i = 5; i < retainersData.length; i++) {
  const row = retainersData[i];
  if (!row || !row[0]) continue;
  
  const deptName = row[0] ? row[0].toString().trim() : null;
  if (!deptName || deptName.includes('TOTAL') || deptName.includes('Totais')) continue;
  
  const catalogName = row[1] ? row[1].toString().trim() : null;
  const monthlyPrice = row[2] ? parseFloat(row[2]) : null;
  const quantity = row[3] ? parseFloat(row[3]) : null;
  const notes = row[5] ? row[5].toString().trim() : null;
  
  // Só adicionar se tiver quantidade > 0 ou se tiver preço definido
  if (deptName && catalogName && (quantity > 0 || monthlyPrice)) {
    extractedData.retainers.push({
      name: catalogName + (notes ? ` - ${notes}` : ''),
      catalogName: catalogName,
      departmentName: deptName,
      monthlyPrice: monthlyPrice || null,
      quantity: quantity ? Math.round(quantity) : 1,
      notes: notes || null
    });
  }
}
console.log(`✅ ${extractedData.retainers.length} avenças ativas encontradas`);
extractedData.retainers.forEach(r => console.log(`   - ${r.name} (${r.departmentName}): ${r.quantity}x €${r.monthlyPrice || 'N/A'}/mês`));

// Salvar dados extraídos
const outputPath = path.join(__dirname, '..', 'extracted-data.json');
fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2));
console.log(`\n💾 Dados extraídos salvos em: ${outputPath}`);

// Resumo final
console.log('\n📊 RESUMO FINAL:');
console.log(`- Departamentos: ${extractedData.departments.length}`);
console.log(`- Catálogo Avenças: ${extractedData.retainerCatalog.length}`);
console.log(`- Avenças Ativas: ${extractedData.retainers.length}`);

