export interface Gym {
    id: string;
    userId: string;
    name: string;
    description?: string;
    isDefault: boolean;
    createdAt: Date;
}

export interface GymRepository {
    getById(id: string): Promise<Gym | null>;
    getAllByUserId(userId: string): Promise<Gym[]>;
    save(gym: Gym): Promise<void>;
    update(id: string, gym: Partial<Gym>): Promise<void>;
    delete(id: string): Promise<void>;
}
