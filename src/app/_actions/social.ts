'use server';

import {
    CreateGroupUseCase,
    AddMemberUseCase,
    GetUserGroupsUseCase,
    ExitGroupUseCase,
    SearchUsersUseCase
} from "@/modules/social/application/GroupUseCases";
import { ShareWorkoutUseCase, GetGroupFeedUseCase } from "@/modules/social/application/SocialPostUseCases";
import { ToggleReactionUseCase } from "@/modules/social/application/ToggleReactionUseCase";
import {
    GetUserNotificationsUseCase,
    MarkNotificationAsReadUseCase,
    MarkAllNotificationsAsReadUseCase,
    GetUnreadNotificationsCountUseCase
} from "@/modules/social/application/NotificationUseCases";
import { SupabaseSocialGroupRepository } from "@/modules/social/infrastructure/adapters/SupabaseSocialGroupRepository";
import { SupabaseSocialPostRepository } from "@/modules/social/infrastructure/adapters/SupabaseSocialPostRepository";
import { SupabaseSocialReactionRepository } from "@/modules/social/infrastructure/adapters/SupabaseSocialReactionRepository";
import { SupabaseNotificationRepository } from "@/modules/social/infrastructure/adapters/SupabaseNotificationRepository";
import { SupabaseProfileRepository } from "@/modules/profiles/infrastructure/adapters/SupabaseProfileRepository";
import { SupabaseAuthRepository } from "@/modules/auth/infrastructure/adapters/SupabaseAuthRepository";
import { revalidatePath } from "next/cache";

async function getRepos() {
    const authRepo = new SupabaseAuthRepository();
    const groupRepo = new SupabaseSocialGroupRepository();
    const profileRepo = new SupabaseProfileRepository();
    const postRepo = new SupabaseSocialPostRepository();
    const reactionRepo = new SupabaseSocialReactionRepository();
    const notificationRepo = new SupabaseNotificationRepository();
    const user = await authRepo.getSession();
    return { authRepo, groupRepo, profileRepo, postRepo, reactionRepo, notificationRepo, user };
}

export async function createGroupAction(name: string) {
    const { groupRepo, profileRepo, user } = await getRepos();
    if (!user) return { error: "No autenticado" };

    const useCase = new CreateGroupUseCase(groupRepo, profileRepo);
    try {
        const group = await useCase.execute(user.id, name);
        revalidatePath("/dashboard/social");
        return { success: true, group };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function addMemberAction(groupId: string, memberId: string) {
    const { groupRepo, user } = await getRepos();
    if (!user) return { error: "No autenticado" };

    const useCase = new AddMemberUseCase(groupRepo);
    try {
        await useCase.execute(groupId, user.id, memberId);
        revalidatePath(`/dashboard/social/${groupId}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getUserGroupsAction() {
    const { groupRepo, user } = await getRepos();
    if (!user) return [];

    const useCase = new GetUserGroupsUseCase(groupRepo);
    return useCase.execute(user.id);
}

export async function exitGroupAction(groupId: string, nextAdminId?: string) {
    const { groupRepo, user } = await getRepos();
    if (!user) return { error: "No autenticado" };

    const useCase = new ExitGroupUseCase(groupRepo);
    try {
        await useCase.execute(groupId, user.id, nextAdminId);
        revalidatePath("/dashboard/social");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function searchUsersAction(query: string) {
    const { groupRepo, user } = await getRepos();
    if (!user) return [];

    const useCase = new SearchUsersUseCase(groupRepo);
    return useCase.execute(query);
}

export async function getGroupByIdAction(groupId: string) {
    const { groupRepo, user } = await getRepos();
    if (!user) return null;

    return groupRepo.getById(groupId);
}

export async function shareWorkoutAction(sessionId: string, groupIds: string[], timeStr?: string) {
    const { groupRepo, profileRepo, postRepo, notificationRepo, user } = await getRepos();

    if (!user) return { error: "No autenticado" };

    const useCase = new ShareWorkoutUseCase(postRepo, profileRepo, groupRepo, notificationRepo);
    try {
        await useCase.execute(user.id, sessionId, groupIds, timeStr);
        revalidatePath("/dashboard/social");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getGroupFeedAction(groupId: string) {
    const { postRepo } = await getRepos();
    return postRepo.getFeedByGroup(groupId);
}

export async function toggleReactionAction(postId: string, emoji: any, groupId?: string) {
    const { postRepo, profileRepo, reactionRepo, notificationRepo, user } = await getRepos();

    if (!user) return { error: "No autenticado" };

    const useCase = new ToggleReactionUseCase(reactionRepo, postRepo, profileRepo, notificationRepo);
    try {
        await useCase.execute(postId, user.id, emoji, groupId);
        if (groupId) {
            revalidatePath(`/dashboard/social/${groupId}`);
        } else {
            revalidatePath('/dashboard/social');
        }
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getUserNotificationsAction() {
    const { notificationRepo, user } = await getRepos();
    if (!user) return [];

    const useCase = new GetUserNotificationsUseCase(notificationRepo);
    return useCase.execute(user.id);
}

export async function markNotificationAsReadAction(id: string) {
    const { notificationRepo, user } = await getRepos();
    if (!user) return { error: "No autenticado" };

    const useCase = new MarkNotificationAsReadUseCase(notificationRepo);
    try {
        await useCase.execute(id);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function markAllNotificationsAsReadAction() {
    const { notificationRepo, user } = await getRepos();
    if (!user) return { error: "No autenticado" };

    const useCase = new MarkAllNotificationsAsReadUseCase(notificationRepo);
    try {
        await useCase.execute(user.id);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getUnreadNotificationsCountAction() {
    const { notificationRepo, user } = await getRepos();
    if (!user) return 0;

    const useCase = new GetUnreadNotificationsCountUseCase(notificationRepo);
    return useCase.execute(user.id);
}
