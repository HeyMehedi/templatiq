<?php
/**
 * @author  wpWax
 * @since   1.0.0
 * @version 1.0.0
 */

namespace Templatiq\FullTemplate;

use Templatiq\Abstracts\ControllerBase;
use Templatiq\Repositories\DependencyRepository;
use Templatiq\Repositories\FileSystemRepository;
use Templatiq\Repositories\RemoteRepository;
use Templatiq_Sites_Error_Handler;

class Controller extends ControllerBase {

	public string $api_domain;
	public string $api_url;
	public string $search_analytics_url;
	public string $import_analytics_url;
	public string $pixabay_url;
	public string $pixabay_api_key;
	private static $instance        = null;
	public static array $local_vars = [];
	public string $wp_upload_url    = '';

	public function set_site_data() {
		check_ajax_referer( 'templatiq-sites-set-ai-site-data', 'security' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error(
				[
					'success' => false,
					'message' => __( 'You are not authorized to perform this action.', 'templatiq' ),
				]
			);
		}

		$param = isset( $_POST['param'] ) ? sanitize_text_field( $_POST['param'] ) : '';

		if ( empty( $param ) ) {
			wp_send_json_error();
		}

		// error_log( "\n" .'***** Updating Site Data ******');

		switch ( $param ) {

			case 'site-title':
				$business_name = isset( $_POST['business-name'] ) ? sanitize_text_field( stripslashes( $_POST['business-name'] ) ) : '';
				if ( ! empty( $business_name ) ) {
					update_option( 'blogname', $business_name );
					error_log( 'Site Title Added' );
				}

				break;

			case 'site-logo' === $param:
				$logo_id = isset( $_POST['logo'] ) ? sanitize_text_field( $_POST['logo'] ) : '';

				if ( $logo_id ) {
					set_theme_mod( 'custom_logo', $logo_id );
					update_option( 'site_logo', $logo_id );
					error_log( 'Logo Inserted from set_site_data()' );
				}

				break;

			case 'site-colors' === $param:
				$palette = isset( $_POST['palette'] ) ? (array) json_decode( stripslashes( $_POST['palette'] ) ) : [];
				$colors  = isset( $palette['colors'] ) ? (array) $palette['colors'] : [];

				if ( ! empty( $colors ) ) {
					error_log( 'Site Colors Added  from set_site_data()' );
				}

				break;

			case 'site-typography' === $param && function_exists( 'templatiq_get_option' ):
				$typography = isset( $_POST['typography'] ) ? (array) json_decode( stripslashes( $_POST['typography'] ) ) : '';

				$font_size_body = isset( $typography['font-size-body'] ) ? (array) $typography['font-size-body'] : '';
				if ( ! empty( $font_size_body ) && is_array( $font_size_body ) ) {
					// templatiq_update_option( 'font-size-body', $font_size_body );
				}

				if ( ! empty( $typography['body-font-family'] ) ) {
					// templatiq_update_option( 'body-font-family', $typography['body-font-family'] );
				}

				if ( ! empty( $typography['body-font-variant'] ) ) {
					// templatiq_update_option( 'body-font-variant', $typography['body-font-variant'] );
				}

				if ( ! empty( $typography['body-font-weight'] ) ) {
					// templatiq_update_option( 'body-font-weight', $typography['body-font-weight'] );
				}

				if ( ! empty( $typography['body-line-height'] ) ) {
					// templatiq_update_option( 'body-line-height', $typography['body-line-height'] );
				}

				if ( ! empty( $typography['headings-font-family'] ) ) {
					// templatiq_update_option( 'headings-font-family', $typography['headings-font-family'] );
				}

				if ( ! empty( $typography['headings-font-weight'] ) ) {
					// templatiq_update_option( 'headings-font-weight', $typography['headings-font-weight'] );
				}

				if ( ! empty( $typography['headings-line-height'] ) ) {
					// templatiq_update_option( 'headings-line-height', $typography['headings-line-height'] );
				}

				if ( ! empty( $typography['headings-font-variant'] ) ) {
					// templatiq_update_option( 'headings-font-variant', $typography['headings-font-variant'] );
				}

				error_log( 'Site Typography Added' );

				break;
		}

		// error_log( "\n" . '**** Ended Site Data ****' . "\n" );

		wp_send_json_success();
	}

