import * as fs from 'fs'
import JSZip from 'jszip'
import * as path from 'path'

export async function addFolderToZip(zip: JSZip, folderPath: string, folderName: string = ''): Promise<void> {
  const files = fs.readdirSync(folderPath)

  for (const file of files) {
    const filePath = path.join(folderPath, file)
    const stats = fs.statSync(filePath)

    if (stats.isFile()) {
      const fileData = fs.readFileSync(filePath)
      zip.file(path.join(folderName, file), fileData)
    } else if (stats.isDirectory()) {
      await addFolderToZip(zip, filePath, path.join(folderName, file))
    }
  }
}

export async function zipFolder(sourceFolder: string, outPath: string): Promise<void> {
  if (!fs.existsSync(sourceFolder) || !fs.statSync(sourceFolder).isDirectory()) {
    throw new Error(`Source folder does not exist or is not a directory: ${sourceFolder}`)
  }

  // Initialize JSZip instance
  const zip = new JSZip()
  await addFolderToZip(zip, sourceFolder)

  // Generate zip content
  const content = await zip.generateAsync({ type: 'nodebuffer' })

  // Ensure the output directory exists
  const outDir = path.dirname(outPath)
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  // Write zip content to file
  fs.writeFileSync(outPath, content)
}
