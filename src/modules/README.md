# Módulos de Domínio

Esta pasta contém os módulos de domínio do sistema, organizados por responsabilidade de negócio.

## Estrutura

Cada módulo segue a estrutura:

```
modules/
  {nome}/
    domain.ts      # Tipos e conceitos de domínio
    service.ts     # Regras de negócio e lógica
    index.ts       # Exports públicos
```

## Módulos Implementados

### `settings/` - Configurações Globais da Empresa

**Responsabilidade**: Centraliza acesso e parsing de `GlobalSetting`.

**Tipos principais**:
- `CompanySettings`: Configurações tipadas (targetMargin, hoursPerMonth, etc.)
- `SETTING_KEYS`: Chaves padronizadas para o banco
- `DEFAULT_SETTINGS`: Valores padrão quando configuração não existe

**Serviços**:
- `getCompanySettings()`: Busca e parseia todas as configurações
- `getSettingValue(key)`: Busca uma configuração específica como string

**Uso**:
```typescript
import { getCompanySettings } from '@/modules/settings'

const settings = await getCompanySettings()
// settings.targetMargin (number, não string!)
// settings.hoursPerMonth (number)
```

---

### `departments/` - Departamentos e Métricas Financeiras

**Responsabilidade**: Cálculo de métricas anuais, overhead alocado e receita mínima.

**Tipos principais**:
- `DepartmentAnnualMetrics`: Métricas calculadas (custos, capacidade, overhead, receita mínima)
- `DepartmentView`: Visão consolidada de departamento + métricas

**Serviços**:
- `calculateOverheadAllocation(departmentId)`: Calcula overhead alocado proporcionalmente
- `calculateAnnualMetrics(departmentId)`: Calcula e persiste todas as métricas anuais
- `calculateAnnualMetricsWithoutSaving(departmentId)`: Calcula sem persistir (simulações)
- `getDepartmentMonthlyResult(departmentId, month, year)`: **Motor mensal** - orquestra todos os módulos para calcular e persistir resultado mensal completo

**Regras de Negócio Centralizadas**:

1. **Overhead Alocado**:
   ```
   totalOverheadCost = overheadPeople * costPerPersonPerMonth * 12
   allocationRatio = dept.billableHeadcount / totalBillableHC
   overheadAllocatedAnnual = totalOverheadCost * allocationRatio
   ```

2. **Custo Direto Anual**:
   ```
   directCostAnnual = billableHeadcount * costPerPerson * 12
   (usa costPerPersonPerMonth do dept ou padrão da empresa)
   ```

3. **Horas Faturáveis Anuais**:
   ```
   billableHoursAnnual = billableHeadcount * hoursPerMonth * targetUtilization * 12
   ```

4. **Capacidade de Receita Anual**:
   ```
   revenueCapacityAnnual = billableHoursAnnual * averageHourlyRate
   ```

5. **Receita Mínima Anual**:
   ```
   minimumRevenueAnnual = (directCostAnnual + overheadAllocatedAnnual) / (1 - targetMargin)
   ```

**Uso**:
```typescript
import { calculateAnnualMetrics } from '@/modules/departments'

// Após criar/atualizar departamento
await calculateAnnualMetrics(departmentId)
```

---

### `dashboards/` - Visão Executiva (Company Dashboard)

**Responsabilidade**: Fornecer uma visão consolidada da empresa para um mês/ano:
- Totais de receita e objetivo
- Performance geral e por departamento
- Ranking de departamentos
- Série dos últimos meses (receita vs objetivo)

**Tipos principais**:
- `CompanyDashboardOverview`: DTO completo consumido pela UI do dashboard
- `DepartmentDashboardSummary`: Visão resumida de cada departamento (inclui status)
- `PerformanceChartPoint`: Ponto do gráfico de performance por departamento
- `RevenueEvolutionPoint`: Ponto da série de evolução mensal
- `RankedDepartment`: Entrada de ranking, já ordenada e categorizada
- `PerformanceStatus`: `'good' | 'warning' | 'bad'`

