import ModalWrapper from '@/components/ModalWrapper';
import { X } from 'lucide-react';
import { useState } from 'react';

interface CategoryModalProps {
	onClose: CallableFunction;
	setCategories: (state: any) => void;
}

export default function CategoryModal({
	onClose,
	setCategories,
}: CategoryModalProps) {
	const [category, setCategory] = useState('');

	const createCategory = async () => {
		if (!category) return;

		const res = await fetch('/api/categories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: category,
				name_bn: '',
				image:
					'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop',
			}),
		});
		if (res.ok) {
			const newCat = await res.json();
			setCategories((prev: any) => [...prev, newCat]);
			onClose();
		}
	};
	return (
		<ModalWrapper size='md'>
			<div className='bg-white rounded-2xl p-6  mb-6'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='font-bold text-dark'>New Category</h2>
					<button onClick={() => onClose()}>
						<X className='h-5 w-5 text-gray-400' />
					</button>
				</div>

				<input
					placeholder='Category Name'
					value={category}
					onChange={(e) => setCategory(e.target.value)}
					className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
				/>

				<button
					onClick={() => createCategory()}
					className={`mt-3 px-6 py-2 ${!category ? 'bg-primary/50' : 'bg-primary hover:bg-primary-dark'} text-white font-semibold rounded-xl  transition-colors text-sm`}
					disabled={!category}
				>
					Add Category
				</button>
			</div>
		</ModalWrapper>
	);
}
