export interface Order {
    id: number;
    product_id: number | null;
    product_name: string;
    product_price: number;
    receiver_name: string;
    phone: string;
    email: string;
    address: string;
    discount: number;
    quantity: number;
    final_amount: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    created_at: string;
}