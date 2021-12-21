const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json())
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

const { LEDMode } = require('./Enums');
const { LEDRequest } = require('./Types');
// const server = http.createServer(app);

const PORT = process.env.PORT ?? 3000;
var ledQueue = [];
var current = null;

// Routes
app.get('/', (req, res) => {
  console.log(`Dequeue`);
  current = ledQueue.shift();
  res.send(current);
});

app.get('/current', (req, res) => {
  console.log(`Current`);
  res.send(current);
});

app.post('/add', (req, res) => {
  console.log(`Enqueue`);
  console.log(req.body)
  const ledReq = new LEDRequest(req.body);
  ledQueue.push(ledReq);
  res.send('Added');
  io.emit('update', ledReq);
});

// Testing Routes
app.get('/add', (req, res) => {
  console.log(`Test Enqueue`);
  let ledRequest = new LEDRequest({
    name: 'Test_Name',
    mode: LEDMode.OFF
  })
  ledQueue.push(ledRequest);
  res.send(ledQueue);
});

app.get('/getqueue', (req, res) => {
  res.send(ledQueue);
  io.emit('Update', ledQueue);
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server stated on port ${PORT}`);
});

// Socket
io.on('connection', (socket) => {
  console.log('On connect');
})