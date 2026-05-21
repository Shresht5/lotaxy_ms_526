import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { initDb } from './services/database/db';
import { getAllUsers, addUser, deleteUser, updateUser } from './services/database/user';
import { getAllProducts, addProduct, deleteProduct, updateProduct } from './services/database/product';
import { getAllOrders, addOrder, getOrderById, deleteOrder, updateOrder } from './services/database/orders';
import { getAllAttendance, getAttendanceByDate, getAttendanceByUser, markAttendance, updateAttendance, deleteAttendance } from './services/database/attendance';
import { getAllClients, addClient, updateClient, deleteClient } from './services/database/client';
import fs from 'fs';
import { addProject, deleteProject, getAllProjects, getProjectById, updateProject } from './services/database/project';



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
      webSecurity: false,
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
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  initDb(app.getPath('userData'));

  //user
  ipcMain.handle('db-get-users', () => getAllUsers());
  ipcMain.handle('db-add-user', (_, name, email, phone, department, position, date_of_joining, date_of_birth, total_experience, performance, potential, ctc) =>
    addUser(name, email, phone ?? '', department ?? '', position ?? '', date_of_joining ?? '', date_of_birth ?? '', +total_experience || 0, performance ?? 'Average', potential ?? 'Medium', +ctc || 0));
  ipcMain.handle('db-update-user', (_, id, name, email, phone, department, position, date_of_joining, date_of_birth, total_experience, performance, potential, ctc) =>
    updateUser(id, name, email, phone ?? '', department ?? '', position ?? '', date_of_joining ?? '', date_of_birth ?? '', +total_experience || 0, performance ?? 'Average', potential ?? 'Medium', +ctc || 0));
  ipcMain.handle('db-delete-user', (_, id) => deleteUser(id));

  //attedance
  ipcMain.handle('attendance-get-all', () => getAllAttendance());
  ipcMain.handle('attendance-get-by-date', (_, date) => getAttendanceByDate(date));
  ipcMain.handle('attendance-get-by-user', (_, userId) => getAttendanceByUser(userId));
  ipcMain.handle('attendance-mark', (_, user_id, date, check_in, status, remark) =>
    markAttendance(user_id, date, check_in, status ?? 'Present', remark ?? ''));
  ipcMain.handle('attendance-update', (_, id, check_in, status, remark) =>
    updateAttendance(id, check_in, status, remark ?? ''));
  ipcMain.handle('attendance-delete', (_, id) => deleteAttendance(id));

  //client
  ipcMain.handle('db-get-clients', () => getAllClients());
  ipcMain.handle('db-add-client', (_, name, email, phone, address, company_name, status) =>
    addClient(name, email, phone ?? '', address ?? '', company_name ?? '', status ?? 'Active'));
  ipcMain.handle('db-update-client', (_, id, name, email, phone, address, company_name, status) =>
    updateClient(id, name, email, phone ?? '', address ?? '', company_name ?? '', status ?? 'Active'));
  ipcMain.handle('db-delete-client', (_, id) => deleteClient(id));

  //project
  ipcMain.handle('project-get-all', () => getAllProjects());
  ipcMain.handle('project-get-by-id', (_, id) => getProjectById(id));
  ipcMain.handle('project-add', (_, name, client_id, detail, what_done, what_todo, completion, status) =>
    addProject(name, client_id ?? null, detail ?? '', what_done ?? '', what_todo ?? '', completion ?? 0, status ?? 'Active'));
  ipcMain.handle('project-update', (_, id, name, client_id, detail, what_done, what_todo, completion, status) =>
    updateProject(id, name, client_id ?? null, detail ?? '', what_done ?? '', what_todo ?? '', completion ?? 0, status ?? 'Active'));
  ipcMain.handle('project-delete', (_, id) => deleteProject(id));

  //product
  ipcMain.handle('db-get-products', () => getAllProducts());
  ipcMain.handle('db-add-product', (_, name, price, mrp, stock, category, detail, image_path) => { return addProduct(name, price, mrp, stock, category ?? '', detail ?? '', image_path ?? ''); });
  ipcMain.handle('db-update-product', (_, id, name, price, mrp, stock, category, detail, image_path) => { return updateProduct(id, name, price, mrp, stock, category ?? '', detail ?? '', image_path ?? ''); });
  ipcMain.handle('db-delete-product', (_, id) => deleteProduct(id));

  //order
  ipcMain.handle('order-get-all', () => getAllOrders());
  ipcMain.handle('order-get-by-id', (_, id) => getOrderById(id));
  ipcMain.handle('order-add', (_, product_id, product_name, product_price, receiver_name, phone, email, address, discount, quantity, final_amount, status) => addOrder(product_id ?? null, product_name ?? '', product_price ?? 0, receiver_name, phone ?? '', email ?? '', address ?? '', discount ?? 0, quantity ?? 1, final_amount ?? 0, status ?? 'Pending'));
  ipcMain.handle('order-update', (_, id, product_id, product_name, product_price, receiver_name, phone, email, address, discount, quantity, final_amount, status) => updateOrder(id, product_id ?? null, product_name ?? '', product_price ?? 0, receiver_name, phone ?? '', email ?? '', address ?? '', discount ?? 0, quantity ?? 1, final_amount ?? 0, status ?? 'Pending'));
  ipcMain.handle('order-delete', (_, id) => deleteOrder(id));


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
