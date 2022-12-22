import fs from 'fs'

export const addDependencies = async (dependencies, devDependencies) => {
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
    }
  }

  fs.writeFileSync('./package.json', JSON.stringify(newPackageJson))
}
