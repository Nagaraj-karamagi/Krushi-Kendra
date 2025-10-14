import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render/Postgres external
  },
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL Database (Render)");
});

export default pool;