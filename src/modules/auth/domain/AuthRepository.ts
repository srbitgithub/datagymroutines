import { AuthUser } from "./AuthUser";

export interface AuthRepository {
    login(email: string, password: string): Promise<AuthUser>;
    register(email: string, password: string): Promise<AuthUser>;
    forgotPassword(email: string): Promise<void>;
    logout(): Promise<void>;
    getSession(): Promise<AuthUser | null>;
}
