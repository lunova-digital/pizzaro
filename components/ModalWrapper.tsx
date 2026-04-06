import { FC, PropsWithChildren } from 'react';

interface ModalWrapperProps {
	size?: '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md' | 'sm';
}
const ModalWrapper: FC<PropsWithChildren<ModalWrapperProps>> = ({
	children,
	size = 'xl',
}) => {
	return (
		<div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
			<div
				className={`bg-white rounded-3xl shadow-2xl w-full max-w-${size} max-h-[90vh] overflow-y-auto`}
			>
				{children}
			</div>
		</div>
	);
};

export default ModalWrapper;
