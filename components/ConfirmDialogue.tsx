import { FC } from 'react';

type ConfirmAlertProps = {
	open: boolean;
	title?: string;
	message?: string;
	onConfirm: () => void;
	onCancel: () => void;
};

export const ConfirmAlert: FC<ConfirmAlertProps> = ({
	open,
	title = 'Are you sure?',
	message = 'This action cannot be undone.',
	onConfirm,
	onCancel,
}) => {
	if (!open) return null;

	return (
		<div className='absolute inset-0 z-50 flex items-center justify-center'>
			{/* Overlay */}
			<div
				className='absolute inset-0 bg-black/40 backdrop-blur-sm'
				onClick={onCancel}
			/>

			{/* Modal */}
			<div className='relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6 animate-scaleIn'>
				<h2 className='text-lg font-semibold text-gray-800 mb-2'>{title}</h2>

				<p className='text-sm text-gray-600 mb-6'>{message}</p>

				{/* Actions */}
				<div className='flex justify-end gap-3'>
					<button
						onClick={() => onCancel()}
						className='px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition'
					>
						Cancel
					</button>

					<button
						onClick={onConfirm}
						className='px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow'
					>
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
};
