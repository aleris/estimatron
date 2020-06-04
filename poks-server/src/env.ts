import { resolve } from 'path'

import { config } from 'dotenv'

const env = process.env.NODE_ENV || 'production'
let envFileRelativePath = '../.env'
if (env === 'dev') {
    envFileRelativePath += '.dev'
}
config({ path: resolve(__dirname, envFileRelativePath) })
