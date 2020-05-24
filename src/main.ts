// import * as firebase from 'firebase/app'
// import 'firebase/firestore'
// import { firebaseConfig } from './firebaseConfig'
import { SessionTable } from './data/SessionTable'
import { SessionPlayer } from './data/SessionPlayer'
import { TableController } from './TableController'
import { SceneLayout } from './display/SceneLayout'

// firebase.initializeApp({
//     apiKey: firebaseConfig.apiKey,
//     authDomain: firebaseConfig.authDomain,
//     projectId: firebaseConfig.projectId
// })

// const firestore = firebase.firestore()

window.addEventListener('DOMContentLoaded', async () => {
    const sessionPlayer = new SessionPlayer()
    const sessionTable = new SessionTable()
    const canvas = document.getElementById('table') as HTMLCanvasElement
    const sceneLayout = new SceneLayout(canvas)
    const tableController = new TableController(sceneLayout, sessionTable, sessionPlayer)

    window.addEventListener('resize', tableController.onWindowResize.bind(tableController), false)

    return tableController.init()
})
