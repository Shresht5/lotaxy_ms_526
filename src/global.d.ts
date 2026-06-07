export { };
declare module '*.css';
declare module '*.scss';
declare module '*.module.css';
declare global {
    interface Window {
        api: {
            //user
            getUsers: () => Promise<any[]>;
            addUser: (name: string, email: string, phone: string, department: string, position: string, date_of_joining: string, date_of_birth: string, total_experience: number, performance: string, potential: string, ctc: number) => Promise<void>;
            updateUser: (id: number, name: string, email: string, phone: string, department: string, position: string, date_of_joining: string, date_of_birth: string, total_experience: number, performance: string, potential: string, ctc: number) => Promise<void>;
            deleteUser: (id: number) => Promise<void>;
            attendance//
            getAllAttendance: () => Promise<Attendance[]>;
            getAttendanceByDate: (date: string) => Promise<Attendance[]>;
            getAttendanceByUser: (userId: number) => Promise<Attendance[]>;
            markAttendance: (user_id: number, date: string, check_in: string, status: string, remark: string) => Promise<void>;
            updateAttendance: (id: number, check_in: string, status: string, remark: string) => Promise<void>;
            deleteAttendance: (id: number) => Promise<void>;
            //client
            getClients: () => Promise<Client[]>;
            addClient: (name: string, email: string, phone: string, address: string, company_name: string, status: string) => Promise<void>;
            updateClient: (id: number, name: string, email: string, phone: string, address: string, company_name: string, status: string) => Promise<void>;
            deleteClient: (id: number) => Promise<void>;
            //project
            getAllProjects: () => Promise<Project[]>;
            getProjectById: (id: number) => Promise<Project>;
            addProject: (name: string, client_id: number | null, detail: string, what_done: string, what_todo: string, completion: number, status: string) => Promise<void>;
            updateProject: (id: number, name: string, client_id: number | null, detail: string, what_done: string, what_todo: string, completion: number, status: string) => Promise<void>;
            deleteProject: (id: number) => Promise<void>;
            //product
            getProducts: () => Promise<any[]>;
            addProduct: (name: string, price: number, mrp: number, stock: number, category: string, detail: string, image_path: string | null) => Promise<void>;
            updateProduct: (id: number, name: string, price: number, mrp: number, stock: number, category: string, detail: string, image_path: string | null) => Promise<void>; deleteProduct: (id: number) => Promise<void>;
            deleteProduct: (id: number) => Promise<void>;
            saveImage: (base64: string, ext: string) => Promise<string>;
            //order
            getOrders: () => Promise<any[]>;
            getOrderById: (id: number) => Promise<any>;
            addOrder: (product_id: number | null, product_name: string, product_price: number, receiver_name: string, phone: string, email: string, address: string, discount: number, quantity: number, final_amount: number, status: string) => Promise<void>;
            updateOrder: (id: number, product_id: number | null, product_name: string, product_price: number, receiver_name: string, phone: string, email: string, address: string, discount: number, quantity: number, final_amount: number, status: string) => Promise<void>;
            deleteOrder: (id: number) => Promise<void>;
        };
        electronAPI: {
            minimize: () => void;
            maximize: () => void;
            close: () => void;
        };
    }

}