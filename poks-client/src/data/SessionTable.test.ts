import { SessionTable } from '@/data/SessionTable'
import { mock } from 'jest-mock-extended'
import { NameGenerator } from '@/data/NameGenerator'
import { IdGenerator } from '@/data/IdGenerator'
import { LocalStorageRepository } from '@/data/StorageRepository'
import { PlayerInfo } from '@server/model/PlayerInfo'
import { createTestPlayerInfo, createTestTableInfo } from '@server/model/TablePlayerInfo.test-utils'
import { TableInfo } from '@server/model/TableInfo'
import { LocalTablePlayer } from '@/data/LocalTablePlayer'

describe(SessionTable.name, () => {
    describe('initialize', () => {
        describe('no local storage', () => {
            beforeAll(() => {
                Object.defineProperty(LocalStorageRepository, 'isAvailable', { value: false })
            })

            test('nothing in window location', () => {
                window.location = mock<Location>({ hash: ''})
                jest.spyOn(IdGenerator, 'randomUniqueId')
                    .mockReturnValueOnce('random-table-id-1')
                    .mockReturnValueOnce('random-player-id-1')

                jest.spyOn(NameGenerator, 'randomReadableName').mockReturnValue('random-player-name-1')

                const sessionTable = new SessionTable(new LocalTablePlayer())

                expect(sessionTable.tableInfo.id).toStrictEqual('random-table-id-1')
                expect(sessionTable.playerInfo.id).toStrictEqual('random-player-id-1')
                expect(sessionTable.playerInfo.name).toStrictEqual('random-player-name-1')
                expect(sessionTable.playerInfo.observerMode).toStrictEqual(false)
                expect(window.location.hash).toStrictEqual('random-table-id-1∧random-player-id-1∧random-player-name-1∧false')
            })

            test('nothing in window location but hash char present', () => {
                window.location = mock<Location>({ hash: '#'})
                jest.spyOn(IdGenerator, 'randomUniqueId')
                    .mockReturnValueOnce('random-table-id-1')
                    .mockReturnValueOnce('random-player-id-1')
                jest.spyOn(NameGenerator, 'randomReadableName').mockReturnValue('random-player-name-1')

                const sessionTable = new SessionTable(new LocalTablePlayer())

                expect(sessionTable.tableInfo.id).toStrictEqual('random-table-id-1')
                expect(sessionTable.playerInfo.id).toStrictEqual('random-player-id-1')
                expect(sessionTable.playerInfo.name).toStrictEqual('random-player-name-1')
                expect(sessionTable.playerInfo.observerMode).toStrictEqual(false)
            })

            test('table id from window location', () => {
                window.location = mock<Location>({ hash: '#table-id-1'})
                jest.spyOn(IdGenerator, 'randomUniqueId')
                    .mockReturnValueOnce('random-player-id-1')
                jest.spyOn(NameGenerator, 'randomReadableName').mockReturnValue('random-player-name-1')

                const sessionTable = new SessionTable(new LocalTablePlayer())

                expect(sessionTable.tableInfo.id).toStrictEqual('table-id-1')
                expect(sessionTable.playerInfo.id).toStrictEqual('random-player-id-1')
                expect(sessionTable.playerInfo.name).toStrictEqual('random-player-name-1')
                expect(sessionTable.playerInfo.observerMode).toStrictEqual(false)
                expect(window.location.hash).toStrictEqual('table-id-1∧random-player-id-1∧random-player-name-1∧false')
            })

            test('table and player from window location', () => {
                window.location = mock<Location>({ hash: '#table-id-1∧player-id-1∧player-name-1∧true'})

                const sessionTable = new SessionTable(new LocalTablePlayer())

                expect(sessionTable.tableInfo.id).toStrictEqual('table-id-1')
                expect(sessionTable.playerInfo.id).toStrictEqual('player-id-1')
                expect(sessionTable.playerInfo.name).toStrictEqual('player-name-1')
                expect(sessionTable.playerInfo.observerMode).toStrictEqual(true)
                expect(window.location.hash).toStrictEqual('table-id-1∧player-id-1∧player-name-1∧true')
            })

            test('location with partial parts only player id', () => {
                const location = mock<Location>()
                location.hash = '#table-id-1∧player-id-1'
                window.location = location

                const sessionTable = new SessionTable(new LocalTablePlayer())

                expect(sessionTable.tableInfo.id).toStrictEqual('table-id-1')
            })


            test('location with partial parts player id and name ', () => {
                window.location = mock<Location>({ hash: '#table-id-1∧player-id-1'})
                jest.spyOn(IdGenerator, 'randomUniqueId').mockReturnValue('random-player-id-1')
                jest.spyOn(NameGenerator, 'randomReadableName').mockReturnValue('random-player-name-1')

                const sessionTable = new SessionTable(new LocalTablePlayer())

                expect(sessionTable.tableInfo.id).toStrictEqual('table-id-1')
                expect(sessionTable.playerInfo.id).toStrictEqual('player-id-1')
                expect(sessionTable.playerInfo.name).toStrictEqual('random-player-name-1')
            })

            test('location with more parts than needed', () => {
                window.location = mock<Location>({ hash: '#table-id-1∧player-id-1∧player-name-1∧true∧a∧b∧c'})
                jest.spyOn(IdGenerator, 'randomUniqueId').mockReturnValue('random-player-id-1')
                jest.spyOn(NameGenerator, 'randomReadableName').mockReturnValue('random-player-name-1')

                const sessionTable = new SessionTable(new LocalTablePlayer())

                expect(sessionTable.tableInfo.id).toStrictEqual('table-id-1')
                expect(sessionTable.playerInfo.id).toStrictEqual('player-id-1')
                expect(sessionTable.playerInfo.name).toStrictEqual('player-name-1')
                expect(sessionTable.playerInfo.observerMode).toStrictEqual(true)
            })

            test('locations with empty values in parts', () => {
                window.location = mock<Location>({ hash: '#table-id-1∧∧∧∧'})
                jest.spyOn(IdGenerator, 'randomUniqueId').mockReturnValue('random-player-id-1')
                jest.spyOn(NameGenerator, 'randomReadableName').mockReturnValue('random-player-name-1')

                const sessionTable = new SessionTable(new LocalTablePlayer())

                expect(sessionTable.tableInfo.id).toStrictEqual('table-id-1')
                expect(sessionTable.playerInfo.id).toStrictEqual('random-player-id-1')
                expect(sessionTable.playerInfo.name).toStrictEqual('random-player-name-1')
                expect(sessionTable.playerInfo.observerMode).toStrictEqual(false)
            })
        })

        describe('with local storage', () => {
            beforeAll(() => {
                Object.defineProperty(LocalStorageRepository, 'isAvailable', { value: true })
            })

            test('nothing in window location', () => {
                const playerInfo = createTestPlayerInfo()
                LocalStorageRepository.player = mock<LocalStorageRepository<PlayerInfo>>({
                    get: (itemKey: string | null = null) => playerInfo
                })
                const tableInfo = createTestTableInfo()
                LocalStorageRepository.table = mock<LocalStorageRepository<TableInfo>>({
                    get: (itemKey: string | null = null) => tableInfo
                })
                window.location = mock<Location>({ hash: ``})

                const sessionTable = new SessionTable(new LocalTablePlayer())

                expect(sessionTable.tableInfo.id).toStrictEqual(tableInfo.id)
                expect(sessionTable.playerInfo.id).toStrictEqual(playerInfo.id)
                expect(window.location.hash).toStrictEqual(`${tableInfo.id}`)
            })

            test('table id from window location', () => {
                const playerInfo = createTestPlayerInfo()
                LocalStorageRepository.player = mock<LocalStorageRepository<PlayerInfo>>({
                    get: (itemKey: string | null = null) => playerInfo
                })
                const tableInfo = createTestTableInfo()
                LocalStorageRepository.table = mock<LocalStorageRepository<TableInfo>>({
                    get: (itemKey: string | null = null) => tableInfo
                })
                window.location = mock<Location>({ hash: `#${tableInfo.id}`})

                const sessionTable = new SessionTable(new LocalTablePlayer())

                expect(sessionTable.tableInfo.id).toStrictEqual(tableInfo.id)
                expect(sessionTable.tableInfo.name).toStrictEqual(tableInfo.name)
                expect(sessionTable.playerInfo.id).toStrictEqual(playerInfo.id)
                expect(window.location.hash).toStrictEqual(`${tableInfo.id}`)
            })

            test('player id from window location ignored', () => {
                const playerInfo = createTestPlayerInfo()
                LocalStorageRepository.player = mock<LocalStorageRepository<PlayerInfo>>({
                    get: (itemKey: string | null = null) => playerInfo
                })
                const tableInfo = createTestTableInfo()
                LocalStorageRepository.table = mock<LocalStorageRepository<TableInfo>>({
                    get: (itemKey: string | null = null) => tableInfo
                })
                window.location = mock<Location>({ hash: `#${tableInfo.id}∧some-other-player-id`})

                const sessionTable = new SessionTable(new LocalTablePlayer())

                expect(sessionTable.tableInfo.id).toStrictEqual(tableInfo.id)
                expect(sessionTable.tableInfo.name).toStrictEqual(tableInfo.name)
                expect(sessionTable.playerInfo.id).toStrictEqual(playerInfo.id)
                expect(sessionTable.playerInfo.name).toStrictEqual(playerInfo.name)
                expect(window.location.hash).toStrictEqual(`${tableInfo.id}`)
            })
        })
    })
})
