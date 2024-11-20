const io = require('socket.io-client');
const readline = require('readline');
const { eventEmitter, mqttFunctions } = require('../mqtt/mqttServer'); // Import eventEmitter từ mqtt.js


// Kết nối đến server Socket.IO
const socket = io('https://05b1-1-55-109-61.ngrok-free.app');

// Lắng nghe sự kiện 'connect'
socket.on('connect', () => {
    console.log('Đã kết nối đến server');

    // Tạo interface để đọc đầu vào từ người dùng
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Hàm gửi tin nhắn
    const sendMessage = () => {
        rl.question('Nhập tin nhắn để gửi (hoặc gõ "exit" để thoát): ', (msg) => {
            if (msg.toLowerCase() === 'exit') {
                socket.disconnect(); // Ngắt kết nối khi người dùng gõ "exit"
                rl.close(); // Đóng interface
                return;
            }
            // Gửi tin nhắn đến server
            socket.emit('message', msg);
            console.log('Tin nhắn đã gửi:', msg);
            if (msg && msg.trim() !== "" ) {
                mqttFunctions.publish('esp32/clientMH', msg);
            } else {
                console.error('Hãy nhập tin nhắn !!!');
            }
            sendMessage(); // Gọi lại hàm để tiếp tục nhận tin nhắn
        });
    };

    sendMessage(); // Khởi động việc nhập tin nhắn
});

// Lắng nghe tin nhắn từ server
socket.on('GPS_1', (data) => {
    console.log(data);
});
socket.on('GPS_2', (data) => {
    console.log(`Message: ${data.message}, Distance: ${data.distance} meters`);
});
socket.on('MPU_1', (data) => {
    console.log(data);
});

// Lắng nghe sự kiện 'disconnect'
socket.on('disconnect', () => {
    console.log('Đã ngắt kết nối khỏi server');
});
