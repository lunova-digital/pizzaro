import { formatPrice } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';
import { SelectInput } from '../SelectInput';

const PizzaMenuCardAdmin: FC<{
	pizza: Pizza;
	onEditPizza: CallableFunction;
	onDeletePizza: CallableFunction;
	toggleAvailability: CallableFunction;
}> = ({ pizza, onEditPizza, onDeletePizza, toggleAvailability }) => {
	return (
		<div
			key={pizza._id}
			className='bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4'
		>
			<div className='relative w-16 h-16 rounded-xl overflow-hidden shrink-0'>
				{pizza.image ? (
					<Image
						src={pizza.image}
						alt={pizza.name}
						fill
						className='object-cover'
					/>
				) : (
					<div className='w-full h-full bg-gray-100' />
				)}
			</div>

			<div className='flex-1 min-w-0'>
				<div className='flex items-center gap-2'>
					<h3 className='font-bold text-dark'>{pizza.name}</h3>
					<span className='text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full'>
						{pizza.category}
					</span>
				</div>
				<p className='text-xs text-gray-400 mt-0.5 line-clamp-1'>
					{pizza.description}
				</p>
				<p className='text-sm font-semibold text-primary mt-1'>
					From {formatPrice(Math.min(...pizza.sizes.map((s) => s.price)))}
				</p>
			</div>

			<div className='flex items-center gap-2 shrink-0'>
				<SelectInput
					options={['Available', 'Not-Available']}
					defaultValue={pizza.isAvailable ? 'Available' : 'Not-Available'}
					_id={pizza?._id}
					onChange={toggleAvailability}
					// isUpdating={updating === order._id}
				/>
				<button
					onClick={() => onEditPizza()}
					className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary/10 hover:text-primary transition-colors'
				>
					<Pencil className='h-4 w-4' />
				</button>
				<button
					onClick={() => onDeletePizza()}
					// disabled={deletingId === pizza._id}
					className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-primary transition-colors disabled:opacity-50'
				>
					<Trash2 className='h-4 w-4' />
				</button>{' '}
			</div>
		</div>
	);
};

export default PizzaMenuCardAdmin;

interface Pizza {
	_id: string;
	name: string;
	description: string;
	image: string;
	category: string;
	sizes: { name: string; price: number }[];
	isAvailable: boolean;
}
