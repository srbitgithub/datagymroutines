'use client';

import { useSession } from '../contexts/SessionContext';
import { RoutineSelection } from './RoutineSelection';
import { SessionLogger } from '../../infrastructure/components/SessionLogger';
import { Routine } from '../../domain/Routine';
import { Exercise } from '../../domain/Exercise';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from '@/core/i18n/TranslationContext';

interface RoutineSessionManagerProps {
    routines: Routine[];
    exercises: Exercise[];
}

export function RoutineSessionManager({ routines, exercises }: RoutineSessionManagerProps) {
    const { activeSession, isLoading, startNewSession } = useSession();
    const searchParams = useSearchParams();
    const [isAutoStarting, setIsAutoStarting] = useState(false);
    const hasAttemptedAutoStart = useRef(false);
    const { t } = useTranslation();

    useEffect(() => {
        const routineId = searchParams.get('routineId');
        if (routineId && !activeSession && !isLoading && !hasAttemptedAutoStart.current) {
            const routine = routines.find(r => r.id === routineId);
            if (routine) {
                hasAttemptedAutoStart.current = true;
                setIsAutoStarting(true);
                startNewSession(routine, exercises)
                    .finally(() => setIsAutoStarting(false));
            }
        }
    }, [searchParams, activeSession, isLoading, routines, exercises, startNewSession]);

    if (isLoading || isAutoStarting) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="h-10 w-10 text-brand-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">
                    {isAutoStarting ? t('training.starting_training') : t('common.loading_session')}
                </p>
            </div>
        );
    }

    if (!activeSession) {
        return <RoutineSelection routines={routines} exercises={exercises} />;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <SessionLogger />
        </div>
    );
}
