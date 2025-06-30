const utilsFunctions = {};

utilsFunctions.handleDuplicateKeyError = function(error, entityName = 'registro') {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      status: 400,
      json: {
        message: `Ya existe un ${entityName} con ese ${field}`,
        field: field,
        value: error.keyValue[field]
      }
    };
  }

  return null;
};
console.log('Exportando:', utilsFunctions);
module.exports = utilsFunctions;