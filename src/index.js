import fs from 'fs-extra' // copy config files
import { execSync } from 'child_process' // execute commands
import inquirer from 'inquirer' // prompt user
import { addDependencies } from './utils/addDependencies.js'

import { TAILWIND, SASS, ESLINT_JS, ESLINT_TS } from './utils/packages.js'
import {
  TITLE,
  DEFAULT_APP_NAME,
  DEFAULT_LANGUAGE,
  DEFAULT_STYLE
} from './utils/defaults.js'

const cwd = process.cwd() // current working directory

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
    message: 'Initialize a new git repository? ',
    default: true
  })
  return git
}

const promptInstall = async () => {
  const { install } = await inquirer.prompt({
    name: 'install',
    type: 'confirm',
    message: 'Install dependencies? ',
    default: true
  })
  return install
}

let appName = DEFAULT_APP_NAME
let language = DEFAULT_LANGUAGE
let style = DEFAULT_STYLE
let git = true
let install = true
let dependencies = {}
let devDependencies = {}

// Prompt user for project options
const promptUser = async () => {
  appName = await promptAppName()
  language = await promptLanguage()
  style = await promptStyle()
  git = await promptGit()
  install = await promptInstall()
}

const createApp = async () => {
  if (language === 'typescript') {
    await execSync(`npm create vite@latest ${appName} -- --template react-ts`)
  } else {
    await execSync(`npm create vite@latest ${appName} -- --template react`)
  }
  // move to created app
  process.chdir(`${cwd}/${appName}`)
}

const setupStyle = async () => {
  if (style === 'tailwind') {
    devDependencies = {
      ...devDependencies,
      ...TAILWIND
    }
    fs.copySync(
      `${cwd}/src/config/tailwind.config.cjs`,
      './tailwind.config.cjs'
    )
    fs.copySync(`${cwd}/src/config/postcss.config.cjs`, './postcss.config.cjs')
    fs.copySync(`${cwd}/src/config/index.css`, './src/index.css')
    return
  }
  if (style === 'scss') {
    dependencies = {
      ...dependencies,
      ...SASS
    }
  }
}

const setupESLint = async () => {
  if (language === 'typescript') {
    devDependencies = {
      ...devDependencies,
      ...ESLINT_TS
    }
    fs.copySync(`${cwd}/src/config/ts/.eslintrc.cjs`, './.eslintrc.cjs')
    return
  }
  devDependencies = {
    ...devDependencies,
    ...ESLINT_JS
  }
  fs.copySync(`${cwd}/src/config/.eslintrc.cjs`, './.eslintrc.cjs')
}

const initGit = async () => {
  if (!git) return
  await execSync('git init')
}

const installDependencies = async () => {
  if (!install) return
  await execSync('npm install')
}

// Setting up the project
const setUp = async () => {
  await createApp()
  await setupStyle()
  await setupESLint()
  await initGit()
  await addDependencies(dependencies, devDependencies)
  await installDependencies()
}

// Start
console.log(TITLE)
await promptUser()
await setUp()
console.log(`Your project "${appName}" is ready!`)
console.log('To get started:')
console.log("Run 'cd' to move to your project directory.")
if (!install) console.log("Run 'npm install' to install dependencies.")
console.log("Run 'npm run dev' to start the development server.")
console.log('Happy hacking! 🎉🎉🎉')
