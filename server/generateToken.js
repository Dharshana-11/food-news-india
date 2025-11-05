import firebaseAdmin from "./firebase.js"; // your admin setup

async function generateToken() {
  try {
    const uid = "TXkibM39hrdK8mcHa8h1xqyrzxz2"; // replace with an existing user's UID
    const customToken = await firebaseAdmin.auth().createCustomToken(uid);
    console.log("Custom Token:", customToken);
  } catch (err) {
    console.error("Error creating custom token:", err);
  }
}

generateToken();
