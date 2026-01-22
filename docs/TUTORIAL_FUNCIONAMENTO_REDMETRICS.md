## Tutorial: Como criar dados fictícios e testar todo o sistema

Este guia mostra, passo a passo, como **preencher o sistema manualmente** com dados fictícios, passando por todas as telas importantes.  
Objetivo: você conseguir **criar tudo à mão**, submeter formulários sem erro e ver números em todos os relatórios / dashboards.

> Recomendado: começar com o banco limpo e seed fictício rodado com `npm run db:seed:complete`, depois seguir este tutorial para criar mais dados manualmente.

---

## 1. Login e permissões

Use um utilizador com papel **ADMIN** (ou MANAGER para algumas ações).

Se estiver usando o seed fictício padrão, existem usuários de exemplo (veja o `seed-complete.ts`).  
Caso contrário, use o usuário ADMIN real da instância.

Depois de logar, use o menu lateral para navegar.

---

## 2. Configurações Globais (`/dashboard/settings`)

Essas configurações alimentam vários cálculos:
- Horas/mês
- Margem alvo
- Utilização alvo
- Overhead de pessoas

Na tela de **Configurações Globais**, garanta que existam pelo menos estes registros (você pode editar os existentes):

- **Margem Alvo** (`targetMargin`)
  - Valor: `0.30`
  - Significado: 30% de margem alvo.

- **Horas de Trabalho por Mês** (`hoursPerMonth`)
  - Valor: `160`
  - Exemplo: 8 horas/dia × 20 dias.

- **Utilização Faturável Média** (`targetUtilization`)
  - Valor: `0.65`
  - Exemplo: 65% do tempo das pessoas é faturável.

- **Custo Médio por Pessoa/Mês** (`costPerPersonPerMonth`)
  - Valor: `2200`

- **Nº Pessoas NÃO faturáveis (overhead)** (`overheadPeople`)
  - Valor: `6`

Clique em **Salvar Configurações**.  
Se algum valor estiver ausente, a tela mostrará erro de validação informando o campo.

---

## 3. Departamentos

### 3.1 Criar um novo departamento (`/dashboard/departments/new`)

Na tela **Novo Departamento**, preencha, por exemplo:

- **Nome do Departamento \***: `Branding & Design`
- **Código** (opcional, mas recomendado): `BRAND`
- **HC Faturável (pessoas) \***: `4`
- **Taxa Média (€/h) \***: `45`
- **Custo por Pessoa/Mês (€)**: `2200`
- **Utilização Faturável Alvo (0-1)**: `0.65`
- **Departamento ativo**: marcado.

Clique em **Criar Departamento**.

Crie mais alguns:

- `Marketing Digital & Performance`
  - Código: `MARKETING`
  - HC: `3`
  - Taxa: `50`
  - Utilização: `0.70`
  - Custo por pessoa/mês: `2200`

- `Web / UX / Dev`
  - Código: `WEB`
  - HC: `4`
  - Taxa: `55`
  - Utilização: `0.65`
  - Custo por pessoa/mês: `2400`

### 3.2 Editar um departamento

1. Acesse `/dashboard/departments`.
2. Clique em **Editar** em um departamento existente.
3. Altere, por exemplo, a **Taxa Média (€/h)** de `45` para `48`.
4. Clique em **Salvar Alterações**.

Se algum campo obrigatório estiver vazio ou inválido, o backend retornará erro de validação, e a tela mostrará a mensagem em vermelho.

---

## 4. Gastos da Empresa (Custos Fixos) (`/dashboard/fixed-costs`)

### 4.1 Criar custos fixos

Na tela **Gastos da Empresa**, clique em **Novo Custo Fixo** e crie alguns exemplos:

1. **Aluguel Escritório Lisboa**
   - Categoria: `Aluguel`
   - Valor Mensal (€): `3500`
   - Data de Início: hoje
   - Data de Término: deixar em branco (custo permanente)
   - Descrição: `Escritório principal em Lisboa`

2. **Eletricidade, Água e Internet**
   - Categoria: `Utilidades`
   - Valor Mensal (€): `850`
   - Data de Início: hoje
   - Data de Término: vazio
   - Descrição: `Custos fixos de luz, água e internet`

3. **Softwares de Produtividade**
   - Categoria: `Software`
   - Valor Mensal (€): `1200`
   - Data de Início: hoje
   - Data de Término: vazio
   - Descrição: `Licenças Adobe, Notion, Google Workspace, Slack, etc.`

Campos opcionais que podem ficar vazios sem erro:
- **Descrição**
- **Data de término**

Esses custos passam a ser usados no cálculo de overhead para os departamentos.

---

## 5. Catálogo de Avenças (`/dashboard/retainers/catalog`)

