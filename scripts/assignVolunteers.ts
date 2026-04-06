import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npx ts-node scripts/assignVolunteers.ts <csv-file>");
    process.exit(1);
  }

  const content = fs.readFileSync(path.resolve(csvPath), "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());

  let updated = 0;
  let errors = 0;

  for (const line of lines) {
    const commaIdx = line.indexOf(",");
    if (commaIdx === -1) {
      console.error(`❌ Skipping malformed line: "${line}"`);
      errors++;
      continue;
    }

    const email = line.slice(0, commaIdx).trim();
    const name = line.slice(commaIdx + 1).trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      console.error(`❌ User not found: ${email} (${name})`);
      errors++;
      continue;
    }

    await prisma.user.update({
      where: { email },
      data: { role: "VOLUNTEER" },
    });

    console.log(`✅ Updated ${email} (${name}) → VOLUNTEER`);
    updated++;
  }

  console.log(`\nDone: ${updated} updated, ${errors} errors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