	public function report_error() {
		$api_url = add_query_arg( [], trailingslashit( TEMPLATIQ_API_ENDPOINT ) . 'wp-json/starter-templates/v2/import-error/' );

		if ( ! templatiq_sites_is_valid_url( $api_url ) ) {
			wp_send_json_error(
				[
					'message' => sprintf( __( 'Invalid Request URL - %s', 'templatiq' ), $api_url ),
					'code'    => 'Error',
				]
			);
		}

		$post_id           = ( isset( $_POST['id'] ) ) ? intval( $_POST['id'] ) : 0;
		$user_agent_string = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( $_SERVER['HTTP_USER_AGENT'] ) : '';

		if ( 0 === $post_id ) {
			wp_send_json_error(
				[
					'message' => sprintf( __( 'Invalid Post ID - %d', 'templatiq' ), $post_id ),
					'code'    => 'Error',
				]
			);
		}

		$Repository = new Repository;

		$api_args = [
			'timeout'  => 3,
			'blocking' => true,
			'body'     => [
				'url'        => esc_url( site_url() ),
				'err'        => stripslashes( $_POST['error'] ),
				'id'         => $_POST['id'],
				'logfile'    => $Repository->get_log_file_path(),
				'version'    => TEMPLATIQ_SITES_VER,
				'abspath'    => ABSPATH,
				'user_agent' => $user_agent_string,
				'server'     => [
					'php_version'            => $Repository->get_php_version(),
					'php_post_max_size'      => ini_get( 'post_max_size' ),
					'php_max_execution_time' => ini_get( 'max_execution_time' ),
					'max_input_time'         => ini_get( 'max_input_time' ),
					'php_memory_limit'       => ini_get( 'memory_limit' ),
					'php_max_input_vars'     => ini_get( 'max_input_vars' ), // phpcs:ignore:PHPCompatibility.IniDirectives.NewIniDirectives.max_input_varsFound
				],
			],
		];

		do_action( 'st_before_sending_error_report', $api_args['body'] );

		$request = wp_remote_post( $api_url, $api_args );

		do_action( 'st_after_sending_error_report', $api_args['body'], $request );

		if ( is_wp_error( $request ) ) {
			wp_send_json_error( $request );
		}

		$code = (int) wp_remote_retrieve_response_code( $request );
		$data = json_decode( wp_remote_retrieve_body( $request ), true );

		if ( 200 === $code ) {
			wp_send_json_success( $data );
		}

		wp_send_json_error( $data );
	}

	public function required_plugin( $required_plugins = [], $options = [] ) {
		// Verify Nonce.
		if ( ! defined( 'WP_CLI' ) && wp_doing_ajax() ) {
			check_ajax_referer( 'templatiq-sites', '_ajax_nonce' );
			if ( ! current_user_can( 'edit_posts' ) ) {
				wp_send_json_error();
			}
		}

		$response = [
			'active'       => [],
			'inactive'     => [],
			'notinstalled' => [],
		];

		$id     = isset( $_POST['id'] ) ? absint( $_POST['id'] ) : '';
		$screen = isset( $_POST['screen'] ) ? sanitize_text_field( $_POST['screen'] ) : '';

		if ( 'elementor' === $screen ) {
			$options            = [];
			$imported_demo_data = get_option( 'templatiq_sites_import_elementor_data_' . $id, [] );
			$required_plugins   = isset( $imported_demo_data['site-pages-required-plugins'] ) ? $imported_demo_data['site-pages-required-plugins'] : [];
		} else {
			$options          = templatiq_get_site_data( 'templatiq-site-options-data' );
			$required_plugins = templatiq_get_site_data( 'required-plugins' );
		}

		$data = ( new Repository )->get_required_plugins_data( $response, $required_plugins );

		if ( wp_doing_ajax() ) {
			wp_send_json_success( $data );
		} else {
			return $data;
		}
	}

