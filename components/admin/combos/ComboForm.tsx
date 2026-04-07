import FileDropzone from '@/components/FileIDropzone';
import ModalWrapper from '@/components/ModalWrapper';
import { Check, X } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

interface ComboFormProps {
	form: any;
	closeForm: CallableFunction;
	editingId: string;
	error: any;
	setForm: any;
	uploadImage: (file: File) => void;
	uploading: boolean;
	handleSave: () => void;
	saving: boolean;
}

const ComboForm: FC<ComboFormProps> = ({
	form,
	closeForm,
	editingId,
	error,
	setForm,
	uploadImage,
	uploading,
	handleSave,
	saving,
}) => {
	return (
		<ModalWrapper size='2xl'>
			<>
				<div className='flex items-center justify-between p-6 border-b border-border'>
					<h2 className='text-lg font-bold text-dark'>
						{editingId ? 'Edit Combo' : 'Add Combo'}
					</h2>
					<button
						onClick={() => closeForm()}
						className='p-2 rounded-xl hover:bg-gray-100 cursor-pointer'
					>
						<X className='h-5 w-5 text-muted-fg' />
					</button>
				</div>

				<div className='p-6 space-y-4'>
					{error && (
						<div className='bg-red-50 text-danger text-sm px-4 py-3 rounded-xl'>
							{error}
						</div>
					)}

					<div>
						<label className='block text-sm font-semibold text-dark mb-1.5'>
							Name (EN)
						</label>
						<input
							value={form.name}
							onChange={(e) =>
								setForm((f: any) => ({ ...f, name: e.target.value }))
							}
							placeholder='e.g. Pizza Combo'
							className='w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
						/>
					</div>

					<div>
						<label className='block text-sm font-semibold text-dark mb-1.5'>
							🇧🇩 নাম (বাংলা)
						</label>
						<input
							value={form.name_bn}
							onChange={(e) =>
								setForm((f: any) => ({ ...f, name_bn: e.target.value }))
							}
							placeholder='যেমন: পিৎজা কম্বো'
							className='w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-primary'
						/>
					</div>

					<div>
						<label className='block text-sm font-semibold text-dark mb-1.5'>
							Description (EN)
						</label>
						<input
							value={form.description}
							onChange={(e) =>
								setForm((f: any) => ({ ...f, description: e.target.value }))
							}
							placeholder='Short tagline shown on the combo card'
							className='w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
						/>
					</div>

					<div>
						<label className='block text-sm font-semibold text-dark mb-1.5'>
							🇧🇩 বিবরণ (বাংলা)
						</label>
						<input
							value={form.description_bn}
							onChange={(e) =>
								setForm((f: any) => ({ ...f, description_bn: e.target.value }))
							}
							placeholder='যেমন: ৪টি পিৎজা + কোল্ড ড্রিংকস'
							className='w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-primary'
						/>
					</div>

					<div>
						<label className='block text-sm font-semibold text-dark mb-1.5'>
							Items{' '}
							<span className='font-normal text-muted-fg'>(one per line)</span>
						</label>
						<textarea
							value={form.itemsText}
							onChange={(e) =>
								setForm((f: any) => ({ ...f, itemsText: e.target.value }))
							}
							rows={5}
							placeholder={'BBQ Chicken Pizza\nFrench Fries\nCold Drinks 2pis'}
							className='w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none'
						/>
					</div>

					<div>
						<label className='block text-sm font-semibold text-dark mb-1.5'>
							Price (৳)
						</label>
						<input
							type='number'
							min={1}
							value={form.price || ''}
							onChange={(e) =>
								setForm((f: any) => ({
									...f,
									price: parseInt(e.target.value) || 0,
								}))
							}
							placeholder='e.g. 999'
							className='w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
						/>
					</div>

					<div>
						<label className='block text-sm font-semibold text-dark mb-1.5'>
							Offer Ends At (Optional)
						</label>
						<input
							type='datetime-local'
							value={form.offerEndsAt}
							onChange={(e) =>
								setForm((f: any) => ({ ...f, offerEndsAt: e.target.value }))
							}
							className='w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
						/>
						<p className='text-xs text-muted-fg mt-1'>
							Leave empty if this is a permanent combo offer.
						</p>
					</div>

					<div>
						<label className='block text-sm font-semibold text-dark mb-1.5'>
							Image
						</label>
						<FileDropzone uploadImage={uploadImage} image={form.image} />
						{uploading && (
							<p className='text-xs text-muted-fg mt-1'>Uploading...</p>
						)}
						<input
							value={form.image}
							onChange={(e) =>
								setForm((f: any) => ({ ...f, image: e.target.value }))
							}
							placeholder='Or paste image URL'
							className='w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mt-2'
						/>
						{form.image && (
							<div className='relative w-full h-32 mt-2 rounded-xl overflow-hidden border border-border'>
								<Image
									src={form.image}
									alt='preview'
									fill
									className='object-cover'
									unoptimized
								/>
							</div>
						)}
					</div>

					<div className='flex flex-col gap-3'>
						<div className='flex items-center gap-3'>
							<button
								onClick={() =>
									setForm((f: any) => ({ ...f, isAvailable: !f.isAvailable }))
								}
								className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
									form.isAvailable ? 'bg-primary' : 'bg-gray-200'
								}`}
							>
								<span
									className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
										form.isAvailable ? 'translate-x-0.5' : '-translate-x-5'
									}`}
								/>
							</button>
							<span className='text-sm font-medium text-dark'>
								{form.isAvailable ? 'Visible to customers' : 'Hidden from menu'}
							</span>
						</div>

						<div className='flex items-center gap-3'>
							<button
								onClick={() =>
									setForm((f: any) => ({ ...f, isFeatured: !f.isFeatured }))
								}
								className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
									form.isFeatured ? 'bg-red-600' : 'bg-gray-200'
								}`}
							>
								<span
									className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
										form.isFeatured ? 'translate-x-0.5' : '-translate-x-5'
									}`}
								/>
							</button>
							<span className='text-sm font-medium text-dark'>
								{form.isFeatured ? 'Featured on Homepage' : 'Standard Combo'}
							</span>
						</div>
					</div>
				</div>

				<div className='p-6 pt-0 flex gap-3'>
					<button
						onClick={() => closeForm()}
						className='flex-1 py-3 border border-border rounded-xl font-semibold text-dark hover:bg-gray-50 transition-colors cursor-pointer'
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						disabled={saving || uploading}
						className='flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2'
					>
						{saving ? (
							'Saving...'
						) : (
							<>
								<Check className='h-4 w-4' />
								{editingId ? 'Save Changes' : 'Create Combo'}
							</>
						)}
					</button>
				</div>
			</>
		</ModalWrapper>
	);
};

export default ComboForm;
