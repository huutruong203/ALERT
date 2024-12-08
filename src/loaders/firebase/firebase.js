//Firebase admin SDK
var admin = require("firebase-admin");

var serviceAccount = require("./apptrackcar-firebase-adminsdk-3eigf-bb870c3cf6.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://device-231e7-default-rtdb.asia-southeast1.firebasedatabase.app"
});


const db = admin.firestore();
console.log('Firebase Connected!');
module.exports = db; // Xuất db để sử dụng trong các file khác


// // Ghi dữ liệu vào Firestore
// async function main() {
//   try {
//     const userRef = db.collection('user');
//     await userRef.add({
//       first: 'Hoang',
//       last: 'Long',
//       born: a
//     });
//     console.log('User written!');
//   } catch (e) {
//     console.error('Error adding document: ', e);
//   }
// }


// main().catch(console.error);


