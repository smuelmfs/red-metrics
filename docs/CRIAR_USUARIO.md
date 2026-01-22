# Como Criar o Primeiro Usuário

Após o deploy na Vercel, você precisa criar o primeiro usuário ADMIN para acessar o sistema.

## Opção 1: Executar Script Localmente (Recomendado)

1. **Configure o `.env` local com a DATABASE_URL do Railway:**
```env
DATABASE_URL="mysql://root:senha@shortline.proxy.rlwy.net:porta/railway"
```

2. **Execute o script de criação de usuário:**

Com valores padrão (admin@redagency.com / admin123):
```bash
npm run db:create-user
```

Ou com valores customizados:
```bash
npx tsx prisma/create-user.ts seu-email@exemplo.com "Seu Nome" sua-senha ADMIN
```

**Exemplo:**
```bash
npx tsx prisma/create-user.ts admin@redagency.com "Administrador" MinhaSenha123 ADMIN
```

## Opção 2: Usar Prisma Studio

1. Configure o `.env` local com a DATABASE_URL do Railway
2. Execute:
```bash
npx prisma studio
```
3. Acesse http://localhost:5555
4. Vá na tabela `User` → `Add record`
5. Preencha:
   - `email`: seu email
   - `name`: seu nome
   - `password`: use bcrypt para hash (ou crie via script primeiro)
   - `role`: `ADMIN`
6. Salve

**Nota**: Para a senha, você precisa fazer hash com bcrypt. É mais fácil usar o script.

## Opção 3: SQL Direto (Avançado)

Se tiver acesso direto ao MySQL do Railway:

```sql
INSERT INTO User (id, email, name, password, role, createdAt, updatedAt)
VALUES (
  'cuid-gerado',
  'admin@redagency.com',
  'Administrador',
  '$2a$10$hash-da-senha-aqui', -- Use bcrypt para gerar
  'ADMIN',
  NOW(),
  NOW()
);
```

**Recomendação**: Use a Opção 1 (script) - é mais seguro e fácil.

## Após Criar o Usuário

1. Acesse a URL da Vercel: `https://seu-projeto.vercel.app`
2. Faça login com:
   - Email: o que você configurou
   - Senha: a senha que você definiu
3. Você terá acesso completo como ADMIN

