import { AuthRepository } from "../domain/AuthRepository";

export class ForgotPasswordUseCase {
    constructor(private authRepository: AuthRepository) { }

    async execute(email: string): Promise<void> {
        return this.authRepository.forgotPassword(email);
    }
}
