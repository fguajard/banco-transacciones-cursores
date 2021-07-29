const { Pool } = require("pg");
const Cursor = require("pg-cursor");

const config = {
  user: "postgres",
  host: "localhost",
  database: "banco",
  password: "postgres",
  port: 5432,
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(config);

const consultaSaldo = async (argumentos) => {
    const client = await pool.connect();
    try {
      const consulta = new Cursor(
        "select saldo from cuentas where id = $1",
        argumentos
      );
      const cursor = client.query(consulta);
      cursor.read(1, (err, rows) => {
        if (err) {
            cursor.close();
            release();
            pool.end();
            return console.log("error read cursor",err);
        } 
        console.log(rows[0]);
        cursor.close();
        client.release();
        pool.end();
      });
    } catch (error) {
      console.log("error en funcion consultaSaldo",error);
    }
  };

  module.exports = consultaSaldo