var mqtt = require('mqtt');
const fs = require('fs');
const db = require('../firebase/firebase'); // Nhập db từ file firebase.js
const { updateData } = require('./data'); // Nhập hàm cập nhật từ data.js
const { EventEmitter } = require('events'); // Hàm lắng nghe mỗi khi update dữ liệu mới
const subscribe = require('../mqtt/mqttSubcribe'); // Nhập hàm subscribe
const publish = require('../mqtt/mqttPublish'); // Nhập hàm publish
const { hostname } = require('os');
require('dotenv').config(); // Khai báo để sử dụng biến trong env

const eventEmitter = new EventEmitter();

// // Cấu hình
// var options = {
//     host: process.env.MQTT_HOST,
//     port: process.env.MQTT_PORT,
//     protocol: process.env.MQTT_PROTOCOL
// };

// Cấu hình
var options = {
    host: '9a0ed229534f4aa0a069157c623625c4.s1.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'truong',
    password: '123'
};

// Tạo một instance client MQTT mới và kết nối đến broker
var client = mqtt.connect(options);

// Khởi tạo biến toàn cục
let latitude, longitude, accelX, accelY, accelZ, gyroX, gyroY, gyroZ;

client.on('connect', function () {
    subscribe(client); // Gọi hàm subscribe khi kết nối
    // publish(client); // Publish thông điệp ban đầu
});

client.on('message', function (topic, message) {
    // called each time a message is received
    console.log('Topic name:', topic);
    console.log('Received message:', message.toString());

    if (topic === 'esp32/testMH') {
        const data = JSON.parse(message.toString()); // Phân tích dữ liệu JSON từ ESP

        // Tạo mảng chứa tên thuộc tính
        const keys = ['Latitude', 'Longitude', 'Accel X', 'Accel Y', 'Accel Z', 'Gyro X', 'Gyro Y', 'Gyro Z'];
        const values = [latitude, longitude, accelX, accelY, accelZ, gyroX, gyroY, gyroZ];

        // Cập nhật biến toàn cục và chỉ gán null nếu key không tồn tại hoặc là undefined
        keys.forEach((key, index) => {
            values[index] = (data[key] !== undefined && data[key] !== " ") ? data[key] : null;
        });

        // Gán lại giá trị cho các biến toàn cục
        [latitude, longitude, accelX, accelY, accelZ, gyroX, gyroY, gyroZ] = values;

        // Tạo đối tượng JSON để lưu vào Firestore
        const jsonData = {
            latitude,
            longitude,
            accelX,
            accelY,
            accelZ,
            gyroX,
            gyroY,
            gyroZ,
            timestamp: new Date().toISOString() // Thêm timestamp để ghi lại thời gian
        };

        // Cập nhật dữ liệu
        updateData(jsonData);

        eventEmitter.emit('dataUpdated'); // Phát ra sự kiện dataUpdated
        const userRef = db.collection('data').doc("data_doc"); // Đường dẫn đến collection 'data' và document 'data_doc'
        
        // Cập nhật dữ liệu vào Firestore
        userRef.set(jsonData, { merge: true }) // Sử dụng merge để cập nhật
            .then(() => {
                console.log('Data updated in Firestore!');
            })
            .catch((error) => {
                console.error('Error updating data in Firestore: ', error);
            });
    }
});

module.exports = eventEmitter; // Xuất eventEmitter lắng nghe sự kiện thay đổi data
