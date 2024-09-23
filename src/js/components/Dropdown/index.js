import checkedClickedOutside from '@helper/checkClickedOutside';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ReactSVG from 'react-inlinesvg';

import { DropdownStyle } from './style';

export default function Dropdown( {
	className,
	dropDownText,
	dropDownIcon,
	dropdownList,
	defaultSelect,
	placement,
	dropDownChange,
} ) {
	const ref = useRef( null );
	const [ isDropdownOpen, setDropDownOpen ] = useState( false );
	const [ selectedItem, setSelectedItem ] = useState( null ); // New state for the selected item

	const dropdownClassName = `templatiq-dropdown ${
		isDropdownOpen ? 'templatiq-dropdown-open ' : ''
	}${ className && className } ${
		placement ? `templatiq-dropdown-${ placement }` : ''
	}`;

	const DropdownIcon = ( { dropDownIcon } ) =>
		dropDownIcon ? (
			<span className="templatiq-dropdown__toggle__icon">
				<ReactSVG src={ dropDownIcon } width={ 14 } height={ 14 } />
			</span>
		) : null;

	function handleDropdown( e ) {
		e.preventDefault();
		setDropDownOpen( ! isDropdownOpen );
	}

	// Function to handle item selection
	function handleItemSelect( item ) {
		setDropDownOpen( false );
		setSelectedItem( item );
		if ( typeof dropDownChange === 'function' ) {
			dropDownChange( item ); // Pass the selected item to the parent component
		}
	}

	/* Close Dropdown click on outside */
	useEffect( () => {
		checkedClickedOutside( isDropdownOpen, setDropDownOpen, ref );
	}, [ isDropdownOpen ] );

	return (
		<DropdownStyle className={ dropdownClassName } ref={ ref }>
			{ selectedItem ? (
				<a
					href={ selectedItem.url ? selectedItem.url : '#' }
					className="templatiq-dropdown__toggle"
					onClick={ handleDropdown }
				>
					<ReactSVG
						src={ selectedItem.icon }
						width={ 24 }
						height={ 24 }
					/>
					{ selectedItem.text }
					<DropdownIcon dropDownIcon={ dropDownIcon } />
				</a>
			) : defaultSelect ? (
				<a
					href={ defaultSelect.url ? defaultSelect.url : '#' }
					className="templatiq-dropdown__toggle"
					onClick={ handleDropdown }
				>
					<ReactSVG
						src={ defaultSelect.icon }
						width={ 24 }
						height={ 24 }
					/>
					{ defaultSelect.text }
					<DropdownIcon dropDownIcon={ dropDownIcon } />
				</a>
			) : (
				<a
					href="#"
					className="templatiq-dropdown__toggle"
					onClick={ handleDropdown }
				>
					{ dropDownText ? dropDownText : '' }
					<DropdownIcon dropDownIcon={ dropDownIcon } />
				</a>
			) }
			<ul
				className={
					isDropdownOpen
						? 'templatiq-dropdown__content templatiq-dropdown__content--open'
						: 'templatiq-dropdown__content'
				}
			>
				{ dropdownList &&
					dropdownList.map( ( item, i ) => {
						let url = null;
						if ( item.url ) {
							url = item.url;
						} else {
							url = '#';
						}
						return (
							<li
								key={ i }
								className={`templatiq-dropdown__content__item ${item.type === 'upcoming' ? 'disable' : ''}`}
								onClick={ () => handleItemSelect( item ) }
							>
								<a
									href={ url }
									className={ `templatiq-dropdown__content__link ${
										item.className ? item.className : ''
									}` }
									target={
										item.target === 'blank'
											? '_blank'
											: null
									}
								>
									{ item.icon ? (
										<img
											src={ item.icon }
											alt={ item.text }
										/>
									) : (
										''
									) }
									{ item.text }
									{ item.type === 'upcoming' ?  <sup> {__( '(Coming Soon)', 'templatiq' )}</sup> : null }
								</a>
							</li>
						);
					} ) }
			</ul>
		</DropdownStyle>
	);
}
