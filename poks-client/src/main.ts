// import * as firebase from 'firebase/app'
// import 'firebase/firestore'
// import { firebaseConfig } from './firebaseConfig'
import { SessionTable } from './data/SessionTable'
import { TableController } from '@/TableController'
import { SceneLayout } from './display/SceneLayout'
import { Server } from './Server'

// firebase.initializeApp({
//     apiKey: firebaseConfig.apiKey,
//     authDomain: firebaseConfig.authDomain,
//     projectId: firebaseConfig.projectId
// })

// const firestore = firebase.firestore()

window.addEventListener('DOMContentLoaded', async () => {

    const tableController = new TableController()

    window.addEventListener('resize', tableController.onWindowResize.bind(tableController), false)
    // return tableController.init()

    // const ws = new WebSocket(
    //     `ws://localhost:29087`
    // );
    //
    // ws.onopen = () => {
    //     ws.send(JSON.stringify({
    //         'type': 'join',
    //         'room': 'șț'
    //     }))
    // }
})
