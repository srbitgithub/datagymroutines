'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { es } from './dictionaries/es';
import { en } from './dictionaries/en';

type Dictionary = typeof es;
export type Language = 'es' | 'en';

interface TranslationContextType {
    t: (path: string, variables?: Record<string, string | number>) => string;
    ta: (path: string) => string[];
    language: Language;
    setLanguage: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const dictionaries: Record<Language, Dictionary> = { es, en };

export function TranslationProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('es');

    useEffect(() => {
        const systemLang = navigator.language.split('-')[0];
        if (systemLang === 'es') {
            setLanguage('es');
        } else {
            setLanguage('en');
        }
    }, []);

    const t = (path: string, variables?: Record<string, string | number>) => {
        const keys = path.split('.');
        let translation: any = dictionaries[language];

        for (const key of keys) {
            if (translation[key] === undefined) {
                console.warn(`Translation key not found: ${path}`);
                return path;
            }
            translation = translation[key];
        }

        if (typeof translation !== 'string') {
            console.warn(`Translation key is not a string: ${path}`);
            return path;
        }

        if (variables) {
            Object.entries(variables).forEach(([key, value]) => {
                translation = (translation as string).replace(`{{${key}}}`, String(value));
            });
        }

        return translation;
    };

    const ta = (path: string) => {
        const keys = path.split('.');
        let translation: any = dictionaries[language];

        for (const key of keys) {
            if (translation[key] === undefined) {
                console.warn(`Translation array key not found: ${path}`);
                return [];
            }
            translation = translation[key];
        }

        if (!Array.isArray(translation)) {
            console.warn(`Translation key is not an array: ${path}`);
            return [];
        }

        return translation;
    };

    return (
        <TranslationContext.Provider value={{ t, ta, language, setLanguage }}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    return context;
}
