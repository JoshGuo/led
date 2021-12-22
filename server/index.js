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
var current = new LEDRequest({
  name: 'Josh',
  mode: 3,
  setting: 2,
  color: '#000000'
});

app.get('/current', (req, res) => {
  console.log(`Current`);
  res.send(current);
});

app.post('/add', (req, res) => {
  console.log(`Enqueue`);
  console.log(req.body)
  const ledReq = new LEDRequest(req.body);
  current = ledReq;
  io.emit('update', ledReq);
  res.send('Done!');
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
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server stated on port ${PORT}`);
});

// Socket
io.on('connection', (socket) => {
  console.log('On connect');
  socket.emit('update', current);
});