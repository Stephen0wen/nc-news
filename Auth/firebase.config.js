const admin = require("firebase-admin");

const serviceAccount = require(`${__dirname}/../.env.firebase.json`);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = { admin };
