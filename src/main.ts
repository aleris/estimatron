// import * as firebase from 'firebase/app'
// import 'firebase/firestore'
// import { firebaseConfig } from './firebaseConfig'
import { SessionTable } from './data/SessionTable'
import { SessionPlayer } from './data/SessionPlayer'
import { TableController } from './TableController'

// firebase.initializeApp({
//     apiKey: firebaseConfig.apiKey,
//     authDomain: firebaseConfig.authDomain,
//     projectId: firebaseConfig.projectId
// })

// const firestore = firebase.firestore()
const sessionPlayer = new SessionPlayer()
const sessionTable = new SessionTable()
const tableController = new TableController(sessionTable, sessionPlayer)

window.addEventListener('DOMContentLoaded', async () => {
    return tableController.init()
})
