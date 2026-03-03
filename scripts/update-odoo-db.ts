import { initializeOdooFromEnv } from "../src/lib/integrations/odoo/service";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Variável lida do .env:", process.env.ODOO_DATABASE);

  const integration = await initializeOdooFromEnv();
  console.log("Configuração no Banco:", integration?.database);
}

main().catch(console.error);