	public function required_plugin_activate( $init = '', $options = [] ) {
		if ( ! defined( 'WP_CLI' ) && wp_doing_ajax() ) {
			check_ajax_referer( 'templatiq-sites', '_ajax_nonce' );

			if ( ! current_user_can( 'install_plugins' ) || ! isset( $_POST['init'] ) || ! sanitize_text_field( $_POST['init'] ) ) {
				wp_send_json_error(
					[
						'success' => false,
						'message' => __( 'Error: You don\'t have the required permissions to install plugins.', 'templatiq' ),
					]
				);
			}
		}

		Templatiq_Sites_Error_Handler::get_instance()->start_error_handler();

		$plugin_init = ( isset( $_POST['init'] ) ) ? esc_attr( sanitize_text_field( $_POST['init'] ) ) : $init;
		$activate    = activate_plugin( $plugin_init, '', false, false );

		Templatiq_Sites_Error_Handler::get_instance()->stop_error_handler();

		if ( is_wp_error( $activate ) ) {
			if ( wp_doing_ajax() ) {
				wp_send_json_error(
					[
						'success' => false,
						'message' => $activate->get_error_message(),
					]
				);
			}
		}

		$options = templatiq_get_site_data( 'templatiq-site-options-data' );
		( new Repository )->after_plugin_activate( $plugin_init, $options );

		if ( wp_doing_ajax() ) {
			wp_send_json_success(
				[
					'success' => true,
					'message' => __( 'Plugin Activated', 'templatiq' ),
				]
			);
		}
	}

	public function backup_settings() {
		if ( ! defined( 'WP_CLI' ) && wp_doing_ajax() ) {
			check_ajax_referer( 'templatiq-sites', '_ajax_nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( __( 'User does not have permission!', 'templatiq' ) );
			}
		}

		( new Backup )->settings();

		if ( wp_doing_ajax() ) {
			wp_send_json_success();
		}
	}

	public function get_reset_data() {
		if ( wp_doing_ajax() ) {
			check_ajax_referer( 'templatiq-sites', '_ajax_nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( __( 'You are not allowed to perform this action', 'templatiq' ) );
			}
		}

		$data = ( new Reset )->get_data();

		if ( wp_doing_ajax() ) {
			wp_send_json_success( $data );
		}

		return $data;
	}

	public function reset_terms_and_forms() {
		if ( wp_doing_ajax() ) {
			check_ajax_referer( 'templatiq-sites', '_ajax_nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( __( 'You are not allowed to perform this action', 'templatiq' ) );
			}
		}

		( new Reset )->terms_and_forms();

		if ( wp_doing_ajax() ) {
			wp_send_json_success();
		}
	}

	public function reset_posts() {
		if ( wp_doing_ajax() ) {
			check_ajax_referer( 'templatiq-sites', '_ajax_nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( __( 'You are not allowed to perform this action', 'templatiq' ) );
			}
		}

		( new Reset )->posts();

		if ( wp_doing_ajax() ) {
			wp_send_json_success();
		}

		wp_send_json_error();
	}

	public function activate_theme() {
		check_ajax_referer( 'templatiq-sites', '_ajax_nonce' );

		if ( ! current_user_can( 'customize' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action', 'templatiq' ) );
		}

		( new DependencyRepository )->activate_theme();

		wp_send_json_success(
			[
				'success' => true,
				'message' => __( 'Theme Activated', 'templatiq' ),
			]
		);
	}

	public function get_deleted_post_ids() {
		if ( wp_doing_ajax() ) {
			check_ajax_referer( 'templatiq-sites', '_ajax_nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( __( 'You are not allowed to perform this action', 'templatiq' ) );
			}
		}

		wp_send_json_success( templatiq_sites_get_reset_post_data() );
	}

	public function api_request() {
		check_ajax_referer( 'templatiq-sites', '_ajax_nonce' );

		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error();
		}

		$template_id = (int) $_POST['template_id'] ?? 0;

		if ( empty( $template_id ) ) {
			wp_send_json_error(
				[
					'message' => __( 'Provided template_id is empty! Please try again!', 'templatiq' ),
					'code'    => 'Error',
				]
			);
		}

		$response = ( new RemoteRepository() )
			->get_full_template( $template_id );

		update_option( 'templatiq_sites_import_data', $response, 'no' );

		wp_send_json_success( $response );
	}

	public function filesystem_permission() {
		if ( ! defined( 'WP_CLI' ) && wp_doing_ajax() ) {
			check_ajax_referer( 'templatiq-sites', '_ajax_nonce' );

			if ( ! current_user_can( 'customize' ) ) {
				wp_send_json_error( __( 'You do not have permission to perform this action.', 'templatiq' ) );
			}
		}

		wp_send_json_success(
			( new FileSystemRepository )->check_permission()
		);
	}
}