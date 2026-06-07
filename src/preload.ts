// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {

    getUsers: () => ipcRenderer.invoke('db-get-users'),
    addUser: (name: string, email: string, phone: string, department: string, position: string, date_of_joining: string, date_of_birth: string, total_experience: number, performance: string, potential: string, ctc: number) => ipcRenderer.invoke('db-add-user', name, email, phone, department, position, date_of_joining, date_of_birth, total_experience, performance, potential, ctc),
    updateUser: (id: number, name: string, email: string, phone: string, department: string, position: string, date_of_joining: string, date_of_birth: string, total_experience: number, performance: string, potential: string, ctc: number) => ipcRenderer.invoke('db-update-user', id, name, email, phone, department, position, date_of_joining, date_of_birth, total_experience, performance, potential, ctc),
    deleteUser: (id: number) => ipcRenderer.invoke('db-delete-user', id),

    getAllAttendance: () => ipcRenderer.invoke('attendance-get-all'),
    getAttendanceByDate: (date: string) => ipcRenderer.invoke('attendance-get-by-date', date),
    getAttendanceByUser: (userId: number) => ipcRenderer.invoke('attendance-get-by-user', userId),
    markAttendance: (user_id: number, date: string, check_in: string, status: string, remark: string) =>
        ipcRenderer.invoke('attendance-mark', user_id, date, check_in, status, remark),
    updateAttendance: (id: number, check_in: string, status: string, remark: string) =>
        ipcRenderer.invoke('attendance-update', id, check_in, status, remark),
    deleteAttendance: (id: number) => ipcRenderer.invoke('attendance-delete', id),

    getClients: () => ipcRenderer.invoke('db-get-clients'),
    addClient: (name: string, email: string, phone: string, address: string, company_name: string, status: string) =>
        ipcRenderer.invoke('db-add-client', name, email, phone, address, company_name, status),
    updateClient: (id: number, name: string, email: string, phone: string, address: string, company_name: string, status: string) =>
        ipcRenderer.invoke('db-update-client', id, name, email, phone, address, company_name, status),
    deleteClient: (id: number) => ipcRenderer.invoke('db-delete-client', id),

    getAllProjects: () => ipcRenderer.invoke('project-get-all'),
    getProjectById: (id: number) => ipcRenderer.invoke('project-get-by-id', id),
    addProject: (name: string, client_id: number | null, detail: string, what_done: string, what_todo: string, completion: number, status: string) =>
        ipcRenderer.invoke('project-add', name, client_id, detail, what_done, what_todo, completion, status),
    updateProject: (id: number, name: string, client_id: number | null, detail: string, what_done: string, what_todo: string, completion: number, status: string) =>
        ipcRenderer.invoke('project-update', id, name, client_id, detail, what_done, what_todo, completion, status),
    deleteProject: (id: number) => ipcRenderer.invoke('project-delete', id),


    getProducts: () => ipcRenderer.invoke('db-get-products'),
    addProduct: (name: string, price: number, mrp: number, stock: number, category: string, detail: string) => ipcRenderer.invoke('db-add-product', name, price, mrp, stock, category, detail),
    updateProduct: (id: number, name: string, price: number, mrp: number, stock: number, category: string, detail: string) => ipcRenderer.invoke('db-update-product', id, name, price, mrp, stock, category, detail),
    deleteProduct: (id: number) => ipcRenderer.invoke('db-delete-product', id),
    saveImage: (base64: string, ext: string) => ipcRenderer.invoke('save-image', base64, ext),

    getOrders: () => ipcRenderer.invoke('order-get-all'),
    getOrderById: (id: number) => ipcRenderer.invoke('order-get-by-id', id),
    addOrder: (product_id: number | null, product_name: string, product_price: number, receiver_name: string, phone: string, email: string, address: string, discount: number, quantity: number, final_amount: number, status: string) => ipcRenderer.invoke('order-add', product_id, product_name, product_price, receiver_name, phone, email, address, discount, quantity, final_amount, status),
    updateOrder: (id: number, product_id: number | null, product_name: string, product_price: number, receiver_name: string, phone: string, email: string, address: string, discount: number, quantity: number, final_amount: number, status: string) => ipcRenderer.invoke('order-update', id, product_id, product_name, product_price, receiver_name, phone, email, address, discount, quantity, final_amount, status),
    deleteOrder: (id: number) => ipcRenderer.invoke('order-delete', id),
});

contextBridge.exposeInMainWorld("electronAPI", {
    minimize: () => ipcRenderer.send("window-minimize"),
    maximize: () => ipcRenderer.send("window-maximize"),
    close: () => ipcRenderer.send("window-close"),

});