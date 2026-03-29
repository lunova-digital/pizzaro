'use client';

import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PizzaCardProps {
	pizza: {
		_id: string;
		name: string;
		description: string;
		image: string;
		sizes: { name: string; price: number }[];
		category: string;
	};
}

export default function PizzaCard({ pizza }: PizzaCardProps) {
	const startingPrice = Math.min(...pizza.sizes.map((s) => s.price));

	return (
		<motion.div
			initial={{ y: 12 }}
			animate={{ y: 0 }}
			whileHover={{ y: -5, transition: { duration: 0.2 } }}
			className='bg-surface rounded-3xl overflow-hidden border border-border shadow-sm shadow-orange-100/80 group'
		>
			<Link href={`/menu/${pizza._id}`}>
				<div className='relative h-52 overflow-hidden'>
					<Image
						src={pizza.image}
						alt={pizza.name}
						fill
						sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
						className='object-cover group-hover:scale-110 transition-transform duration-500'
					/>
					<div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
					<span className='absolute top-3 left-3 bg-white/95 text-xs font-bold px-3 py-1 rounded-full text-dark shadow-sm'>
						{pizza.category}
					</span>
				</div>
			</Link>

			<div className='p-5'>
				<div className='flex items-start justify-between mb-1.5'>
					<Link href={`/menu/${pizza._id}`}>
						<h3 className='font-bold text-foreground text-[17px] hover:text-primary transition-colors'>
							{pizza.name}
						</h3>
					</Link>
					<div className='flex items-center gap-0.5 shrink-0 ml-2'>
						<Star className='h-3.5 w-3.5 fill-secondary text-secondary' />
						<span className='text-xs font-bold text-dark'>4.8</span>
					</div>
				</div>
				<p className='text-muted-fg text-sm leading-relaxed line-clamp-2 mb-4'>
					{pizza.description}
				</p>
				<div className='flex items-center justify-between'>
					<div>
						<span className='text-xs text-muted-fg'>From </span>
						<span className='text-xl font-bold text-primary'>
							{formatPrice(startingPrice)}
						</span>
					</div>
					<Link
						href={`/menu/${pizza._id}`}
						className='px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-200'
					>
						Customize
					</Link>
				</div>
			</div>
		</motion.div>
	);
}
