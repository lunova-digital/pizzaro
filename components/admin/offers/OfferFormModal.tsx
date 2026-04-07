import ModalWrapper from '@/components/ModalWrapper';

const OfferFormModal = () => {
	return (
		<ModalWrapper size='4xl'>
			<div className='bg-white rounded-2xl p-6 mb-8 border border-orange-100'>
				<div className='flex items-center justify-between mb-5'>
					<h2 className='font-bold text-dark text-lg'>
						{editingId ? 'অফার সম্পাদনা' : 'নতুন অফার তৈরি'}
					</h2>
					<button onClick={() => setShowForm(false)}>
						<X className='h-5 w-5 text-gray-400' />
					</button>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<input
						placeholder='অফারের নাম (EN)'
						value={form.title}
						onChange={(e) => setForm({ ...form, title: e.target.value })}
						className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
					/>
					<input
						placeholder='🇧🇩 অফারের নাম (বাংলা)'
						value={form.title_bn}
						onChange={(e) => setForm({ ...form, title_bn: e.target.value })}
						className='px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:border-primary'
					/>
					<input
						placeholder='বিবরণ (EN)'
						value={form.description}
						onChange={(e) => setForm({ ...form, description: e.target.value })}
						className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
					/>
					<input
						placeholder='🇧🇩 বিবরণ (বাংলা)'
						value={form.description_bn}
						onChange={(e) =>
							setForm({ ...form, description_bn: e.target.value })
						}
						className='px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:border-primary'
					/>
					<div>
						<label className='text-xs text-gray-500 mb-1 block'>
							অফারের ধরন
						</label>
						<select
							value={form.type}
							onChange={(e) =>
								setForm({ ...form, type: e.target.value as Offer['type'] })
							}
							className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
						>
							<option value='percentage'>শতকরা ছাড় (%)</option>
							<option value='flat'>নির্দিষ্ট টাকা ছাড় (৳)</option>
							<option value='combo'>কম্বো অফার</option>
						</select>
					</div>
					<div>
						<label className='text-xs text-gray-500 mb-1 block'>
							ছাড়ের পরিমাণ ({form.type === 'percentage' ? '%' : '৳'})
						</label>
						<input
							type='number'
							min={0}
							value={form.discountValue}
							onChange={(e) =>
								setForm({ ...form, discountValue: Number(e.target.value) })
							}
							className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
						/>
					</div>
					<div>
						<label className='text-xs text-gray-500 mb-1 block'>
							ছাড়ের লক্ষ্যমাত্রা
						</label>
						<select
							value={form.targetType}
							onChange={(e) =>
								setForm({
									...form,
									targetType: e.target.value as Offer['targetType'],
									targetId: '',
								})
							}
							className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
						>
							<option value='all'>সমস্ত কার্ট</option>
							<option value='category'>নির্দিষ্ট ক্যাটাগরি</option>
							<option value='pizza'>নির্দিষ্ট পিৎজা</option>
						</select>
					</div>
					{form.targetType !== 'all' &&
						(form.targetType === 'category' ? (
							<select
								value={form.targetId}
								onChange={(e) => setForm({ ...form, targetId: e.target.value })}
								className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
							>
								<option value=''>-- ক্যাটাগরি নির্বাচন করুন --</option>
								{categories.map((c) => (
									<option key={c._id} value={c.name}>
										{c.name}
									</option>
								))}
							</select>
						) : (
							<select
								value={form.targetId}
								onChange={(e) => setForm({ ...form, targetId: e.target.value })}
								className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
							>
								<option value=''>-- পিৎজা নির্বাচন করুন --</option>
								{pizzas.map((p) => (
									<option key={p._id} value={p._id}>
										{p.name}
									</option>
								))}
							</select>
						))}
					<div>
						<label className='text-xs text-gray-500 mb-1 block'>
							ন্যূনতম অর্ডার (৳)
						</label>
						<input
							type='number'
							min={0}
							value={form.minOrderValue}
							onChange={(e) =>
								setForm({ ...form, minOrderValue: Number(e.target.value) })
							}
							className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
						/>
					</div>
					<div>
						<label className='text-xs text-gray-500 mb-1 block'>
							শুরুর সময়
						</label>
						<input
							type='datetime-local'
							value={form.startsAt}
							onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
							className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
						/>
					</div>
					<div>
						<label className='text-xs text-gray-500 mb-1 block'>
							শেষের সময়
						</label>
						<input
							type='datetime-local'
							value={form.endsAt}
							onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
							className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
						/>
					</div>
					<div className='flex gap-6 items-center col-span-full'>
						<label className='flex items-center gap-2 text-sm cursor-pointer'>
							<input
								type='checkbox'
								checked={form.isActive}
								onChange={(e) =>
									setForm({ ...form, isActive: e.target.checked })
								}
								className='h-4 w-4 accent-primary'
							/>
							সক্রিয়
						</label>
						<label className='flex items-center gap-2 text-sm cursor-pointer'>
							<input
								type='checkbox'
								checked={form.isFeatured}
								onChange={(e) =>
									setForm({ ...form, isFeatured: e.target.checked })
								}
								className='h-4 w-4 accent-primary'
							/>
							হোম পেজে দেখান
						</label>
					</div>
				</div>
				<div className='mt-4'>
					<FileDropzone uploadImage={uploadImage} image={form.image!} />
				</div>
				<button
					onClick={handleSubmit}
					className='mt-5 px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm'
				>
					{editingId ? 'আপডেট করুন' : 'অফার তৈরি করুন'}
				</button>
			</div>
		</ModalWrapper>
	);
};

export default OfferFormModal;
