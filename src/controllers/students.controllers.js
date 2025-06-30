// controllers/students.controller.js
const Student = require('../models/Student');
const utilsFunctions = require('../utils/utilsFunctions'); // Importa tus funciones de utilidad
const mongoose = require('mongoose');

const studentCtrl = {};

/**
 * @route POST /api/students
 * @description Crea un nuevo estudiante
 * @access Private (Requiere JWT)
 */
studentCtrl.create = async (req, res) => {
    try {
        // Asegúrate de que los campos de fecha se conviertan a Date si vienen como string
        // Mongoose maneja esto automáticamente si el tipo es Date, pero es buena práctica verificar
        ['dob', 'enrollmentDate', 'startDate', 'disenrollmentDate'].forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                req.body[field] = new Date(req.body[field]);
            }
        });

        // Generar _id para cada nota si se proporcionan en el cuerpo de la petición
        if (Array.isArray(req.body.notes)) {
            req.body.notes = req.body.notes.map(note => ({
                _id: new mongoose.Types.ObjectId(), // Genera un nuevo ObjectId para la nota
                date: note.date ? new Date(note.date) : new Date(), // Usa la fecha proporcionada o la actual
                text: note.text
            }));
        }

        const newStudent = new Student(req.body);
        const savedStudent = await newStudent.save();

        res.status(201).json({
            message: 'Estudiante creado exitosamente',
            student: savedStudent
        });
    } catch (error) {
        console.error('Error al crear estudiante:', error);

        // Intenta manejar errores de clave duplicada
        const handled = utilsFunctions.handleDuplicateKeyError(error, 'estudiante');
        if (handled) {
            return res.status(handled.status).json(handled.json);
        }

        // Si no es un error de clave duplicada, devuelve un error genérico
        res.status(500).json({ message: 'Error interno al crear estudiante', error: error.message });
    }
};

/**
 * @route GET /api/students
 * @description Lista todos los estudiantes
 * @access Private (Requiere JWT)
 */
studentCtrl.list = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        console.error('Error al listar estudiantes:', error);
        res.status(500).json({ message: 'Error interno al listar estudiantes', error: error.message });
    }
};

/**
 * @route GET /api/students/:id
 * @description Obtiene un estudiante por su ID
 * @access Private (Requiere JWT)
 */
studentCtrl.getById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        res.status(200).json(student);
    } catch (error) {
        console.error('Error al obtener estudiante por ID:', error);
        // Maneja errores de ID inválido de Mongoose
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de estudiante inválido' });
        }
        res.status(500).json({ message: 'Error interno al obtener estudiante', error: error.message });
    }
};

/**
 * @route PUT /api/students/:id
 * @description Actualiza un estudiante por su ID
 * @access Private (Requiere JWT)
 */
studentCtrl.update = async (req, res) => {
    try {
        // Asegúrate de que los campos de fecha se conviertan a Date si vienen como string
        ['dob', 'enrollmentDate', 'startDate', 'disenrollmentDate'].forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                req.body[field] = new Date(req.body[field]);
            }
        });

        // Si se actualizan las notas, asegúrate de generar _id para las nuevas si no lo tienen
        if (Array.isArray(req.body.notes)) {
            req.body.notes = req.body.notes.map(note => ({
                _id: note._id || new mongoose.Types.ObjectId(), // Mantiene el _id existente o crea uno nuevo
                date: note.date ? new Date(note.date) : new Date(),
                text: note.text
            }));
        }

        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        res.status(200).json({
            message: 'Estudiante actualizado exitosamente',
            student: updatedStudent
        });
    } catch (error) {
        console.error('Error al actualizar estudiante:', error);
        // Intenta manejar errores de clave duplicada
        const handled = utilsFunctions.handleDuplicateKeyError(error, 'estudiante');
        if (handled) {
            return res.status(handled.status).json(handled.json);
        }
        // Maneja errores de ID inválido de Mongoose
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de estudiante inválido' });
        }
        res.status(500).json({ message: 'Error interno al actualizar estudiante', error: error.message });
    }
};

/**
 * @route PATCH /api/students/:id/deactivate
 * @description Desactiva un estudiante por su ID (establece isActive a false)
 * @access Private (Requiere JWT)
 */
studentCtrl.deactivate = async (req, res) => {
    try {
        const deactivatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            {
                isActive: false,
                disenrollmentDate: new Date(),
                // Usa encadenamiento opcional para acceder a req.body.reason de forma segura
                // Si req.body es undefined o req.body.reason es undefined, usará el valor por defecto
                disenrollmentReason: req.body?.reason || 'Desactivado por administración'
            },
            { new: true }
        );
        if (!deactivatedStudent) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        res.status(200).json({
            message: 'Estudiante desactivado exitosamente',
            student: deactivatedStudent
        });
    } catch (error) {
        console.error('Error al desactivar estudiante:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de estudiante inválido' });
        }
        res.status(500).json({ message: 'Error interno al desactivar estudiante', error: error.message });
    }
};

/**
 * @route PATCH /api/students/:id/activate
 * @description Activa un estudiante por su ID (establece isActive a true)
 * @access Private (Requiere JWT)
 */
studentCtrl.activate = async (req, res) => {
    try {
        const activatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { isActive: true, disenrollmentDate: null, disenrollmentReason: null }, // Limpia campos de desinscripción al activar
            { new: true }
        );
        if (!activatedStudent) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        res.status(200).json({
            message: 'Estudiante activado exitosamente',
            student: activatedStudent
        });
    } catch (error) {
        console.error('Error al activar estudiante:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de estudiante inválido' });
        }
        res.status(500).json({ message: 'Error interno al activar estudiante', error: error.message });
    }
};

module.exports = studentCtrl;