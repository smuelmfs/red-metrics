# Guia de Deploy na Vercel

Este guia explica como fazer o deploy do RED Metrics na Vercel usando MySQL.

## MySQL Hospedado no Railway

Para fazer deploy na Vercel, você precisa de um banco MySQL hospedado. Vamos usar o **Railway** (gratuito com limites generosos).

### Passo 1: Criar banco MySQL no Railway

1. Crie conta em [railway.app](https://railway.app) (pode usar GitHub para login)
2. Crie um novo projeto:
   - Clique em **New Project**
   - Selecione **Empty Project** ou **Deploy from GitHub repo** (se quiser conectar depois)
3. Adicione um banco MySQL:
   - No projeto, clique em **+ New**
   - Selecione **Database** → **Add MySQL**
   - O Railway criará automaticamente um banco MySQL
4. Obtenha a connection string:
   - Clique no serviço MySQL criado
   - Vá na aba **Variables**
   - Copie a variável `DATABASE_URL` (formato: `mysql://...`)
   - **OU** vá na aba **Connect** e copie a connection string completa
5. **Importante**: A connection string do Railway já inclui todas as credenciais necessárias

### Passo 2: Executar Migrations

O schema do Prisma já está configurado para MySQL, então não precisa mudar nada!

1. Localmente, atualize seu `.env` com a connection string do Railway:
```env
DATABASE_URL="mysql://usuario:senha@host:porta/railway"
```

**Nota**: O Railway pode usar um nome de banco diferente (como `railway`). Verifique na connection string.

2. Execute as migrations:
```bash
npx prisma migrate deploy
```

Ou se for a primeira vez:
```bash
npx prisma migrate dev --name init
```

3. Verifique se as tabelas foram criadas:
   - No Railway, vá no serviço MySQL → **Data** → **Open in TablePlus** (ou use outro cliente)
   - Ou execute: `npx prisma studio` e conecte com a DATABASE_URL do Railway

### Passo 3: Configurar Variáveis de Ambiente na Vercel

No dashboard da Vercel, vá em **Settings** → **Environment Variables** e adicione:

**Obrigatórias:**
```
DATABASE_URL=mysql://usuario:senha@host:porta/railway
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=seu-secret-aqui
NODE_ENV=production
```

**Nota**: Use a connection string completa que o Railway forneceu. Ela já inclui todas as credenciais.

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

## Alternativa: PlanetScale

Se preferir usar PlanetScale ao invés do Railway:

1. Crie conta em [planetscale.com](https://planetscale.com)
2. Crie um novo banco de dados (plano Free)
3. Copie a connection string da branch `main`
4. Siga os mesmos passos acima (Passos 2-4)

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
- Verifique se a connection string do Railway está correta
- O Railway permite conexões externas por padrão, mas verifique se não há firewall bloqueando

### Erro: "Connection refused" no Railway
- Verifique se o serviço MySQL está rodando no Railway
- Confirme que está usando a connection string correta (pode mudar após restart)
- Railway pode ter limites de conexões simultâneas no plano gratuito

### Erro: "Access denied" no Railway
- Verifique se as credenciais na connection string estão corretas
- O Railway gera credenciais automaticamente - use a connection string completa fornecida

