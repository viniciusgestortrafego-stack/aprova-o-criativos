import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const comandos = readFileSync(new URL("./schema.sql", import.meta.url), "utf8")
  .replace(/--.*$/gm, "")
  .split(";")
  .map((c) => c.trim())
  .filter(Boolean);
for (const c of comandos) await sql.query(c);
console.log(`${comandos.length} comandos aplicados`);
