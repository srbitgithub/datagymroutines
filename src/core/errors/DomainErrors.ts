export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DomainError";
    }
}

export class AuthError extends DomainError {
    constructor(message: string) {
        super(message);
        this.name = "AuthError";
    }
}

export class InvalidCredentialsError extends AuthError {
    constructor() {
        super("Credenciales inválidas");
        this.name = "InvalidCredentialsError";
    }
}

export class UserAlreadyExistsError extends AuthError {
    constructor() {
        super("El usuario ya existe");
        this.name = "UserAlreadyExistsError";
    }
}
