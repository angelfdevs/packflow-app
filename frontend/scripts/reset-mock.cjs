const fs = require('node:fs')
const path = require('node:path')

const frontendRoot = path.resolve(__dirname, '..')
const source = path.join(frontendRoot, 'mock', 'db.seed.json')
const target = path.join(frontendRoot, 'mock', 'db.local.json')

fs.copyFileSync(source, target)
console.log('Mock restablecido desde db.seed.json')
