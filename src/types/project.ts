interface Project {
    id: number;
    name: string;
    client_id: number | null;
    client_name: string;
    company_name: string;
    detail: string;
    what_done: string;
    what_todo: string;
    completion: number;
    status: string;
    created_at: string;
}