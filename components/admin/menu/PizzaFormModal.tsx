import FileDropzone from '@/components/FileIDropzone';
import ModalWrapper from '@/components/ModalWrapper';
import { Plus, X } from 'lucide-react';

interface PizzaFormModalProps {
	categories: { _id: string; name: string }[];
	setShowAdd: (state: boolean) => void;
	setPizzas: (state: Pizza[]) => void;
	updatePizza: (pizza: Pizza) => void;
	createPizza: () => void;
	pizzaData?: Pizza;
	editingId: string;
	form: any;
	setForm: (state: any) => void;
}

export default function PizzaFormModal({
	categories,
	setShowAdd,
	updatePizza,
	createPizza,
	pizzaData,
	editingId,
	form,
	setForm,
}: PizzaFormModalProps) {
	// image uploader
	const uploadImage = async (file: File) => {
		const formData = new FormData();
		formData.append('file', file);

		const res = await fetch('/api/upload', {
			method: 'POST',
			body: formData,
		});

		const { url } = await res.json();
		setForm((prev: any) => ({
			...prev,
			image: url!,
		}));
	};

	// form handler
	const handleSubmitForm = (pizzaId?: string) => {
		if (pizzaId === pizzaData?._id && pizzaId) {
			console.log('object');
			updatePizza({ ...form, ...pizzaData! });
		} else {
			console.log('object2');
			createPizza();
		}
	};

	return (
		<ModalWrapper size='4xl'>
			<div className='bg-white rounded-2xl p-6 mb-6'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='font-bold text-dark'>New Pizza</h2>
					<button onClick={() => setShowAdd(false)}>
						<X className='h-5 w-5 text-gray-400' />
					</button>
				</div>
				<div className='grid grid-cols-2 gap-3 mb-3'>
					<input
						placeholder='Pizza Name (EN)'
						value={form.name}
						onChange={(e) => setForm({ ...form, name: e.target.value })}
						className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
					/>
					<input
						placeholder='পিৎজার নাম (বাংলা)'
						value={form.name_bn}
						onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
						className='px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:border-primary'
					/>
					<select
						value={form.category}
						onChange={(e) => setForm({ ...form, category: e.target.value })}
						className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
					>
						<option value=''>-- Select Category --</option>
						{categories.map((c: any) => (
							<option key={c._id} value={c.name}>
								{c.name}
							</option>
						))}
					</select>
				</div>
				<input
					placeholder='Description (EN)'
					value={form.description}
					onChange={(e) => setForm({ ...form, description: e.target.value })}
					className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary mb-2'
				/>
				<input
					placeholder='বিবরণ (বাংলায় লিখুন)'
					value={form.description_bn}
					onChange={(e) => setForm({ ...form, description_bn: e.target.value })}
					className='w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:border-primary mb-3'
				/>

				<FileDropzone uploadImage={uploadImage} image={pizzaData?.image!} />

				{/* Custom Sizes Section */}
				<div className='mt-4 mb-6 border border-gray-100 rounded-xl p-4 bg-gray-50/50'>
					<div className='flex items-center justify-between mb-3'>
						<h3 className='font-semibold text-dark text-sm'>
							Pizza Sizes & Prices
						</h3>
						<button
							onClick={() =>
								setForm({
									...form,
									sizes: [...form.sizes, { name: '', price: 0 }],
								})
							}
							className='text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1'
						>
							<Plus className='h-3 w-3' /> Add Size
						</button>
					</div>
					{form.sizes.length === 0 ? (
						<p className='text-xs text-gray-400'>
							No sizes added. Please add at least one size.
						</p>
					) : (
						<div className='space-y-2'>
							{form?.sizes?.map((size: any, index: number) => (
								<div key={index} className='flex items-center gap-3'>
									<input
										placeholder='Size (e.g. 5 inc or Regular)'
										value={size.name}
										onChange={(e) => {
											const newSizes = [...form.sizes];
											newSizes[index].name = e.target.value;
											setForm({ ...form, sizes: newSizes });
										}}
										className='flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
									/>
									<div className='relative w-32'>
										<span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>
											৳
										</span>
										<input
											type='number'
											placeholder='Price'
											value={size.price || ''}
											onChange={(e) => {
												const newSizes = [...form.sizes];
												newSizes[index].price = Number(e.target.value);
												setForm({ ...form, sizes: newSizes });
											}}
											className='w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
										/>
									</div>
									<button
										onClick={() => {
											const newSizes = form.sizes.filter(
												(_: any, i: number) => i !== index,
											);
											setForm({ ...form, sizes: newSizes });
										}}
										className='w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors'
									>
										<X className='h-4 w-4' />
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				<button
					onClick={() => handleSubmitForm(pizzaData?._id!)}
					className='px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm'
				>
					{pizzaData?._id === editingId ? 'Update Pizza' : 'Add Pizza'}
				</button>
			</div>
		</ModalWrapper>
	);
}

interface Pizza {
	_id: string;
	name: string;
	name_bn?: string;
	description: string;
	description_bn?: string;
	image: string;
	category: string;
	sizes: { name: string; price: number }[];
	isAvailable: boolean;
}
