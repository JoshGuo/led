const express = require('express');
const app = express();

const PORT = 3000;
var ledQueue = [];

app.get('/', (req, res) => {
  res.send(ledQueue);
});

app.get('/add', (req, res) => {
  ledQueue.push({
    name: 'Josh',
    mode: 10
  });
  res.send('added');
})

app.listen(PORT, () => {
  console.log(`Server stated on port ${PORT}`);
});