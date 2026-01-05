import { Profile, ProfileRepository } from "../domain/Profile";

export class GetProfileUseCase {
    constructor(private profileRepository: ProfileRepository) { }

    async execute(id: string): Promise<Profile | null> {
        return this.profileRepository.getById(id);
    }
}

export class UpdateProfileUseCase {
    constructor(private profileRepository: ProfileRepository) { }

    async execute(id: string, profileData: Partial<Profile>): Promise<void> {
        return this.profileRepository.update(id, profileData);
    }
}
