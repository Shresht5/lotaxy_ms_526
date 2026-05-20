// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    getUsers: () => ipcRenderer.invoke('db-get-users'),
    addUser: (name: string, email: string, phone: string, department: string, position: string, date_of_joining: string, date_of_birth: string, total_experience: number, performance: string, potential: string, ctc: number) => ipcRenderer.invoke('db-add-user', name, email, phone, department, position, date_of_joining, date_of_birth, total_experience, performance, potential, ctc),
    updateUser: (id: number, name: string, email: string, phone: string, department: string, position: string, date_of_joining: string, date_of_birth: string, total_experience: number, performance: string, potential: string, ctc: number) => ipcRenderer.invoke('db-update-user', id, name, email, phone, department, position, date_of_joining, date_of_birth, total_experience, performance, potential, ctc),
    deleteUser: (id: number) => ipcRenderer.invoke('db-delete-user', id),
    getProducts: () => ipcRenderer.invoke('db-get-products'),
    addProduct: (name: string, price: number, mrp: number, stock: number, category: string, detail: string) => ipcRenderer.invoke('db-add-product', name, price, mrp, stock, category, detail),
    updateProduct: (id: number, name: string, price: number, mrp: number, stock: number, category: string, detail: string) => ipcRenderer.invoke('db-update-product', id, name, price, mrp, stock, category, detail),
    deleteProduct: (id: number) => ipcRenderer.invoke('db-delete-product', id),
    getOrders: () => ipcRenderer.invoke('db-get-orders'),
    addOrder: (userId: number, productId: number, qty: number) => ipcRenderer.invoke('db-add-order', userId, productId, qty),
    saveImage: (base64: string, ext: string) => ipcRenderer.invoke('save-image', base64, ext),
});