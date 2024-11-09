const express = require('express');
const ngrok = require("ngrok");
const path = require('path');
const http = require('http');
require('dotenv').config();

const { createSocketServer }= require('../loaders/socket/socketServer'); // Import WebSocket server

const app = express();
const port = process.env.PORT || 9000;

// Khởi tạo server WebSocket bằng cách truyền server HTTP
const httpServer = http.createServer(app);
const {io} = createSocketServer(httpServer); // Khởi tạo io
console.log(io ? "WebSocket server initialized" : "WebSocket server not initialized");

require('../loaders/socket/caculationGPS');
require('../loaders/socket/caculationMPU');

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Cấu hình template engine
app.set('views', path.join(__dirname, '../loaders/views'));
app.set('view engine', 'ejs');

// Cài đặt middleware cho CORS
const cors = require('cors');
app.use(cors());

// Khởi tạo route, trả về index.ejs
app.get('/', (req, res) => {
    res.render('index.ejs');
});

// Lắng nghe HTTP server
httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Main App running on http://127.0.0.1:${port}`);
    
    // Connect to ngrok to expose the server publicly
    ngrok.connect(port).then(ngrokUrl => {
        console.log(`Ngrok tunnel in: ${ngrokUrl}`);

        // Gửi URL ngrok đến tất cả client kết nối
        io.on('connection', (socket) => {
            socket.emit('ngrokUrl', ngrokUrl); // Gửi URL ngrok cho client khi kết nối
        });
    }).catch(error => {
        console.log(`Couldn't tunnel ngrok: ${error}`);
    });
});
