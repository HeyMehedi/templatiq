import dataFetcher from '@helper/fetchData';

export default async function fetchWPPages( inputValue, ids ) {
	inputValue = inputValue ? inputValue : '';
	let url = '';

	if ( Array.isArray( ids ) ) {
		const queryStrings = ids
			.map( ( item ) => `ids[]=${ item }` )
			.join( '&' );
		url = `/templatiq/admin/page/?${ queryStrings }`;
	} else {
		url = `/templatiq/admin/page/?search=${ inputValue }`;
	}

	try {
		const availablePages = await dataFetcher( url );
		const availableOptions = availablePages.pages.map(
			( { id, title } ) => ( {
				value: id,
				label: title,
			} )
		);

		return availableOptions;
	} catch ( _ ) {
		return [];
	}
}
