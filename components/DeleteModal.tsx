import { FC } from 'react';
import ModalWrapper from './ModalWrapper';

interface DeleteModalProps {
	text: string;
	setShowDeleteModal: (state: boolean) => void;
	handleDelete: CallableFunction;
}

const DeleteModal: FC<DeleteModalProps> = ({
	text,
	setShowDeleteModal,
	handleDelete,
}) => {
	return (
		<ModalWrapper size='md'>
			<div className='p-5 text-center'>
				<h2>{text}</h2>
				<div className='flex justify-center items-center gap-2 mt-4'>
					<button
						onClick={() => setShowDeleteModal(false)}
						className='rounded-md px-4 py-1 bg-danger text-white flex items-center justify-center  hover:bg-danger/80 transition-colors'
					>
						Cancel
					</button>
					<button
						onClick={() => {
							handleDelete();
							setShowDeleteModal(false);
						}}
						className='rounded-md px-4 py-1 bg-success flex items-center justify-center text-white hover:bg-success/80  transition-colors'
					>
						Yes
					</button>
				</div>
			</div>
		</ModalWrapper>
	);
};

export default DeleteModal;
