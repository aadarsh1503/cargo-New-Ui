const ImageKit = require('imagekit');

// Validate environment variables
if (!process.env.IMAGEKIT_PUBLIC_KEY) {
  console.error('❌ IMAGEKIT_PUBLIC_KEY is missing in environment variables');
}
if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  console.error('❌ IMAGEKIT_PRIVATE_KEY is missing in environment variables');
}
if (!process.env.IMAGEKIT_URL_ENDPOINT) {
  console.error('❌ IMAGEKIT_URL_ENDPOINT is missing in environment variables');
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

module.exports = imagekit;