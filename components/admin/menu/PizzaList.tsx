import PizzaMenuCardAdmin from '@/components/menu/PizzaMenuCardAdmin';

export default function PizzaList({ pizzas, onEdit }: any) {
	return (
		<div className='grid gap-4'>
			{pizzas.map((pizza: any) => (
				<PizzaMenuCardAdmin
					key={pizza._id}
					pizza={pizza}
					onEditPizza={() => onEdit(pizza)}
					onDeletePizza={() => {}}
					toggleAvailability={() => {}}
				/>
			))}
		</div>
	);
}
