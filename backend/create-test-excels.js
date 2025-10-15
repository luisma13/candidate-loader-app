const XLSX = require('xlsx');

// 1. ✅ Excel CORRECTO - cumple todas las validaciones
const validData = [
  {
    'seniority': 'senior',
    'years': 5,
    'availability': true
  }
];

const validWorkbook = XLSX.utils.book_new();
const validWorksheet = XLSX.utils.json_to_sheet(validData);
XLSX.utils.book_append_sheet(validWorkbook, validWorksheet, 'Sheet1');
XLSX.writeFile(validWorkbook, 'test-valid-candidate.xlsx');
console.log('✅ Created: test-valid-candidate.xlsx');
console.log('   - Seniority: senior');
console.log('   - Years: 5');
console.log('   - Availability: true\n');

// 2. ✅ Excel CORRECTO - junior con disponibilidad false
const validJuniorData = [
  {
    'seniority': 'junior',
    'years': 2,
    'availability': false
  }
];

const validJuniorWorkbook = XLSX.utils.book_new();
const validJuniorWorksheet = XLSX.utils.json_to_sheet(validJuniorData);
XLSX.utils.book_append_sheet(validJuniorWorkbook, validJuniorWorksheet, 'Sheet1');
XLSX.writeFile(validJuniorWorkbook, 'test-valid-junior.xlsx');
console.log('✅ Created: test-valid-junior.xlsx');
console.log('   - Seniority: junior');
console.log('   - Years: 2');
console.log('   - Availability: false\n');

// 3. ❌ Excel con DOS FILAS - debe tener solo una
const twoRowsData = [
  {
    'seniority': 'senior',
    'years': 5,
    'availability': true
  },
  {
    'seniority': 'junior',
    'years': 2,
    'availability': false
  }
];

const twoRowsWorkbook = XLSX.utils.book_new();
const twoRowsWorksheet = XLSX.utils.json_to_sheet(twoRowsData);
XLSX.utils.book_append_sheet(twoRowsWorkbook, twoRowsWorksheet, 'Sheet1');
XLSX.writeFile(twoRowsWorkbook, 'test-two-rows.xlsx');
console.log('❌ Created: test-two-rows.xlsx');
console.log('   - ERROR: Contains 2 rows (should have exactly 1)\n');

// 4. ❌ Excel VACÍO - sin datos
const emptyWorkbook = XLSX.utils.book_new();
const emptyWorksheet = XLSX.utils.aoa_to_sheet([['seniority', 'years', 'availability']]);
XLSX.utils.book_append_sheet(emptyWorkbook, emptyWorksheet, 'Sheet1');
XLSX.writeFile(emptyWorkbook, 'test-empty.xlsx');
console.log('❌ Created: test-empty.xlsx');
console.log('   - ERROR: No data rows (only headers)\n');

// 5. ❌ Excel con COLUMNAS FALTANTES
const missingColumnsData = [
  {
    'seniority': 'senior',
    'years': 5
    // ❌ falta 'availability'
  }
];

const missingColumnsWorkbook = XLSX.utils.book_new();
const missingColumnsWorksheet = XLSX.utils.json_to_sheet(missingColumnsData);
XLSX.utils.book_append_sheet(missingColumnsWorkbook, missingColumnsWorksheet, 'Sheet1');
XLSX.writeFile(missingColumnsWorkbook, 'test-missing-columns.xlsx');
console.log('❌ Created: test-missing-columns.xlsx');
console.log('   - ERROR: Missing column "availability"\n');

// 6. ❌ Excel con VALORES INVÁLIDOS
const invalidValuesData = [
  {
    'seniority': 'expert', // ❌ valor inválido (solo acepta junior/senior)
    'years': -2, // ❌ años negativos
    'availability': 'maybe' // ❌ valor inválido (debe ser boolean)
  }
];

const invalidValuesWorkbook = XLSX.utils.book_new();
const invalidValuesWorksheet = XLSX.utils.json_to_sheet(invalidValuesData);
XLSX.utils.book_append_sheet(invalidValuesWorkbook, invalidValuesWorksheet, 'Sheet1');
XLSX.writeFile(invalidValuesWorkbook, 'test-invalid-values.xlsx');
console.log('❌ Created: test-invalid-values.xlsx');
console.log('   - ERROR: Seniority "expert" (invalid - should be junior/senior)');
console.log('   - ERROR: Years -2 (negative)');
console.log('   - ERROR: Availability "maybe" (invalid boolean)\n');

// 7. ❌ Excel con SENIORITY INVÁLIDO
const invalidSeniorityData = [
  {
    'seniority': 'mid', // ❌ no existe 'mid', solo junior/senior
    'years': 3,
    'availability': true
  }
];

const invalidSeniorityWorkbook = XLSX.utils.book_new();
const invalidSeniorityWorksheet = XLSX.utils.json_to_sheet(invalidSeniorityData);
XLSX.utils.book_append_sheet(invalidSeniorityWorkbook, invalidSeniorityWorksheet, 'Sheet1');
XLSX.writeFile(invalidSeniorityWorkbook, 'test-invalid-seniority.xlsx');
console.log('❌ Created: test-invalid-seniority.xlsx');
console.log('   - ERROR: Seniority "mid" (should be junior or senior)\n');

console.log('📋 All test Excel files created successfully!');
console.log('\n📝 Summary:');
console.log('   ✅ Valid files: 2');
console.log('   ❌ Invalid files: 5');
console.log('\nReady for testing!');

