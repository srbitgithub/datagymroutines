'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-border last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
                <span className="font-semibold text-sm sm:text-base">{question}</span>
                <ChevronDown
                    className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>
            {open && (
                <div className="pb-5 text-sm text-muted-foreground leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    );
}

export function FAQSection() {
    const { t } = useTranslation();

    const faqs = [
        { q: t('landing.faq_1_q'), a: t('landing.faq_1_a') },
        { q: t('landing.faq_2_q'), a: t('landing.faq_2_a') },
        { q: t('landing.faq_3_q'), a: t('landing.faq_3_a') },
        { q: t('landing.faq_4_q'), a: t('landing.faq_4_a') },
        { q: t('landing.faq_5_q'), a: t('landing.faq_5_a') },
        { q: t('landing.faq_6_q'), a: t('landing.faq_6_a') },
    ];

    return (
        <section id="faq" className="py-20 sm:py-28 bg-muted/30">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        {t('landing.faq_title')}
                    </h2>
                </div>

                <div className="rounded-2xl border border-border bg-card px-6 sm:px-8">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} question={faq.q} answer={faq.a} />
                    ))}
                </div>
            </div>
        </section>
    );
}