**Serviços**:
- `getCompanyDashboardOverview(month, year)`: Monta toda a visão do dashboard em uma chamada

**Regras de Negócio Centralizadas**:
- Cálculo de totais (receita, objetivo, performance geral, gap)
- Thresholds de performance via constantes:
  - `PERFORMANCE_GOOD_THRESHOLD = 100`
  - `PERFORMANCE_WARNING_THRESHOLD = 80`
- Montagem de ranking já ordenado e categorizado por `PerformanceStatus`
- Construção da série dos últimos 6 meses (incluindo o mês selecionado)

**Uso**:
```typescript
import { getCompanyDashboardOverview } from '@/modules/dashboards'

const overview = await getCompanyDashboardOverview(selectedMonth, selectedYear)
// Passar overview direto para a UI (DashboardPageClient)
```

---

### `hours/` - Horas Planejadas e Reais

**Responsabilidade**: Centralizar regras relacionadas a capacidade de horas:
- Plano mensal (headcount, horas alvo, utilização alvo)
- Horas reais faturáveis
- Capacidade planejada (`targetAvailableHours`)
- Taxa de utilização (`utilizationRate`)

**Tipos principais**:
- `WorkHoursPlan`: Dados de plano (billableHeadcount, targetHoursPerMonth, targetUtilization)
- `WorkHoursActual`: Dados reais (actualBillableHours)
- `HoursCapacity`: Capacidade derivada (targetAvailableHours)

**Serviços**:
- `calculateTargetAvailableHours(plan)`: Calcula `targetAvailableHours` com base no plano
- `calculateUtilizationRate(actual, capacity)`: Calcula `utilizationRate` a partir de horas reais e capacidade

**Regras de Negócio Centralizadas**:

1. **Capacidade Planejada**:
   ```ts
   targetAvailableHours =
     billableHeadcount * targetHoursPerMonth * targetUtilization
   ```

2. **Taxa de Utilização**:
   ```ts
   utilizationRate = actualBillableHours / targetAvailableHours
   ```

**Uso**:
```typescript
import { calculateTargetAvailableHours } from '@/modules/hours'

const targetAvailableHours = calculateTargetAvailableHours({
  billableHeadcount,
  targetHoursPerMonth,
  targetUtilization,
})
```

---

### `retainers/` - Avenças e Receita Recorrente

**Responsabilidade**: Centralizar regras de negócio das avenças:
- Precificação mensal (`monthlyPrice`, `quantity`, `monthlyRevenue`)
- Seleção de avenças ativas em um período
- Receita recorrente mensal por departamento

**Tipos principais**:
- `RetainerPricing`: Estrutura de precificação (`monthlyPrice`, `quantity`, `monthlyRevenue`)
- `RetainerContract`: Conceito de avença ativa (vínculo com departamento e datas)
- `DepartmentRetainerSummary`: Resumo mensal de receita de avenças por departamento

**Serviços**:
- `calculateRetainerMonthlyRevenue(price, quantity)`: Calcula `monthlyRevenue` a partir de preço e quantidade
- `getActiveRetainersForMonth(departmentId, month, year)`: Seleciona avenças ativas no período
- `getDepartmentRetainerRevenueForMonth(departmentId, month, year)`: Soma receita recorrente de avenças do departamento no mês

**Regras de Negócio Centralizadas**:

1. **Receita Mensal da Avença**:
   ```ts
   monthlyRevenue = monthlyPrice * quantity
   ```

2. **Filtro de Avenças Ativas** (mês/ano):
   - `departmentId` bate
   - `isActive = true`
   - `startDate <= fimDoMes`
   - `endDate` é `null` **ou** `endDate >= inicioDoMes`

