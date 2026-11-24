const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const sql = require("mssql");

const app = express();
app.use(express.json());

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
    return res.status(400).json({ error: "Invalid id" });
  }
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection
      .request()
      .input("id", sql.Int, publisherId)
      .query("SELECT PublisherID, Name FROM Publisher WHERE PublisherID = @id");

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

app.post("/publishers", async (req, res) => {
  const { publisherId, name } = req.body;
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    await connection.request()
    .input("publisherId", sql.SmallInt, publisherId)
    .input("name", sql.VarChar(50), name)
    .query("INSERT INTO Publisher (PublisherID, Name) VALUES (@publisherId, @name)");
    res.status(201).json(req.body);
  } finally {
    if (connection) await connection.close();
  }
})

app.delete("/publishers/:id", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", parseInt(req.params.id));
    const sqlQuery = "DELETE FROM Publisher WHERE PublisherID = @id";
    const result = await request.query(sqlQuery);
    if (result.rowsAffected[0] === 0){
      return res.status(404).json({error: "Not found"});
    } res.status(204).send();
  } catch (err) {
    res.status(500).json({error: "Database error"});
  } finally {
    if (connection) await connection.close();
  }
})

app.post("/echo/:id", async (req, res) => {
  console.log("params: ", req.params);
  console.log("query: ", req.query);
  console.log("body: ", req.body);
  res.status(200).json({ ok: true });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
