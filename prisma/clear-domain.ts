/**
 * Script para limpar apenas os dados de domínio,
 * preservando usuários e tabelas de autenticação.
 *
 * Use quando quiser começar do zero com departamentos, avenças,
 * horas, objetivos, custos fixos, configurações globais, etc.,
 * sem apagar contas de utilizadores.
 *
 * Execute com: npm run db:clear:domain
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Limpando dados de domínio (preservando usuários e auth)...");

  try {
    // Ordem de deleção: tabelas filhas primeiro, depois tabelas pais
    // para evitar erros de foreign key.

    console.log("  - Deletando AuditLogs...");
    await prisma.auditLog.deleteMany({});

    console.log("  - Deletando Results...");
    await prisma.result.deleteMany({});

    console.log("  - Deletando Objectives...");
    await prisma.objective.deleteMany({});

    console.log("  - Deletando PlannedHours...");
    await prisma.plannedHours.deleteMany({});

    console.log("  - Deletando Retainers...");
    await prisma.retainer.deleteMany({});

    console.log("  - Deletando RetainerCatalog...");
    await prisma.retainerCatalog.deleteMany({});

    console.log("  - Deletando FixedCosts...");
    await prisma.fixedCost.deleteMany({});

    console.log("  - Deletando Departments...");
    await prisma.department.deleteMany({});

    console.log("  - Deletando GlobalSettings...");
    await prisma.globalSetting.deleteMany({});

    console.log("  - Deletando OdooDepartmentMappings...");
    await prisma.odooDepartmentMapping.deleteMany({});

    console.log("  - Deletando OdooIntegrations...");
    await prisma.odooIntegration.deleteMany({});

    console.log("✅ Dados de domínio limpos com sucesso!");
    console.log("");
    console.log(
      "💡 Agora você pode seguir o tutorial em docs/TUTORIAL_DADOS_FICTICIOS.md",
    );
  } catch (error) {
    console.error("❌ Erro ao limpar dados de domínio:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
