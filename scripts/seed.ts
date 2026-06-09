import { migrate } from "@/lib/db/migrate";

async function main() {
  await migrate();
  console.log("No seed data required for TruthCI MVP.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
