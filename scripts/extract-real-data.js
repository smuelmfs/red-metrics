const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ler a planilha Excel real
const workbook = XLSX.readFile(path.join(__dirname, '..', 'RED_Objectivos_Minimos_Departamentos_v11_Pronta.xlsx'));

const extractedData = {
  departments: [],
  retainerCatalog: [],
  retainers: [],
  plannedHours: [],
  globalSettings: [],
  fixedCosts: []
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

// 4. HORAS PLANEJADAS (aba "Horas Faturáveis – Dept")
console.log('\n📋 Extraindo Horas Planejadas...');
const hoursSheet = workbook.Sheets['Horas Faturáveis – Dept'];
if (hoursSheet) {
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
} else {
  console.log('⚠️  Aba "Horas Faturáveis – Dept" não encontrada na planilha');
}

// 5. CONFIGURAÇÕES GLOBAIS E CUSTOS FIXOS (aba "Inputs")
console.log('\n📋 Extraindo Configurações Globais e Custos Fixos...');
const inputsSheet = workbook.Sheets['Inputs'];
if (inputsSheet) {
  const inputsData = XLSX.utils.sheet_to_json(inputsSheet, { header: 1, defval: null });

  const settingsMap = {};

  // Procurar configurações nas primeiras linhas (normalmente no topo da aba)
  for (let i = 0; i < Math.min(40, inputsData.length); i++) {
    const row = inputsData[i];
    if (!row) continue;

    const label = (row[0] || '').toString().toLowerCase();
    const rawValue = row[1] != null ? row[1] : row[2];
    if (rawValue == null) continue;
    const value = rawValue.toString().trim();
    if (!value) continue;

    if (label.includes('margem') && label.includes('alvo')) {
      settingsMap.targetMargin = value;
    } else if (label.includes('horas') && label.includes('mês')) {
      settingsMap.hoursPerMonth = value;
    } else if (label.includes('utiliza')) {
      settingsMap.targetUtilization = value;
    } else if (label.includes('custo') && label.includes('pessoa')) {
      settingsMap.costPerPersonPerMonth = value;
    } else if (label.includes('overhead') || label.includes('não fatur') || label.includes('nao fatur')) {
      settingsMap.overheadPeople = value;
    }
  }

  Object.entries(settingsMap).forEach(([key, value]) => {
    extractedData.globalSettings.push({
      key,
      value: String(value),
      description: null
    });
  });

  console.log(`✅ ${extractedData.globalSettings.length} configurações globais encontradas`);

  // Procurar tabela de custos fixos (colunas com Nome/Descrição, Categoria, Valor)
  let headerRowIndex = -1;
  for (let i = 0; i < inputsData.length; i++) {
    const row = inputsData[i];
    if (!row) continue;
    const lower = row.map(c => (c ? c.toString().toLowerCase() : ''));

    if (
      lower.some(c => c.includes('custo') || c.includes('descrição') || c.includes('descricao') || c.includes('nome')) &&
      lower.some(c => c.includes('categoria')) &&
      lower.some(c => c.includes('valor') || c.includes('mensal'))
    ) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex !== -1) {
    const header = inputsData[headerRowIndex].map(c => (c ? c.toString().toLowerCase() : ''));
    const nameIdx = header.findIndex(c => c.includes('nome') || c.includes('custo') || c.includes('descrição') || c.includes('descricao'));
    const categoryIdx = header.findIndex(c => c.includes('categoria'));
    const amountIdx = header.findIndex(c => c.includes('valor') || c.includes('mensal'));
    const startIdx = header.findIndex(c => c.includes('início') || c.includes('inicio') || c.includes('start'));
    const endIdx = header.findIndex(c => c.includes('término') || c.includes('termino') || c.includes('fim') || c.includes('end'));

    for (let i = headerRowIndex + 1; i < inputsData.length; i++) {
      const row = inputsData[i];
      if (!row) continue;

      const name = nameIdx >= 0 && row[nameIdx] ? row[nameIdx].toString().trim() : null;
      if (!name || name.toLowerCase().includes('total')) continue;

      const rawCategory = categoryIdx >= 0 && row[categoryIdx] ? row[categoryIdx].toString().trim() : null;
      let category = rawCategory || 'Outros';

      // Normalizar categorias para os valores esperados no domínio
      const catLower = category.toLowerCase();
      if (catLower.includes('aluguel') || catLower.includes('renda') || catLower.includes('rento')) {
        category = 'Aluguel';
      } else if (catLower.includes('utilidade') || catLower.includes('luz') || catLower.includes('água') || catLower.includes('agua') || catLower.includes('internet')) {
        category = 'Utilidades';
      } else if (catLower.includes('software') || catLower.includes('licen')) {
        category = 'Software';
      } else if (catLower.includes('viatura') || catLower.includes('carro')) {
        category = 'Viaturas';
      } else {
        category = 'Outros';
      }

      const amountVal = amountIdx >= 0 && row[amountIdx] ? parseFloat(row[amountIdx]) : null;
      if (!amountVal || isNaN(amountVal)) continue;

      const description = null;
      const todayIso = new Date().toISOString().split('T')[0];
      const startDate = startIdx >= 0 && row[startIdx]
        ? new Date(row[startIdx]).toISOString().split('T')[0]
        : todayIso;
      const endDate = endIdx >= 0 && row[endIdx]
        ? new Date(row[endIdx]).toISOString().split('T')[0]
        : null;

      extractedData.fixedCosts.push({
        name,
        category,
        monthlyAmount: amountVal,
        description,
        startDate,
        endDate
      });
    }
  }

  console.log(`✅ ${extractedData.fixedCosts.length} custos fixos encontrados`);
} else {
  console.log('⚠️  Aba "Inputs" não encontrada na planilha');
}

// Salvar dados extraídos
const outputPath = path.join(__dirname, '..', 'extracted-data.json');
fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2));
console.log(`\n💾 Dados extraídos salvos em: ${outputPath}`);

// Resumo final
console.log('\n📊 RESUMO FINAL:');
console.log(`- Departamentos: ${extractedData.departments.length}`);
console.log(`- Catálogo Avenças: ${extractedData.retainerCatalog.length}`);
console.log(`- Avenças Ativas: ${extractedData.retainers.length}`);
console.log(`- Horas Planejadas: ${extractedData.plannedHours.length}`);
console.log(`- Configurações Globais: ${extractedData.globalSettings.length}`);
console.log(`- Custos Fixos: ${extractedData.fixedCosts.length}`);

