const iniciarTransaccion = require("./utils/transaccion")
const registroTransaccion = require("./utils/consultaTransaccion")
const consultaSaldo = require("./utils/conusltaSaldo")
const [operacion, ...argumentos] = process.argv.slice(2);

const funciones = {
    transaccion: iniciarTransaccion,
    registro: registroTransaccion,
    saldo: consultaSaldo,    
  };
  
  funciones[operacion](argumentos)