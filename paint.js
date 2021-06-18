const Jimp = require('jimp');
const seedrandom = require('seedrandom');
const fs = require('fs').promises;
const axios = require('axios');
const sha256 = require('js-sha256');
 
module.exports = async ({
  gweiRawUrl,
  style,
  preserve_color,
  alpha,
}) => {
  console.log(`Downloading gwei painting ${gweiRawUrl}`);
  const gweiPaintingResponse = await axios.get(gweiRawUrl, {
    responseType: 'arraybuffer'
  });

  const hash = sha256(`${gweiRawUrl}-${style}-${preserve_color}-${alpha}`);
  var rng = seedrandom(hash);

  const random = Math.floor(rng() * 9);

  const stylePath = `./styles/${style}/${random}.jpg`;
  console.log(`Reading style file ${stylePath}`);

  const contentBase64 = 'data:image/png;base64,' + Buffer.from(gweiPaintingResponse.data, 'binary').toString('base64');
  const styleBase64 = 'data:image/jpeg;base64,' + await fs.readFile(stylePath, { encoding: 'base64' });

  console.log(`Generating the new painting at ${process.env.MS_STYLE_TRANSFER}`);
  const result = await axios.post(process.env.MS_STYLE_TRANSFER, {
    content_new_size: "0",
    style_new_size: "0",
    content: contentBase64,
    style: styleBase64,
    preserve_color,
    alpha,
  }, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  const imageResult = await Jimp.read(Buffer.from(result.data.image.replace("data:image/jpeg;base64,", ""), "base64"));

  imageResult.resize(1520, 1520);

  let frame = Math.floor(rng() * 6);
  let frameImage = null;

  console.log(`Using the frame ${frameImage}`);

  if (frame === 0) {
    frameImage = await Jimp.read("./frames/frame0.png");
    frameImage.composite(imageResult, 148, 148);
  } else if (frame === 1) {
    frameImage = await Jimp.read("./frames/frame1.png");
    frameImage.composite(imageResult, 211, 298);
  } else if (frame === 2) {
    frameImage = await Jimp.read("./frames/frame2.png");
    frameImage.composite(imageResult, 257, 295);
  } else if (frame === 3) {
    frameImage = await Jimp.read("./frames/frame3.png");
    frameImage.composite(imageResult, 212, 217);
  } else if (frame === 4) {
    frameImage = await Jimp.read("./frames/frame4.png");
    frameImage.composite(imageResult, 175, 150);
  } else if (frame === 5) {
    frameImage = await Jimp.read("./frames/frame5.png");
    frameImage.composite(imageResult, 185, 266);
  }

  console.log("Painting generated successfully!");
  return frameImage;
}