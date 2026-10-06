import createClient from 'openapi-fetch'
import type { paths } from './schema'

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5001'

/** Typed fetch client generated from the backend OpenAPI spec. */
export const apiClient = createClient<paths>({ baseUrl })
