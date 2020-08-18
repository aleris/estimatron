import { globalStats, MeasureUnit, AggregationType, TagKey, TagMap } from '@opencensus/core'
import * as Exporter from '@opencensus/exporter-stackdriver'
import { logger } from './logger'

export class Monitoring {
    private static readonly MEASURE_OPENED_CONNECTIONS = globalStats.createMeasureInt64(
        'opened_connections',
        MeasureUnit.UNIT,
        'Number of opened connections'
    )

    private static readonly MEASURE_CREATED_TABLES = globalStats.createMeasureInt64(
        'created_tables',
        MeasureUnit.UNIT,
        'Number of created tables'
    )

    private static readonly MEASURE_PLAYERS_JOINED = globalStats.createMeasureInt64(
        'players_joined',
        MeasureUnit.UNIT,
        'Number of players joined'
    )

    private static readonly TAG_JOIN_DENY_REASON: TagKey  = { name: 'join_deny_reason' }
    private static readonly MEASURE_PLAYERS_DENIED_JOINED = globalStats.createMeasureInt64(
        'players_denied_joined',
        MeasureUnit.UNIT,
        'Number of players denied joining'
    )

    private static readonly TAG_PLAYERS_ON_TABLE: TagKey  = { name: 'players_on_table' }
    private static readonly MEASURE_GAMES_PLAYED = globalStats.createMeasureInt64(
        'games_played',
        MeasureUnit.UNIT,
        'Number of games played as determined by reveal cards'
    )

    static initialize() {
        const monitoringEnabled = Boolean(process.env.MONITORING_ENABLED) || false
        if (!monitoringEnabled) {
            logger.info('Monitoring is not enabled')
            return
        }

        this.registerViews()

        const projectId = process.env.GOOGLE_PROJECT_ID

        if (!projectId || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            throw Error('Unable to proceed without GOOGLE_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS set')
        }

        const MONITORING_EXPORT_INTERVAL = process.env.MONITORING_EXPORT_INTERVAL
            ? parseInt(process.env.MONITORING_EXPORT_INTERVAL, 10)
            : 10

        const exporter = new Exporter.StackdriverStatsExporter({
            projectId,
            period: MONITORING_EXPORT_INTERVAL * 60 * 1000,
        })

        globalStats.registerExporter(exporter)

        logger.info(`Monitoring initialized with export period of ${MONITORING_EXPORT_INTERVAL} min`)
    }

    private static registerViews() {
        globalStats.registerView(globalStats.createView(
            'opened_connections_count',
            this.MEASURE_OPENED_CONNECTIONS,
            AggregationType.COUNT,
            [],
            'The count of the number of opened connections.',
            []
        ))

        globalStats.registerView(globalStats.createView(
            'created_tables_count',
            this.MEASURE_CREATED_TABLES,
            AggregationType.COUNT,
            [],
            'The count of the number of created tables.',
            []
        ))

        globalStats.registerView(globalStats.createView(
            'players_joined_count',
            this.MEASURE_PLAYERS_JOINED,
            AggregationType.COUNT,
            [],
            'The count of the number of players joined.',
            []
        ))


        globalStats.registerView(globalStats.createView(
            'players_denied_joined_count',
            this.MEASURE_PLAYERS_DENIED_JOINED,
            AggregationType.COUNT,
            [this.TAG_JOIN_DENY_REASON],
            'The count of the number of players denied joining.',
            []
        ))


        globalStats.registerView(globalStats.createView(
            'games_played_count',
            this.MEASURE_GAMES_PLAYED,
            AggregationType.COUNT,
            [this.TAG_PLAYERS_ON_TABLE],
            'The count of the number of games played as determined by reveal cards.',
            []
        ))
    }

    static recordStatsOpenedConnections() {
        globalStats.record([{measure: this.MEASURE_OPENED_CONNECTIONS, value: 1}])
    }

    static recordStatsCreatedTables() {
        globalStats.record([
            { measure: this.MEASURE_CREATED_TABLES, value: 1 },
            { measure: this.MEASURE_PLAYERS_JOINED, value: 1 }
        ])
    }

    static recordStatsPlayersJoined() {
        globalStats.record([{ measure: this.MEASURE_PLAYERS_JOINED, value: 1 }])
    }

    static recordStatsGamesPlayed(numberOfPlayers: number) {
        const tags = new TagMap()
        tags.set(this.TAG_PLAYERS_ON_TABLE, {value: numberOfPlayers.toString()})
        globalStats.record([{measure: this.MEASURE_GAMES_PLAYED, value: 1}], tags)
    }
}

