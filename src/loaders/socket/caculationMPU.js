const { getData } = require('../mqtt/data'); // Hàm getData để lấy dữ liệu mới
const { eventEmitter } = require('../mqtt/mqttServer'); // Import eventEmitter từ mqtt.js
const { getIo } = require('./socketServer');
const io = getIo();

    
eventEmitter.on('accidentAlert', () => {
    console.log('TAI NẠN !!!');
    io.emit('MPU_1', {
        message: 'MPU_WARNING'})// Gửi cho client
});


