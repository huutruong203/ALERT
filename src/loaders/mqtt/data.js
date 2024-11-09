// data.js
let data = {
    latitude: null,
    longitude: null,
    accelX: null,
    accelY: null,
    accelZ: null,
    gyroX: null,
    gyroY: null,
    gyroZ: null,
};

function updateData(newData) {
    data = { ...data, ...newData }; // Cập nhật dữ liệu mới vào data
}


function getData() {
    return data; // Trả về dữ liệu hiện tại
}

module.exports = {
    updateData,
    getData,
};
