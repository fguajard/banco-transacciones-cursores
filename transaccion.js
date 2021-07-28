const { Pool } = require("pg");

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

const retornaQuerys = (argumentos) => {return {
  queryTransaccion: {
    text: "insert into transacciones values($1,$2,$3,$4,$5) RETURNING *",
    values: argumentos,    
    name: "nueva-transaccion",
  },
  queryDescontar: {
    text: "UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2 RETURNING *",
    values: [argumentos[2], argumentos[3]],    
    name: "actualiza-cuenta1",
  },
  queryAgregar: {
    text: "UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2 RETURNING *",
    values: [argumentos[2], argumentos[4]],    
    name: "actualiza-cuenta2",
  },
}};

const iniciarTransaccion = async (argumentos) => {
  const querys = retornaQuerys(argumentos)  ;
  const client = await pool.connect();  
  try {
    await client.query("BEGIN");
    const resultadoTransaccion = await client.query(querys["queryTransaccion"]);
    const resultadoDescontar = await client.query(querys["queryDescontar"]);
    const resultadoAgregar = await client.query(querys["queryAgregar"]);
    await client.query("COMMIT");
    console.log("Transaccion agregada con exito: ",resultadoTransaccion.rows[0]
    );
    console.log("Descuento realizado con éxito: ", resultadoDescontar.rows[0]);
    console.log("Acreditación realizada con éxito: ", resultadoAgregar.rows[0]);
  } catch ({ code, detail, table, constraint }) {
    await client.query("ROLLBACK");
    console.log({ code, detail, table, constraint });
  } finally {
    client.release();
    pool.end();
  }
};

module.exports = iniciarTransaccion