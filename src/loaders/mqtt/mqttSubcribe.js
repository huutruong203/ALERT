function subscribe(client) {
    client.subscribe(['esp32/testMH', 'DEVICE'], function (err) {
        if (err) {
            console.log('Subscription error:', err);
        } else {
            console.log('Subscribed to topic from MQTT!');
        }
    });
}

module.exports = subscribe; // Xuất hàm subscribe