import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../supabase/client';
import { Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FormOccasion: FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [name, setName] = useState('');
	const [slug, setSlug] = useState('');

	useEffect(() => {
		if (id) {
			fetchOccasionData(id);
		}
	}, [id]);

	const fetchOccasionData = async (occasionId: string) => {
		try {
			const { data, error } = await supabase
				.from('occasions')
				.select('*')
				.eq('id', occasionId)
				.single();

			if (error) throw error;
			
			if (data) {
				setName(data.name);
				setSlug(data.slug);
			}
		} catch (error) {
			console.error('Error fetching occasion:', error);
			alert('No se pudo cargar la ocasión para editar.');
			navigate('/dashboard/ocasiones');
		}
	};

	const generateSlug = (text: string) => {
		return text
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '') // remove diacritics
			.replace(/[^a-z0-9]+/g, '-') // non-alphanumeric to dash
			.replace(/(^-|-$)/g, ''); // trim dashes
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newName = e.target.value;
		setName(newName);
		if (!id) {
			// Auto-generate slug only if we are creating a new one
			setSlug(`temporada-${generateSlug(newName)}`);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !slug) {
			alert('El nombre y el slug son obligatorios.');
			return;
		}

		setIsSubmitting(true);

		try {
			if (id) {
				// Update existing
				const { error } = await supabase
					.from('occasions')
					.update({ name, slug })
					.eq('id', id);

				if (error) throw error;
			} else {
				// Create new
				const { error } = await supabase
					.from('occasions')
					.insert([{ name, slug }]);

				if (error) throw error;
			}

			navigate('/dashboard/ocasiones');
		} catch (error: any) {
			console.error('Error saving occasion:', error);
			alert(`Error al guardar: ${error.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="p-6 max-w-2xl">
			<div className="flex items-center gap-4 mb-8">
				<Link to="/dashboard/ocasiones" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
					<ArrowLeft className="w-5 h-5" />
				</Link>
				<div>
					<h1 className="text-3xl font-bold text-slate-800">
						{id ? 'Editar Ocasión' : 'Nueva Ocasión'}
					</h1>
					<p className="text-slate-500 mt-1">
						{id ? 'Modifica los detalles de esta temporada.' : 'Agrega una nueva temporada festiva al menú.'}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
				
				<div className="space-y-2">
					<label htmlFor="name" className="text-sm font-bold text-slate-700">Nombre de la Temporada</label>
					<input
						id="name"
						type="text"
						value={name}
						onChange={handleNameChange}
						placeholder="Ej: Día de la Madre"
						className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
						required
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="slug" className="text-sm font-bold text-slate-700">Slug (URL Route)</label>
					<input
						id="slug"
						type="text"
						value={slug}
						onChange={(e) => setSlug(e.target.value)}
						placeholder="Ej: temporada-dia-de-la-madre"
						className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-sm bg-slate-50"
						required
					/>
					<p className="text-xs text-slate-400 mt-1">Este es el identificador único en la URL. Preferiblemente no lo edites si ya está publicado para no romper links.</p>
				</div>

				<div className="pt-6 border-t border-slate-100">
					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Save className="w-5 h-5" />
						{isSubmitting ? 'Guardando...' : 'Guardar Ocasión'}
					</button>
				</div>
				
			</form>
		</div>
	);
};
