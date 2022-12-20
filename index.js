import fs from 'fs-extra' // copy config files
import { exec } from 'child_process' // execute commands
import { promisify } from 'util' // promisify exec
import inquirer from 'inquirer' // prompt user

import {
  TITLE,
  DEFAULT_APP_NAME,
  DEFAULT_LANGUAGE,
  DEFAULT_STYLE
} from './defaults.js'

const cwd = process.cwd() // current working directory
const execPromise = promisify(exec)

const promptAppName = async () => {
  const { appName } = await inquirer.prompt({
    name: 'appName',
    type: 'input',
    message: 'What will your project be called? ',
    default: DEFAULT_APP_NAME
  })
  return appName
}

const promptLanguage = async () => {
  const { language } = await inquirer.prompt({
    name: 'language',
    type: 'list',
    message: 'Will you be using TypeScript or JavaScript? ',
    choices: [
      { name: 'TypeScript', value: 'typescript' },
      { name: 'JavaScript', value: 'javascript' }
    ],
    default: DEFAULT_LANGUAGE
  })
  return language
}

const promptStyle = async () => {
  const { style } = await inquirer.prompt({
    name: 'style',
    type: 'list',
    message: 'How will you style your project? ',
    choices: [
      { name: 'TailwindCSS', value: 'tailwind' },
      { name: 'SCSS', value: 'scss' },
      { name: 'CSS ', value: 'css' }
    ],
    default: DEFAULT_STYLE
  })
  return style
}

const promptGit = async () => {
  const { git } = await inquirer.prompt({
    name: 'git',
    type: 'confirm',
    message: 'Would you like to initialize a git repository? ',
    default: true
  })
  return git
}

// Prompt user for project options
console.log(TITLE)
const appName = await promptAppName()
const language = await promptLanguage()
const style = await promptStyle()
const git = await promptGit()

const createApp = async () => {
  if (language === 'typescript') {
    await execPromise(
      `npm create vite@latest ${appName} -- --template react-ts`
    )
  } else {
    await execPromise(`npm create vite@latest ${appName} -- --template react`)
  }
  // move to created app
  process.chdir(`${cwd}/${appName}`)
}

const installStyle = async () => {
  if (style === 'tailwind') {
    await execPromise(
      `npm install -D tailwindcss@latest postcss@latest autoprefixer@latest`
    )
    await execPromise(`npx tailwindcss init -p`)
    fs.copySync(`${cwd}/tailwind.config.cjs`, './tailwind.config.cjs')
    return
  }
  if (style === 'scss') {
    await execPromise(`npm install sass`)
    return
  }
}

const initGit = async () => {
  if (!git) return
  await execPromise(`git init`)
}

// Setting up the project
await createApp()
await installStyle()
await initGit()
