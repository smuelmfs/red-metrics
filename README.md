# RED Metrics

Sistema interno de gestão de objetivos mínimos e performance por departamento para a RED Agency.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: ShadCN UI + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL (XAMPP)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Charts**: Recharts

## 📋 Pré-requisitos

- Node.js 18+
- MySQL (XAMPP)
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env`:
```env
DATABASE_URL="mysql://root:@localhost:3306/red_metrics?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
NODE_ENV="development"

# Opcional: Configuração automática do Odoo (as credenciais serão usadas automaticamente)
ODOO_BASE_URL="https://odoo.example.com"
ODOO_DATABASE="nome_do_banco"
ODOO_USERNAME="usuario"
ODOO_API_KEY="sua-api-key-aqui"
ODOO_API_TYPE="xmlrpc"
ODOO_ENABLED="true"
```

4. Crie o banco de dados MySQL:
```sql
CREATE DATABASE red_metrics;
```

5. Execute as migrations do Prisma:
```bash
npm run db:push
# ou
npm run db:migrate
```

6. Gere o Prisma Client:
```bash
npm run db:generate
```

7. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
red-metrics/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Rotas de autenticação
│   │   ├── (dashboard)/       # Rotas do dashboard
│   │   ├── api/               # API Routes
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── prisma.ts          # Cliente Prisma
│   │   ├── auth.ts            # Configuração NextAuth
│   │   └── business-logic/    # Lógica de negócio
│   │       ├── calculations.ts
│   │       ├── validations.ts
│   │       └── audit.ts
│   ├── components/            # Componentes React
│   └── types/                 # TypeScript types
└── public/
```

## 🔐 Autenticação

O sistema usa NextAuth.js com autenticação por credenciais. Para criar o primeiro usuário admin, você precisará:

1. Criar um script de seed ou usar o Prisma Studio
2. Hash da senha usando bcrypt

## 📊 Funcionalidades

- ✅ Gestão de Departamentos
- ✅ Horas Planejadas (mensais)
- ✅ Objetivos Mínimos (mensais)
- ✅ Retainers (Avenças)
- ✅ Cálculo Automático de Performance
- ✅ Dashboards
- ✅ Auditoria de Mudanças
- 🔄 Integração Odoo (TODO)

## 🔄 Integração Odoo (Futuro)

A integração com Odoo está planejada para:
- Importar horas reais trabalhadas
- Desabilitar edição manual quando integração estiver ativa
- Sincronização automática

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Inicia servidor de produção
- `npm run db:generate` - Gera Prisma Client
- `npm run db:push` - Sincroniza schema com banco
- `npm run db:migrate` - Cria migration
- `npm run db:studio` - Abre Prisma Studio

## 🏗️ Arquitetura

O sistema segue uma arquitetura limpa com:
- **Separação de responsabilidades**: Lógica de negócio no backend
- **Validação**: Zod schemas para validação de dados
- **Auditoria**: Log de todas as mudanças
- **Cálculos automáticos**: Resultados calculados no backend

## 📄 Licença

Uso interno - RED Agency

