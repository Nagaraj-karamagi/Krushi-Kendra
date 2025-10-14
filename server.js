// ✅ Sri Dongardevi Krishi Kendra Backend
// Built with Express + PostgreSQL + Render

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ PostgreSQL Connection
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://<your-username>:<your-password>@<your-host>:5432/<your-db-name>",
  ssl: {
    rejectUnauthorized: false,
  },
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("🚀 Sri Dongardevi Krishi Kendra Backend is running!");
});

// 🧾 Add new bill
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
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW())
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
      message: "✅ Bill saved successfully!",
      bill: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error saving bill:", err);
    res.status(500).json({ error: "Error saving bill to database" });
  }
});

// 📦 Get all bills
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

// ✏️ Update a bill by ID
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
      `UPDATE bills 
       SET customer_name=$1, particular=$2, quantity=$3, rate_incl_tax=$4,
           total_amount=$5, grand_total=$6, payment_mode=$7,
           amount_paid=$8, balance_amount=$9
       WHERE bill_id=$10 RETURNING *`,
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
      message: "✅ Bill updated successfully!",
      bill: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating bill:", err);
    res.status(500).json({ error: "Error updating bill" });
  }
});

// 🗑️ Delete bill by ID
app.delete("/delete-bill/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM bills WHERE bill_id=$1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json({ message: "✅ Bill deleted successfully!" });
  } catch (err) {
    console.error("❌ Error deleting bill:", err);
    res.status(500).json({ error: "Error deleting bill" });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
