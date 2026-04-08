'use client';

import { useLang } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Star, Truck } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
	const { t } = useLang();

	const badges = [
		{ icon: Clock, label: t('hero.badge30min') },
		{ icon: Star, label: t('hero.badge49') },
		{ icon: Truck, label: t('hero.badgeFree') },
	];

	return (
		<section className='relative overflow-hidden bg-bg'>
			{/* Background blobs */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl' />
				<div className='absolute top-1/2 -left-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl' />
			</div>

			<div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24'>
				<div className='grid lg:grid-cols-2 gap-12 items-center'>
					{/* Text side */}
					<motion.div
						initial={{ x: -24 }}
						animate={{ x: 0 }}
						transition={{ duration: 0.5, ease: 'easeOut' }}
					>
						{/* Badge */}
						<div className='inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6'>
							<span className='w-2 h-2 bg-primary rounded-full animate-pulse' />
							{t('hero.badge')}
						</div>

						<h1
							className='text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6'
							style={{ fontFamily: 'var(--font-heading)' }}
						>
							{t('hero.headline1')}
							<span className='block text-primary relative'>
								{t('hero.headline2')}
								<svg
									className='absolute -bottom-2 left-0 w-full'
									viewBox='0 0 200 8'
									preserveAspectRatio='none'
								>
									<path
										d='M0 6 Q50 0 100 4 Q150 8 200 2'
										stroke='#EA580C'
										strokeWidth='3'
										fill='none'
										strokeLinecap='round'
										opacity='0.4'
									/>
								</svg>
							</span>
							<span className='text-foreground/80'> {t('hero.headline3')}</span>
						</h1>

						<p className='text-lg text-muted-fg leading-relaxed max-w-md mb-8'>
							{t('hero.subtitle')}
						</p>

						{/* CTAs */}
						<div className='flex flex-wrap gap-3 mb-10'>
							<Link
								href='/menu'
								className='inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0'
							>
								{t('hero.orderNow')}
								<ArrowRight className='h-4.5 w-4.5' />
							</Link>
							<Link
								href='/menu'
								className='inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border-2 border-foreground/15 text-foreground font-bold text-base hover:border-primary hover:text-primary transition-all'
							>
								{t('hero.seeMenu')}
							</Link>
						</div>

						{/* Badges */}
						<div className='flex flex-wrap gap-4'>
							{badges.map(({ icon: Icon, label }) => (
								<div
									key={label}
									className='flex items-center gap-2 bg-surface rounded-xl px-4 py-2.5 border border-border shadow-sm'
								>
									<Icon className='h-4 w-4 text-primary' />
									<span className='text-sm font-semibold text-dark'>
										{label}
									</span>
								</div>
							))}
						</div>
					</motion.div>

					{/* Video side */}
					<motion.div
						initial={{ scale: 0.93 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.5, ease: 'easeOut' }}
						className='relative'
					>
						<div className='absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent scale-110 blur-2xl' />

						{/* Floating card */}
						<div className='absolute -top-4 -left-4 z-10 bg-surface rounded-2xl px-4 py-3 shadow-xl shadow-orange-100 border border-border'>
							<div className='flex items-center gap-2'>
								<div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
									<span className='text-green-600 text-xs font-bold'>✓</span>
								</div>
								<div>
									<p className='text-xs font-bold text-dark'>
										{t('hero.orderPlaced')}
									</p>
									<p className='text-xs text-muted-fg'>{t('hero.arriving')}</p>
								</div>
							</div>
						</div>

						{/* Rating card */}
						<div className='absolute -bottom-4 -right-4 z-10 bg-surface rounded-2xl px-4 py-3 shadow-xl shadow-orange-100 border border-border'>
							<div className='flex items-center gap-2'>
								<div className='flex'>
									{[1, 2, 3, 4, 5].map((i) => (
										<Star
											key={i}
											className='h-3.5 w-3.5 fill-secondary text-secondary'
										/>
									))}
								</div>
								<span className='text-xs font-bold text-dark'>5.0 / 5</span>
							</div>
							<p className='text-xs text-muted-fg mt-0.5'>
								{t('hero.reviews')}
							</p>
						</div>

						{/* YouTube video */}
						<div className='relative max-w-lg mx-auto aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-200 border-4 border-surface'>
							<iframe
								className='absolute inset-0 w-[300%] h-full -left-[100%]'
								src='https://www.youtube.com/embed/r9M9LC1V5-g?autoplay=1&mute=1&loop=1&playlist=r9M9LC1V5-g&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1'
								title='Pizzaro video'
								frameBorder='0'
								allow='autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
								allowFullScreen
							/>
							{/* Subtle overlay so it blends with the design */}
							<div className='absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-[2.5rem]' />
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
