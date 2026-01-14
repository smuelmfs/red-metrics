// Script para gerar NEXTAUTH_SECRET
const crypto = require('crypto')

const secret = crypto.randomBytes(32).toString('base64')

console.log('\n✅ NEXTAUTH_SECRET gerado:')
console.log(secret)
console.log('\n📝 Adicione esta linha ao seu arquivo .env:')
console.log(`NEXTAUTH_SECRET="${secret}"`)
console.log('')

