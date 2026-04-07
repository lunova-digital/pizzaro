'use client';
import { Plus, Search } from 'lucide-react';

interface MenuHeaderProps {
	count: number;
	searchQuery: string;
	setSearchQuery: CallableFunction;
	onAddPizza: CallableFunction;
	onAddCategory: CallableFunction;
}

export default function MenuHeader({
	count,
	searchQuery,
	setSearchQuery,
	onAddPizza,
	onAddCategory,
}: MenuHeaderProps) {
	return (
		<div className='flex justify-between items-center mb-8'>
			<h1 className='text-2xl font-bold'>Menu ({count})</h1>

			<div className='flex gap-4'>
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
					<input
						type='text'
						placeholder='Search pizzas...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary w-64'
					/>
				</div>

				<button
					className='flex items-center gap-2 px-4 py-2 bg-orange-100 text-primary font-semibold rounded-xl hover:bg-orange-200 transition-colors'
					onClick={() => onAddCategory()}
				>
					<Plus className='h-4 w-4' /> Add Category
				</button>
				<button
					className='flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors'
					onClick={() => onAddPizza()}
				>
					<Plus className='h-4 w-4' /> Add Pizza
				</button>
			</div>
		</div>
	);
}
