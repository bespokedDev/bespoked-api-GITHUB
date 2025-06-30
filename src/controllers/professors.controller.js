    // controllers/professors.controller.js
    const utilsFunctions = require('../utils/utilsFunctions');
    const Professor = require('../models/Professor');
    const ProfessorType = require('../models/ProfessorType'); // Importa el modelo ProfessorType
    const professorCtrl = {};

    const mongoose = require('mongoose');

    /**
     * @route POST /api/professors
     * @description Crea un nuevo profesor
     * @access Private (Requiere JWT)
     */
    professorCtrl.create = async (req, res) => {
        try {
            // Asegúrate de que los campos de fecha se conviertan a Date si vienen como string
            ['dob', 'startDate'].forEach(field => {
                if (req.body[field] && typeof req.body[field] === 'string') {
                    req.body[field] = new Date(req.body[field]);
                }
            });

            if (Array.isArray(req.body.paymentData)) {
                req.body.paymentData = req.body.paymentData.map(item => ({
                    _id: new mongoose.Types.ObjectId(), // Asegura que cada item tenga un _id único
                    ...item
                }));
            }

            // Si se proporciona typeId, valida que sea un ObjectId válido
            if (req.body.typeId && !mongoose.Types.ObjectId.isValid(req.body.typeId)) {
                return res.status(400).json({ message: 'ID de tipo de profesor inválido.' });
            }

            const newProfessor = new Professor(req.body);
            const saved = await newProfessor.save();

            // Popular el typeId en la respuesta de creación
            const populatedProfessor = await Professor.findById(saved._id)
                                                        .populate('typeId', 'name description')
                                                        .lean();

            res.status(201).json({
                message: 'Profesor creado exitosamente',
                professor: populatedProfessor
            });
        } catch (error) {
            console.error('Error al crear profesor:', error);

            const handled = utilsFunctions.handleDuplicateKeyError(error, 'profesor');
            if (handled) return res.status(handled.status).json(handled.json);

            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }

            res.status(500).json({ message: 'Error interno al crear profesor, asegúrate que el correo y el número de cédula del profesor no estén repetidos en tu nómina', error: error.message });
        }
    };

    /**
     * @route GET /api/professors
     * @description Lista todos los profesores con sus datos de tipo de profesor
     * @access Private (Requiere JWT)
     */
    professorCtrl.list = async (req, res) => {
        try {
            const professors = await Professor.find()
                                                .populate('typeId', 'name rates')
                                                .lean();

            res.status(200).json(professors);
        } catch (error) {
            console.error('Error al listar profesores:', error);
            res.status(500).json({ message: 'Error interno al listar profesores', error: error.message });
        }
    };

    /**
     * @route GET /api/professors/:id
     * @description Obtiene un profesor por su ID con sus datos de tipo de profesor
     * @access Private (Requiere JWT)
     */
    professorCtrl.getById = async (req, res) => {
        try {
            const professor = await Professor.findById(req.params.id)
                                                .populate('typeId', 'name rates')
                                                .lean();
            console.log(`info del profesor: ${professor}`)
            if (!professor) return res.status(404).json({ message: 'Profesor no encontrado' });
            res.status(200).json(professor);
        } catch (error) {
            console.error('Error al obtener profesor:', error);
            if (error.name === 'CastError') {
                return res.status(400).json({ message: 'ID de profesor inválido' });
            }
            res.status(500).json({ message: 'Error interno al obtener profesor', error: error.message });
        }
    };

    /**
     * @route PUT /api/professors/:id
     * @description Actualiza un profesor por su ID
     * @access Private (Requiere JWT)
     */
    professorCtrl.update = async (req, res) => {
        try {
            // Asegúrate de que los campos de fecha se conviertan a Date si vienen como string
            ['dob', 'startDate'].forEach(field => {
                if (req.body[field] && typeof req.body[field] === 'string') {
                    req.body[field] = new Date(req.body[field]);
                }
            });

            if (Array.isArray(req.body.paymentData)) {
                req.body.paymentData = req.body.paymentData.map(item => ({
                    _id: item._id || new mongoose.Types.ObjectId(),
                    ...item
                }));
            }

            // Si se proporciona typeId en la actualización, valida que sea un ObjectId válido
            if (req.body.typeId && !mongoose.Types.ObjectId.isValid(req.body.typeId)) {
                return res.status(400).json({ message: 'ID de tipo de profesor inválido.' });
            }

            const updated = await Professor.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updated) return res.status(404).json({ message: 'Profesor no encontrado' });

            // Popular el typeId en la respuesta de actualización
            const populatedUpdatedProfessor = await Professor.findById(updated._id)
                                                        .populate('typeId', 'name description')
                                                        .lean();

            res.status(200).json({ message: 'Profesor actualizado', professor: populatedUpdatedProfessor });
        } catch (error) {
            console.error('Error al actualizar profesor:', error);
            const handled = utilsFunctions.handleDuplicateKeyError(error, 'profesor');
            if (handled) return res.status(handled.status).json(handled.json);
            if (error.name === 'CastError') {
                return res.status(400).json({ message: 'ID de profesor inválido' });
            }
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error al actualizar profesor', error: error.message });
        }
    };

    /**
     * @route PATCH /api/professors/:id/deactivate
     * @description Desactiva un profesor
     * @access Private (Requiere JWT)
     */
    professorCtrl.deactivate = async (req, res) => {
        try {
            const deactivated = await Professor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
            if (!deactivated) return res.status(404).json({ message: 'Profesor no encontrado' });

            // Popular el typeId en la respuesta
            const populatedDeactivatedProfessor = await Professor.findById(deactivated._id)
                                                            .populate('typeId', 'name description')
                                                            .lean();

            res.status(200).json({ message: 'Profesor desactivado', professor: populatedDeactivatedProfessor });
        } catch (error) {
            console.error('Error al desactivar profesor:', error);
            if (error.name === 'CastError') {
                return res.status(400).json({ message: 'ID de profesor inválido' });
            }
            res.status(500).json({ message: 'Error al desactivar profesor', error: error.message });
        }
    };

    /**
     * @route PATCH /api/professors/:id/activate
     * @description Activa un profesor
     * @access Private (Requiere JWT)
     */
    professorCtrl.activate = async (req, res) => {
        try {
            const activated = await Professor.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
            if (!activated) return res.status(404).json({ message: 'Profesor no encontrado' });

            // Popular el typeId en la respuesta
            const populatedActivatedProfessor = await Professor.findById(activated._id)
                                                        .populate('typeId', 'name description')
                                                        .lean();

            res.status(200).json({ message: 'Profesor activado', professor: populatedActivatedProfessor });
        } catch (error) {
            console.error('Error al activar profesor:', error);
            if (error.name === 'CastError') {
                return res.status(400).json({ message: 'ID de profesor inválido' });
            }
            res.status(500).json({ message: 'Error al activar profesor', error: error.message });
        }
    };

    professorCtrl.uniformizePaymentIds = async (req, res) => {
        try {
            const professors = await Professor.find().lean();
            let updatedCount = 0;

            for (const professor of professors) {
                const paymentData = professor.paymentData || [];

                const needsUpdate = paymentData.some(entry => !entry._id);

                if (needsUpdate) {
                    const updatedPaymentData = paymentData.map(entry => {
                        return {
                            ...entry,
                            _id: entry._id || new mongoose.Types.ObjectId()
                        };
                    });

                    await Professor.updateOne(
                        { _id: professor._id },
                        { $set: { paymentData: updatedPaymentData } }
                    );

                    updatedCount++;
                    console.log(`✔️ Profesor ${professor._id} actualizado.`);
                }
            }

            res.status(200).json({
                message: `Actualización completada. ${updatedCount} profesor(es) fueron modificados.`,
            });
        } catch (error) {
            console.error('❌ Error al uniformizar paymentData:', error);
            res.status(500).json({ message: 'Error interno al uniformizar paymentData' });
        }
    };

    professorCtrl.logPaymentData = async (req, res) => {
        try {
            const professors = await Professor.find();

            if (!professors.length) {
                console.log('No se encontraron profesores en la base de datos.');
                return res.status(200).json({ message: 'No hay profesores registrados.' });
            }

            professors.forEach(professor => {
                console.log(`\n🧑 Profesor: ${professor.name} - ID: ${professor._id}`);

                if (Array.isArray(professor.paymentData) && professor.paymentData.length > 0) {
                    professor.paymentData.forEach((entry, index) => {
                        console.log(`   [${index + 1}] Banco: ${entry.bankName}, Cuenta: ${entry.accountNumber}, _id: ${entry._id}`);
                    });
                } else {
                    console.log('   🔍 Este profesor no tiene datos de pago registrados.');
                }
            });

            res.status(200).json({ message: `Se listaron ${professors.length} profesores en consola.` });
        } catch (error) {
            console.error('Error al listar paymentData:', error);
            res.status(500).json({ message: 'Error interno al listar paymentData' });
        }
    };

    module.exports = professorCtrl;