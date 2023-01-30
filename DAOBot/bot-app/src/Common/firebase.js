const admin = require('firebase-admin');
const serviceAccount = require('../firebase-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://esportsdao-7f4bd-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.firestore();

const getDaoById = (id) => {
	return db.collection('daos').doc(id.toString()).get();
};

const setDaoById = (id, item) => {
	db.collection('daos').doc(id.toString()).set(item);
};

module.exports = {
	getDaoById,
	setDaoById,
};