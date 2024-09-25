import ContentLoading from '@components/ContentLoading';
import InsertTemplate from '@components/InsertTemplate';
import DashboardLayout from '@layout/DashboardLayout';
import store from '@store/index';
import { select, subscribe } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import EmptyTemplate from '@components/EmptyTemplate';
import { TemplatePackStyle } from '@root/style';
import { Link } from 'react-router-dom';
import { DashboardItemsStyle } from './style';

export default function MyPurchaseModule() {
	const [ loading, setLoading ] = useState( false );
	const [ isEmpty, setIsEmpty ] = useState( false );

	const templateData = select( store ).getTemplates();
	const { purchased,unlocked } = select( store ).getUserInfo();

	const [ purchasedData, setPurchasedData ] = useState( [] );
	const [ purchasedTemplates, setPurchasedTemplates ] = useState( [] );

	const [ searchValue, setSearchValue ] = useState( '' );
	const [ defaultTemplates, setDefaultTemplates ] = useState( [] );
	const [ filteredTemplates, setFilteredTemplates ] = useState( [] );

	const searchFilteredTemplates = () => {
		const newFilteredTemplates = defaultTemplates.filter( ( template ) =>
			template.title.toLowerCase().includes( searchValue.toLowerCase() )
		);

		// Update the state with the filtered templates
		setFilteredTemplates( newFilteredTemplates );

		return newFilteredTemplates;
	};


	const renderPurchasedData = ( totalPurchasedData ) => {
		setLoading( false );
		let filteredTemplates = templateData;
		const isElementorEditorActive = document.body.classList.contains(
			'elementor-editor-active'
		);
		if ( isElementorEditorActive ) {
			filteredTemplates = templateData.filter( ( template ) => template.type !== 'pack' );
		}
		
		const purchasedTemplateIds = totalPurchasedData
			.filter(
				( item ) =>
					typeof item === 'object' && ! Array.isArray( item )
			)
			.map( ( obj ) => Object.keys( obj ) )
			.flat()
			.map( Number );

		// Find template data for purchased template_ids
		const purchasedTemplate = filteredTemplates.filter( ( template ) =>
			purchasedTemplateIds.includes( template.template_id )
		);

		setPurchasedTemplates( purchasedTemplate );
		setFilteredTemplates( purchasedTemplate );
		setDefaultTemplates( purchasedTemplate );
	}

	// Component for individual purchase items
	const PurchaseItem = ({ item }) => {
		const [isImageLoaded, setIsImageLoaded] = useState(false);
	
		return (
			<div className="templatiq__content__dashboard__single">
				<Link 
					to={`/template/${item.slug}`} 
					className="templatiq__content__dashboard__item templatiq__content__dashboard__item--name"
				>
					<span 
						to={`/template/${item.slug}`} 
						className={`templatiq__content__dashboard__item__img ${!isImageLoaded ? "loading" : ""}`}
					>
						<img
							src={item.thumbnail}
							alt={item.title}
							onLoad={() => setIsImageLoaded(true)}
						/>
						{
							!isImageLoaded && (
								<span className="image-loader"></span>
							)
						}
					</span>
					<span className="templatiq__content__dashboard__item__title">
						{item.title}
					</span>
				</Link>
				<div className="templatiq__content__dashboard__item templatiq__content__dashboard__item--type">
					<span className="templatiq__content__dashboard__item__text">
						{item.type}
					</span>
				</div>
				<div className="templatiq__content__dashboard__item templatiq__content__dashboard__item--date">
					<span className="templatiq__content__dashboard__item__text">
						{item.date}
					</span>
				</div>
				<div className="templatiq__content__dashboard__item templatiq__content__dashboard__item--date">
					<InsertTemplate
						solidIcon
						item={item}
						innerText={'Insert'}
						className={
						'templatiq__content__dashboard__item__btn templatiq-btn templatiq-btn-success'
						}
					/>
				</div>
			</div>
		);
	};

	useEffect( () => {
		searchFilteredTemplates();
	}, [ searchValue ] );

	useEffect( () => {
		setPurchasedTemplates( filteredTemplates );

		filteredTemplates.length > 0 ? setIsEmpty( false ) : setIsEmpty( true );
	}, [ filteredTemplates ] );

	useEffect( () => {
		setLoading( true );
		const totalPurchasedData = (purchased || [])?.concat(unlocked || []);
		
		purchasedData.length > 0 ? setIsEmpty( true ) : setIsEmpty( false );
		renderPurchasedData(totalPurchasedData);

		// Subscribe to changes in the store's data
		const purchaseSearch = subscribe( () => {
			const searchQuery = select( store ).getSearchQuery();

			setSearchValue( searchQuery );
		} );

		// purchaseSearch when the component is unmounted
		return () => purchaseSearch();
	}, [] );

	return (
		<DashboardLayout>
			<div className="templatiq__content templatiq__content--dashboard">
				<TemplatePackStyle className="templatiq__content__dashboard">
					<div className="templatiq__content__top">
						<div className="templatiq__content_top__filter">
							<h3 className="templatiq__content__top__filter__title">
								{__( 'My Purchase', 'templatiq' )}
							</h3>
						</div>
					</div>
					<DashboardItemsStyle className="templatiq__content__dashboard__downloads">
						<div className="templatiq__content__dashboard__header">
							<div className="templatiq__content__dashboard__item templatiq__content__dashboard__item--name">
								<span className="templatiq__content__dashboard__item__header">
									{__( 'Name', 'templatiq' )}
								</span>
							</div>
							<div className="templatiq__content__dashboard__item templatiq__content__dashboard__item--type">
								<span className="templatiq__content__dashboard__item__header">
									{__( 'Template Type', 'templatiq' )}
								</span>
							</div>
							<div className="templatiq__content__dashboard__item templatiq__content__dashboard__item--date">
								<span className="templatiq__content__dashboard__item__header">
									{__( 'Purchased Date', 'templatiq' )}
								</span>
							</div>
							<div className="templatiq__content__dashboard__item templatiq__content__dashboard__item--insert">
								<span className="templatiq__content__dashboard__item__header">
									{__( 'Insert', 'templatiq' )}
								</span>
							</div>
						</div>
						<div className="templatiq__content__dashboard__items">
							{ loading ? (
								<ContentLoading
									style={ { margin: 0, minHeight: 'unset' } }
								/>
							) : isEmpty ? (
								<EmptyTemplate 
									title="No Purchase Found"
									subTitle="Search Other Templates"
								/>
							) : (
								purchasedTemplates.map( ( item, key ) => (
									<PurchaseItem key={key} item={item} />
								) )
							) }
						</div>
					</DashboardItemsStyle>
				</TemplatePackStyle>
			</div>
		</DashboardLayout>
	);
}