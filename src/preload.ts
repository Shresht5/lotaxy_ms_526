// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    getUsers: () => ipcRenderer.invoke('db-get-users'),
    addUser: (name: string, email: string) => ipcRenderer.invoke('db-add-user', name, email),
    updateUser: (id: number, name: string, email: string) => ipcRenderer.invoke('db-update-user', id, name, email),
    deleteUser: (id: number) => ipcRenderer.invoke('db-delete-user', id),
    getProducts: () => ipcRenderer.invoke('db-get-products'),
    addProduct: (name: string, price: number, stock: number) => ipcRenderer.invoke('db-add-product', name, price, stock),
    deleteProduct: (id: number) => ipcRenderer.invoke('db-delete-product', id),
    getOrders: () => ipcRenderer.invoke('db-get-orders'),
    addOrder: (userId: number, productId: number, qty: number) => ipcRenderer.invoke('db-add-order', userId, productId, qty),
});