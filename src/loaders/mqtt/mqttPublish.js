function publish(client) {
    client.publish('esp32/client', 'END', function (err) {
        if (err) {
            console.log('Publish error:', err);
        } else {
            console.log(`Message published to MQTT!`);
        }
    });
}

module.exports = publish; // Xuất hàm publish
