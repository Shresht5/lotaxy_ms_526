export { };

declare global {
    interface Window {
        api: {
            getUsers: () => Promise<any[]>;
            addUser: (name: string, email: string) => Promise<void>;
            updateUser: (id: number, name: string, email: string) => Promise<void>;
            deleteUser: (id: number) => Promise<void>;
            getProducts: () => Promise<any[]>;
            addProduct: (name: string, price: number, mrp: number, stock: number, category: string, detail: string, image_path: string | null) => Promise<void>;
            updateProduct: (id: number, name: string, price: number, mrp: number, stock: number, category: string, detail: string, image_path: string | null) => Promise<void>; deleteProduct: (id: number) => Promise<void>;
            getOrders: () => Promise<any[]>;
            addOrder: (userId: number, productId: number, qty: number) => Promise<void>;
            deleteOrder: (id: number) => Promise<void>;
            saveImage: (base64: string, ext: string) => Promise<string>;
        };
    }
}