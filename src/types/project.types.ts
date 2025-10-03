// Project types
export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'completed';
    createdAt: string;
    updatedAt: string;
    userId: string;
}
