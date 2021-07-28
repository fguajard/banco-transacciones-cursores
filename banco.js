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

const [operacion,...argumentos] = process.argv.slice(2);

const querys = {
  queryTransaccion: {
    text: "insert into transacciones values($1,$2,$3,$4,$5) RETURNING *",
    values: argumentos,
    // rowMode: "array",
    name: "nueva-transaccion",
  },
  queryDescontar: {
    text: "UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2 RETURNING *",
    values: [argumentos[2], argumentos[3]],
    // rowMode: "array",
    name: "actualiza-cuenta1",
  },
  queryAgregar: {
    text: "UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2 RETURNING *",
    values: [argumentos[2], argumentos[4]],
    // rowMode: "array",
    name: "actualiza-cuenta2",
  },
};

pool.connect(async (error_connection, client, release) => {
  const iniciarTransaccion = async () => {
    if (error_connection) return console.log(error_connection);
    try {
      await client.query("BEGIN");      
      const resultadoTransaccion = await client.query(querys["queryTransaccion"]);      
      const resultadoDescontar = await client.query(querys["queryDescontar"]);     
      const resultadoAgregar = await client.query(querys["queryAgregar"]);
      await client.query("COMMIT");
      console.log(
        "Transaccion agregada con exito: ",
        resultadoTransaccion.rows[0]
      );
      console.log(
        "Descuento realizado con éxito: ",
        resultadoDescontar.rows[0]
      );
      console.log(
        "Acreditación realizada con éxito: ",
        resultadoAgregar.rows[0]
      );
    } catch ({ code, detail, table, constraint }) {
      await client.query("ROLLBACK");
      console.log({ code, detail, table, constraint });
    } finally {
      release();
      pool.end();
    }
  };

  const registroTransaccion = () => {
    if (error_connection) return console.log(error_connection);
    try {
      const consulta = new Cursor(
        "select * from transacciones where cuenta_origen = $1",
        argumentos
      );
      const cursor = client.query(consulta);
      cursor.read(5, (err, rows) => {
        if (err) return console.log("error read cursor",err);
        console.log(rows);
        cursor.close();
        release();
        pool.end();
      });
    } catch (error) {
      console.log("error en funcion registroTransaccion",error);
    }
  };

  const consultaSaldo = () => {
    if (error_connection) return console.log(error_connection);
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
        release();
        pool.end();
      });
    } catch (error) {
      console.log("error en funcion consultaSaldo",error);
    }
  };

  const funciones = {
    transaccion: iniciarTransaccion,
    registro: registroTransaccion,
    saldo: consultaSaldo,    
  };
  funciones[operacion]()
});
