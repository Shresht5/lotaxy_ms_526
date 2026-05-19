import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { initDb } from './services/database/db';
import { getAllUsers, addUser, deleteUser, updateUser } from './services/database/user';
import { getAllProducts, addProduct, deleteProduct, updateProduct } from './services/database/product';
import { getAllOrders, addOrder } from './services/database/orders';
import fs from 'fs';



// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),

    );
  }

  // // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  initDb(app.getPath('userData'));
  // ipcMain.handle('db-get-users', () => getAllUsers());
  // ipcMain.handle('db-add-user', (_, name, email) => addUser(name, email));
  // ipcMain.handle('db-delete-user', (_, id) => deleteUser(id));
  // ipcMain.handle('db-update-user', (_, id, name, email) => updateUser(id, name, email));
  ipcMain.handle('db-get-products', () => getAllProducts());


  ipcMain.handle('db-add-product', (_, name, price, mrp, stock, category, detail, image_path) => {
    console.log('args:', name, price, mrp, stock, category, detail, image_path);
    console.log('types:', typeof name, typeof price, typeof mrp, typeof stock, typeof category, typeof detail, typeof image_path);
    return addProduct(name, price, mrp, stock, category ?? '', detail ?? '', image_path ?? '');
  });
  ipcMain.handle('db-update-product', (_, id, name, price, mrp, stock, category, detail, image_path) => {
    return updateProduct(id, name, price, mrp, stock, category ?? '', detail ?? '', image_path ?? '');
  });
  ipcMain.handle('db-delete-product', (_, id) => deleteProduct(id));
  // ipcMain.handle('db-get-orders', () => getAllOrders());
  // ipcMain.handle('db-add-order', (_, userId, productId, qty) => addOrder(userId, productId, qty));
  ipcMain.handle('save-image', (_, base64: string, ext: string) => {
    const imagesDir = path.join(app.getPath('userData'), 'images');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
    const fileName = `${Date.now()}.${ext}`;
    const destPath = path.join(imagesDir, fileName);
    fs.writeFileSync(destPath, Buffer.from(base64, 'base64'));
    return destPath;
  });
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
