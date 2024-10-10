import SignInContent from '@modules/SignIn/SignInContent';
import SignUpContent from '@modules/SignUp/SignUpContent';
import { useState } from '@wordpress/element';
import ReactSVG from 'react-inlinesvg';
import { AuthModalStyle } from './style';

import closeIcon from '@icon/close.svg';

const AuthModal = ( { slug, onClose } ) => {
	const [ signUpModal, openSignUpModal ] = useState( false );
	const [isSignedUp, setIsSignedUp] = useState(false);

	let closeAuthModal = () => {
		let templatiqRoot = document.querySelector( '.templatiq' );

		templatiqRoot &&
			templatiqRoot.classList.remove( 'templatiq-overlay-enable' );

		onClose();
	};

	let openAnotherModal = ( e ) => {
		e.preventDefault();
		openSignUpModal( ! signUpModal );
	};

	return (
		<AuthModalStyle className="templatiq__modal">
			{ ! signUpModal ?
			 	<SignInContent slug={slug} /> : 
				<SignUpContent setIsSignedUp={setIsSignedUp} /> 
			}
			<button
				className="templatiq__modal__cancel__button"
				onClick={ closeAuthModal }
			>
				<ReactSVG src={ closeIcon } width={ 20 } height={ 20 } />
			</button>
			{/* {!isSignedUp && (
				<div className="templatiq__modal__bottom">
					{!signUpModal
						?  __( "Don't have an account?", 'templatiq' )
						:  __( 'Already have an account?', 'templatiq' )}{' '}
					<a
						href="#"
						className="templatiq__modal__another__btn"
						onClick={openAnotherModal}
					>
						{!signUpModal ? __( 'Sign up', 'templatiq' ) :  __( 'Sign in', 'templatiq' ) }
					</a>
				</div>
			)} */}
		</AuthModalStyle>
	);
};

export default AuthModal;
