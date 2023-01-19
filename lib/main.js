const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const execSync = require('child_process').execSync

// hashes a given file and returns the hex digest
const hashFile = (filepath) => {
  const hashSum = crypto.createHash('md5')
  const contents = fs.readFileSync(filepath, 'utf-8')

  hashSum.update(Buffer.from(contents))
  return hashSum.digest('hex')
}

const findPackageJson = (lockFilename) => {
  let current = process.cwd()
  let last = current
  do {
    const search = path.join(current, lockFilename)
    if (fs.existsSync(search)) {
      return search
    }
    last = current
    current = path.dirname(current)
  } while (current !== last)
}

// returns whether or not npm install should be executed
const watchFile = ({
  hashFilename = 'packagehash.txt',
  lockFilename = 'package-lock.json',
  installCommand = 'npm install',
  isHashOnly = false
}) => {
  const packagePath = findPackageJson(lockFilename)

  if (!packagePath) {
    console.error(
      `Cannot find ${lockFilename}. Travelling up from current working directory`
    )
  }

  const packageHashPath = path.join(path.dirname(packagePath), hashFilename)
  const recentDigest = hashFile(packagePath)

  // if the hash file doesn't exist
  // or if it does and the hash is different
  if (
    !fs.existsSync(packageHashPath) ||
        fs.readFileSync(packageHashPath, 'utf-8') !== recentDigest
  ) {
    console.log(`${lockFilename} has been modified.`)

    if (isHashOnly) {
      console.log('Updating hash only because --hash-only is true.')

      fs.writeFileSync(packageHashPath, recentDigest) // write to hash to file for future use
      return true
    }

    console.log('Installing and updating hash.')

    try {
      execSync(installCommand, {
        stdio: 'inherit',
        shell: 'bash'
      })
      fs.writeFileSync(packageHashPath, recentDigest) // write to hash to file for future use
    }
    catch (error) {
      console.log(error)
    }
    return true
  }
  console.log(`${lockFilename} has not been modified.`)
  return false
}

module.exports = watchFile
