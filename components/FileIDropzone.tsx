import React, { ChangeEvent, useRef, useState } from 'react';

const FileDropzone: React.FC<{
	uploadImage: (state: File) => void;
	image: string;
}> = ({ uploadImage, image }) => {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [file, setFile] = useState<File>();

	const handleFiles = (selectedFile: File) => {
		if (!selectedFile) return;
		setFile(selectedFile);
		uploadImage(selectedFile);
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		handleFiles(e?.target?.files?.[0]!);
	};

	return (
		<div className='w-full max-w-md mb-3'>
			<div
				className={`relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer transition-all
			`}
			>
				{/* Hidden Input */}
				<input
					type='file'
					ref={inputRef}
					className='absolute inset-0 opacity-0 cursor-pointer'
					onChange={handleChange}
					multiple
				/>

				{/* Content */}
				<div className='space-y-2 pointer-events-none'>
					<p className='text-lg font-semibold text-gray-800'>
						📁 Drag & drop files here
					</p>
					<p className='text-sm text-gray-500'>or click to browse</p>
				</div>
			</div>

			{/* File List */}
			{(file?.name || image) && (
				<div className='mt-4 space-y-2'>
					<div className='px-4 py-2 bg-white rounded-lg shadow text-sm text-gray-700 flex justify-between items-center'>
						<span> {file?.name?.slice(0, 60) || image?.slice(0, 60)}</span>
						{file?.size && (
							<span className='text-xs text-gray-400'>
								{(file?.size! / 1024).toFixed(1)} KB
							</span>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default FileDropzone;
