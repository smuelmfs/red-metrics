# Guia do Usuário - RED Metrics

Bem-vindo ao RED Metrics! Este guia explica como usar o sistema para acompanhar a performance dos departamentos da empresa.

---

## 📋 Índice

1. [Acesso ao Sistema](#1-acesso-ao-sistema)
2. [Dashboard Principal](#2-dashboard-principal)
3. [Visualizar Departamentos](#3-visualizar-departamentos)
4. [Planejamento de Horas](#4-planejamento-de-horas)
5. [Objetivos Mensais](#5-objetivos-mensais)
6. [Retainers (Clientes Mensais)](#6-retainers-clientes-mensais)
7. [Custos Fixos](#7-custos-fixos)
8. [Visão Mensal Consolidada](#8-visão-mensal-consolidada)
9. [Perfil e Configurações](#9-perfil-e-configurações)
10. [Dúvidas Frequentes](#10-dúvidas-frequentes)

---

## 1. Acesso ao Sistema

### 1.1 Login

1. Acesse a URL do sistema (fornecida pelo administrador)
2. Digite seu **email** e **senha**
3. Clique em **Entrar**

**Importante:** Se você esqueceu sua senha, entre em contato com o administrador do sistema.

### 1.2 Navegação

Após fazer login, você verá:
- **Menu lateral** (no desktop): com todas as opções do sistema
- **Menu mobile** (no celular): ícone de menu no topo para acessar as opções

---

## 2. Dashboard Principal

O Dashboard é a primeira tela que você vê após fazer login. Ele mostra uma **visão geral** de todos os departamentos.

### 2.1 O que você vê no Dashboard

- **Objetivo Total**: Valor total em euros que a empresa precisa atingir no mês
  - *Exemplo: €66.080,00 (soma de todos os objetivos dos departamentos)*
- **Performance Geral**: Percentual de quanto foi atingido do objetivo
  - *Exemplo: 90% (significa que atingiu 90% do objetivo de €66.080, ou seja, €59.440)*
- **Resumo por Departamento**: Cards mostrando a performance de cada departamento
  - *Exemplo: "Branding & Design - 92% | Marketing Digital - 105% | Web/UX/Dev - 78%"*
- **Gráficos**: 
  - Gráfico de Performance (comparação entre departamentos)
  - Gráfico de Receita (evolução ao longo do tempo)
  - Classificação de Departamentos (ranking)

**Exemplo completo de um Dashboard (Janeiro 2026):**

```
┌─────────────────────────────────────────────────────────┐
│ Dashboard - Janeiro 2026                                │
├─────────────────────────────────────────────────────────┤
│ Objetivo Total: €66.080,00                              │
│ Performance Geral: 90% (€59.440 atingidos)               │
├─────────────────────────────────────────────────────────┤
│ Departamentos:                                          │
│                                                          │
│ 🟢 Marketing Digital - 105% (€20.160 / €19.200)       │
│ 🟡 Branding & Design - 92% (€17.280 / €18.720)         │
│ 🔴 Web / UX / Dev - 78% (€22.000 / €28.160)            │
└─────────────────────────────────────────────────────────┘
```

**Interpretação:**
- 🟢 Verde: Marketing Digital superou o objetivo (105%)
- 🟡 Amarelo: Branding & Design está próximo (92%)
- 🔴 Vermelho: Web/UX/Dev precisa melhorar (78%)

### 2.2 Filtrar por Mês/Ano

No topo do Dashboard, você pode:
- Selecionar o **mês** que deseja visualizar
- Selecionar o **ano** que deseja visualizar
- Clicar em **Recalcular** para atualizar os dados

### 2.3 Personalizar o Dashboard

Você pode:
- **Arrastar** os cards/gráficos para reorganizar
- **Ocultar** widgets que não deseja ver
- As alterações são salvas automaticamente

---

## 3. Visualizar Departamentos

### 3.1 Lista de Departamentos

1. No menu, clique em **Departamentos**
2. Você verá uma lista com todos os departamentos cadastrados
3. Cada departamento mostra:
   - Nome e código
   - Número de pessoas (HC Faturável)
   - Taxa média por hora
   - Status (Ativo/Inativo)

**Exemplo de departamentos que você pode ver:**
- **Branding & Design** (código: BRAND)
  - 4 pessoas faturáveis
  - Taxa média: €45/hora
  - Status: Ativo

- **Marketing Digital & Performance** (código: MARKETING)
  - 3 pessoas faturáveis
  - Taxa média: €50/hora
  - Status: Ativo

- **Web / UX / Dev** (código: WEB)
  - 4 pessoas faturáveis
  - Taxa média: €55/hora
  - Status: Ativo

### 3.2 Ver Detalhes de um Departamento

1. Clique no nome do departamento na lista
2. Você verá:
   - Informações completas do departamento
   - Histórico de performance
   - Dados mensais detalhados

**Exemplo - Detalhes do departamento "Branding & Design":**

```
Nome: Branding & Design
Código: BRAND
Status: ✅ Ativo

Pessoas (HC Faturável): 4
Taxa Média: €45/hora
Custo por Pessoa/Mês: €2.200,00
Utilização Faturável Alvo: 65%

Performance Janeiro 2026:
- Objetivo: €18.720,00
- Atingido: €17.280,00
- Performance: 92%
- Horas Planejadas: 520h
- Horas Reais: 485h
- Horas Disponíveis: 416h
```

### 3.3 Visualização Anual

1. Na página de Departamentos, clique em **Visão Anual**
2. Você verá um resumo de todo o ano para todos os departamentos

**Exemplo de Visão Anual (2026):**

| Departamento | Jan | Fev | Mar | Abr | Mai | Jun | Total Anual |
|--------------|-----|-----|-----|-----|-----|-----|-------------|
| Branding & Design | 92% | 95% | 88% | 102% | 98% | 94% | **94.8%** |
| Marketing Digital | 105% | 108% | 97% | 112% | 103% | 110% | **106%** |
| Web / UX / Dev | 78% | 82% | 85% | 90% | 88% | 92% | **85.8%** |

### 3.3 Visualização Anual

1. Na página de Departamentos, clique em **Visão Anual**
2. Você verá um resumo de todo o ano para todos os departamentos

---

## 4. Planejamento de Horas

A página de **Planejamento de Horas** permite visualizar e editar as horas planejadas e reais de cada departamento.

### 4.1 Visualizar Horas

1. No menu, clique em **Planejamento de Horas**
2. Selecione o **mês** e **ano** que deseja ver (ex: Janeiro 2026)
3. Você verá uma tabela com:
   - Nome do departamento
   - Horas Planejadas (alvo)
   - Horas Reais (o que foi executado)
   - Horas Disponíveis (alvo)
   - Status

**Exemplo de dados que você pode ver (Janeiro 2026):**

| Departamento | Horas Planejadas | Horas Reais | Horas Disponíveis | Status |
|--------------|------------------|-------------|-------------------|--------|
| Branding & Design | 520h | 485h | 416h | ✅ OK |
| Marketing Digital | 480h | 520h | 384h | ⚠️ Acima do planejado |
| Web / UX / Dev | 640h | 600h | 512h | ✅ OK |
| RED® MEDIA | 570h | 550h | 456h | ✅ OK |
| MyPRINT® | 576h | 580h | 461h | ⚠️ Acima do planejado |

**Como interpretar:**
- **Horas Planejadas**: O que foi planejado trabalhar no mês
- **Horas Reais**: O que realmente foi trabalhado (vem do Odoo ou manual)
- **Horas Disponíveis (alvo)**: Horas que devem ser faturáveis (calculado automaticamente)
- **Status**: 
  - ✅ OK: Dentro do esperado
  - ⚠️ Acima: Trabalhou mais horas do que o planejado
  - ⚠️ Abaixo: Trabalhou menos horas do que o planejado

### 4.2 Editar Horas (se permitido)

**Nota:** Apenas usuários ADMIN podem editar horas. Departamentos sincronizados do Odoo têm as horas protegidas.

1. Clique em **Editar** na linha do departamento desejado
2. Preencha os campos:
   - **Horas Planejadas**: Quantas horas o departamento deve trabalhar
     - *Exemplo: 520 horas (4 pessoas × 160 horas/mês × 0,8125 de utilização)*
   - **Horas Reais**: Quantas horas foram realmente trabalhadas (apenas para departamentos manuais)
     - *Exemplo: 485 horas (o que realmente foi trabalhado no mês)*
   - **Horas Disponíveis (alvo)**: Horas disponíveis para faturar
     - *Exemplo: 416 horas (calculado automaticamente, mas pode ser editado)*
3. Clique em **Salvar**

**Exemplo prático - Editar horas do "Branding & Design" (Janeiro 2026):**

**Situação inicial:**
- Horas Planejadas: `520h` (4 pessoas × 160h × 0,8125)
- Horas Reais: `485h` (vem do Odoo - protegido)
- Horas Disponíveis (alvo): `416h` (calculado automaticamente)

**Você decide ajustar:**
- Horas Planejadas: `520h` (mantém)
- Horas Reais: `485h` (não pode editar - vem do Odoo)
- Horas Disponíveis (alvo): `420h` (edita para `420` porque quer aumentar o alvo)

**Resultado:** O sistema recalcula os objetivos baseado nas novas horas disponíveis.

**Cálculo automático:**
- Horas Disponíveis = Horas Planejadas × Utilização Faturável
- Exemplo: 520h × 0,80 (80%) = 416h
- Mas você pode editar manualmente para `420h` se necessário

**Importante:** 
- Departamentos que vêm do Odoo têm as "Horas Reais" sincronizadas automaticamente
- Você pode editar "Horas Disponíveis (alvo)" mesmo para departamentos do Odoo

---

## 5. Objetivos Mensais

Os **Objetivos** definem quanto cada departamento precisa faturar no mês.

### 5.1 Ver Objetivos

1. No menu, clique em **Objetivos**
2. Selecione o **mês** e **ano** (ex: Janeiro 2026)
3. Você verá uma lista com:
   - Departamento
   - Objetivo em euros
   - Valor atingido
   - Percentual de performance

**Exemplo de objetivos que você pode ver (Janeiro 2026):**

| Departamento | Objetivo | Valor Atingido | Performance | Status |
|--------------|----------|----------------|-------------|--------|
| Marketing Digital | €19.200 | €20.160 | 105% | 🟢 Superou |
| Branding & Design | €18.720 | €17.280 | 92% | 🟡 Próximo |
| RED® MEDIA | €20.520 | €19.800 | 96% | 🟡 Próximo |
| Web / UX / Dev | €28.160 | €22.000 | 78% | 🔴 Abaixo |
| MyPRINT® | €2.304 | €2.200 | 95% | 🟡 Próximo |
| **TOTAL** | **€66.080** | **€59.440** | **90%** | 🟡 Próximo |

**Como calcular o objetivo:**
- Objetivo = Horas Disponíveis (alvo) × Taxa Média por Hora
- Exemplo Branding & Design: 416h × €45/h = **€18.720**

**Como calcular o valor atingido:**
- Valor Atingido = Horas Reais Faturáveis × Taxa Média por Hora
- Exemplo Branding & Design: 384h × €45/h = **€17.280**

**Performance:**
- Performance = (Valor Atingido ÷ Objetivo) × 100
- Exemplo: (€17.280 ÷ €18.720) × 100 = **92%**

### 5.2 Criar/Editar Objetivo (apenas ADMIN)

1. Clique em **Novo Objetivo** ou **Editar** em um objetivo existente
2. Preencha:
   - **Departamento**: Selecione qual departamento
     - *Exemplo: "Branding & Design"*
   - **Mês/Ano**: Período do objetivo
     - *Exemplo: Janeiro / 2026*
   - **Valor do Objetivo**: Quanto em euros precisa ser faturado
     - *Exemplo: 18720 (para um departamento com 416 horas × €45/hora)*
3. Clique em **Salvar**

**Exemplo prático - Criar objetivo para "Marketing Digital" (Fevereiro 2026):**

**Passo a passo:**
1. Clique em **Novo Objetivo**
2. Selecione Departamento: **Marketing Digital**
3. Selecione Mês: **Fevereiro**
4. Selecione Ano: **2026**
5. Digite Valor do Objetivo: `19200` (€19.200,00)

**Como saber qual valor colocar?**
- Verifique as "Horas Disponíveis (alvo)" do departamento em Fevereiro
- Multiplique pela Taxa Média: 384h × €50/h = €19.200
- Ou use um valor baseado em metas de negócio

**Após criar:**
- O objetivo aparecerá na lista
- A performance será calculada automaticamente quando houver dados de receita
- Se não houver receita ainda, aparecerá como 0%

---

## 6. Retainers (Clientes Mensais)

**Retainers** são clientes que pagam um valor fixo mensal. Eles aparecem como receita recorrente.

### 6.1 Ver Retainers

1. No menu, clique em **Retainers**
2. Você verá uma lista com:
   - Nome do cliente
   - Valor mensal
   - Departamento responsável
   - Status (Ativo/Inativo)
   - Período (data início/fim)

**Exemplo de retainers que você pode ver:**

| Cliente | Valor Mensal | Departamento | Status | Período | Total Anual |
|---------|--------------|--------------|--------|---------|-------------|
| Cliente ABC - Gestão Redes Sociais | €800 | Marketing Digital | ✅ Ativo | 01/01/2026 - 31/12/2026 | €9.600 |
| Cliente XYZ - Branding Mensal | €1.500 | Branding & Design | ✅ Ativo | 01/01/2026 - 31/12/2026 | €18.000 |
| Cliente DEF - Site Manutenção | €600 | Web / UX / Dev | ✅ Ativo | 01/02/2026 - 31/12/2026 | €6.600 |
| Cliente JKL - Consultoria Marketing | €2.000 | Marketing Digital | ✅ Ativo | 01/01/2026 - 31/12/2026 | €24.000 |
| Cliente MNO - Design Gráfico | €1.200 | Branding & Design | ✅ Ativo | 01/03/2026 - 31/12/2026 | €12.000 |
| Cliente GHI - Consultoria (antigo) | €2.000 | Marketing Digital | ⏸️ Inativo | 01/01/2025 - 31/12/2025 | - |
| **TOTAL ATIVOS** | **€6.100/mês** | | | | **€70.200/ano** |

**Como os retainers aparecem no cálculo:**
- Cada retainer ativo soma ao valor de receita do departamento
- Exemplo Janeiro 2026:
  - Marketing Digital: €800 + €2.000 = €2.800 de retainers
  - Branding & Design: €1.500 de retainers
  - Web / UX / Dev: €0 (retainer começa em Fevereiro)

**Retainers inativos:**
- Não aparecem nos cálculos do período atual
- Ficam no histórico para referência

### 6.2 Ver Catálogo de Retainers

1. No menu, clique em **Retainers** → **Catálogo**
2. Você verá todos os tipos de retainer disponíveis (modelos/templates)
3. Estes são usados para criar novos retainers rapidamente

---

## 7. Custos Fixos

Os **Custos Fixos** são gastos mensais da empresa (aluguel, softwares, etc.).

### 7.1 Ver Custos Fixos

1. No menu, clique em **Custos Fixos**
2. Você verá uma lista com:
   - Nome do custo
   - Categoria (Aluguel, Software, etc.)
   - Valor mensal
   - Status (Ativo/Inativo)
   - Período (data início/fim)

**Exemplo de custos fixos que você pode ver:**

| Custo | Categoria | Valor Mensal | Status | Período | Total Anual |
|-------|-----------|--------------|--------|---------|-------------|
| Aluguel Escritório Lisboa | Aluguel | €3.500 | ✅ Ativo | 01/01/2026 - (permanente) | €42.000 |
| Eletricidade, Água e Internet | Utilidades | €850 | ✅ Ativo | 01/01/2026 - (permanente) | €10.200 |
| Softwares de Produtividade | Software | €1.200 | ✅ Ativo | 01/01/2026 - (permanente) | €14.400 |
| Licenças Adobe Creative Cloud | Software | €600 | ✅ Ativo | 01/01/2026 - (permanente) | €7.200 |
| Seguros | Outros | €450 | ✅ Ativo | 01/01/2026 - (permanente) | €5.400 |
| Marketing e Publicidade | Marketing | €800 | ✅ Ativo | 01/01/2026 - (permanente) | €9.600 |
| Aluguel Escritório Porto | Aluguel | €2.200 | ⏸️ Inativo | 01/01/2025 - 31/12/2025 | - |
| **TOTAL ATIVO** | | **€7.400/mês** | | | **€88.800/ano** |

**Como os custos fixos afetam os cálculos:**
- São somados aos custos totais da empresa
- Reduzem a margem final
- Exemplo Janeiro 2026:
  - Receita Total: €59.440
  - Custos Variáveis (pessoas): €37.840
  - Custos Fixos: €7.400
  - **Custos Totais: €45.240**
  - **Margem: €14.200 (24%)**

**Custos por categoria:**
- **Aluguel**: Espaços físicos (escritórios)
- **Utilidades**: Luz, água, internet, telefone
- **Software**: Licenças, assinaturas, ferramentas
- **Marketing**: Publicidade, eventos, materiais
- **Outros**: Seguros, manutenção, etc.

### 7.2 Filtrar Custos

Você pode filtrar por:
- **Categoria**: Ver apenas custos de uma categoria específica
- **Status**: Ver apenas ativos ou inativos
- **Período**: Ver custos de um período específico

---

## 8. Visão Mensal Consolidada

A **Visão Mensal Consolidada** mostra um resumo de todo o ano, mês a mês.

### 8.1 Acessar

1. No Dashboard, clique em **Visão Mensal Consolidada** (no topo)
2. Ou no menu, vá em **Dashboard** → **Visão Mensal**

### 8.2 O que você vê

- Tabela com todos os meses do ano
- Para cada mês:
  - Receita total
  - Custos totais
  - Margem
  - Performance geral
- Gráficos de evolução ao longo do ano

**Exemplo de dados que você pode ver (ano 2026):**

| Mês | Receita Total | Custos Totais | Margem | % Margem | Performance | Status |
|-----|---------------|---------------|--------|----------|-------------|--------|
| Janeiro | €59.440 | €45.240 | €14.200 | 24% | 90% | 🟡 |
| Fevereiro | €62.100 | €46.800 | €15.300 | 25% | 94% | 🟡 |
| Março | €58.900 | €44.500 | €14.400 | 24% | 89% | 🟡 |
| Abril | €65.200 | €47.100 | €18.100 | 28% | 99% | 🟢 |
| Maio | €63.800 | €46.200 | €17.600 | 28% | 97% | 🟢 |
| Junho | €61.500 | €45.600 | €15.900 | 26% | 93% | 🟡 |
| **TOTAL** | **€370.940** | **€275.440** | **€95.500** | **26%** | **94%** | 🟡 |

**Interpretação dos dados:**

**Receita Total:**
- Soma de todas as receitas faturáveis dos departamentos
- Inclui retainers + horas faturáveis

**Custos Totais:**
- Custos variáveis (pessoas) + Custos fixos
- Exemplo Janeiro: €37.840 (pessoas) + €7.400 (fixos) = €45.240

**Margem:**
- Receita - Custos = Margem
- Exemplo Janeiro: €59.440 - €45.240 = €14.200
- Percentual: (€14.200 ÷ €59.440) × 100 = 24%

**Performance:**
- Percentual do objetivo atingido
- Exemplo Janeiro: 90% (atingiu 90% do objetivo de €66.080)

**Status:**
- 🟢 Verde: Margem ≥ 30% OU Performance ≥ 100%
- 🟡 Amarelo: Margem entre 20-30% OU Performance entre 80-99%
- 🔴 Vermelho: Margem < 20% OU Performance < 80%

### 8.3 Filtrar por Ano

No topo da página, selecione o **ano** que deseja visualizar.

---

## 9. Perfil e Configurações

### 9.1 Ver seu Perfil

1. No menu, clique em **Perfil** (ou no seu nome no topo)
2. Você verá:
   - Seu nome
   - Seu email
   - Seu papel (ADMIN ou USER)

### 9.2 Configurações Globais (apenas ADMIN)

**Nota:** Apenas usuários ADMIN podem acessar esta seção.

1. No menu, clique em **Configurações**
2. Você pode editar:
   - **Margem Alvo**: Percentual de margem desejado (ex: 30%)
     - *Valor padrão: 0,30 (30%)*
   - **Horas por Mês**: Quantas horas uma pessoa trabalha por mês (ex: 160)
     - *Valor padrão: 160 horas (8h/dia × 20 dias úteis)*
   - **Utilização Faturável**: Percentual de tempo faturável (ex: 65%)
     - *Valor padrão: 0,65 (65% do tempo é faturável)*
   - **Custo por Pessoa/Mês**: Custo médio de cada pessoa (ex: 2200€)
     - *Valor padrão: 2200 (salário + encargos)*
   - **Pessoas Overhead**: Quantas pessoas não são faturáveis (ex: 6)
     - *Valor padrão: 6 (administração, direção, etc.)*

3. Clique em **Salvar Configurações**

**Exemplo de configurações típicas:**

| Configuração | Valor | Explicação |
|-------------|-------|------------|
| Margem Alvo | `0.30` (30%) | A empresa quer ter 30% de margem em média |
| Horas por Mês | `160` | Cada pessoa trabalha 160h/mês (8h/dia × 20 dias) |
| Utilização Faturável | `0.65` (65%) | 65% do tempo das pessoas é faturável (35% é overhead interno) |
| Custo por Pessoa/Mês | `2200` (€2.200) | Custo total de cada pessoa (salário + encargos) |
| Pessoas Overhead | `6` | 6 pessoas não são faturáveis (direção, admin, etc.) |

**Como essas configurações afetam os cálculos:**

**Exemplo prático - Departamento com 4 pessoas:**
- Horas totais: 4 pessoas × 160h = 640h/mês
- Horas faturáveis: 640h × 0,65 = 416h/mês
- Custo total: 4 pessoas × €2.200 = €8.800/mês
- Custo por hora: €8.800 ÷ 416h = €21,15/h (custo interno)
- Se taxa média é €45/h: Margem = (€45 - €21,15) ÷ €45 = 53% de margem

**Se mudar Utilização Faturável para 0,70 (70%):**
- Horas faturáveis: 640h × 0,70 = 448h/mês
- Custo por hora: €8.800 ÷ 448h = €19,64/h
- Margem: (€45 - €19,64) ÷ €45 = 56% de margem (melhor!)

**Importante:** Essas configurações afetam todos os cálculos do sistema. Altere apenas se souber o que está fazendo.

---

## 10. Dúvidas Frequentes

### 10.1 Por que não consigo editar as horas reais de um departamento?

Alguns departamentos são sincronizados automaticamente do sistema Odoo. Nestes casos, as "Horas Reais" são protegidas e só podem ser atualizadas via sincronização. Você ainda pode editar as "Horas Disponíveis (alvo)".

### 10.2 O que significa "Performance" no Dashboard?

A Performance mostra quanto percentual do objetivo mensal foi atingido. Por exemplo:
- **100%**: Objetivo foi atingido completamente
  - *Exemplo: Objetivo de €20.000, atingiu €20.000*
- **80%**: Faltam 20% para atingir o objetivo
  - *Exemplo: Objetivo de €20.000, atingiu €16.000 (faltam €4.000)*
- **120%**: Superou o objetivo em 20%
  - *Exemplo: Objetivo de €20.000, atingiu €24.000 (superou em €4.000)*

**Cores no sistema:**
- 🟢 Verde: Performance ≥ 100% (objetivo atingido ou superado)
- 🟡 Amarelo: Performance entre 80% e 99% (próximo do objetivo)
- 🔴 Vermelho: Performance < 80% (abaixo do esperado)

### 10.3 Como vejo dados de meses anteriores?

Use os filtros de **Mês** e **Ano** no topo das páginas. Você pode selecionar qualquer mês/ano para visualizar dados históricos.

### 10.4 O que são "Horas Disponíveis (alvo)"?

São as horas que o departamento tem disponível para faturar, considerando:
- Horas totais do mês
- Horas já utilizadas
- Horas planejadas

Este valor é calculado automaticamente, mas pode ser editado manualmente se necessário.

**Exemplo de cálculo:**
- Departamento com 4 pessoas
- Horas por mês: 160h por pessoa
- Total: 4 × 160 = 640 horas totais
- Utilização faturável: 65%
- Horas disponíveis (alvo): 640 × 0,65 = **416 horas**

Se o departamento trabalhou 485 horas reais, mas o alvo é 416h, significa que trabalhou mais horas do que o planejado.

### 10.5 Por que alguns departamentos aparecem como "N/A" no Dashboard?

Isso acontece quando:
- Não há dados cadastrados para aquele mês
- O departamento não tem horas planejadas
- Os cálculos ainda não foram executados

Clique em **Recalcular** no Dashboard para atualizar os dados.

### 10.6 Como faço para exportar os dados?

Atualmente, o sistema não possui exportação automática. Entre em contato com o administrador se precisar exportar dados específicos.

### 10.7 Esqueci minha senha. O que fazer?

Entre em contato com o administrador do sistema para redefinir sua senha.

---

## 📞 Suporte

Se você tiver dúvidas ou encontrar problemas:

1. Verifique este guia primeiro
2. Entre em contato com o administrador do sistema
3. Forneça detalhes sobre o problema (tela, mensagem de erro, etc.)

---

**Última atualização:** Janeiro 2026

