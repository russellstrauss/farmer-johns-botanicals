// Script to copy assets from dist to public for Vue app
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distAssetsPath = path.join(__dirname, '../dist/assets')
const publicAssetsPath = path.join(__dirname, '../public/assets')

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
      console.log(`Copied: ${entry.name}`)
    }
  }
}

if (fs.existsSync(distAssetsPath)) {
  console.log('Copying assets from dist to public...')
  copyRecursive(distAssetsPath, publicAssetsPath)
  console.log('Assets copied successfully!')
} else {
  console.log('dist/assets directory not found. Skipping asset copy.')
}
