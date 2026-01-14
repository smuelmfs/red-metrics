const XLSX = require('xlsx');
const path = require('path');

const workbook = XLSX.readFile(path.join(__dirname, '..', 'RED_Objectivos_Minimos_Departamentos_v11_Pronta.xlsx'));

// Analisar abas principais
const mainSheets = ['Depts', 'Catálogo Avenças', 'Avenças', 'Horas Faturáveis – Dept'];

mainSheets.forEach(sheetName => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 ABA: ${sheetName}`);
  console.log('='.repeat(60));
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
  
  // Mostrar primeiras 10 linhas
  console.log(`\nPrimeiras 10 linhas:`);
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i];
    if (row && row.some(cell => cell !== null)) {
      console.log(`Linha ${i + 1}:`, JSON.stringify(row.slice(0, 10)));
    }
  }
  
  // Procurar por células com dados numéricos ou texto relevante
  console.log(`\nLinhas com dados (primeiras 20 linhas não vazias):`);
  let count = 0;
  for (let i = 0; i < data.length && count < 20; i++) {
    const row = data[i];
    if (row && row.some(cell => {
      if (cell === null) return false;
      const str = cell.toString().trim();
      return str.length > 0 && !str.match(/^(null|undefined)$/i);
    })) {
      console.log(`Linha ${i + 1}:`, row.slice(0, 8).map(c => c !== null ? c.toString().substring(0, 30) : 'null').join(' | '));
      count++;
    }
  }
});

