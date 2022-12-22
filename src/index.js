import fs from 'fs-extra' // copy config files
import { execSync } from 'child_process' // execute commands
import inquirer from 'inquirer' // prompt user
import { addDependencies } from './utils/addDependencies.js'

import { TAILWIND, SASS } from './utils/packages.js'
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

let dependencies = {}
let devDependencies = {}

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
    fs.copySync(`${cwd}/src/config/ts/.eslintrc.cjs`, './.eslintrc.cjs')
    return
  }
  fs.copySync(`${cwd}/src/config/.eslintrc.cjs`, './.eslintrc.cjs')
}

const initGit = async () => {
  if (!git) return
  await execSync('git init')
}

const installDependencies = async () => {
  await execSync('npm install')
}

// Setting up the project
await createApp()
await setupStyle()
await setupESLint()
await initGit()
await addDependencies(dependencies, devDependencies)
await installDependencies()
