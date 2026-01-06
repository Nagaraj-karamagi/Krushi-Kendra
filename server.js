// ✅ Sri Dongardevi Krishi Kendra Backend
// Express + PostgreSQL + Render (PRODUCTION READY)

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// ✅ MIDDLEWARE
// =======================
app.use(
  cors({
    origin: [
      "https://nagaraj-karamagi.github.io", // GitHub Pages frontend
      "http://localhost:5500",
      "http://127.0.0.1:5500",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// =======================
// ✅ POSTGRESQL CONNECTION
// =======================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // REQUIRED for Render PostgreSQL
  },
});

pool
  .connect()
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));

// =======================
// ✅ TEST ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("🚀 Sri Dongardevi Krishi Kendra Backend is running!");
});

// =======================
// 🧾 ADD NEW BILL
// =======================
app.post("/add-bill", async (req, res) => {
  try {
    const {
      customer_name,
      particular,
      quantity,
      rate_incl_tax,
      total_amount,
      grand_total,
      payment_mode,
      amount_paid,
      balance_amount,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO bills
      (customer_name, particular, quantity, rate_incl_tax, total_amount, grand_total, payment_mode, amount_paid, balance_amount, bill_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
      RETURNING *`,
      [
        customer_name,
        particular,
        quantity,
        rate_incl_tax,
        total_amount,
        grand_total,
        payment_mode,
        amount_paid,
        balance_amount,
      ]
    );

    res.status(201).json({
      message: "✅ Bill saved successfully",
      bill: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error saving bill:", err);
    res.status(500).json({ error: "Error saving bill to database" });
  }
});

// =======================
// 📦 GET ALL BILLS
// =======================
app.get("/bills", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bills ORDER BY bill_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching bills:", err);
    res.status(500).json({ error: "Error fetching bills" });
  }
});

// =======================
// ✏️ UPDATE BILL
// =======================
app.put("/update-bill/:id", async (req, res) => {
  const { id } = req.params;
  const {
    customer_name,
    particular,
    quantity,
    rate_incl_tax,
    total_amount,
    grand_total,
    payment_mode,
    amount_paid,
    balance_amount,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE bills SET
        customer_name = COALESCE($1, customer_name),
        particular = COALESCE($2, particular),
        quantity = COALESCE($3, quantity),
        rate_incl_tax = COALESCE($4, rate_incl_tax),
        total_amount = COALESCE($5, total_amount),
        grand_total = COALESCE($6, grand_total),
        payment_mode = COALESCE($7, payment_mode),
        amount_paid = COALESCE($8, amount_paid),
        balance_amount = COALESCE($9, balance_amount)
       WHERE bill_id = $10
       RETURNING *`,
      [
        customer_name,
        particular,
        quantity,
        rate_incl_tax,
        total_amount,
        grand_total,
        payment_mode,
        amount_paid,
        balance_amount,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json({
      message: "✅ Bill updated successfully",
      bill: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating bill:", err);
    res.status(500).json({ error: "Error updating bill" });
  }
});

// =======================
// 🗑️ DELETE BILL
// =======================
app.delete("/delete-bill/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM bills WHERE bill_id=$1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json({ message: "✅ Bill deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting bill:", err);
    res.status(500).json({ error: "Error deleting bill" });
  }
});

// =======================
// 🚀 START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

