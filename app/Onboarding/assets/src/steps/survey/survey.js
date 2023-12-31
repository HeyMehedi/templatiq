import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';

const SurveyForm = ( { updateFormDetails } ) => {
	const [ selectedIndex, setSelectedIndex ] = useState( {
		option1: 0,
		option2: 0,
	} );

	return (
		<>
			<p className="label-text row-label">
				{ __( 'Tell us a little bit about yourself', 'templatiq-sites' ) }
			</p>
			<div className="survey-fields-wrap">
				<input
					type="text"
					className="survey-text-input"
					name="first_name"
					placeholder={ __( 'Your First Name', 'templatiq-sites' ) }
					onChange={ ( e ) =>
						updateFormDetails( 'first_name', e.target.value )
					}
				/>
				<input
					type="email"
					className="survey-text-input"
					name="email"
					placeholder={ __( 'Your Work Email', 'templatiq-sites' ) }
					onChange={ ( e ) =>
						updateFormDetails( 'email', e.target.value )
					}
				/>
				<select
					name="wp_user_type"
					className={
						selectedIndex.option1 !== 0
							? 'survey-select-input'
							: 'survey-select-input initial'
					}
					defaultValue=""
					onBlur={ ( e ) =>
						updateFormDetails( 'wp_user_type', e.target.value )
					}
					onChange={ ( e ) => {
						updateFormDetails( 'wp_user_type', e.target.value );
						setSelectedIndex( {
							...selectedIndex,
							option1: e.target.selectedIndex,
						} );
					} }
				>
					<option value="" disabled>
						{ __( 'I am…', 'templatiq-sites' ) }
					</option>
					<option value="1">
						{ __( 'Beginner', 'templatiq-sites' ) }
					</option>
					<option value="2">
						{ __( 'Intermediate', 'templatiq-sites' ) }
					</option>
					<option value="3">{ __( 'Expert', 'templatiq-sites' ) }</option>
				</select>
				<select
					name="build_website_for"
					className={
						selectedIndex.option2 !== 0
							? 'survey-select-input'
							: 'survey-select-input initial'
					}
					defaultValue=""
					onBlur={ ( e ) =>
						updateFormDetails( 'build_website_for', e.target.value )
					}
					onChange={ ( e ) => {
						setSelectedIndex( {
							...selectedIndex,
							option2: e.target.selectedIndex,
						} );
					} }
				>
					<option value="" disabled>
						{ __( 'I am building website for…', 'templatiq-sites' ) }
					</option>
					<option value="1">
						{ __( 'Myself/My Company', 'templatiq-sites' ) }
					</option>
					<option value="2">
						{ __( 'My Client', 'templatiq-sites' ) }
					</option>
				</select>
			</div>
			<label
				className="subscription-agreement-checkbox-label"
				htmlFor="OPT_IN"
			>
				<input
					className="subscription-agreement-checkbox"
					type="checkbox"
					name="OPT_IN"
					id="OPT_IN"
					value={ false }
					onChange={ ( event ) =>
						updateFormDetails( 'opt_in', event.target.checked )
					}
				/>
				{ __(
					'I agree to receive your newsletters and accept the data privacy statement.',
					'templatiq-sites'
				) }
			</label>
		</>
	);
};

export default SurveyForm;