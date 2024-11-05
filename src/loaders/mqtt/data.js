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

//{ ...data, ...newData } sử dụng spread operator để sao chép các thuộc tính từ hai đối tượng:
function updateData(newData) {
    data = { ...data, ...newData }; // Cập nhật dữ liệu
}

function getData() {
    return data; // Trả về dữ liệu hiện tại
}

module.exports = {
    updateData,
    getData,
};
