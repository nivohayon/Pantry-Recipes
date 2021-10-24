import firebase from 'firebase'
const firebaseConfig = {
  apiKey: 'AIzaSyBDTfkPPbG-VbDT92Q1Z6QQ3SXc0s0Y33o',
  authDomain: 'https://console.firebase.google.com/u/0/project/reactnativefinal-c2163/authentication/users',
  databaseURL: 'https://reactnativefinal-c2163-default-rtdb.europe-west1.firebasedatabase.app/',
  projectId: 'reactnativefinal-c2163'
}
export default firebaseConfig
export const app = firebase.initializeApp(firebaseConfig)
export const auth = app.auth()