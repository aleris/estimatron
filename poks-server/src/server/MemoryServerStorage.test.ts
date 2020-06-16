import { MemoryServerStorage } from './MemoryServerStorage'
import { createTestTablePlayer } from '../TestUtils'
import { WebSocket } from 'uWebSockets.js'
import { mock } from 'jest-mock-extended'

describe(MemoryServerStorage.name, () => {
    test('saveTable create and getTable', () => {
        const serverStorage = new MemoryServerStorage()
        const table = createTestTablePlayer(mock<WebSocket>()).table
        serverStorage.saveTable(table)
        expect(serverStorage.tablesCount).toStrictEqual(1)
        expect(serverStorage.getTable(table.tableInfo.id)).toStrictEqual(table)
    })

    test('saveTable update', () => {
        const serverStorage = new MemoryServerStorage()
        const table = createTestTablePlayer(mock<WebSocket>()).table
        serverStorage.saveTable(table)
        table.tableInfo.name = 'changed-name'
        serverStorage.saveTable(table)
        expect(serverStorage.tablesCount).toStrictEqual(1)
        expect(serverStorage.getTable(table.tableInfo.id)?.tableInfo.name).toStrictEqual('changed-name')
    })

    test('tablesCount', () => {
        const serverStorage = new MemoryServerStorage()
        serverStorage.saveTable(createTestTablePlayer(mock<WebSocket>(), 1).table)
        serverStorage.saveTable(createTestTablePlayer(mock<WebSocket>(), 2).table)
        expect(serverStorage.tablesCount).toStrictEqual(2)
    })

    test('getTable not found', () => {
        const serverStorage = new MemoryServerStorage()
        const table = createTestTablePlayer(mock<WebSocket>()).table
        serverStorage.saveTable(table)
        expect(serverStorage.getTable('does-not-exists')).toBeUndefined()
    })
})