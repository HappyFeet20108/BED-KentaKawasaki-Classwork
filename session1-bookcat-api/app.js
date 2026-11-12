const express = require("express");
const app = express();

const sql = require("mssql");
app.use(express.json());

const dbConfig = {
  server: "localhost",
  database: "NPBookstore",
  user: "npbookstore_user",
  password: "1011",
  options: { trustServerCertificate: true },
};

app.get("/", (req, res) => {
  res.send("Welcome to the Book Category API");
});

app.get("/categories", (req, res) => {
  res.json([
    { id: 1, name: "Fiction" },
    { id: 2, name: "Non-Fiction" },
    { id: 3, name: "Biography" },
  ]);
});

app.get("/about", (req, res) => {
  res.send("Hi my name is Kenta, this is my first Node.js project.");
});

app.get("/author", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection
      .request()
      .query("SELECT AuthorID, Name FROM Author");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

app.get("/author/:id", async (req, res) => {
  const authorId = parseInt(req.params.id);
  if (isNaN(authorId)) {
    return res.status(400).json({ error: "Invalid authorId" });
  }
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", authorId);
    const sqlQuery = `SELECT AuthorID, Name
                      FROM Author
                      WHERE AuthorID = @id`;
    const result = await request.query(sqlQuery);
    if (result.recordset.length === 0) {
      return res.status(400).json({error: "Not found"});
    }
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({error: "Database error"});
  } finally {
    if (connection) await connection.close();
  }
});

app.post("/authors", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", req.body.id);
    request.input("name", req.body.name);
    const sqlQuery = `INSERT INTO Author (AuthorID, Name)
      OUTPUT INSERTED.*
      VALUES (@id, @name)`;
    const result = await request.query(sqlQuery);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.close();
  }
});

app.put("/authors/:id", async (req, res) => {
  const authorId = parseInt(req.params.id);
  if (isNaN(authorId)) {
    return res.status(400).json({ error: "Invalid authorId" });
  }
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request;
    request.input("id", parseInt(req.params.id));
    request.input("name", req.body.name);
    const sqlQuery = `UPDATE Author
      SET NAME = @name
      WHERE AuthorID = @id`;
    const result = await request.query(sqlQuery);
    if (result.rowAffected[0] === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.status(200).json({ updated: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.close();
  }
});

app.delete("/authors/:id", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request(req.params.id);
    const sqlQuery = `DELETE FROM Author WHERE AuthorID = @id`;
    const result = await request.query(sqlQuery);
    if (result.rowsAffected[0] === 0){
      return res.status(404).json({error: "Not found"})
    }
    res.status(204).send();
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

app.get("/db-test", async (req, res) => {
  try {
    const pool = await sql.connect({
      server: "localhost",
      port: 1433,
      database: "NPBookstore",
      user: "npbookstore_user",
      password: "1011",
      options: { trustServerCertificate: true },
    });
    const result = await pool
      .request()
      .query("SELECT COUNT(*) AS Total FROM Author");
    await pool.close();
    res.json({ connected: true, authors: result.recordset[0].Total });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