O catálogo define **tipos padrão** de avenças (pacotes), com preço, horas e custos internos.

### 5.1 Criar item de catálogo básico

Na tela **Catálogo de Avenças**, clique em **Novo Item do Catálogo**:

1. **Gestão Redes Sociais - Básico**
   - Departamento: `Marketing Digital & Performance`
   - Nome da Avença: `Gestão Redes Sociais - Básico`
   - Preço Mensal (€): `800`
   - Horas por Mês: `20`
   - Custo Interno por Hora (€): `30`
   - Base Hours / Base Price: deixar em branco (opcional).

Enquanto você preenche:
- O formulário mostra um **preview**:
  - Custo Mensal = 20 × 30 = 600
  - Margem = 800 - 600 = 200
  - % Margem ≈ 25%

Clique em **Criar Item**.

### 5.2 Como ler a lista do catálogo

Na lista do catálogo:

- Há um bloco explicativo no topo informando que:
  - Colunas de custo/margem só aparecem quando **Custo Interno/h** está definido.
  - Quando um item não tiver esse valor, a tabela mostrará **`-`**, indicando “não configurado”.

- Você pode marcar o checkbox:
  - **“Mostrar detalhes de custo e margem”**  
  para ver as colunas:
  - Custo Interno/h
  - Custo Mensal
  - Margem
  - % Margem

Se não preencher **Custo Interno/h** ao criar o item, essas colunas ficarão com `-`, o que é esperado.

Crie mais itens, por exemplo:

2. **Gestão Redes Sociais - Premium**
   - Departamento: `Marketing Digital & Performance`
   - Preço Mensal (€): `1500`
   - Horas/Mês: `40`
   - Custo Interno/h: `30`

3. **Identidade Visual Completa**
   - Departamento: `Branding & Design`
   - Preço Mensal (€): `2000`
   - Horas/Mês: `30`
   - Custo Interno/h: `35`

---

## 6. Avenças Ativas (`/dashboard/retainers`)

### 6.1 Criar avença a partir do catálogo (`/dashboard/retainers/new`)

Nesta tela você pode:
- Selecionar um tipo de avença do catálogo, ou
- Criar uma avença customizada.

#### Exemplo: avença baseada no catálogo

1. **Selecionar do Catálogo (opcional)**:
   - Escolha `Gestão Redes Sociais - Básico`.
   - O formulário preenche automaticamente:
     - Departamento
     - Nome
     - Preço Mensal
     - Horas/Mês (interno, para cálculos).

2. Complete os campos:

   - Tipo de Avença: `Social Media`
   - Quantidade: `1`
   - Receita Mensal Total: preview em € (não editável).
   - Data de Início: hoje
   - Data de Término: em branco (sem término)
   - Notas: `Cliente teste - pacote básico`

3. Clique em **Criar Avença**.

Depois:
- Em `/dashboard/retainers`, veja a avença listada sob o departamento **Marketing Digital & Performance**, com:
  - Nome
  - Tipo
  - Preço Mensal
  - Quantidade
  - Receita Mensal (calculada pelo backend)
  - Data de início

#### Exemplo: avença customizada (sem catálogo)

1. Deixe “Selecionar do Catálogo” como “Nenhum”.
2. Preencha:
   - Departamento: `Branding & Design`
   - Nome: `Cliente ABC - Identidade Visual`
   - Tipo: `Projeto Recorrente`
   - Preço Mensal (€): `2000`
   - Quantidade: `1`
   - Datas e notas como quiser.
3. Clique em **Criar Avença**.

Na lista de avenças, ela aparecerá com `catalog` vazio, mas é tratada normalmente como receita recorrente.

### 6.2 Editar uma avença existente

1. Em `/dashboard/retainers`, clique em **Editar** na avença desejada.
2. Altere, por exemplo:
   - Quantidade: `1` → `2`
   - Preço Mensal: `800` → `900`
3. Clique em **Salvar Alterações**.

O backend vai:
- Recalcular `monthlyRevenue`.
- Registrar log de auditoria.
- Recalcular resultados do departamento para o mês atual e próximos meses.

---

## 7. Integração com Odoo (Opcional)

A integração com Odoo permite sincronizar automaticamente as horas reais dos departamentos diretamente do sistema Odoo.

### 7.1 Configuração via Variáveis de Ambiente

A configuração é feita através do arquivo `.env` na raiz do projeto. Adicione as seguintes variáveis:

```env
ODOO_BASE_URL="https://odoo.example.com"
ODOO_DATABASE="nome_do_banco"
ODOO_USERNAME="usuario"
ODOO_API_KEY="sua-api-key-aqui"
ODOO_API_TYPE="xmlrpc"
ODOO_ENABLED="true"
```

