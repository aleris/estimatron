import { globalStats, MeasureUnit, AggregationType, TagKey } from '@opencensus/core'
import * as Exporter from '@opencensus/exporter-stackdriver'
import { logger } from './logger'

export const TAG_PLAYERS_ON_TABLE: TagKey  = { name: 'players_on_table' }

export const MEASURE_OPENED_CONNECTIONS = globalStats.createMeasureInt64(
    'opened_connections',
    MeasureUnit.UNIT,
    'Number of opened connections'
)
globalStats.registerView(globalStats.createView(
    'opened_connections_count',
    MEASURE_OPENED_CONNECTIONS,
    AggregationType.COUNT,
    [],
    'The count of the number of opened connections.',
    []
))

export const MEASURE_CREATED_TABLES = globalStats.createMeasureInt64(
    'created_tables',
    MeasureUnit.UNIT,
    'Number of created tables'
)
globalStats.registerView(globalStats.createView(
    'created_tables_count',
    MEASURE_CREATED_TABLES,
    AggregationType.COUNT,
    [],
    'The count of the number of created tables.',
    []
))

export const MEASURE_PLAYERS_JOINED = globalStats.createMeasureInt64(
    'players_joined',
    MeasureUnit.UNIT,
    'Number of players joined'
)
globalStats.registerView(globalStats.createView(
    'players_joined_count',
    MEASURE_PLAYERS_JOINED,
    AggregationType.COUNT,
    [],
    'The count of the number of players joined.',
    []
))

export const MEASURE_GAMES_PLAYED = globalStats.createMeasureInt64(
    'games_played',
    MeasureUnit.UNIT,
    'Number of games played as determined by reveal cards'
)
globalStats.registerView(globalStats.createView(
    'games_played_count',
    MEASURE_GAMES_PLAYED,
    AggregationType.COUNT,
    [TAG_PLAYERS_ON_TABLE],
    'The count of the number of games played as determined by reveal cards.',
    []
))

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

logger.info(`Monitoring enabled with export period of ${MONITORING_EXPORT_INTERVAL} min`)
