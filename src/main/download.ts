import { dialog, ipcMain } from 'electron'
import { mainWindow } from './index'
import { resolve, extname } from 'path'
import axios from 'axios'
import fs from 'fs'
let dirName = ''
ipcMain.handle('selectedDirectory', async (_evnet) => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: '选择音乐下载目录',
    properties: ['createDirectory', 'openDirectory']
  })
  if (!res.canceled && res.filePaths.length) {
    dirName = res.filePaths[0]
    sendLocalDownloadList(dirName)
    watchDirName(dirName)
    return dirName
  }
  return false
})

ipcMain.handle('downLoadMusic', async (_evnet, url, name, outputPath, id) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      onDownloadProgress: (e) => {
        // console.log(e)
        setTimeout(() => {
          mainWindow.webContents.send('downloadProgress', e?.progress, id)
        }, 200)
      }
    })
    fs.writeFileSync(resolve(outputPath, `${name}-${url.split('=').pop()}.mp3`), response.data)
  } catch (error) {
    console.error('下载音乐时发生错误：', error)
  }
})

ipcMain.handle('initWatch', async (_evnet, outputPath) => {
  if (outputPath) {
    sendLocalDownloadList(outputPath)
    watchDirName(outputPath)
  }
})

function sendLocalDownloadList(path) {
  const res = findMP3Files([], path)
  mainWindow.webContents.send('localDownloadList', res)
}

function watchDirName(path) {
  fs.watch(path, () => {
    sendLocalDownloadList(path)
  })
}

function findMP3Files(mp3Files: any[] = [], dir: string) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    if (extname(file).toLowerCase() === '.mp3') {
      mp3Files.push(file)
    }
  }
  return mp3Files
}
