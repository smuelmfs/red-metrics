const XLSX = require('xlsx');
const path = require('path');

// Ler a planilha Excel
const workbook = XLSX.readFile(path.join(__dirname, '..', 'RED_Objectivos_Minimos_Departamentos_v11_Pronta.xlsx'));

console.log('📊 Abas encontradas:', workbook.SheetNames);
console.log('\n');

// Analisar cada aba
workbook.SheetNames.forEach(sheetName => {
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
  
  console.log(`\n=== ${sheetName} ===`);
  console.log(`Total de linhas: ${data.length}`);
  
  if (data.length > 0) {
    console.log('Primeiras 3 linhas:');
    data.slice(0, 3).forEach((row, idx) => {
      console.log(`  Linha ${idx + 1}:`, row);
    });
  }
});

