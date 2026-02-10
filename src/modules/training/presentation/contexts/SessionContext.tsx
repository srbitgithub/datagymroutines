'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TrainingSession, ExerciseSet } from '../../domain/Session';
import { Routine } from '../../domain/Routine';
import { Exercise } from '../../domain/Exercise';
import { Profile } from '@/modules/profiles/domain/Profile';
import { saveSessionBatchAction, startSessionAction, abandonSessionAction } from '@/app/_actions/training';
import { getProfileAction } from '@/app/_actions/auth';

interface SessionContextType {
    activeSession: TrainingSession | null;
    sessionSets: ExerciseSet[];
    completedSetIds: string[];
    routine: Routine | null;
    exercises: Exercise[];
    preferredRestTime: number;
    isLoading: boolean;
    startNewSession: (routine: Routine, exercises: Exercise[]) => Promise<void>;
    updateSet: (setId: string, field: 'weight' | 'reps', value: number) => void;
    toggleSetCompletion: (setId: string) => void;
    setPreferredRestTime: (time: number) => void;
    saveSession: () => Promise<{ success: boolean; error?: string }>;
    finishSession: () => Promise<void>;
    abandonSession: () => Promise<void>;
    addExerciseSet: (exerciseId: string) => void;
    clearSession: () => void;
    userProfile?: Profile | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const STORAGE_KEY = 'ironmetric_active_session';

export function SessionProvider({ children }: { children: ReactNode }) {
    const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
    const [sessionSets, setSessionSets] = useState<ExerciseSet[]>([]);
    const [completedSetIds, setCompletedSetIds] = useState<string[]>([]);
    const [routine, setRoutine] = useState<Routine | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [preferredRestTime, setPreferredRestTimeState] = useState(120);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        getProfileAction().then(setUserProfile);

        const saved = localStorage.getItem(STORAGE_KEY);
        const savedRest = localStorage.getItem('ironmetric_preferred_rest');

        if (savedRest) {
            setPreferredRestTimeState(parseInt(savedRest));
        }

        if (saved) {
            try {
                const data = JSON.parse(saved);

                // Revive dates
                const session = data.activeSession ? {
                    ...data.activeSession,
                    startTime: new Date(data.activeSession.startTime),
                    endTime: data.activeSession.endTime ? new Date(data.activeSession.endTime) : undefined
                } : null;

                const sets = (data.sessionSets || []).map((s: any) => ({
                    ...s,
                    createdAt: s.createdAt ? new Date(s.createdAt) : new Date()
                }));

                setActiveSession(session);
                setSessionSets(sets);
                setCompletedSetIds(data.completedSetIds || []);
                setRoutine(data.routine);
                setExercises(data.exercises || []);
            } catch (e) {
                console.error('Error parsing saved session:', e);
            }
        }
        setIsLoading(false);
    }, []);

    const setPreferredRestTime = (time: number) => {
        setPreferredRestTimeState(time);
        localStorage.setItem('ironmetric_preferred_rest', time.toString());
    };

    // Save to localStorage on change
    useEffect(() => {
        if (!isLoading) {
            if (activeSession) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    activeSession,
                    sessionSets,
                    completedSetIds,
                    routine,
                    exercises
                }));
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, [activeSession, sessionSets, completedSetIds, routine, exercises, isLoading]);

    const startNewSession = async (selectedRoutine: Routine, allExercises: Exercise[]) => {
        setIsLoading(true);
        const now = new Date();
        const result = await startSessionAction(selectedRoutine.id, now.toISOString());

        if (result.success && result.sessionId) {
            const newSession: TrainingSession = {
                id: result.sessionId,
                userId: '', // Will be handled on server
                routineId: selectedRoutine.id,
                startTime: new Date(),
                sets: []
            };

            const prefilledSets: ExerciseSet[] = [];
            selectedRoutine.exercises.forEach((re) => {
                for (let i = 0; i < re.series; i++) {
                    prefilledSets.push({
                        id: crypto.randomUUID(),
                        sessionId: result.sessionId!,
                        exerciseId: re.exerciseId,
                        weight: re.targetWeight || 0,
                        reps: re.targetReps || 0,
                        type: 'normal',
                        orderIndex: i,
                        createdAt: new Date()
                    });
                }
            });

            setActiveSession(newSession);
            setSessionSets(prefilledSets);
            setCompletedSetIds([]);
            setRoutine(selectedRoutine);
            setExercises(allExercises);
        } else {
            throw new Error(result.error || "Error al iniciar sesión");
        }
        setIsLoading(false);
    };

    const updateSet = (setId: string, field: 'weight' | 'reps', value: number) => {
        setSessionSets(prev => prev.map(s => s.id === setId ? { ...s, [field]: value } : s));
    };

    const addExerciseSet = (exerciseId: string) => {
        setSessionSets(prev => {
            const exerciseSets = prev.filter(s => s.exerciseId === exerciseId);
            const lastSet = exerciseSets.length > 0
                ? [...exerciseSets].sort((a, b) => b.orderIndex - a.orderIndex)[0]
                : null;

            const newOrderIndex = lastSet ? lastSet.orderIndex + 1 : 0;

            const newSet: ExerciseSet = {
                id: crypto.randomUUID(),
                sessionId: activeSession?.id || '',
                exerciseId: exerciseId,
                weight: lastSet?.weight || 0,
                reps: lastSet?.reps || 0,
                type: 'normal',
                orderIndex: newOrderIndex,
                createdAt: new Date()
            };

            return [...prev, newSet];
        });
    };

    const toggleSetCompletion = (setId: string) => {
        setCompletedSetIds(prev => {
            const next = [...prev];
            const index = next.indexOf(setId);
            if (index > -1) {
                next.splice(index, 1);
            } else {
                next.push(setId);
            }
            return next;
        });
    };

    const saveSession = async (isFinished: boolean = false): Promise<{ success: boolean; error?: string }> => {
        if (!activeSession) return { success: false, error: "No hay sesión activa" };

        try {
            const now = new Date();
            const result = await saveSessionBatchAction(activeSession.id, sessionSets, isFinished, undefined, now.toISOString());
            return result as { success: boolean; error?: string };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const finishSession = async () => {
        const result = await saveSession(true);
        if (!result.success) {
            throw new Error(result.error || "Error al finalizar sesión");
        }
        clearSession();
    };

    const abandonSession = async () => {
        if (!activeSession) return;
        try {
            const result = await abandonSessionAction(activeSession.id);
            if (result.success) {
                clearSession();
            } else {
                console.error("Error in abandonSessionAction:", result.error);
                // Even if action fails on server (e.g. session already deleted), we clear locally
                clearSession();
            }
        } catch (error) {
            console.error("Error abandoning session:", error);
            clearSession();
        }
    };

    const clearSession = () => {
        setActiveSession(null);
        setSessionSets([]);
        setCompletedSetIds([]);
        setRoutine(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <SessionContext.Provider value={{
            activeSession,
            sessionSets,
            completedSetIds,
            routine,
            exercises,
            preferredRestTime,
            isLoading,
            startNewSession,
            updateSet,
            toggleSetCompletion,
            setPreferredRestTime,
            saveSession,
            finishSession,
            abandonSession,
            addExerciseSet,
            clearSession,
            userProfile
        }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}
