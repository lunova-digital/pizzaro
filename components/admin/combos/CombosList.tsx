import { Combo } from '@/app/admin/combos/page';
import DeleteModal from '@/components/DeleteModal';
import { formatPrice } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { FC, useState } from 'react';

interface CombosListProps {
	loading: boolean;
	combos: Combo[];
	setCombos: (state: any) => void;
	openEdit: (state: Combo) => void;
	handleDelete: (id: string) => void;
	deletingId: string;
}

const CombosList: FC<CombosListProps> = ({
	loading,
	combos,
	setCombos,
	openEdit,
	handleDelete,
	deletingId,
}) => {
	const [isShowDeleteModal, setShowDeleteModal] = useState(false);

	async function toggleAvailable(combo: Combo) {
		const res = await fetch(`/api/combos/${combo._id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isAvailable: !combo.isAvailable }),
		});
		if (res.ok) {
			const updated: Combo = await res.json();
			setCombos((prev: Combo[]) =>
				prev?.map((c) => (c._id === updated._id ? updated : c)),
			);
		}
	}

	return (
		<div>
			{loading ? (
				<div className='space-y-3'>
					{[...Array(3)].map((_, i) => (
						<div
							key={i}
							className='h-20 bg-gray-100 rounded-2xl animate-pulse'
						/>
					))}
				</div>
			) : combos?.length === 0 ? (
				<div className='text-center py-16 text-muted-fg'>
					<p className='text-xl font-bold text-dark'>No combos yet</p>
					<p className='mt-1 text-sm'>
						Click &quot;Add Combo&quot; to create your first deal
					</p>
				</div>
			) : (
				<div className='space-y-3'>
					{combos?.map((combo) => (
						<div
							key={combo._id}
							className='bg-surface border border-border rounded-2xl p-4 flex items-center gap-4'
						>
							{/* Image */}
							<div className='relative w-16 h-16 rounded-xl overflow-hidden shrink-0'>
								<Image
									src={combo.image}
									alt={combo.name}
									fill
									className='object-cover'
									unoptimized={combo.image?.startsWith('/uploads/')}
								/>
							</div>

							{/* Info */}
							<div className='flex-1 min-w-0'>
								<div className='flex items-center gap-2'>
									<span className='font-bold text-dark truncate'>
										{combo.name}
									</span>
									<span className='text-primary font-bold text-sm'>
										{formatPrice(combo.price)}
									</span>
								</div>
								<p className='text-xs text-muted-fg mt-0.5 truncate'>
									{combo.items.join(' · ')}
								</p>
							</div>

							{/* Actions */}
							<div className='flex items-center gap-2 shrink-0'>
								<button
									onClick={() => toggleAvailable(combo)}
									className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
										combo.isAvailable
											? 'bg-green-100 text-green-700 hover:bg-green-200'
											: 'bg-gray-100 text-gray-500 hover:bg-gray-200'
									}`}
								>
									{combo.isAvailable ? 'Live' : 'Hidden'}
								</button>
								<button
									onClick={() => openEdit(combo)}
									className='p-2 text-muted-fg hover:text-primary hover:bg-orange-50 rounded-lg transition-colors cursor-pointer'
								>
									<Pencil className='h-4 w-4' />
								</button>
								<button
									onClick={() => setShowDeleteModal(true)}
									disabled={deletingId === combo._id}
									className='p-2 text-muted-fg hover:text-danger hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40'
								>
									<Trash2 className='h-4 w-4' />
								</button>
								{isShowDeleteModal && (
									<DeleteModal
										text='Are you sure to delete this combo ?'
										handleDelete={() => handleDelete(combo._id)}
										setShowDeleteModal={setShowDeleteModal}
									/>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default CombosList;
