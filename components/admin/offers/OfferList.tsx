import { Offer } from '@/app/admin/offers/page';
import DeleteModal from '@/components/DeleteModal';
import { Pencil, Star, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { FC, useState } from 'react';

interface OfferListProps {
	offers: Offer[];
	toggleField: CallableFunction;
	openEdit: (state: Offer) => void;
	isExpired: any;
	handleDelete: CallableFunction;
}

const OfferList: FC<OfferListProps> = ({
	offers,
	openEdit,
	toggleField,
	isExpired,
	handleDelete,
}) => {
	const [isShowDeleteModal, setShowDeleteModal] = useState(false);

	return (
		<div className='grid gap-4'>
			{offers.length === 0 && (
				<div className='text-center py-16 text-gray-400'>
					<p>কোনো অফার নেই। নতুন অফার তৈরি করুন।</p>
				</div>
			)}
			{offers.map((offer) => (
				<div
					key={offer._id}
					className={`bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 ${isExpired(offer.endsAt) ? 'opacity-50' : ''}`}
				>
					{offer.image && (
						<img
							src={offer.image}
							alt={offer.title}
							className='w-14 h-14 rounded-xl object-cover shrink-0'
						/>
					)}
					<div className='flex-1 min-w-0'>
						<div className='flex items-center gap-2 flex-wrap'>
							<h3 className='font-bold text-dark'>
								{offer.title_bn || offer.title}
							</h3>
							<span
								className={`text-xs font-bold px-2 py-0.5 rounded-full ${offer.type === 'percentage' ? 'bg-green-100 text-green-700' : offer.type === 'flat' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}
							>
								{offer.type === 'percentage'
									? `${offer.discountValue}% ছাড়`
									: offer.type === 'flat'
										? `৳${offer.discountValue} ছাড়`
										: 'কম্বো'}
							</span>
							{isExpired(offer.endsAt) && (
								<span className='text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full'>
									মেয়াদ শেষ
								</span>
							)}
						</div>
						<p className='text-xs text-gray-400 mt-0.5'>
							{offer.targetType === 'all'
								? 'সমস্ত কার্টে'
								: offer.targetType === 'category'
									? `ক্যাটাগরি: ${offer.targetId}`
									: `পিৎজা: ${offer.targetId}`}
							{' · '}
							{new Date(offer.endsAt).toLocaleString('bn-BD')} পর্যন্ত
						</p>
					</div>
					<div className='flex items-center gap-2 shrink-0'>
						<button
							onClick={() =>
								toggleField(offer._id, 'isFeatured', offer.isFeatured)
							}
							title='হোম পেজে দেখান'
							className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${offer.isFeatured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}
						>
							<Star
								className='h-4 w-4'
								fill={offer.isFeatured ? 'currentColor' : 'none'}
							/>
						</button>
						<button
							onClick={() => toggleField(offer._id, 'isActive', offer.isActive)}
							title='সক্রিয়/নিষ্ক্রিয়'
							className='text-gray-400 hover:text-primary transition-colors'
						>
							{offer.isActive ? (
								<ToggleRight className='h-6 w-6 text-primary' />
							) : (
								<ToggleLeft className='h-6 w-6' />
							)}
						</button>
						<button
							onClick={() => openEdit(offer)}
							className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary/10 hover:text-primary transition-colors'
						>
							<Pencil className='h-4 w-4' />
						</button>
						<button
							onClick={() => setShowDeleteModal(true)}
							className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors'
						>
							<Trash2 className='h-4 w-4' />
						</button>
						{isShowDeleteModal && (
							<DeleteModal
								text='Are you sure to delete this offer ?'
								handleDelete={() => handleDelete(offer?._id)}
								setShowDeleteModal={setShowDeleteModal}
							/>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

export default OfferList;
