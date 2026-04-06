import ModalWrapper from '@/components/ModalWrapper';
import { useState } from 'react';

export default function CategoryModal({ onClose, onSuccess }: any) {
	const [name, setName] = useState('');

	const handleCreate = async () => {
		const res = await fetch('/api/categories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name }),
		});

		const data = await res.json();
		onSuccess(data);
		onClose();
	};

	return (
		<ModalWrapper>
			<input value={name} onChange={(e) => setName(e.target.value)} />
			<button onClick={handleCreate}>Create</button>
		</ModalWrapper>
	);
}
