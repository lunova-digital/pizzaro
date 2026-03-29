import { FC, useEffect, useRef, useState } from 'react';

type SelectInputProps = {
	options: string[];
	defaultValue?: string;
	onChange?: CallableFunction;
	_id?: string;
	isUpdating?: boolean;
};

export const SelectInput: FC<SelectInputProps> = ({
	options,
	defaultValue,
	onChange,
	_id,
	isUpdating,
}) => {
	const [selected, setSelected] = useState<string | null>(null);
	const [open, setOpen] = useState(false);

	const selectRef = useRef<HTMLDivElement | null>(null);

	// ✅ Set default value
	useEffect(() => {
		if (defaultValue && options.includes(defaultValue)) {
			setSelected(defaultValue);
		}
	}, [defaultValue, options]);

	// 👇 Handle outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				selectRef.current &&
				!selectRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleSelect = (option: string) => {
		setSelected(option);
		setOpen(false);

		// ✅ Trigger onChange
		if (onChange) {
			onChange(_id, option);
		}
	};

	return (
		<div ref={selectRef} className='!w-[170px]'>
			{/* Button */}
			<button
				type='button'
				onClick={() => setOpen((prev) => !prev)}
				className={`${selected === 'Not-Available' ? '!bg-red-500 !text-white' : ''} w-full flex justify-between items-center bg-white border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition `}
				disabled={isUpdating}
			>
				{/* <span className={selected ? 'text-gray-800' : 'text-gray-400'}> */}
				{selected ?? 'Select something...'}
				{/* </span> */}

				<svg
					className={`${selected === 'Not-Available' ? '!text-white' : ''} w-5 h-5 text-gray-500 transform transition ${
						open ? 'rotate-180' : ''
					}`}
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					viewBox='0 0 24 24'
				>
					<path d='M19 9l-7 7-7-7' />
				</svg>
			</button>

			{/* Dropdown */}
			{open && (
				<div className='absolute mt-2 !w-[170px] bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden'>
					{options.map((option) => (
						<div
							key={option}
							onClick={() => handleSelect(option)}
							className={`px-4 py-3 cursor-pointer hover:bg-indigo-50 transition ${
								selected === option
									? 'bg-indigo-100 text-indigo-700'
									: 'text-gray-700'
							}`}
						>
							{option}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
