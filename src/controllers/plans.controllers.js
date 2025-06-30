// controllers/plans.controller.js
const Plan = require('../models/Plans');
const utilsFunctions = require('../utils/utilsFunctions'); // Importa tus funciones de utilidad
const mongoose = require('mongoose'); // Importar mongoose si necesitas ObjectId u otras utilidades

const planCtrl = {};

/**
 * @route POST /api/plans
 * @description Crea un nuevo plan
 * @access Private (Requiere JWT)
 */
planCtrl.create = async (req, res) => {
    try {
        const newPlan = new Plan(req.body);
        const savedPlan = await newPlan.save();

        res.status(201).json({
            message: 'Plan creado exitosamente',
            plan: savedPlan
        });
    } catch (error) {
        console.error('Error al crear plan:', error);

        // Intenta manejar errores de clave duplicada
        const handled = utilsFunctions.handleDuplicateKeyError(error, 'plan');
        if (handled) {
            return res.status(handled.status).json(handled.json);
        }

        // Si no es un error de clave duplicada, devuelve un error genérico
        res.status(500).json({ message: 'Error interno al crear plan', error: error.message });
    }
};

/**
 * @route GET /api/plans
 * @description Lista todos los planes
 * @access Private (Requiere JWT)
 */
planCtrl.list = async (req, res) => {
    try {
        const plans = await Plan.find();
        res.status(200).json(plans);
    } catch (error) {
        console.error('Error al listar planes:', error);
        res.status(500).json({ message: 'Error interno al listar planes', error: error.message });
    }
};

/**
 * @route GET /api/plans/:id
 * @description Obtiene un plan por su ID
 * @access Private (Requiere JWT)
 */
planCtrl.getById = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }
        res.status(200).json(plan);
    } catch (error) {
        console.error('Error al obtener plan por ID:', error);
        // Maneja errores de ID inválido de Mongoose
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de plan inválido' });
        }
        res.status(500).json({ message: 'Error interno al obtener plan', error: error.message });
    }
};

/**
 * @route PUT /api/plans/:id
 * @description Actualiza un plan por su ID
 * @access Private (Requiere JWT)
 */
planCtrl.update = async (req, res) => {
    try {
        const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPlan) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }
        res.status(200).json({
            message: 'Plan actualizado exitosamente',
            plan: updatedPlan
        });
    } catch (error) {
        console.error('Error al actualizar plan:', error);
        // Intenta manejar errores de clave duplicada
        const handled = utilsFunctions.handleDuplicateKeyError(error, 'plan');
        if (handled) {
            return res.status(handled.status).json(handled.json);
        }
        // Maneja errores de ID inválido de Mongoose
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de plan inválido' });
        }
        res.status(500).json({ message: 'Error interno al actualizar plan', error: error.message });
    }
};

/**
 * @route PATCH /api/plans/:id/deactivate
 * @description Desactiva un plan por su ID (establece isActive a false)
 * @access Private (Requiere JWT)
 */
planCtrl.deactivate = async (req, res) => {
    try {
        const deactivatedPlan = await Plan.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!deactivatedPlan) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }
        res.status(200).json({
            message: 'Plan desactivado exitosamente',
            plan: deactivatedPlan
        });
    } catch (error) {
        console.error('Error al desactivar plan:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de plan inválido' });
        }
        res.status(500).json({ message: 'Error interno al desactivar plan', error: error.message });
    }
};

/**
 * @route PATCH /api/plans/:id/activate
 * @description Activa un plan por su ID (establece isActive a true)
 * @access Private (Requiere JWT)
 */
planCtrl.activate = async (req, res) => {
    try {
        const activatedPlan = await Plan.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        );
        if (!activatedPlan) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }
        res.status(200).json({
            message: 'Plan activado exitosamente',
            plan: activatedPlan
        });
    } catch (error) {
        console.error('Error al activar plan:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de plan inválido' });
        }
        res.status(500).json({ message: 'Error interno al activar plan', error: error.message });
    }
};

module.exports = planCtrl;
