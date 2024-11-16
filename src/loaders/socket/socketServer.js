const { getData } = require('../mqtt/data');
const { eventEmitter } = require('../mqtt/mqttServer');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

let io; // Để lưu trữ đối tượng io
let latitude, longitude;
let isOn = false;

// Tạo và xuất kết nối WebSocket
const createSocketServer = (httpServer) => {
    io = new Server(httpServer, { // Khởi tạo io và gán vào biến io
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        socket.on('message', (msg) => {
            if (msg === 'ON' && !isOn) {
                console.log('MOBILE: ON');
                const currentData = getData();
                latitude = currentData.latitude;
                longitude = currentData.longitude;
                
                if (latitude != null && longitude != null) {
                    isOn = true;
                    const { updateInitialCoordinates } = require('./caculationGPS');
                    updateInitialCoordinates(latitude, longitude, true);
                } else {
                    console.log('Chưa nhận được toạ độ');
                }
            } else if (msg === 'OFF' && isOn) {
                console.log('MOBILE: OFF');
                isOn = false;
                const { updateInitialCoordinates } = require('./caculationGPS');
                updateInitialCoordinates(null, null, false);
            }
        });
    });

    eventEmitter.on('dataUpdated', () => {
        const currentData = getData();
        latitude = currentData.latitude;
        longitude = currentData.longitude;

        const data = {
            latitude: currentData.latitude,
            longitude: currentData.longitude,
            accelX: currentData.accelX,
            accelY: currentData.accelY,
            accelZ: currentData.accelZ,
            gyroX: currentData.gyroX,
            gyroY: currentData.gyroY,
            gyroZ: currentData.gyroZ,
            timestamp: currentData.timestamp
        };

        io.emit('newData', data);
    });

    return { io }; // Trả về một object chứa io
};

module.exports = { createSocketServer, getIo: () => io }; // Xuất hàm tạo server
