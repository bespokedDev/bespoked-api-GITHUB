// models/PaymentMethod.js
const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
    name: { // Ej: "Zelle", "Banesco", "Binance Pay", "Efectivo"
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: { // Ej: "Bank Transfer", "Crypto", "Cash"
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Añade automáticamente createdAt y updatedAt
});

// Exporta el modelo. El nombre del modelo es 'PaymentMethod' y la colección es 'paymentMethods'.
module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema, 'paymentMethods');