**Importante:**
- Use a **API Key** do Odoo (não a senha de login)
- A API Key pode ser obtida nas configurações de usuário do Odoo
- O sistema inicializa automaticamente a configuração quando essas variáveis estão definidas
- Não é necessário configurar manualmente na interface

### 7.2 Sincronização de Horas (`/dashboard/odoo`)

1. Acesse a página **Integração Odoo** (apenas para usuários ADMIN)
2. Na aba **Sincronização**:
   - Selecione o **Mês** e **Ano** (apenas anos >= 2026)
   - Clique em **Sincronizar Horas**
3. O sistema irá:
   - Buscar departamentos do Odoo que têm horas registradas no período
   - Filtrar apenas por tipos de faturamento: "Billed at a fixed price", "Billed on Timesheets", "Billed on Milestones", "Billed Manually"
   - Criar departamentos automaticamente se não existirem no RED Metrics
   - Atualizar as horas reais (`actualBillableHours`) para cada departamento

### 7.3 Visualizar Dados Sincronizados

Na aba **Dados Sincronizados**, você pode:
- Ver todos os departamentos sincronizados do Odoo
- Verificar as horas sincronizadas por mês/ano
- Ver a data da última sincronização

### 7.4 Departamentos do Odoo vs. Departamentos Manuais

**Departamentos sincronizados do Odoo:**
- Campo "Horas Reais" está **protegido** (não editável manualmente)
- Mostra indicador "(Sincronizado do Odoo)"
- Horas são atualizadas apenas via sincronização

**Departamentos criados manualmente:**
- Campo "Horas Reais" está **editável** manualmente
- Você pode inserir as horas diretamente no formulário
- Não são afetados pela sincronização do Odoo

### 7.5 Edição de Horas Disponíveis

O campo **"Horas Disponíveis (alvo)"** é calculado automaticamente pela fórmula:
```
HC Faturável × Horas/Mês × Utilização Alvo
```

Você pode editar manualmente este valor se necessário, mas por padrão ele é calculado automaticamente.

---

## 8. Horas Faturáveis e Objetivos

### 8.1 Horas Planejadas / Reais (`/dashboard/planned-hours`)

Selecione um mês e ano, por exemplo:
- **Mês**: `1`
- **Ano**: `2025`

Para cada departamento:

#### Branding & Design
- HC Faturável: `4`
- Horas Planeadas/Mês: `160`
- Utilização Alvo: `0.65`
- Horas Faturáveis Reais: `350`
- Receita de Projetos (€): `3000`

#### Marketing Digital & Performance
- HC Faturável: `3`
- Horas Planeadas/Mês: `160`
- Utilização Alvo: `0.70`
- Horas Faturáveis Reais: `280`
- Receita de Projetos (€): `4500`

Clique em **Salvar**.

### 8.2 Objetivos (`/dashboard/objectives`)

No mesmo mês/ano (1/2025), defina objetivos:

#### Branding & Design
- Objetivo (€): `20000`

#### Marketing Digital & Performance
- Objetivo (€): `25000`

Clique em **Salvar Objetivos**.

---

## 9. Verificando os resultados

Depois de criar:
- Departamentos
- Configurações globais
- Custos fixos
- Catálogo de avenças
- Avenças ativas
- Horas planejadas/reais
- Objetivos

Você deve conseguir:

1. Ver **receitas de avenças** em `/dashboard/retainers`.
2. Ver **custos fixos** em `/dashboard/fixed-costs`.
3. Ver **horas e objetivos mensais** em:
   - `/dashboard/planned-hours`
   - `/dashboard/objectives`
4. Ver **visões consolidadas**:
   - Visão anual de departamentos
   - Breakdown mensal
   - Dashboard principal.

Se algum campo aparecer com `-`:
- Para colunas de custos/margens no catálogo, significa apenas **“não configurado”** (falta Custo Interno/h), não erro.
- Para outros casos, confira se o formulário correspondente foi preenchido (por exemplo, objetivo mensal para aquele dept/mês).

---

## 10. Dicas para evitar dúvidas com campos vazios

- Prefira sempre preencher:
  - **Custo Interno/h** ao criar itens do catálogo (para ter margens visíveis).
  - **Horas Planeadas/Mês** e **Objetivo (€)** para cada dept/mês que você queira analisar.
- Use as mensagens de ajuda:
  - No topo do catálogo, o texto explica quando as colunas de custo/margem aparecem e o significado do `-`.
  - Em formulários, campos com `*` são obrigatórios; os outros podem ficar vazios se a mensagem não indicar o contrário.

Seguindo este tutorial com esses valores fictícios, você deve conseguir:
- Criar e editar tudo sem erros de validação.
- Ver números coerentes em todas as telas principais.


