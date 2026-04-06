import ModalWrapper from '@/components/ModalWrapper';
import { useEffect, useState } from 'react';
import SizesInput from './SizesInput';

export default function PizzaFormModal({
	pizza,
	categories,
	onClose,
	onSuccess,
}: any) {
	const [form, setForm] = useState({
		name: '',
		category: '',
		sizes: [],
	});

	useEffect(() => {
		if (pizza) setForm(pizza);
	}, [pizza]);

	const handleSubmit = async () => {
		const method = pizza ? 'PUT' : 'POST';
		const url = pizza ? `/api/pizzas/${pizza._id}` : '/api/pizzas';

		const res = await fetch(url, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form),
		});

		const data = await res.json();
		onSuccess(data);
		onClose();
	};

	return (
		<ModalWrapper size='4xl'>
			<div className='p-6'>
				<input
					value={form.name}
					onChange={(e) => setForm({ ...form, name: e.target.value })}
				/>

				<select
					value={form.category}
					onChange={(e) => setForm({ ...form, category: e.target.value })}
				>
					{categories.map((c: any) => (
						<option key={c._id}>{c.name}</option>
					))}
				</select>

				<SizesInput form={form} setForm={setForm} />

				<button onClick={handleSubmit}>{pizza ? 'Update' : 'Create'}</button>
			</div>
		</ModalWrapper>
	);
}
