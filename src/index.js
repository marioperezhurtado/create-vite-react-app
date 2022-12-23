#!/usr/bin/env node

import inquirer from 'inquirer' // prompt user
import fs from 'fs-extra' // copy config files
import { execSync } from 'child_process' // execute commands
import figlet from 'figlet' // title
import gradient from 'gradient-string'
import { createSpinner } from 'nanospinner' // loading spinner

import { addDependencies } from './utils/addDependencies.js'

import {
  TAILWIND,
  SASS,
  ESLINT_JS,
  ESLINT_TS,
  VITEST,
  VITEST_SCRIPTS
} from './utils/packages.js'
import {
  PKG_ROOT,
  TITLE,
  DEFAULT_APP_NAME,
  DEFAULT_LANGUAGE,
  DEFAULT_STYLE,
  DEFAULT_TESTING,
  DEFAULT_GIT,
  DEFAULT_INSTALL
} from './utils/defaults.js'

const cwd = process.cwd() // current working directory

const greet = async () => {
  const greeting = figlet.textSync(TITLE, { font: 'Slant' })
  console.log(gradient.pastel.multiline(greeting))
}

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

const promptTesting = async () => {
  const { testing } = await inquirer.prompt({
    name: 'testing',
    type: 'list',
    message: 'How will you test your project? ',
    choices: [
      { name: 'Vitest', value: 'vitest' },
      { name: 'None', value: false }
    ],
    default: DEFAULT_STYLE
  })
  return testing
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
let testing = DEFAULT_TESTING
let git = DEFAULT_GIT
let install = DEFAULT_INSTALL
let dependencies = {}
let devDependencies = {}
let scripts = {}

// Prompt user for project options
const promptUser = async () => {
  appName = await promptAppName()
  language = await promptLanguage()
  style = await promptStyle()
  testing = await promptTesting()
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
      `${PKG_ROOT}/config/tailwind/tailwind.config.cjs`,
      './tailwind.config.cjs'
    )
    fs.copySync(
      `${PKG_ROOT}/config/tailwind/postcss.config.cjs`,
      './postcss.config.cjs'
    )
    fs.copySync(`${PKG_ROOT}/config/tailwind/index.css`, './src/index.css')
    return
  }
  if (style === 'scss') {
    dependencies = {
      ...dependencies,
      ...SASS
    }
  }
}

const setupTesting = async () => {
  if (!testing) return
  if (testing === 'vitest') {
    devDependencies = {
      ...devDependencies,
      ...VITEST
    }
    scripts = {
      ...scripts,
      ...VITEST_SCRIPTS
    }
    if (language === 'typescript') {
      fs.copySync(
        `${PKG_ROOT}/config/vitest/vite.config.ts`,
        './vite.config.ts'
      )
      return
    }
    fs.copySync(`${PKG_ROOT}/config/vitest/vite.config.js`, './vite.config.js')
  }
}

const setupESLint = async () => {
  if (language === 'typescript') {
    devDependencies = {
      ...devDependencies,
      ...ESLINT_TS
    }
    fs.copySync(`${PKG_ROOT}/config/eslint/ts/.eslintrc.cjs`, './.eslintrc.cjs')
    return
  }
  devDependencies = {
    ...devDependencies,
    ...ESLINT_JS
  }
  fs.copySync(`${PKG_ROOT}/config/eslint/.eslintrc.cjs`, './.eslintrc.cjs')
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
  const sCreate = createSpinner('Creating project...').spin()
  await createApp()
  sCreate.success('Project created!')
  const sStyle = createSpinner('Setting up style...').start()
  await setupStyle()
  sStyle.success('Your styles have been set up!')
  const sTesting = createSpinner('Setting up testing...').start()
  await setupTesting()
  sTesting.success('Testing has been set up!')
  const sESLint = createSpinner('Setting up ESLint...').start()
  await setupESLint()
  sESLint.success('ESLint has been set up!')
  const sGit = createSpinner('Initalizing git...').start()
  await initGit()
  sGit.success('Your git repository has been initialized!')
  await addDependencies(dependencies, devDependencies, scripts)
  const sDep = createSpinner('Installing dependencies...').spin()
  await installDependencies()
  sDep.success('Your dependencies have been installed!')
}

// Start
await greet()
await promptUser()
await setUp()

if (install) {
  console.log(`
  Your project "${appName}" is ready!

  To get started:
    Run 'cd ${appName}' to move to your project directory.
    Run 'npm run dev' to start the development server.

  Happy hacking! 🎉🎉🎉
`)
} else {
  console.log(`
  Your project "${appName}" is ready!

  To get started:
    Run 'cd ${appName}' to move to your project directory.
    Run 'npm install' to install dependencies.
    Run 'npm run dev' to start the development server.

  Note: Your project is not fully setup yet. You will need to install dependencies before you can run the development server.

  Happy hacking! 🎉🎉🎉
`)
}
