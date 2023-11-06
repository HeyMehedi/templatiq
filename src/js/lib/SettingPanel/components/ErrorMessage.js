import { getErrorMessage } from '../helpers/utility';

export default function ErrorMessage( { inputKey, form, rules } ) {
	const errorMessage = getErrorMessage( inputKey, form, rules );

	if ( ! errorMessage ) {
		return '';
	}

	return (
		<div className="templatiq-form-input-error-message">
			{ errorMessage }
		</div>
	);
}
