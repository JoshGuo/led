const express = require('express');
const { LEDMode } = require('./Enums');
const { LEDRequest } = require('./Types');
const app = express();
app.use(express.urlencoded())

const PORT = 3000;
var ledQueue = [];
var current = null;

app.get('/', (req, res) => {
  console.log(`Dequeue`);
  current = ledQueue.shift();
  res.send(current);
});

app.get('/current', (req, res) => {
  console.log(`Current`);
  res.send(current);
});

app.get('/getqueue', (req, res) => {
  res.send(ledQueue);
})

app.get('/add', (req, res) => {
  console.log(`Test Enqueue`);
  let ledRequest = new LEDRequest({
    name: 'Test_Name',
    mode: LEDMode.OFF
  })
  ledQueue.push(ledRequest);
  res.send(ledQueue);
});

app.post('/add', (req, res) => {
  console.log(`Enqueue`);
  console.log(new LEDRequest(req.body));
  ledQueue.push(new LEDRequest(req.body));
  res.send('Added');
})

app.listen(PORT, () => {
  console.log(`Server stated on port ${PORT}`);
});