import * as firebase from 'firebase/app'
import 'firebase/firestore'
import { firebaseConfig } from './firebaseConfig'
import { SessionTable } from './Table'
import { SessionPlayer } from './Player'
import { TableController } from './TableController'
import { Stage, Shape, Text, Shadow } from '@createjs/easeljs'
import { EstimationPacks } from './EstimationPacks'

firebase.initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId
})

const firestore = firebase.firestore()
const sessionPlayer = new SessionPlayer()
const sessionTable = new SessionTable(firestore)
const tableController = new TableController(sessionTable, sessionPlayer)

window.addEventListener('DOMContentLoaded', async () => {
    // return tableController.init()
    const canvas = document.getElementById('table')
    canvas.style.backgroundColor = 'DeepSkyBlue'
    const stage = new Stage(canvas)

    const bg = new Shape()
    bg.graphics.beginFill('#ffffff').drawRoundRect(10, 10, 100, 160, 12)
    bg.x = 100
    bg.y = 100
    stage.addChild(bg)

    bg.shadow = new Shadow('#000000', 1, 1, 4);

    const text = new Text(EstimationPacks.MountainGoat.choices[2], '30px \'Lobster Two\'', '#222222')
    text.x = 120
    text.y = 120
    stage.addChild(text)

    stage.update()
})
