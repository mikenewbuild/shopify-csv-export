const fs = require('fs')

module.exports.write = (file, contents) => {
  fs.writeFile(file, contents, (error) => {
    if (error) throw error
    console.log(`Saved "${file}"`)
  })
}

module.exports.mkdir = (path) => {
  if (fs.existsSync(path)) return

  fs.mkdir(path, (error) => {
    if (error) throw error
    console.log(`Created  "${path}"`)
  })
}
