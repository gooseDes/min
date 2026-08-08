import mysql from "mysql2/promise";

const config = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "min",
};

async function showTablesAndData() {
  const connection = await mysql.createConnection(config);

  try {
    const [tables] = await connection.query("SHOW TABLES");
    const tableKey = Object.keys(tables[0])[0];

    if (tables.length === 0) {
      console.log("No tables");
      return;
    }

    for (const row of tables) {
      const tableName = row[tableKey];
      console.log(`\nTables: ${tableName}`);

      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);

      if (rows.length === 0) {
        console.log("  Empty table");
      } else {
        console.table(rows);
      }
    }
  } catch (err) {
    console.error("Error: ", err);
  } finally {
    await connection.end();
  }
}

showTablesAndData();
