/**
 * Exports the backend's OpenAPI spec to `openapi/openapi.json`.
 *
 * The backend only serves the spec through Swagger UI, so we import its
 * `swaggerSpec` directly (read-only, no backend code is modified).
 * `swagger-jsdoc` resolves the `apis` globs relative to the current working
 * directory, so we switch into `backend/` before importing it.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const backendDir = resolve(rootDir, 'backend')
const outputFile = resolve(rootDir, 'openapi', 'openapi.json')

process.chdir(backendDir)

const { swaggerSpec } = (await import(
  pathToFileURL(resolve(backendDir, 'src/config/swagger.ts')).href
)) as { swaggerSpec: unknown }

mkdirSync(dirname(outputFile), { recursive: true })
writeFileSync(outputFile, `${JSON.stringify(swaggerSpec, null, 2)}\n`)

console.log(`OpenAPI spec written to ${outputFile}`)
