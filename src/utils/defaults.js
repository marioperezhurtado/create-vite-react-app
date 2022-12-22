import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const distPath = path.dirname(__filename)
export const PKG_ROOT = path.join(distPath, '../')

export const TITLE = 'Create Vite React App'
export const DEFAULT_APP_NAME = 'my-vite-react-app'
export const DEFAULT_LANGUAGE = 'typescript'
export const DEFAULT_STYLE = 'tailwind'
