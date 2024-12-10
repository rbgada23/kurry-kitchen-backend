const functions = require('firebase-functions');
const app = require('./app'); // Assuming app.js is in the root of the functions folder

exports.app = functions.https.onRequest(app);