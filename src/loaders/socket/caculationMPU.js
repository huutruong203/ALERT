const { getData } = require('../mqtt/data'); // Hàm getData để lấy dữ liệu mới
const eventEmitter = require('../mqtt/mqttServer'); // Import eventEmitter từ mqtt.js
const { getIo }= require('../socket/socketServer'); // Import WebSocket server
const io = getIo(); // Lấy đối tượng io








