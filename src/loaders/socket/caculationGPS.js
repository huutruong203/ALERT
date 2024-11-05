const { getData } = require('../mqtt/data'); // Hàm getData để lấy dữ liệu mới
const eventEmitter = require('../mqtt/mqttServer'); // Import eventEmitter từ mqtt.js
const { getIo }= require('../socket/socketServer'); // Import WebSocket server
const io = getIo(); // Lấy đối tượng io

let latitude, longitude;
let initialLatitude = null;
let initialLongitude = null;
let initialSet = false; // Cờ để kiểm tra xem tọa độ ban đầu đã được thiết lập chưa


const toRad = angle => angle * (Math.PI / 180);// Đổi từ độ sang radian

// Hàm tính khoảng cách Haversine
const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Bán kính Trái Đất (m)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    lat1 = toRad(lat1);
    lat2 = toRad(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Hàm cập nhật tọa độ mốc
const updateInitialCoordinates = (lat, lon, isOn) => {
    if (isOn) {
        initialLatitude = lat; // Cập nhật tọa độ mốc
        initialLongitude = lon;
        initialSet = true; // Đánh dấu tọa độ mốc đã được thiết lập
        if (lat != null && lon != null){
            console.log('Toạ độ mốc đã được thiết lập:', initialLatitude, initialLongitude);
        }

    } else {
        initialLatitude = null; // Huỷ tọa độ mốc
        initialLongitude = null;
        initialSet = false; // Đánh dấu tọa độ mốc đã bị huỷ
        console.log('Đã huỷ toạ độ mốc');
    }
};

// Lắng nghe sự kiện 'dataUpdated' khi dữ liệu được cập nhật
eventEmitter.on('dataUpdated', () => {
    const currentData = getData();
    latitude = currentData['latitude'];
    longitude = currentData['longitude'];
    console.log('Toạ độ :', latitude, longitude);

    // Chỉ tính khoảng cách khi tọa độ mốc đã được thiết lập
    if (initialSet) {
        if (initialLatitude!= null && initialLongitude!= null && latitude!=null && longitude!=null){
            // Tính khoảng cách từ vị trí hiện tại đến tọa độ ban đầu
            const distance = haversine(initialLatitude, initialLongitude, latitude, longitude);
            console.log('Khoảng cách :', distance.toFixed(3), 'meters');

            // Kiểm tra nếu khoảng cách lớn hơn một ngưỡng và thực hiện hành động cần thiết
            const threshold = 10; // ví dụ ngưỡng là 10 mét
            if (distance > threshold) {
                console.log('CẢNH BÁO !!!');
                io.emit('alert','CẢNH BÁO !!!');
            }
            else {
                console.log('AN TOÀN !!!');
                io.emit('alert','AN TOÀN !!!');
            }
        }
        else {
            console.log('Chưa nhận được toạ độ');
        }
    }
});

// Xuất hàm cập nhật tọa độ để có thể sử dụng trong file Socket.IO
module.exports = { updateInitialCoordinates };
