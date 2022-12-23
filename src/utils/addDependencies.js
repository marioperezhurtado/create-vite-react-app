import fs from 'fs'

export const addDependencies = async (
  dependencies,
  devDependencies,
  scripts
) => {
  const res = await fs.readFileSync('./package.json')
  const packageJson = await JSON.parse(res)

  const newPackageJson = {
    ...packageJson,
    dependencies: {
      ...packageJson.dependencies,
      ...dependencies
    },
    devDependencies: {
      ...packageJson.devDependencies,
      ...devDependencies
    },
    scripts: {
      ...packageJson.scripts,
      ...scripts
    }
  }

  fs.writeFileSync('./package.json', JSON.stringify(newPackageJson))
}
