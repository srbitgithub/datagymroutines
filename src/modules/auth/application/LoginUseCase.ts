import { AuthRepository } from "../domain/AuthRepository";
import { AuthUser } from "../domain/AuthUser";

export class LoginUseCase {
    constructor(private authRepository: AuthRepository) { }

    async execute(email: string, password: string): Promise<AuthUser> {
        // Aquí se podrían añadir validaciones de negocio adicionales
        return this.authRepository.login(email, password);
    }
}
