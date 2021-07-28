const iniciarTransaccion = require("./transaccion")
const registroTransaccion = require("./consultaTransaccion")
const consultaSaldo = require("./conusltaSaldo")
const [operacion, ...argumentos] = process.argv.slice(2);

const funciones = {
    transaccion: iniciarTransaccion,
    registro: registroTransaccion,
    saldo: consultaSaldo,    
  };
  
  funciones[operacion](argumentos)