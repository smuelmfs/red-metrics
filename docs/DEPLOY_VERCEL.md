# Guia de Deploy na Vercel

Este guia explica como fazer o deploy do RED Metrics na Vercel usando MySQL.

## MySQL Hospedado

Para fazer deploy na Vercel, você precisa de um banco MySQL hospedado. Opções recomendadas:

- **PlanetScale** (recomendado - gratuito até certo limite)
- **Railway** (MySQL gratuito)
- **Aiven** (MySQL gratuito com limites)
- **AWS RDS** (pago, mas robusto)

### Passo 1: Criar banco MySQL no PlanetScale

1. Crie conta em [planetscale.com](https://planetscale.com)
2. Crie um novo banco de dados:
   - Clique em **Create database**
   - Escolha um nome (ex: `red-metrics`)
   - Selecione a região mais próxima
   - Escolha o plano **Free** (para começar)
3. Após criar, vá em **Settings** → **Connection strings**
4. Copie a connection string (formato: `mysql://...`)
5. **Importante**: PlanetScale usa branches. Use a branch `main` para produção

### Passo 2: Executar Migrations

O schema do Prisma já está configurado para MySQL, então não precisa mudar nada!

1. Localmente, atualize seu `.env` com a connection string do PlanetScale:
```env
DATABASE_URL="mysql://usuario:senha@host:porta/red_metrics"
```

2. Execute as migrations:
```bash
npx prisma migrate deploy
```

Ou se for a primeira vez:
```bash
npx prisma migrate dev --name init
```

3. Verifique se as tabelas foram criadas no PlanetScale

### Passo 3: Configurar Variáveis de Ambiente na Vercel

No dashboard da Vercel, vá em **Settings** → **Environment Variables** e adicione:

**Obrigatórias:**
```
DATABASE_URL=mysql://usuario:senha@host:porta/red_metrics
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=seu-secret-aqui
NODE_ENV=production
```

**Opcionais (para integração Odoo):**
```
ODOO_BASE_URL=https://odoo.example.com
ODOO_DATABASE=nome_do_banco
ODOO_USERNAME=usuario
ODOO_API_KEY=sua-api-key
ODOO_API_TYPE=xmlrpc
ODOO_ENABLED=true
ODOO_ENCRYPTION_KEY=chave-para-criptografia
```

### Passo 4: Deploy

1. Conecte seu repositório GitHub à Vercel
2. O `vercel.json` já está configurado com:
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next` (automático)
3. Faça o deploy!

---

## Alternativa: MySQL no Railway

Se preferir usar Railway:

1. Crie conta em [railway.app](https://railway.app)
2. Crie um novo projeto → **New** → **Database** → **MySQL**
3. Copie a connection string
4. Siga os mesmos passos do PlanetScale (Passos 2-4 acima)

---

## Notas Importantes

### Build Command
O `package.json` já está configurado com:
```json
"build": "prisma generate && next build"
```

Isso garante que o Prisma Client seja gerado antes do build.

### Variáveis de Ambiente Sensíveis
- `NEXTAUTH_SECRET`: Use um valor aleatório forte
- `ODOO_ENCRYPTION_KEY`: Use uma chave de 32 caracteres para criptografia
- `ODOO_API_KEY`: Mantenha segura, não commite no código

### Gerar Secrets

Para gerar um `NEXTAUTH_SECRET`:
```bash
npm run generate:secret
```

Para gerar um `ODOO_ENCRYPTION_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Primeiro Deploy

Após o primeiro deploy:
1. Acesse a URL da Vercel
2. Crie o primeiro usuário ADMIN (ou use o script `db:create-user`)
3. Configure as variáveis do Odoo se necessário

---

## Troubleshooting

### Erro: "Prisma Client not generated"
- Certifique-se de que o Build Command inclui `prisma generate`
- Verifique se a `DATABASE_URL` está correta

### Erro: "Connection timeout"
- Verifique se o banco de dados permite conexões externas
- No Supabase/Neon, verifique as configurações de firewall

### Erro: "Migration failed"
- Execute as migrations localmente primeiro: `npx prisma migrate deploy`
- No PlanetScale, certifique-se de estar usando a branch `main`
- Verifique se a connection string está correta e permite conexões externas

### Erro: "Connection refused" no PlanetScale
- PlanetScale requer SSL. A connection string já inclui `?sslaccept=strict`
- Verifique se está usando a branch correta (não `dev`, use `main` para produção)

