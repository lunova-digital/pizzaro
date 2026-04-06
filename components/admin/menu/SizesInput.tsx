export default function SizesInput({ form, setForm }: any) {
	return (
		<div>
			<button
				onClick={() =>
					setForm({
						...form,
						sizes: [...form.sizes, { name: '', price: 0 }],
					})
				}
			>
				Add Size
			</button>

			{form.sizes.map((s: any, i: number) => (
				<div key={i}>
					<input
						value={s.name}
						onChange={(e) => {
							const sizes = [...form.sizes];
							sizes[i].name = e.target.value;
							setForm({ ...form, sizes });
						}}
					/>
				</div>
			))}
		</div>
	);
}
