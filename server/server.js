const nr = require('newrelic');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoDatabase = require('../Mongodatabase/data.js');
const sqlDatabase = require('../SQLdatabase/data.js');


const app = express();
const port = 3004;

app.use('/listings/:id/', express.static(`${__dirname}/../client/public`));
app.use(express.static(`${__dirname}/../client/public`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


const redis = require('redis');
const client = redis.createClient();

function cache(req, res, next) {
  const id = req.params.id
  client.get(id, function (err, data) {
      if (err) throw err;

      if (data != null) {
        // console.log('sending data from cache')
          res.send(JSON.parse(data));
      } else {
          next();
      }
  });
}

function getData(req, res, next) {
  const requestId= req.params.id
  console.log(requestId,'requestId')
  mongoDatabase.getById(requestId, (err, data) => {
    if (err) {
      res.status(404).json({ message: 'No attraction' });
    }
    client.setex(requestId, 3600, JSON.stringify(data[0].questions));
    res.json(data[0].questions);
  });
};

app.get('/api/listings/:id/q-and-a', cache, getData);





// app.get('/api/listings/:id/q-and-a', (req, res) => {
//   const requestId = Number(req.params.id);
//   // console.time()
//   sqlDatabase.getById(requestId, (err, data) => {
//     if (err) {
//       res.status(404).json({ message: 'No attraction' });
//     }
//     // console.timeEnd()
//     res.json(data);
//   });
// });



app.listen(port, () => console.log(`listening on port ${port}`));
