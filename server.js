// ✅ Sri Dongardevi Krishi Kendra Backend (FINAL FIXED)

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "https://nagaraj-karamagi.github.io",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
  ],
}));

app.use(express.json());

// ✅ PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("🚀 Krushi Kendra Backend Running");
});

// 🧾 ADD BILL (FIXED)
app.post("/add-bill", async (req, res) => {
  try {
    console.log("📥 Incoming bill:", req.body);

    const result = await pool.query(
      `INSERT INTO bills
      (customer_name, particular, quantity, rate_incl_tax, total_amount, grand_total,
       payment_mode, amount_paid, balance_amount, bill_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
      RETURNING *`,
      [
        req.body.customer_name || null,
        req.body.particular || null,
        Number(req.body.quantity) || 0,
        Number(req.body.rate_incl_tax) || 0,
        Number(req.body.total_amount) || 0,
        Number(req.body.grand_total) || 0,
        req.body.payment_mode || null,
        Number(req.body.amount_paid) || 0,
        Number(req.body.balance_amount) || 0,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Insert error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📦 GET BILLS
app.get("/bills", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bills ORDER BY bill_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🗑 DELETE BILL
app.delete("/delete-bill/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM bills WHERE bill_id=$1",
      [req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ UPDATE BILL
app.put("/update-bill/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE bills SET
        payment_mode=$1,
        amount_paid=$2,
        balance_amount=$3
       WHERE bill_id=$4
       RETURNING *`,
      [
        req.body.payment_mode,
        Number(req.body.amount_paid),
        Number(req.body.balance_amount),
        req.params.id,
      ]
    );

    if (!result.rowCount) return res.status(404).json({ message: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
