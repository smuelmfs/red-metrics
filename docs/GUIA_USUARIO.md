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
- **Performance Geral**: Percentual de quanto foi atingido do objetivo
- **Resumo por Departamento**: Cards mostrando a performance de cada departamento
- **Gráficos**: 
  - Gráfico de Performance (comparação entre departamentos)
  - Gráfico de Receita (evolução ao longo do tempo)
  - Classificação de Departamentos (ranking)

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

### 3.2 Ver Detalhes de um Departamento

1. Clique no nome do departamento na lista
2. Você verá:
   - Informações completas do departamento
   - Histórico de performance
   - Dados mensais detalhados

### 3.3 Visualização Anual

1. Na página de Departamentos, clique em **Visão Anual**
2. Você verá um resumo de todo o ano para todos os departamentos

---

## 4. Planejamento de Horas

A página de **Planejamento de Horas** permite visualizar e editar as horas planejadas e reais de cada departamento.

### 4.1 Visualizar Horas

1. No menu, clique em **Planejamento de Horas**
2. Selecione o **mês** e **ano** que deseja ver
3. Você verá uma tabela com:
   - Nome do departamento
   - Horas Planejadas (alvo)
   - Horas Reais (o que foi executado)
   - Horas Disponíveis (alvo)
   - Status

### 4.2 Editar Horas (se permitido)

**Nota:** Apenas usuários ADMIN podem editar horas. Departamentos sincronizados do Odoo têm as horas protegidas.

1. Clique em **Editar** na linha do departamento desejado
2. Preencha os campos:
   - **Horas Planejadas**: Quantas horas o departamento deve trabalhar
   - **Horas Reais**: Quantas horas foram realmente trabalhadas (apenas para departamentos manuais)
   - **Horas Disponíveis (alvo)**: Horas disponíveis para faturar
3. Clique em **Salvar**

**Importante:** 
- Departamentos que vêm do Odoo têm as "Horas Reais" sincronizadas automaticamente
- Você pode editar "Horas Disponíveis (alvo)" mesmo para departamentos do Odoo

---

## 5. Objetivos Mensais

Os **Objetivos** definem quanto cada departamento precisa faturar no mês.

### 5.1 Ver Objetivos

1. No menu, clique em **Objetivos**
2. Selecione o **mês** e **ano**
3. Você verá uma lista com:
   - Departamento
   - Objetivo em euros
   - Valor atingido
   - Percentual de performance

### 5.2 Criar/Editar Objetivo (apenas ADMIN)

1. Clique em **Novo Objetivo** ou **Editar** em um objetivo existente
2. Preencha:
   - **Departamento**: Selecione qual departamento
   - **Mês/Ano**: Período do objetivo
   - **Valor do Objetivo**: Quanto em euros precisa ser faturado
3. Clique em **Salvar**

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
   - **Horas por Mês**: Quantas horas uma pessoa trabalha por mês (ex: 160)
   - **Utilização Faturável**: Percentual de tempo faturável (ex: 65%)
   - **Custo por Pessoa/Mês**: Custo médio de cada pessoa (ex: 2200€)
   - **Pessoas Overhead**: Quantas pessoas não são faturáveis (ex: 6)

3. Clique em **Salvar Configurações**

**Importante:** Essas configurações afetam todos os cálculos do sistema. Altere apenas se souber o que está fazendo.

---

## 10. Dúvidas Frequentes

### 10.1 Por que não consigo editar as horas reais de um departamento?

Alguns departamentos são sincronizados automaticamente do sistema Odoo. Nestes casos, as "Horas Reais" são protegidas e só podem ser atualizadas via sincronização. Você ainda pode editar as "Horas Disponíveis (alvo)".

### 10.2 O que significa "Performance" no Dashboard?

A Performance mostra quanto percentual do objetivo mensal foi atingido. Por exemplo:
- **100%**: Objetivo foi atingido completamente
- **80%**: Faltam 20% para atingir o objetivo
- **120%**: Superou o objetivo em 20%

### 10.3 Como vejo dados de meses anteriores?

Use os filtros de **Mês** e **Ano** no topo das páginas. Você pode selecionar qualquer mês/ano para visualizar dados históricos.

### 10.4 O que são "Horas Disponíveis (alvo)"?

São as horas que o departamento tem disponível para faturar, considerando:
- Horas totais do mês
- Horas já utilizadas
- Horas planejadas

Este valor é calculado automaticamente, mas pode ser editado manualmente se necessário.

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

