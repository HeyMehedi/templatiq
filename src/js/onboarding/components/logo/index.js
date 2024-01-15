// import { Logo as SiteLogo } from '@brainstormforce/starter-templates-components';
import { __ } from '@wordpress/i18n';
import './style.scss';
import { whiteLabelEnabled, getWhileLabelName } from '../../utils/functions';
const { imageDir } = starterTemplates;

const Logo = () => {
	return (
		<div className="branding-wrap">
			{ whiteLabelEnabled() ? (
				<h3>{ getWhileLabelName() }</h3>
			) : (
				// <SiteLogo
				// 	className="ist-logo"
				// 	src={ `${ imageDir }logo.svg` }
				// 	alt={ __( 'Starter Templates', 'templatiq-sites' ) }
				// 	href={ templatiqSitesVars.st_page_url }
				// />
				<img src={templatiqSitesVars.st_page_url} alt={ __( 'Starter Templates', 'templatiq-sites' ) } />
			) }
		</div>
	);
};

export default Logo;
