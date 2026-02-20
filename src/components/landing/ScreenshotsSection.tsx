'use client';

import { useTranslation } from '@/core/i18n/TranslationContext';

interface ScreenshotRowProps {
    src: string;
    alt: string;
    tag: string;
    title: string;
    desc: string;
    reverse?: boolean;
}

function PhoneFrame({ src, alt }: { src: string; alt: string }) {
    return (
        <div className="relative mx-auto shrink-0 w-[200px] sm:w-[230px]">
            {/* Glow */}
            <div className="absolute -inset-6 bg-brand-primary/10 blur-3xl rounded-full -z-10" />
            {/* Frame */}
            <div className="overflow-hidden rounded-[2rem] border-2 border-foreground/15 shadow-2xl bg-black">
                {/* Negative margin to clip the Android green status bar (~40px at native res, ~14px rendered) */}
                <div style={{ marginTop: '-14px' }}>
                    <img
                        src={src}
                        alt={alt}
                        className="w-full block"
                        loading="lazy"
                    />
                </div>
            </div>
        </div>
    );
}

function ScreenshotRow({ src, alt, tag, title, desc, reverse }: ScreenshotRowProps) {
    return (
        <div className={`flex flex-col gap-10 lg:gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
            {/* Text */}
            <div className="flex-1 space-y-4 text-center lg:text-left">
                <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary uppercase tracking-wider">
                    {tag}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                    {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg max-w-md mx-auto lg:mx-0">
                    {desc}
                </p>
            </div>

            {/* Screenshot */}
            <PhoneFrame src={src} alt={alt} />
        </div>
    );
}

export function ScreenshotsSection() {
    const { t } = useTranslation();

    const screenshots: ScreenshotRowProps[] = [
        {
            src: '/screenshots/main_page.jpeg',
            alt: t('landing.screenshot_1_title'),
            tag: t('landing.screenshot_1_tag'),
            title: t('landing.screenshot_1_title'),
            desc: t('landing.screenshot_1_desc'),
            reverse: false,
        },
        {
            src: '/screenshots/trainings.jpeg',
            alt: t('landing.screenshot_2_title'),
            tag: t('landing.screenshot_2_tag'),
            title: t('landing.screenshot_2_title'),
            desc: t('landing.screenshot_2_desc'),
            reverse: true,
        },
        {
            src: '/screenshots/edit_routines.jpeg',
            alt: t('landing.screenshot_3_title'),
            tag: t('landing.screenshot_3_tag'),
            title: t('landing.screenshot_3_title'),
            desc: t('landing.screenshot_3_desc'),
            reverse: false,
        },
        {
            src: '/screenshots/statistics.jpeg',
            alt: t('landing.screenshot_4_title'),
            tag: t('landing.screenshot_4_tag'),
            title: t('landing.screenshot_4_title'),
            desc: t('landing.screenshot_4_desc'),
            reverse: true,
        },
        {
            src: '/screenshots/social.jpeg',
            alt: t('landing.screenshot_5_title'),
            tag: t('landing.screenshot_5_tag'),
            title: t('landing.screenshot_5_title'),
            desc: t('landing.screenshot_5_desc'),
            reverse: false,
        },
    ];

    return (
        <section className="py-20 sm:py-28 overflow-hidden">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-20 sm:mb-28">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                        {t('landing.screenshots_title')}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t('landing.screenshots_subtitle')}
                    </p>
                </div>

                {/* Alternating rows */}
                <div className="space-y-24 sm:space-y-32">
                    {screenshots.map((s, i) => (
                        <ScreenshotRow key={i} {...s} />
                    ))}
                </div>
            </div>
        </section>
    );
}
