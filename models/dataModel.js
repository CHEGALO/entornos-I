const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    // Definir la estructura de los datos
    // Ejemplo: { sensorId: String, value: Number, timestamp: Date }
    Hora: {
        type: String,
        required: true,
    },
    Fecha: {
        type: String,
        required: true,
    },
    Luminosidad: {
        type: Number,
        required: true,
    },
    distancia: {
        type: Number,
        required: true,
    },
    humidity: {
        type: Number,
        required: true,
    },
    temperature: {
        type: Number,
        required: true,
    },
});

const Data = mongoose.model('datesMqttMongos', dataSchema);

module.exports = Data;
