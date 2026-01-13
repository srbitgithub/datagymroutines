'use client';

import { useState, useEffect, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, Bell } from 'lucide-react';

const PRESETS = [60, 90, 120, 180];

export function RestTimer() {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isActive, setIsActive] = useState(false);
    const [duration, setDuration] = useState(90);

    const tick = useCallback(() => {
        if (timeLeft > 0) {
            setTimeLeft(prev => prev - 1);
        } else {
            setIsActive(false);
            // Play sound or notification if possible
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        }
    }, [timeLeft]);

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(tick, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, tick]);

    const startTimer = (secs: number) => {
        setTimeLeft(secs);
        setIsActive(true);
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setTimeLeft(0);
        setIsActive(false);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const percentage = timeLeft > 0 ? (timeLeft / duration) * 100 : 0;

    return (
        <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
            <header className="flex items-center gap-3">
                <div className="rounded-full bg-brand-primary/10 p-2 text-brand-primary">
                    <Timer className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold">Temporizador de Descanso</h3>
                    <p className="text-xs text-muted-foreground">Optimiza tu recuperación</p>
                </div>
            </header>

            <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
                {/* Circular Visualizer */}
                <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex items-center justify-center">
                    <svg className="h-full w-full -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="44"
                            className="sm:hidden text-accent/10"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            className="hidden sm:block text-accent/10"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                        />
                        <circle
                            cx="48"
                            cy="48"
                            r="44"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={276.4}
                            strokeDashoffset={276.4 - (276.4 * percentage) / 100}
                            className="sm:hidden text-brand-primary transition-all duration-1000 ease-linear"
                            strokeLinecap="round"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={364.4}
                            strokeDashoffset={364.4 - (364.4 * percentage) / 100}
                            className="hidden sm:block text-brand-primary transition-all duration-1000 ease-linear"
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute text-2xl sm:text-3xl font-black tabular-nums">
                        {formatTime(timeLeft || duration)}
                    </span>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 w-full">
                    <button
                        onClick={resetTimer}
                        className="flex-1 h-10 sm:h-12 flex items-center justify-center rounded-xl bg-accent/20 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                        onClick={toggleTimer}
                        disabled={timeLeft === 0}
                        className={`flex-[2] h-10 sm:h-12 flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 ${isActive
                            ? 'bg-amber-500 text-white shadow-lg'
                            : 'bg-brand-primary text-white shadow-lg disabled:opacity-50'
                            }`}
                    >
                        {isActive ? <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-1" />}
                    </button>
                    <div className="flex-1 h-10 sm:h-12 flex items-center justify-center rounded-xl bg-accent/20 text-muted-foreground">
                        <Bell className={`h-4 w-4 sm:h-5 sm:w-5 ${percentage === 0 && duration > 0 ? 'animate-bounce' : ''}`} />
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 w-full">
                    {PRESETS.map((p) => (
                        <button
                            key={p}
                            onClick={() => {
                                setDuration(p);
                                startTimer(p);
                            }}
                            className={`h-9 sm:h-10 rounded-lg text-[10px] sm:text-xs font-bold border transition-all ${duration === p && timeLeft > 0
                                ? 'bg-brand-primary border-brand-primary text-white'
                                : 'bg-background hover:bg-accent'
                                }`}
                        >
                            {p}s
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
