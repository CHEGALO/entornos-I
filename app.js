//Librerias a utilizar
const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const Data = require('./models/dataModel');

const socketIo = require('socket.io');
const app = express();
const server = require('http').createServer(app);
const io = socketIo(server);
const path = require('path');



const port = 3000;
app.use(bodyParser.json());
//motor de vistas
app.set('view engine', 'ejs');

//conexion a mongodb
mongoose.connect('mongodb+srv://chegalo:Chegalo12@cluster0.npbqz.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

    //conexion a mqtt
const mqttClient = mqtt.connect('mqtt://test.mosquitto.org:1883/');

    

//conexion a mqtt
mqttClient.on('connect', () => {
    console.log('Connected to MQTT Broker');
    mqttClient.subscribe('/chegalo');
});

mqttClient.on('error', (error) => {
    console.error('MQTT Connection Error:', error);
});

//recoleccion de los datos mqtt
mqttClient.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());

    const cleanedData = {};
    Object.keys(data).forEach((key) => {
        const cleanedKey = key.trim();
        cleanedData[cleanedKey] = data[key];
    });

    const { Hora, Fecha, Luminosidad, distancia, humedity, temperatura } = cleanedData;

    const mqttData = new Data({
        Hora,
        Fecha,
        Luminosidad,
        distancia,
        humidity: humedity,
        temperature: temperatura,
    });

    try {
        await mqttData.save();
        console.log('MQTT data saved in MongoDB');
    } catch (error) {
        console.error('Error saving MQTT data in MongoDB:', error);
    }

    console.log('Data received from MQTT:');
    console.log('Hora:', Hora);
    console.log('Fecha:', Fecha);
    console.log('Luminosidad:', Luminosidad);
    console.log('distancia:', distancia);
    console.log('humedity:', humedity);
    console.log('temperatura:', temperatura);

});

//const Data = mongoose.model('datesMqttMongos', dataSchema);

io.on('connection', async (socket) => {
    console.log('Client connected');
  
    try {
      const data = await Data.find().exec();
      socket.emit('mongoData', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
});

const changeStream = Data.watch();

changeStream.on('change', async (change) => {
  if (change.operationType === 'insert') {
    const newData = await Data.findById(change.documentKey._id);
    io.emit('newData', newData);
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/luminosidad', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'luminosidad.html'));
});
// Puedes hacer lo mismo para las otras rutas
app.get('/distancia', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'distancia.html'));
});

app.get('/humedad', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'humedad.html'));
});

app.get('/temperatura', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'temperatura.html'));
});

//rutas para la segunda estacion

app.get('/luminosidad2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'luminosidad2.html'));
});
// Puedes hacer lo mismo para las otras rutas
app.get('/distancia2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'distancia2.html'));
});

app.get('/humedad2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'humedad2.html'));
});

app.get('/temperatura2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'temperatura2.html'));
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
