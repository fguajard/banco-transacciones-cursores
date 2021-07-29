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

const registroTransaccion = async (argumentos) => {   
    try {
      const client = await pool.connect();
      const consulta = new Cursor(
        "select * from transacciones where cuenta_origen = $1",
        argumentos
      );
      const cursor = client.query(consulta);
      cursor.read(5, (err, rows) => {
        if (err) return console.log("error read cursor",err);
        console.log(rows);
        cursor.close();
        client.release();
        pool.end();
      });
    } catch (error) {
      console.log("error en funcion registroTransaccion",error);
    }
  };

  module.exports = registroTransaccion