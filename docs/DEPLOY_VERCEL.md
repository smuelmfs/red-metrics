# Guia de Deploy na Vercel

Este guia explica como fazer o deploy do RED Metrics na Vercel.

## Opção 1: PostgreSQL (Recomendado)

A Vercel recomenda PostgreSQL. Você pode usar:
- **Vercel Postgres** (integrado)
- **Supabase** (gratuito até certo limite)
- **Neon** (gratuito até certo limite)

### Passo 1: Criar banco PostgreSQL

#### Usando Vercel Postgres:
1. No dashboard da Vercel, vá em **Storage** → **Create Database** → **Postgres**
2. Anote a `DATABASE_URL` gerada

#### Usando Supabase:
1. Crie conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **Settings** → **Database** → copie a **Connection string**

#### Usando Neon:
1. Crie conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string

### Passo 2: Migrar Schema do Prisma

1. Atualize o `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Mudar de "mysql" para "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Execute as migrations:
```bash
npx prisma migrate dev --name init
```

3. Ou use `db push` para desenvolvimento:
```bash
npx prisma db push
```

### Passo 3: Configurar Variáveis de Ambiente na Vercel

No dashboard da Vercel, vá em **Settings** → **Environment Variables** e adicione:

**Obrigatórias:**
```
DATABASE_URL=postgresql://...
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
2. Configure o **Build Command**: `prisma generate && next build`
3. Configure o **Output Directory**: `.next`
4. Faça o deploy!

---

## Opção 2: MySQL (PlanetScale)

Se preferir continuar com MySQL:

### Passo 1: Criar banco no PlanetScale

1. Crie conta em [planetscale.com](https://planetscale.com)
2. Crie um novo banco de dados
3. Copie a connection string

### Passo 2: Configurar na Vercel

1. Adicione a `DATABASE_URL` do PlanetScale nas variáveis de ambiente
2. O schema do Prisma já está configurado para MySQL
3. Execute as migrations no PlanetScale

### Passo 3: Deploy

Siga os mesmos passos da Opção 1, mas mantenha `provider = "mysql"` no schema.

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
- Execute as migrations localmente primeiro
- Verifique se o schema está compatível com PostgreSQL (se migrou de MySQL)

