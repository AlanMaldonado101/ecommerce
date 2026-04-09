import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { Link } from 'react-router-dom';
import { Edit, Plus, Trash2 } from 'lucide-react';

interface Occasion {
	id: string;
	name: string;
	slug: string;
	created_at: string;
}

export const DashboardOccasionsPage = () => {
	const [occasions, setOccasions] = useState<Occasion[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchOccasions();
	}, []);

	const fetchOccasions = async () => {
		try {
			const { data, error } = await supabase
				.from('occasions')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;
			setOccasions(data || []);
		} catch (error) {
			console.error('Error fetching occasions:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string, name: string) => {
		if (!window.confirm(`¿Estás seguro de que deseas eliminar la ocasión "${name}"? Esta acción no se puede deshacer.`)) {
			return;
		}
		
		try {
			// Nota: Si hay productos apuntando a esta ocasión, fallará si no hay ON DELETE CASCADE.
			const { error } = await supabase.from('occasions').delete().eq('id', id);
			if (error) throw error;
			
			setOccasions(prev => prev.filter(occasion => occasion.id !== id));
		} catch (error: any) {
			console.error('Error deleting occasion:', error);
			alert(`Error al eliminar: ${error.message}`);
		}
	};

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold text-slate-800">Ocasiones / Temporadas</h1>
					<p className="text-slate-500 mt-1">Administra las temporadas festivas que aparecen en el menú principal.</p>
				</div>
				<Link
					to="/dashboard/ocasiones/new"
					className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
				>
					<Plus className="w-5 h-5" /> Nueva Ocasión
				</Link>
			</div>

			<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm text-slate-600">
						<thead className="bg-slate-50 text-slate-700 uppercase font-bold text-xs">
							<tr>
								<th className="px-6 py-4">Nombre</th>
								<th className="px-6 py-4">Slug (URL)</th>
								<th className="px-6 py-4">Fecha de Creación</th>
								<th className="px-6 py-4 text-center">Acciones</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr>
									<td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
										Cargando ocasiones...
									</td>
								</tr>
							) : occasions.length === 0 ? (
								<tr>
									<td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
										No tienes ocasiones registradas aún.
									</td>
								</tr>
							) : (
								occasions.map((occasion) => (
									<tr key={occasion.id} className="hover:bg-slate-50/80 transition-colors">
										<td className="px-6 py-4 font-bold text-slate-800">
											{occasion.name}
										</td>
										<td className="px-6 py-4 font-medium text-slate-500">
											{occasion.slug}
										</td>
										<td className="px-6 py-4 font-medium">
											{new Date(occasion.created_at).toLocaleDateString('es-CL')}
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center justify-center gap-3">
												<Link
													to={`/dashboard/ocasiones/editar/${occasion.id}`}
													className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
													title="Editar Ocasión"
												>
													<Edit className="w-5 h-5" />
												</Link>
												<button
													onClick={() => handleDelete(occasion.id, occasion.name)}
													className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
													title="Eliminar Ocasión"
												>
													<Trash2 className="w-5 h-5" />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
