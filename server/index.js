const express = require('express');
const cors = require('cors');
const { LEDMode } = require('./Enums');
const { LEDRequest } = require('./Types');

const app = express();
app.use(cors());
app.use(express.json())

const PORT = 3000;
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
  ledQueue.push(new LEDRequest(req.body));
  res.send('Added');
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
app.listen(PORT, () => {
  console.log(`Server stated on port ${PORT}`);
});