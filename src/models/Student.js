const mongoose = require('mongoose');

// Esquema para las notas del estudiante
const NoteSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: true }); // Mongoose añade _id por defecto a los subdocumentos, pero lo explicitamos

// Esquema principal del estudiante
const StudentSchema = new mongoose.Schema({
    studentCode: {
        type: String,
        required: true,
        unique: true, // El código de estudiante debe ser único
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    dob: { // Date of Birth (Fecha de Nacimiento)
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['M', 'F', 'O'], // Masculino, Femenino, Otro
        required: true
    },
    representativeName: { // Nombre del representante (puede ser nulo)
        type: String,
        trim: true,
        default: null
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true, // El email debe ser único
        sparse: true, // Permite múltiples documentos con 'null' en este campo, pero únicos para valores no nulos
        default: null
    },
    phone: {
        type: String,
        trim: true,
        required: true
    },
    address: {
        type: String,
        trim: true,
        default: null
    },
    city: {
        type: String,
        trim: true,
        default: null
    },
    country: {
        type: String,
        trim: true,
        default: null
    },
    occupation: {
        type: String,
        trim: true,
        default: null
    },
    enrollmentDate: { // Fecha de matriculación
        type: String,
        required: true
    },
    language: { // Idioma de estudio principal
        type: String,
        trim: true,
        default: null
    },
    startDate: { // Fecha de inicio en el programa
        type: String,
        required: true
    },
    status: { // Estado actual del estudiante (e.g., 'Activo', 'Inactivo', 'Retirado')
        type: String,
        trim: true,
        default: 'Activo'
    },
    notes: [NoteSchema], // Array de subdocumentos de notas
    disenrollmentDate: { // Fecha de desinscripción (si aplica)
        type: String,
        default: null
    },
    disenrollmentReason: { // Razón de desinscripción (si aplica)
        type: String,
        trim: true,
        default: null
    },
    isActive: { // Para activar/desactivar lógicamente el estudiante
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Añade automáticamente createdAt y updatedAt
});

// Exportar el modelo
module.exports = mongoose.model('Student', StudentSchema);