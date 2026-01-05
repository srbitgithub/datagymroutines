import { AuthRepository } from "../domain/AuthRepository";
import { AuthUser } from "../domain/AuthUser";

export class RegisterUseCase {
    constructor(private authRepository: AuthRepository) { }

    async execute(email: string, password: string): Promise<AuthUser> {
        return this.authRepository.register(email, password);
    }
}
