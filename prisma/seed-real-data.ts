import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ExtractedData {
  departments: Array<{
    name: string;
    billableHeadcount: number;
    costPerPersonPerMonth: number | null;
    targetUtilization: number;
    averageHourlyRate: number;
  }>;
  retainerCatalog: Array<{
    name: string;
    departmentName: string;
    monthlyPrice: number | null;
    hoursPerMonth: number | null;
    baseHours: number | null;
    basePrice: number | null;
  }>;
  retainers: Array<{
    name: string;
    catalogName: string;
    departmentName: string;
    monthlyPrice: number | null;
    quantity: number;
    notes: string | null;
  }>;
  plannedHours: Array<{
    departmentName: string;
    month: number;
    year: number;
    billableHeadcount: number | null;
    actualBillableHours: number | null;
    projectRevenue: number | null;
  }>;
  globalSettings: Array<{
    key: string;
    value: string;
    description?: string | null;
  }>;
  fixedCosts: Array<{
    name: string;
    category: string;
    monthlyAmount: number;
    description: string | null;
    startDate: string;
    endDate: string | null;
  }>;
}

async function main() {
  console.log("🌱 Seeding database with real data from Excel...");

  // 0. Limpar dados de domínio (preservando usuários/autenticação)
  console.log("🧹 Limpando dados de domínio (preservando usuários)...");

  // Ordem de deleção: filhos → pais
  await prisma.auditLog.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.objective.deleteMany({});
  await prisma.plannedHours.deleteMany({});
  await prisma.retainer.deleteMany({});
  await prisma.retainerCatalog.deleteMany({});
  await prisma.fixedCost.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.globalSetting.deleteMany({});

  console.log("✅ Dados de domínio limpos (usuários preservados)");

  // 1. Ler dados extraídos
  const dataPath = path.join(__dirname, "..", "extracted-data.json");
  if (!fs.existsSync(dataPath)) {
    console.error("❌ Arquivo extracted-data.json não encontrado!");
    console.log("Execute primeiro: node scripts/extract-real-data.js");
    process.exit(1);
  }

  const extractedData: ExtractedData = JSON.parse(
    fs.readFileSync(dataPath, "utf-8"),
  );

  // 2. Criar configurações globais (prioriza valores da planilha, com fallback)
  console.log("\n📋 Criando Configurações Globais...");

  const defaults = {
    targetMargin: {
      value: "0.3",
      description: "Margem alvo (ex.: 0,30 = 30%)",
    },
    hoursPerMonth: {
      value: "160",
      description: "Horas de trabalho por mês",
    },
    targetUtilization: {
      value: "0.65",
      description: "Utilização faturável média (ex.: 0,65 = 65%)",
    },
    costPerPersonPerMonth: {
      value: "2200",
      description: "Custo médio por pessoa / mês (empresa)",
    },
    overheadPeople: {
      value: "6",
      description: "Nº pessoas NÃO faturáveis (overhead)",
    },
  } as const;

  const keys = Object.keys(defaults) as Array<keyof typeof defaults>;

  for (const key of keys) {
    const fromSheet = extractedData.globalSettings.find((s) => s.key === key);
    const setting = {
      key,
      value: fromSheet?.value ?? defaults[key].value,
      description: fromSheet?.description ?? defaults[key].description,
    };

    await prisma.globalSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("✅ Global settings created");

  // Carregar configurações numéricas para uso posterior
  const companySettings = await prisma.globalSetting.findMany();
  const hoursPerMonthSetting = companySettings.find(
    (s) => s.key === "hoursPerMonth",
  );
  const hoursPerMonth = hoursPerMonthSetting
    ? parseFloat(hoursPerMonthSetting.value)
    : 160;

  // 3. Criar Departamentos
  console.log("\n📋 Criando Departamentos...");
  const departmentMap = new Map<string, string>();

  for (const dept of extractedData.departments) {
    // Ignorar departamentos não faturáveis
    if (dept.name.includes("não faturável") || dept.averageHourlyRate === 0) {
      console.log(`   ⏭️  Pulando: ${dept.name} (não faturável)`);
      continue;
    }

    const created = await prisma.department.upsert({
      where: { name: dept.name },
      update: {
        billableHeadcount: dept.billableHeadcount,
        costPerPersonPerMonth: dept.costPerPersonPerMonth
          ? dept.costPerPersonPerMonth
          : undefined,
        targetUtilization: dept.targetUtilization,
        averageHourlyRate: dept.averageHourlyRate,
      },
      create: {
        name: dept.name,
        billableHeadcount: dept.billableHeadcount,
        costPerPersonPerMonth: dept.costPerPersonPerMonth || undefined,
        targetUtilization: dept.targetUtilization,
        averageHourlyRate: dept.averageHourlyRate,
      },
    });

    departmentMap.set(dept.name, created.id);
    console.log(
      `   ✅ ${dept.name} (HC: ${dept.billableHeadcount}, Taxa: €${dept.averageHourlyRate}/h)`,
    );
  }

  // 4. Criar Catálogo de Avenças
  console.log("\n📋 Criando Catálogo de Avenças...");
  const catalogMap = new Map<string, string>();

  for (const catalog of extractedData.retainerCatalog) {
    const departmentId = departmentMap.get(catalog.departmentName);

    if (!departmentId) {
      console.log(
        `   ⚠️  Departamento não encontrado: ${catalog.departmentName}`,
      );
      continue;
    }

    // Usar preço base se mensal não estiver disponível
    const finalPrice = catalog.monthlyPrice || catalog.basePrice || 0;
    const finalHours = catalog.hoursPerMonth || catalog.baseHours || 0;

    if (finalPrice === 0 && finalHours === 0) {
      console.log(`   ⏭️  Pulando: ${catalog.name} (sem preço/horas)`);
      continue;
    }

    const created = await prisma.retainerCatalog.upsert({
      where: { name: catalog.name },
      update: {
        departmentId,
        monthlyPrice: finalPrice,
        hoursPerMonth: finalHours,
        baseHours: catalog.baseHours || finalHours,
        basePrice: catalog.basePrice || finalPrice,
      },
      create: {
        name: catalog.name,
        departmentId,
        monthlyPrice: finalPrice,
        hoursPerMonth: finalHours,
        baseHours: catalog.baseHours || finalHours,
        basePrice: catalog.basePrice || finalPrice,
        isActive: true,
      },
    });

    catalogMap.set(catalog.name, created.id);
    console.log(`   ✅ ${catalog.name} (€${finalPrice}/mês, ${finalHours}h)`);
  }

  // 5. Criar Avenças Ativas (se houver)
  if (extractedData.retainers.length > 0) {
    console.log("\n📋 Criando Avenças Ativas...");
    const currentDate = new Date();

    for (const retainer of extractedData.retainers) {
      const departmentId = departmentMap.get(retainer.departmentName);
      const catalogId = catalogMap.get(retainer.catalogName);

      if (!departmentId) {
        console.log(
          `   ⚠️  Departamento não encontrado: ${retainer.departmentName}`,
        );
        continue;
      }

      // Buscar preço do catálogo se não tiver
      let monthlyPrice = retainer.monthlyPrice;
      if (!monthlyPrice && catalogId) {
        const catalog = await prisma.retainerCatalog.findUnique({
          where: { id: catalogId },
        });
        monthlyPrice = catalog ? Number(catalog.monthlyPrice) : null;
      }

      if (!monthlyPrice) {
        console.log(`   ⏭️  Pulando: ${retainer.name} (sem preço)`);
        continue;
      }

      // Verificar se já existe
      const existing = await prisma.retainer.findFirst({
        where: {
          departmentId,
          name: retainer.name,
        },
      });

      if (existing) {
        const monthlyRevenue = monthlyPrice * retainer.quantity;

        await prisma.retainer.update({
          where: { id: existing.id },
          data: {
            catalogId: catalogId || undefined,
            monthlyPrice,
            quantity: retainer.quantity,
            monthlyRevenue,
            notes: retainer.notes || undefined,
            isActive: retainer.quantity > 0,
          },
        });
      } else {
        const monthlyRevenue = monthlyPrice * retainer.quantity;

        await prisma.retainer.create({
          data: {
            departmentId,
            catalogId: catalogId || undefined,
            name: retainer.name,
            monthlyPrice,
            quantity: retainer.quantity,
            monthlyRevenue,
            notes: retainer.notes || undefined,
            startDate: currentDate,
            isActive: retainer.quantity > 0,
          },
        });
      }

      console.log(
        `   ✅ ${retainer.name} (${retainer.quantity}x €${monthlyPrice}/mês)`,
      );
    }
  } else {
    console.log(
      "\n📋 Nenhuma avença ativa encontrada na planilha (todas com quantidade 0)",
    );
  }

  // 6. Criar Custos Fixos
  console.log("\n📋 Criando Custos Fixos...");
  let fixedCostsCreated = 0;
  for (const cost of extractedData.fixedCosts) {
    try {
      await prisma.fixedCost.create({
        data: {
          name: cost.name,
          // category já normalizada no script de extração
          category: cost.category as any,
          monthlyAmount: cost.monthlyAmount,
          description: cost.description,
          startDate: new Date(cost.startDate),
          endDate: cost.endDate ? new Date(cost.endDate) : null,
          isActive: true,
        },
      });
      fixedCostsCreated++;
    } catch (e) {
      console.log(
        `   ⚠️  Erro ao criar custo fixo "${cost.name}":`,
        (e as Error).message,
      );
    }
  }
  console.log(`✅ Custos fixos criados: ${fixedCostsCreated}`);

  // 7. Criar Horas Planejadas
  console.log("\n📋 Criando Horas Planejadas...");
  const plannedHoursSummary = new Set<string>();

  for (const ph of extractedData.plannedHours) {
    const departmentId = departmentMap.get(ph.departmentName);
    if (!departmentId) {
      console.log(
        `   ⚠️  Departamento não encontrado para horas: ${ph.departmentName}`,
      );
      continue;
    }

    const dept = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!dept) continue;

    const billableHeadcount = ph.billableHeadcount ?? dept.billableHeadcount;
    const targetUtilization = Number(dept.targetUtilization);
    const targetAvailableHours =
      billableHeadcount * hoursPerMonth * targetUtilization;

    await prisma.plannedHours.upsert({
      where: {
        departmentId_month_year: {
          departmentId,
          month: ph.month,
          year: ph.year,
        },
      },
      update: {
        billableHeadcount,
        targetHoursPerMonth: hoursPerMonth,
        targetUtilization,
        targetAvailableHours,
        actualBillableHours: ph.actualBillableHours ?? null,
        projectRevenue: ph.projectRevenue ?? null,
      },
      create: {
        departmentId,
        month: ph.month,
        year: ph.year,
        billableHeadcount,
        targetHoursPerMonth: hoursPerMonth,
        targetUtilization,
        targetAvailableHours,
        actualBillableHours: ph.actualBillableHours ?? null,
        projectRevenue: ph.projectRevenue ?? null,
      },
    });

    plannedHoursSummary.add(`${departmentId}-${ph.year}-${ph.month}`);
  }

  console.log(`✅ Registros de horas planejadas: ${plannedHoursSummary.size}`);

  // 8. Calcular métricas anuais e criar Objetivos mensais baseados no mínimo anual
  console.log("\n📋 Calculando métricas anuais e criando Objetivos mensais...");

  const { calculateDepartmentAnnualMetrics, calculateDepartmentResult } =
    await import("../src/lib/business-logic/calculations");

  const departments = await prisma.department.findMany();
  const deptAnnualMin: Record<string, number | null> = {};

  for (const dept of departments) {
    const updated = await calculateDepartmentAnnualMetrics(dept.id);
    const minimum = updated.minimumRevenueAnnual
      ? Number(updated.minimumRevenueAnnual)
      : null;
    deptAnnualMin[dept.id] = minimum;
  }

  // Criar objetivos mensais iguais a (mínimo anual / 12) para cada combinação dept/mês/ano com horas
  for (const key of plannedHoursSummary) {
    const [departmentId, yearStr, monthStr] = key.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const minimum = deptAnnualMin[departmentId];
    if (!minimum) continue;

    const monthlyObjective = minimum / 12;

    await prisma.objective.upsert({
      where: {
        departmentId_month_year: {
          departmentId,
          month,
          year,
        },
      },
      update: {
        targetValue: monthlyObjective,
      },
      create: {
        departmentId,
        month,
        year,
        targetValue: monthlyObjective,
      },
    });
  }

  console.log(
    "✅ Objetivos mensais criados/atualizados com base no mínimo anual",
  );

  // 9. Calcular Resultados mensais a partir das horas, avenças e objetivos
  console.log("\n📋 Calculando Resultados mensais...");

  for (const key of plannedHoursSummary) {
    const [departmentId, yearStr, monthStr] = key.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    try {
      await calculateDepartmentResult(departmentId, month, year);
    } catch (error) {
      console.error(
        `   ⚠️  Erro ao calcular resultado para dept ${departmentId}, ${month}/${year}:`,
        error,
      );
    }
  }

  console.log("✅ Resultados mensais calculados");

  console.log("\n🎉 Seeding completed!");
  console.log(`\n📊 Resumo:`);
  console.log(`   - Departamentos: ${departmentMap.size}`);
  console.log(`   - Catálogo Avenças: ${catalogMap.size}`);
  console.log(
    `   - Avenças Ativas (linhas na planilha): ${extractedData.retainers.length}`,
  );
  console.log(
    `   - Horas Planejadas (combinações dept/mês/ano): ${plannedHoursSummary.size}`,
  );
  console.log(`   - Custos Fixos: ${fixedCostsCreated}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
