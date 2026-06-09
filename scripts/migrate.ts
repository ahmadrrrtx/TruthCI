import { migrate } from "@/lib/db/migrate";

async function main() {
  await migrate();
  console.log("TruthCI database migrated.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