**Uso**:
```typescript
import { calculateRetainerMonthlyRevenue } from '@/modules/retainers'

const pricing = calculateRetainerMonthlyRevenue(monthlyPrice, quantity)
// pricing.monthlyRevenue é usado para preencher Prisma.Retainer.monthlyRevenue
```

---

### `fixed-costs/` - Custos Fixos Mensais da Empresa

**Responsabilidade**: Centralizar regras de negócio dos custos fixos mensais:
- Custos fixos recorrentes (aluguel, utilidades, softwares, viaturas, etc.)
- Cálculo de totais mensais e anuais
- Agrupamento por categoria
- Integração com cálculo de overhead

**Tipos principais**:
- `FixedCost`: Custo fixo mensal com categoria, valor, período
- `FixedCostCategory`: Categoria do custo ('Aluguel', 'Utilidades', 'Software', 'Viaturas', 'Outros')
- `FixedCostSummary`: Resumo por categoria (total mensal, anual, contagem)
- `FixedCostsOverview`: Visão consolidada de todos os custos fixos

**Serviços**:
- `getActiveFixedCostsForMonth(month, year)`: Busca custos fixos ativos em um mês/ano
- `getTotalFixedCostsForMonth(month, year)`: Calcula total mensal de custos fixos
- `getTotalFixedCostsAnnual(month, year)`: Calcula total anual (mensal × 12)
- `getFixedCostsOverview(month, year)`: Monta visão consolidada com breakdown por categoria

**Regras de Negócio Centralizadas**:

1. **Custo Fixo Ativo** (mês/ano):
   - `isActive = true`
   - `startDate <= fimDoMes`
   - `endDate` é `null` **ou** `endDate >= inicioDoMes`

2. **Total Anual**:
   ```ts
   totalAnnual = totalMonthly * 12
   ```

**Integração com Overhead**:
Os custos fixos são automaticamente incluídos no cálculo de overhead alocado:
```ts
totalOverheadCost = (overheadPeople * costPerPersonPerMonth * 12) + fixedCostsAnnual
```

**Uso**:
```typescript
import { getTotalFixedCostsAnnual } from '@/modules/fixed-costs'

const fixedCostsAnnual = await getTotalFixedCostsAnnual(month, year)
// Usado no cálculo de overhead alocado
```

---

## Compatibilidade

As funções antigas em `lib/business-logic/calculations.ts` foram mantidas como **wrappers** para garantir compatibilidade:

- `calculateDepartmentOverhead()` → delega para `calculateOverheadAllocation()`
- `calculateDepartmentAnnualMetrics()` → delega para `calculateAnnualMetrics()`
- `getGlobalSettings()` → delega para `getCompanySettings()` (deprecated)

**IMPORTANTE**: Código existente continua funcionando. A migração é gradual.

---

## Módulos Concluídos ✅

- `settings/`: Configurações globais da empresa
- `departments/`: Métricas anuais e **motor mensal** (`getDepartmentMonthlyResult`)
- `hours/`: Capacidade e utilização de horas
- `retainers/`: Receita recorrente mensal
- `dashboards/`: Visão executiva consolidada
- `fixed-costs/`: Custos fixos mensais da empresa (aluguel, utilidades, softwares, viaturas, etc.)

## Próximos Módulos (Opcional - Fase 2)

- `planning/`: Objetivos mínimos e gap análise (pode usar os módulos existentes)
- `audit/`: Auditoria e trilhas de alterações (já existe em `lib/business-logic/audit.ts`)

---

## Princípios

1. **Separação de Responsabilidades**: Cada módulo tem uma responsabilidade clara
2. **Tipagem Forte**: Tipos de domínio refletem conceitos reais do negócio
3. **Regras Centralizadas**: Nenhuma regra financeira fica espalhada
4. **Compatibilidade**: Wrappers mantêm código existente funcionando
5. **Documentação**: Regras de negócio documentadas nos serviços

