var mqtt = require('mqtt');
const fs = require('fs');
const db = require('../firebase/firebase'); // Nhập db từ file firebase.js
const { updateData } = require('./data'); // Nhập hàm cập nhật từ data.js
const { EventEmitter } = require('events'); // Hàm lắng nghe mỗi khi update dữ liệu mới
const subscribe = require('../mqtt/mqttSubcribe'); // Nhập hàm subscribe
require('dotenv').config(); // Khai báo để sử dụng biến trong env

const eventEmitter = new EventEmitter();

// Cấu hình
var options = {
    host: process.env.MQTT_HOST,
    port: process.env.MQTT_PORT,
    protocol: process.env.MQTT_PROTOCOL,
    clean: true
};

// // Cấu hình
// var options = {
//     host: '9a0ed229534f4aa0a069157c623625c4.s1.eu.hivemq.cloud',
//     port: 8883,
//     protocol: 'mqtts',
//     username: 'truong',
//     password: '123'
// };

// Tạo một instance client MQTT mới và kết nối đến broker
var client = mqtt.connect(options);
exports.client = client;

// Khởi tạo biến toàn cục
let latitude, longitude, accelX, accelY, accelZ, gyroX, gyroY, gyroZ;
let mqttFunctions = {};

// Khi kết nối thành công với broker
client.on('connect', function () {
    console.log('Successfully connected to MQTT broker');
    subscribe(client); // Gọi hàm subscribe khi kết nối

    // Hàm publishMessage
    mqttFunctions.publish = function (topic, message) {
        if (client.connected) {
            client.publish(topic, message, { qos: 0 }, (err) => {
                if (err) {
                    console.error('Failed to publish message:', err);
                } else {
                    console.log(`Message published to ${topic}: ${message}`);
                }
            });
        } else {
            console.error('MQTT client not connected. Message not sent.');
        }
    };
});

client.on('message', function (topic, message, packet) {

    if (packet.retain) {
        return; // Bỏ qua tin nhắn retained nếu không cần thiết
    }

    if (topic === 'esp32/testMH') {
        // called each time a message is received
        console.log('Topic name:', topic);
        console.log('Received message:', message.toString());
        const data = JSON.parse(message.toString()); // Phân tích dữ liệu JSON từ ESP

        // Tạo mảng chứa tên thuộc tính
        const keys = ['Latitude', 'Longitude', 'AccX', 'AccY', 'AccZ', 'AngleX', 'AngleY', 'AngleZ'];
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

    if (topic === 'esp32/testMH1') {
        console.log("OK");
        try {
            // Chuyển đổi message thành JSON
            const jsonMessage = JSON.parse(message.toString());

            // Kiểm tra nếu trường "Thong bao" có giá trị "Tai nan"
            if (jsonMessage["Thong bao"] === "Tai nan") {
                // Phát ra sự kiện accidentAlert
                eventEmitter.emit('accidentAlert');
            }
        } catch (error) {
            console.error('Error parsing JSON message:', error);
        }
    }
});

module.exports = { eventEmitter, mqttFunctions }; // Xuất eventEmitter lắng nghe sự kiện thay đổi data
