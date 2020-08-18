import { resolve } from 'path'

import { config } from 'dotenv'

const env = process.env.NODE_ENV || 'production'
let envFileRelativePath = '../.env'
if (env !== 'production') {
    envFileRelativePath += '.' + env
}
const path = resolve(__dirname, envFileRelativePath)
config({ path })
