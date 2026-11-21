const express = require("express");
const app = express();

const sql = require("mssql");
app.use(express.json());

const process = require("dotenv").config();
const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: { trustServerCertificate: true },
};

app.get("/", (req, res) => {
  res.send("Welcome to the Book Category API");
});

app.get("/publishers", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request().query("SELECT * FROM Publisher");
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching publishers:", err);
    res.status(500).json({ error: "Failed to retrieve publishers" });
  } finally {
    if (connection) await connection.close();
  }
});

app.get("/publishers/:id", async (req, res) => {
  const publisherId = parseInt(req.params.id);
  if (isNaN(publisherId)) {
    return res.status(400).json({error: "Invalid id"})
  }
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request().input('id', publisherId).query("SELECT PublisherID, Name FROM Publisher WHERE PublisherID = @id");
    if (result.rowsAffected[0] === 0){
      return res.status(404).json({error: 'Not Found'});
    }
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Not Found" });
    }
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching publishers:", err);
    res.status(500).json({ error: "Failed to retrieve publishers" });
  } finally {
    if (connection) await connection.close();
  }
});

app.post("/echo/:id", async (req, res) => {
  console.log("params: ", req.params);
  console.log("query: ", req.query);
  console.log("body: ", req.body);
  res.status(200).json({ ok: true });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
