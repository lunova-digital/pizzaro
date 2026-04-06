import { Plus, Search } from 'lucide-react';

export default function MenuHeader({
	count,
	searchQuery,
	setSearchQuery,
	onAddPizza,
	onAddCategory,
}: any) {
	return (
		<div className='flex justify-between mb-8'>
			<h1 className='text-2xl font-bold'>Menu ({count})</h1>

			<div className='flex gap-4'>
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4' />
					<input
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-9 pr-4 py-2 border rounded-xl'
						placeholder='Search...'
					/>
				</div>

				<button onClick={onAddCategory}>+ Category</button>
				<button onClick={onAddPizza}>
					<Plus /> Pizza
				</button>
			</div>
		</div>
	);
}
