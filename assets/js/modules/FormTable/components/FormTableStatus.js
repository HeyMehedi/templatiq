import useStore from '@hooks/useStore.js';
import useUpdateMutation from '@hooks/useUpdateMutation.js';
import handleUpdateFormStatus from '../helper/handleUpdateFormStatus';
import { ToggleControl } from '@wordpress/components';
import { useFormTableState } from '../context/FormTableStateContext';
import { useQueryClient } from '@tanstack/react-query';

export default function FormTableStatus( props ) {
	const { formTableState, setFormTableState } = useFormTableState();
	const { currentPage } = formTableState;
	const { id, status, baseApiRoute } = props;
	const statusText = status === 'publish' ? 'Active' : 'Inactive';
	const { setStoreData, getStoreData } = useStore();
	const forms = getStoreData( [ `helpgent-form-${ currentPage }` ] );
	const queryClient = useQueryClient();

	/* Form Update Mutation */
	const { mutateAsync: updateStatusFormMutation, isLoading } =
		useUpdateMutation( `/helpgent/admin/form/${ id }/status` );

	return (
		<div className="helpgent-toggle helpgent-toggle-success">
			<ToggleControl
				onChange={ () =>
					handleUpdateFormStatus(
						id,
						forms,
						status,
						updateStatusFormMutation,
						setStoreData,
						currentPage,
						queryClient
					)
				}
				checked={ status === 'publish' }
				label={ statusText }
			/>
		</div>
	);
}