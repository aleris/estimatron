import { resolve } from 'path'

import { config } from 'dotenv'

let envFileRelativePath = '../.env'
if (process.env.NODE_ENV === 'dev') {
    envFileRelativePath += '.dev'
}
config({ path: resolve(__dirname, envFileRelativePath) })
