const { getData } = require('../mqtt/data'); // Hàm getData để lấy dữ liệu mới
const eventEmitter = require('../mqtt/mqttServer'); // Import eventEmitter từ mqtt.js
const { getIo } = require('./socketServer');
const io = getIo();

let accelX, accelY, accelZ, gyroX, gyroY, gyroZ;

io.on('connection', (socket) => {
    socket.on('message', (msg) => {
        if(msg === "END"){
            io.emit('MPU_1','TAI NAN');
        }
    });
});
    

eventEmitter.on('dataUpdated', () => {
    const currentData = getData();
    accelX = currentData['accelX'];
    accelY = currentData['accelY'];
    accelZ = currentData['accelZ'];
    gyroX = currentData['gyroX'];
    gyroY = currentData['gyroY'];
    gyroZ = currentData['gyroZ'];

});


