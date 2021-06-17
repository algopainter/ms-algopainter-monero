const express = require('express');
const Jimp = require('jimp');
const paint = require('./paint');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors()); 

const port = process.env.PORT || 4000;

app.get('/', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'image/png');

    const size = req.query.size;
    const gweiRawUrl = req.query.gweiRawUrl;
    const style = req.query.style;
    const preserve_color = req.query.preserve_color;
    const alpha = req.query.alpha;
    
    const base = await paint({
      gweiRawUrl,
      style,
      preserve_color,
      alpha,
    });

    const newBase = base.clone();

    if (size && size !== "0") {
        console.log(`Resizing to ${size}x${size}`)
        newBase.resize(parseInt(size), parseInt(size));
    }

    const buffer = await new Promise((resolve, reject) => {
      newBase.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
        if (err) {
          reject(err);
        }

        resolve(buffer);
      });
    });

    res.end(buffer);
  } catch (e) {
    console.log(e.message);
    res.send({ e });
  }
});

app.listen(port, function () {
    console.log('Ready');
});