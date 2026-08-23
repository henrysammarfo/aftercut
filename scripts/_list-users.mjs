import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}
const sql = neon(url);
const rows = await sql`select id, email, name, created_at from "user" order by created_at desc limit 10`;
console.log(JSON.stringify(rows, null, 2));
