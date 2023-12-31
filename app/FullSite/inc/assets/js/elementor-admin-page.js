/**
 * AJAX Request Queue
 *
 * - add()
 * - remove()
 * - run()
 * - stop()
 *
 * @since 1.0.0
 */

var TemplatiqSitesAjaxQueue = (function () {

	var requests = [];

	return {

		/**
		 * Add AJAX request
		 *
		 * @since 1.0.0
		 */
		add: function (opt) {
			requests.push(opt);
		},

		/**
		 * Remove AJAX request
		 *
		 * @since 1.0.0
		 */
		remove: function (opt) {
			if (jQuery.inArray(opt, requests) > -1)
				requests.splice($.inArray(opt, requests), 1);
		},

		/**
		 * Run / Process AJAX request
		 *
		 * @since 1.0.0
		 */
		run: function () {
			var self = this,
				oriSuc;

			if (requests.length) {
				oriSuc = requests[0].complete;

				requests[0].complete = function () {
					if (typeof (oriSuc) === 'function') oriSuc();
					requests.shift();
					self.run.apply(self, []);
				};

				jQuery.ajax(requests[0]);

			} else {

				self.tid = setTimeout(function () {
					self.run.apply(self, []);
				}, 1000);
			}
		},

		/**
		 * Stop AJAX request
		 *
		 * @since 1.0.0
		 */
		stop: function () {

			requests = [];
			clearTimeout(this.tid);
		}
	};

}());

(function ($) {

	$elscope = {};

	$.fn.isInViewport = function () {

		// If not have the element then return false!
		if (!$(this).length) {
			return false;
		}

		var elementTop = $(this).offset().top;
		var elementBottom = elementTop + $(this).outerHeight();
		var viewportTop = $(window).scrollTop();
		var viewportBottom = viewportTop + $(window).height();

		return elementBottom > viewportTop && elementTop < viewportBottom;
	};

	TemplatiqElementorSitesAdmin = {

		visited_pages: [],
		reset_remaining_posts: 0,
		site_imported_data: null,
		backup_taken: false,
		templateData: {},
		insertData: {},
		log_file: '',
		pages_list: '',
		insertActionFlag: false,
		page_id: '',
		site_id: '',
		block_id: '',
		requiredPlugins: [],
		canImport: false,
		canInsert: false,
		type: 'pages',
		action: '',
		masonryObj: [],
		index: 0,
		blockCategory: '',
		blockColor: '',
		processing: false,
		siteType: '',
		page: 1,
		per_page: 20,

		init: function () {
			this._bind();
		},

		/**
		 * Binds events for the Templatiq Sites.
		 *
		 * @since 1.0.0
		 * @access private
		 * @method _bind
		 */
		_bind: function () {

			if (elementorCommon) {

				let add_section_tmpl = $("#tmpl-elementor-add-section");

				if (add_section_tmpl.length > 0) {

					let action_for_add_section = add_section_tmpl.text();
					let white_label_class = '';
					let stylesheet = '';
					if (astraElementorSites.isWhiteLabeled) {
						white_label_class = " ast-elementor-white-label"
						stylesheet = '<style type="">.elementor-add-ast-site-button.ast-elementor-white-label .eicon-folder:before {content: \'' + astraElementorSites.plugin_name[0] + '\';}</style>'
					}

					action_for_add_section = action_for_add_section.replace('<div class="elementor-add-section-drag-title', stylesheet + '<div class="elementor-add-section-area-button elementor-add-ast-site-button ' + white_label_class + '" title="' + astraElementorSites.plugin_name + '"> <i class="eicon-folder"></i> </div><div class="elementor-add-section-drag-title');

					add_section_tmpl.text(action_for_add_section);

					elementor.on("preview:loaded", function () {

						let base_skeleton = wp.template('ast-template-base-skeleton');
						let header_template = $('#tmpl-ast-template-modal__header').text();

						if ($('#ast-sites-modal').length == 0) {

							$('body').append(base_skeleton());
							$elscope = $('#ast-sites-modal');
							$elscope.find('.templatiq-sites-content-wrap').before(header_template);
						}

						TemplatiqElementorSitesAdmin._populate_color_filters();

						$elscope.find('.astra-blocks-category').select2();

						$elscope.find('.astra-blocks-category').on('select2:select', TemplatiqElementorSitesAdmin._categoryChange);
						$elscope.find('#elementor-template-block-color-filter select').on('change', TemplatiqElementorSitesAdmin._blockColorChange);

						$(elementor.$previewContents[0].body).on("click", ".elementor-add-ast-site-button", TemplatiqElementorSitesAdmin._open);

						// Click events.
						$('body').on("click", ".ast-sites-modal__header__close", TemplatiqElementorSitesAdmin._close);
						$('body').on("click", "#ast-sites-modal .elementor-template-library-menu-item", TemplatiqElementorSitesAdmin._libraryClick);
						$('body').on("click", "#ast-sites-modal .theme-screenshot", TemplatiqElementorSitesAdmin._preview);
						$('body').on("click", "#ast-sites-modal .back-to-layout", TemplatiqElementorSitesAdmin._goBack);
						$('body').on("click", TemplatiqElementorSitesAdmin._closeTooltip);

						$(document).on("click", "#ast-sites-modal .ast-library-template-insert", TemplatiqElementorSitesAdmin._insert);
						$(document).on("click", ".ast-import-elementor-template", TemplatiqElementorSitesAdmin._importTemplate);
						$('body').on("click", "#ast-sites-modal .templatiq-sites-tooltip-icon", TemplatiqElementorSitesAdmin._toggleTooltip);
						$(document).on("click", ".elementor-template-library-menu-item", TemplatiqElementorSitesAdmin._toggle);
						$(document).on('click', '#ast-sites-modal .templatiq-sites__sync-wrap', TemplatiqElementorSitesAdmin._sync);
						$(document).on('click', '#ast-sites-modal .ast-sites-modal__header__logo, #ast-sites-modal .back-to-layout-button', TemplatiqElementorSitesAdmin._home);
						$(document).on('click', '#ast-sites-modal .notice-dismiss', TemplatiqElementorSitesAdmin._dismiss);

						// Other events.
						$elscope.find('.templatiq-sites-content-wrap').scroll(TemplatiqElementorSitesAdmin._loadLargeImages);
						$(document).on('keyup input', '#ast-sites-modal #wp-filter-search-input', TemplatiqElementorSitesAdmin._search);
						$(document).on('change', '#ast-sites-modal .elementor-template-library-order-input', TemplatiqElementorSitesAdmin._changeType);

						// Triggers.
						$(document).on("templatiq-sites__elementor-open-after", TemplatiqElementorSitesAdmin._initSites);
						$(document).on("templatiq-sites__elementor-open-before", TemplatiqElementorSitesAdmin._beforeOpen);
						$(document).on("templatiq-sites__elementor-plugin-check", TemplatiqElementorSitesAdmin._pluginCheck);
						$(document).on('templatiq-sites__elementor-close-before', TemplatiqElementorSitesAdmin._beforeClose);

						$(document).on('templatiq-sites__elementor-do-step-1', TemplatiqElementorSitesAdmin._step1);
						$(document).on('templatiq-sites__elementor-do-step-2', TemplatiqElementorSitesAdmin._step2);

						$(document).on('templatiq-sites__elementor-goback-step-1', TemplatiqElementorSitesAdmin._goStep1);
						$(document).on('templatiq-sites__elementor-goback-step-2', TemplatiqElementorSitesAdmin._goStep2);

						// Plugin install & activate.
						$(document).on('wp-plugin-installing', TemplatiqElementorSitesAdmin._pluginInstalling);
						$(document).on('wp-plugin-install-error', TemplatiqElementorSitesAdmin._installError);
						$(document).on('wp-plugin-install-success', TemplatiqElementorSitesAdmin._installSuccess);

						//open modal on reload after required plugins activated
						TemplatiqElementorSitesAdmin.insertBlockOnRefresh();
					});
				}
			}

		},

		insertBlockOnRefresh() {
			const urlObj = new URL( window.location.href );
			const remoteST = urlObj.searchParams.get( 'remoteST' );
			// Get the value of the "blockID" parameter
			const blockID = urlObj.searchParams.get( 'blockID' );
			const type =
				urlObj.searchParams.get( 'type' ) === 'blocks'
					? 'astra-blocks'
					: 'site-pages';
			
			if ( remoteST && blockID && type ) {
				const data = astraElementorSites['last_viewed_block_data'];
				const templateModel = new Backbone.Model( {
					getTitle() {
						return data?.title;
					},
				} );
				this.requestInsert(
					blockID,
					type,
					templateModel,
					this.afterInsert,
					this.beforeInsert,
					this.failedCallback
				);
				this.removeAddedParams();
			}
		},

		_populate_color_filters: function() {

			if( ! Object.keys( astraElementorSites.templatiq_blocks ).length ) {
				return;
			}

			let template = wp.template('ast-template-block-color-filters');

			var colorFilters = [];

			for( block_id in astraElementorSites.templatiq_blocks ) {
				if( astraElementorSites.templatiq_blocks[ block_id ]['filter'] && ! colorFilters.includes( astraElementorSites.templatiq_blocks[ block_id ]['filter'] )) {
					colorFilters.push( astraElementorSites.templatiq_blocks[ block_id ]['filter'] );
				}
			}

			if( colorFilters.length <= 1 ) {
				return;
			}

			$( '#elementor-template-block-color-filter' ).show().html( template( colorFilters ) );

		},

		_paginateBlocks: function () {
			if (TemplatiqElementorSitesAdmin.type == 'blocks') {
				if (undefined != $elscope.find('.templatiq-sites-library-template:last').offset()) {
					if (($('.dialog-widget-content').scrollTop() + 600) >= ($elscope.find('.templatiq-sites-library-template:last').offset().top)) {
						TemplatiqElementorSitesAdmin.page = (TemplatiqElementorSitesAdmin.page + 1);
						// Set listing HTML.
						TemplatiqElementorSitesAdmin._appendPaginationBlocks(astraElementorSites.templatiq_blocks);
					}
				}
			}
		},

		_changeType: function () {
			TemplatiqElementorSitesAdmin.siteType = $(this).val();
			$elscope.find('#wp-filter-search-input').trigger('keyup');
		},

		_categoryChange: function (event) {
			TemplatiqElementorSitesAdmin.blockCategory = $(this).val();
			$elscope.find('#wp-filter-search-input').trigger('keyup');
		},

		_blockColorChange: function (event) {
			TemplatiqElementorSitesAdmin.blockColor = $(this).val();
			$elscope.find('#wp-filter-search-input').trigger('keyup');
		},

		_dismiss: function () {
			$(this).closest('.ast-sites-floating-notice-wrap').removeClass('slide-in');
			$(this).closest('.ast-sites-floating-notice-wrap').addClass('slide-out');

			setTimeout(function () {
				$(this).closest('.ast-sites-floating-notice-wrap').removeClass('slide-out');
			}, 200);

			if ($(this).closest('.ast-sites-floating-notice-wrap').hasClass('refreshed-notice')) {
				$.ajax({
					url: astraElementorSites.ajaxurl,
					type: 'POST',
					data: {
						action: 'templatiq-sites-update-library-complete',
						_ajax_nonce: astraElementorSites._ajax_nonce,
					},
				}).done(function (response) {
					$('#ast-sites-floating-notice-wrap-id').toggle();
				});

			}
		},

		_done: function (data) {

			console.groupEnd('Process Done.');

			var str = (TemplatiqElementorSitesAdmin.type == 'pages') ? astraElementorSites.template : astraElementorSites.block;
			$elscope.find('.ast-import-elementor-template').removeClass('installing');
			$elscope.find('.ast-import-elementor-template').attr('data-demo-link', data.data.link);
			setTimeout(function () {
				$elscope.find('.ast-import-elementor-template').text('View Saved ' + str);
				$elscope.find('.ast-import-elementor-template').addClass('action-done');
			}, 200);
		},

		_beforeClose: function () {
			if (TemplatiqElementorSitesAdmin.action == 'insert') {
				$elscope.find('.ast-library-template-insert').removeClass('installing');
				$elscope.find('.ast-library-template-insert').text('Imported');
				$elscope.find('.ast-library-template-insert').addClass('action-done');

				if ($elscope.find('.ast-sites-floating-notice-wrap').hasClass('slide-in')) {

					$elscope.find('.ast-sites-floating-notice-wrap').removeClass('slide-in');
					$elscope.find('.ast-sites-floating-notice-wrap').addClass('slide-out');

					setTimeout(function () {
						$elscope.find('.ast-sites-floating-notice-wrap').removeClass('slide-out');
					}, 200);
				}
			}
		},

		_closeTooltip: function (event) {

			if (
				event.target.className !== "ast-tooltip-wrap" &&
				event.target.className !== "dashicons dashicons-editor-help"
			) {
				var wrap = $elscope.find('.ast-tooltip-wrap');
				if (wrap.hasClass('ast-show-tooltip')) {
					$elscope.find('.ast-tooltip-wrap').removeClass('ast-show-tooltip');
				}
			}
		},

		_sync: function (event) {

			event.preventDefault();
			var button = $(this).find('.templatiq-sites-sync-library-button');

			if (button.hasClass('updating-message')) {
				return;
			}

			button.addClass('updating-message');
			$elscope.find('#ast-sites-floating-notice-wrap-id').show().removeClass('error');
			$elscope.find('#ast-sites-floating-notice-wrap-id .ast-sites-floating-notice').html('<span class="message">Syncing template library in the background. The process can take anywhere between 2 to 3 minutes. We will notify you once done.<span><button type="button" class="notice-dismiss"><span class="screen-reader-text">' + astraElementorSites.dismiss_text + '</span></button>');
			$elscope.find('#ast-sites-floating-notice-wrap-id').addClass('slide-in').removeClass('refreshed-notice');

			$.ajax({
				url: astraElementorSites.ajaxurl,
				type: 'POST',
				data: {
					action: 'templatiq-sites-update-library',
					_ajax_nonce: astraElementorSites._ajax_nonce,
				},
			})
				.fail(function (jqXHR) {
					console.log(jqXHR);
				})
				.done(function (response) {

					if (response.success) {
						if ('updated' === response.data) {
							$elscope.find('#ast-sites-floating-notice-wrap-id').addClass('refreshed-notice').find('.ast-sites-floating-notice').html('<span class="message">' + astraElementorSites.syncCompleteMessage + '</span><button type="button" class="notice-dismiss"><span class="screen-reader-text">' + astraElementorSites.dismiss_text + '</span></button>');
							button.removeClass('updating-message');
							console.log('Already sync all the sites.');
						} else {

							// Import categories.
							$.ajax({
								url: astraElementorSites.ajaxurl,
								type: 'POST',
								data: {
									action: 'templatiq-sites-import-all-categories-and-tags',
									_ajax_nonce: astraElementorSites._ajax_nonce,
								},
							})
								.fail(function (jqXHR) {
									console.log(jqXHR);
								});


							// Import categories.
							$.ajax({
								url: astraElementorSites.ajaxurl,
								type: 'POST',
								data: {
									action: 'templatiq-sites-import-all-categories',
									_ajax_nonce: astraElementorSites._ajax_nonce,
								},
							})
								.fail(function (jqXHR) {
									console.log(jqXHR);
								});

							// Import Blocks.
							$.ajax({
								url: astraElementorSites.ajaxurl,
								type: 'POST',
								data: {
									action: 'templatiq-sites-get-blocks-request-count',
									_ajax_nonce: astraElementorSites._ajax_nonce,
								},
								beforeSend: function () {
									console.groupCollapsed('Updating Blocks');
									console.log('Updating Blocks');
								},
							})
								.fail(function (jqXHR) {
									console.log(jqXHR, 'error');
									console.error(jqXHR.status + jqXHR.statusText, 'Blocks Count Request Failed!', jqXHR);
									console.groupEnd('Updating Blocks');
								})
								.done(function (response) {
									console.log(response);
									if (response.success) {
										var total = response.data;

										for (let i = 1; i <= total; i++) {
											TemplatiqSitesAjaxQueue.add({
												url: astraElementorSites.ajaxurl,
												type: 'POST',
												data: {
													action: 'templatiq-sites-import-blocks',
													page_no: i,
													_ajax_nonce: astraElementorSites._ajax_nonce,
												},
												beforeSend: function () {
													console.groupCollapsed('Importing Blocks - Page ' + i);
													console.log('Importing Blocks - Page ' + i);
												},
												success: function (response) {
													console.log(response);
													console.groupEnd('Importing Blocks - Page ' + i);
												}
											});
										}

										// Run the AJAX queue.
										TemplatiqSitesAjaxQueue.run();
									} else {
										console.error(response.data, 'Blocks Count Request Failed!');
									}
								});

							// Import Block Categories.
							$.ajax({
								url: astraElementorSites.ajaxurl,
								type: 'POST',
								data: {
									action: 'templatiq-sites-import-block-categories',
									_ajax_nonce: astraElementorSites._ajax_nonce,
								},
							})
								.fail(function (jqXHR) {
									console.log(jqXHR);
								});

							$.ajax({
								url: astraElementorSites.ajaxurl,
								type: 'POST',
								data: {
									action: 'templatiq-sites-get-sites-request-count',
									_ajax_nonce: astraElementorSites._ajax_nonce,
								},
							})
								.fail(function (jqXHR) {
									console.log(jqXHR);
								})
								.done(function (response) {
									if (response.success) {
										var total = response.data;

										for (let i = 1; i <= total; i++) {
											TemplatiqSitesAjaxQueue.add({
												url: astraElementorSites.ajaxurl,
												type: 'POST',
												data: {
													action: 'templatiq-sites-import-sites',
													page_no: i,
													_ajax_nonce: astraElementorSites._ajax_nonce,
												},
												success: function (result) {

													if (i === total && astraElementorSites.syncCompleteMessage) {
														button.removeClass('updating-message');
														$elscope.find('#ast-sites-floating-notice-wrap-id').addClass('refreshed-notice').find('.ast-sites-floating-notice').html('<span class="message">' + astraElementorSites.syncCompleteMessage + '</span><button type="button" class="notice-dismiss"><span class="screen-reader-text">' + astraElementorSites.dismiss_text + '</span></button>');
													}
												}
											});
										}

										// Run the AJAX queue.
										TemplatiqSitesAjaxQueue.run();
									}
								});
						}
					}
				});
		},

		_toggleTooltip: function (e) {

			var wrap = $elscope.find('.ast-tooltip-wrap');


			if (wrap.hasClass('ast-show-tooltip')) {
				$elscope.find('.ast-tooltip-wrap').removeClass('ast-show-tooltip');
			} else {
				$elscope.find('.ast-tooltip-wrap').addClass('ast-show-tooltip');
			}
		},

		_toggle: function (e) {
			$elscope.find('.elementor-template-library-menu-item').removeClass('elementor-active');

			$elscope.find('.dialog-lightbox-content').hide();

			$elscope.find('.theme-preview').hide();
			$elscope.find('.theme-preview').html('');
			$elscope.find('.theme-preview-block').hide();
			$elscope.find('.theme-preview-block').html('');
			$elscope.find('.ast-template-library-toolbar').show();

			$elscope.find('.dialog-lightbox-content').hide();
			$elscope.find('.dialog-lightbox-content-block').hide();

			$(this).addClass('elementor-active');
			let data_type = $(this).data('template-type');

			TemplatiqElementorSitesAdmin.type = data_type;
			TemplatiqElementorSitesAdmin._switchTo(data_type);
		},

		_home: function () {
			if (TemplatiqElementorSitesAdmin.processing) {
				return;
			}
			$elscope.find('#wp-filter-search-input').val('');
			// Hide Back button.
			$elscope.find('.back-to-layout').css('visibility', 'hidden');
			$elscope.find('.back-to-layout').css('opacity', '0');
			$elscope.find('.elementor-template-library-menu-item:first-child').trigger('click');
		},

		_switchTo: function (type) {
			if ('pages' == type) {
				TemplatiqElementorSitesAdmin._initSites();
				$elscope.find('.dialog-lightbox-content').show();
				$elscope.find('.astra-blocks-category-inner-wrap').hide();
				$elscope.find('.astra-blocks-filter-inner-wrap').hide();
				$elscope.find('.elementor-template-library-order').show();
			} else {
				TemplatiqElementorSitesAdmin._initBlocks();
				$elscope.find('.dialog-lightbox-content-block').show();
				$elscope.find('.astra-blocks-category-inner-wrap').show();
				$elscope.find('.astra-blocks-filter-inner-wrap').show();
				$elscope.find('.elementor-template-library-order').hide();
			}
			$elscope.find('.templatiq-sites-content-wrap').trigger('scroll');
		},

		_importWPForm: function (wpforms_url, callback) {

			if ( ! wpforms_url) {
				if (callback && typeof callback == "function") {
					callback('');
				}
				return;
			}

			$.ajax({
				url: astraElementorSites.ajaxurl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'templatiq-sites-import-wpforms',
					screen: 'elementor',
					id: TemplatiqElementorSitesAdmin.templateData.id,
					_ajax_nonce: astraElementorSites._ajax_nonce,
				},
				beforeSend: function () {
					console.groupCollapsed('Importing WP Forms');
				},
			})
				.fail(function (jqXHR) {
					console.log(jqXHR.status + ' ' + jqXHR.responseText, true);
					console.groupEnd();
				})
				.done(function (data) {

					// 1. Fail - Import WPForms Options.
					if (false === data.success) {
						console.log(data.data);
						console.groupEnd();
					} else {
						if (callback && typeof callback == "function") {
							callback(data);
						}
					}
				});
		},

		_createTemplate: function () {

			console.groupEnd();
			
			// Work with JSON page here
			$.ajax({
				url: astraElementorSites.ajaxurl,
				type: 'POST',
				dataType: 'json',
				data: {
					'action': 'templatiq-sites-create-template',
					'id' : (TemplatiqElementorSitesAdmin.type == 'pages') ? TemplatiqElementorSitesAdmin.page_id?.replace( 'id-', '' ) : TemplatiqElementorSitesAdmin.block_id?.replace( 'id-', '' ),
					'title': TemplatiqElementorSitesAdmin.templateData?.title?.rendered || '',
					'type': ( 'blocks' == TemplatiqElementorSitesAdmin.type ) ? 'astra-blocks' : 'site-pages',
					'_ajax_nonce': astraElementorSites._ajax_nonce,
				},
				beforeSend: function () {
					console.groupCollapsed('Creating Template');
				}
			})
				.fail(function (jqXHR) {
					console.log(jqXHR);
				})
				.done(function (data) {
					TemplatiqElementorSitesAdmin._done(data);
				});
		},

		/**
		 * Install All Plugins.
		 */
		_installAllPlugins: function (not_installed) {

			$.each(not_installed, function (index, single_plugin) {

				console.log('Installing Plugin - ' + single_plugin.name);

				// Add each plugin activate request in Ajax queue.
				// @see wp-admin/js/updates.js
				wp.updates.queue.push({
					action: 'install-plugin', // Required action.
					data: {
						slug: single_plugin.slug
					}
				});
			});

			// Required to set queue.
			wp.updates.queueChecker();
		},

		/**
		 * Activate All Plugins.
		 */
		_activateAllPlugins: function (activate_plugins) {

			$.each(activate_plugins, function (index, single_plugin) {

				console.log('Activating Plugin - ' + single_plugin.name);

				TemplatiqSitesAjaxQueue.add({
					url: astraElementorSites.ajaxurl,
					type: 'POST',
					data: {
						'action': 'astra-required-plugin-activate',
						'init': single_plugin.init,
						'_ajax_nonce': astraElementorSites._ajax_nonce,
					},
					success: function (result) {

						if (result.success) {

							var pluginsList = TemplatiqElementorSitesAdmin.requiredPlugins.inactive;

							// Reset not installed plugins list.
							TemplatiqElementorSitesAdmin.requiredPlugins.inactive = TemplatiqElementorSitesAdmin._removePluginFromQueue(single_plugin.slug, pluginsList);

							// Enable Demo Import Button
							TemplatiqElementorSitesAdmin._enableImport();
						}
					}
				});
			});
			TemplatiqSitesAjaxQueue.run();
		},

		/**
		 * Remove plugin from the queue.
		 */
		_removePluginFromQueue: function (removeItem, pluginsList) {
			return jQuery.grep(pluginsList, function (value) {
				return value.slug != removeItem;
			});
		},

		/**
		 * Get plugin from the queue.
		 */
		_getPluginFromQueue: function (item, pluginsList) {

			var match = '';
			for (ind in pluginsList) {
				if (item == pluginsList[ind].slug) {
					match = pluginsList[ind];
				}
			}
			return match;
		},

		_bulkPluginInstallActivate: function () {

			console.groupCollapsed('Bulk Plugin Install Process Started');

			// If has class the skip-plugins then,
			// Avoid installing 3rd party plugins.
			var not_installed = TemplatiqElementorSitesAdmin.requiredPlugins.notinstalled || '';
			var activate_plugins = TemplatiqElementorSitesAdmin.requiredPlugins.inactive || '';

			console.log(TemplatiqElementorSitesAdmin.requiredPlugins);

			// First Install Bulk.
			if (not_installed.length > 0) {
				TemplatiqElementorSitesAdmin._installAllPlugins(not_installed);
			}

			// Second Activate Bulk.
			if (activate_plugins.length > 0) {
				TemplatiqElementorSitesAdmin._activateAllPlugins(activate_plugins);
			}

			if (activate_plugins.length <= 0 && not_installed.length <= 0) {
				TemplatiqElementorSitesAdmin._enableImport();
			}
		},

		_importTemplate: function (e) {

			if (!TemplatiqElementorSitesAdmin.canImport) {
				if ($(this).attr('data-demo-link') != undefined) {
					window.open($(this).attr('data-demo-link'), '_blank');
				}
				return;
			}

			TemplatiqElementorSitesAdmin.canImport = false;

			var str = (TemplatiqElementorSitesAdmin.type == 'pages') ? astraElementorSites.template : astraElementorSites.block;

			$(this).addClass('installing');
			$(this).text('Saving ' + str + '...');

			TemplatiqElementorSitesAdmin.action = 'import';

			TemplatiqElementorSitesAdmin._bulkPluginInstallActivate();
		},

		_unescape: function (input_string) {
			var title = _.unescape(input_string);

			// @todo check why below character not escape with function _.unescape();
			title = title.replace('&#8211;', '-');

			return title;
		},

		_unescape_lower: function (input_string) {
			input_string = $("<textarea/>").html(input_string).text()
			var input_string = TemplatiqElementorSitesAdmin._unescape(input_string);
			return input_string.toLowerCase();
		},

		_search: function () {

			let search_term = $(this).val() || '';
			search_term = search_term.toLowerCase();

			if ('pages' == TemplatiqElementorSitesAdmin.type) {

				var items = TemplatiqElementorSitesAdmin._getSearchedPages(search_term);

				if (search_term.length) {
					$(this).addClass('has-input');
					TemplatiqElementorSitesAdmin._addSites(items);
				} else {
					$(this).removeClass('has-input');
					TemplatiqElementorSitesAdmin._appendSites(astraElementorSites.default_page_builder_sites);
				}
			} else {

				var items = TemplatiqElementorSitesAdmin._getSearchedBlocks(search_term);

				if (search_term.length) {
					$(this).addClass('has-input');
					TemplatiqElementorSitesAdmin._appendBlocks(items);
				} else {
					$(this).removeClass('has-input');
					TemplatiqElementorSitesAdmin._appendBlocks(astraElementorSites.templatiq_blocks);
				}
			}
		},

		_getSearchedPages: function (search_term) {
			var items = [];
			search_term = search_term.toLowerCase();

			for (site_id in astraElementorSites.default_page_builder_sites) {

				var current_site = astraElementorSites.default_page_builder_sites[site_id];

				// Check in site title.
				if (current_site['title']) {
					var site_title = TemplatiqElementorSitesAdmin._unescape_lower(current_site['title']);

					if (site_title.toLowerCase().includes(search_term)) {

						for (page_id in current_site['pages']) {

							items[page_id] = current_site['pages'][page_id];
							items[page_id]['type'] = 'page';
							items[page_id]['site_id'] = site_id;
							items[page_id]['templatiq-sites-type'] = current_site['templatiq-sites-type'] || '';
							items[page_id]['parent-site-name'] = current_site['title'] || '';
							items[page_id]['pages-count'] = 0;
						}
					}
				}

				// Check in page title.
				if (Object.keys(current_site['pages']).length) {
					var pages = current_site['pages'];

					for (page_id in pages) {

						// Check in site title.
						if (pages[page_id]['title']) {

							var page_title = TemplatiqElementorSitesAdmin._unescape_lower(pages[page_id]['title']);

							if (page_title.toLowerCase().includes(search_term)) {
								items[page_id] = pages[page_id];
								items[page_id]['type'] = 'page';
								items[page_id]['site_id'] = site_id;
								items[page_id]['templatiq-sites-type'] = current_site['templatiq-sites-type'] || '';
								items[page_id]['parent-site-name'] = current_site['title'] || '';
								items[page_id]['pages-count'] = 0;
							}
						}

					}
				}
			}

			return items;
		},

		_getSearchedBlocks: function (search_term) {

			var items = [];

			if (search_term.length) {

				for (block_id in astraElementorSites.templatiq_blocks) {

					var current_site = astraElementorSites.templatiq_blocks[block_id];

					// Check in site title.
					if (current_site['title']) {
						var site_title = TemplatiqElementorSitesAdmin._unescape_lower(current_site['title']);

						if (site_title.toLowerCase().includes(search_term)) {
							items[block_id] = current_site;
							items[block_id]['type'] = 'site';
							items[block_id]['site_id'] = block_id;
						}
					}

				}
			}

			return items;
		},

		_addSites: function (data) {

			if (data) {
				let single_template = wp.template('templatiq-sites-search');
				pages_list = single_template(data);
				$elscope.find('.dialog-lightbox-content').html(pages_list);
				TemplatiqElementorSitesAdmin._loadLargeImages();

			} else {
				$elscope.find('.dialog-lightbox-content').html(wp.template('templatiq-sites-no-sites'));
			}
		},

		_appendSites: function (data) {

			let single_template = wp.template('templatiq-sites-list');
			pages_list = single_template(data);
			$elscope.find('.dialog-lightbox-message-block').hide();
			$elscope.find('.dialog-lightbox-message').show();
			$elscope.find('.dialog-lightbox-content').html(pages_list);
			TemplatiqElementorSitesAdmin._loadLargeImages();
		},

		_appendBlocks: function (data) {

			let single_template = wp.template('astra-blocks-list');
			let blocks_list = single_template(data);
			$elscope.find('.dialog-lightbox-message').hide();
			$elscope.find('.dialog-lightbox-message-block').show();
			$elscope.find('.dialog-lightbox-content-block').html(blocks_list);
			TemplatiqElementorSitesAdmin._masonry();
		},

		_appendPaginationBlocks: function (data) {

			let single_template = wp.template('astra-blocks-list');
			let blocks_list = single_template(data);
			$elscope.find('.dialog-lightbox-message').hide();
			$elscope.find('.dialog-lightbox-message-block').show();
			$elscope.find('.dialog-lightbox-content-block').append(blocks_list);
			TemplatiqElementorSitesAdmin._masonry();
		},

		_masonry: function () {

			//create empty var masonryObj
			var masonryObj;
			var container = document.querySelector('.dialog-lightbox-content-block');
			// initialize Masonry after all images have loaded
			imagesLoaded(container, function () {
				masonryObj = new Masonry(container, {
					itemSelector: '.templatiq-sites-library-template'
				});
			});
		},

		_enableImport: function () {

			console.log('Required Plugins Process Done.');
			console.groupEnd();

			if ( TemplatiqElementorSitesAdmin['initial-page-refresh'] ) {
				TemplatiqElementorSitesAdmin.saveContentAndRefresh();
			} else {
				TemplatiqElementorSitesAdmin.removeAddedParams();
			}

			let form_url = '';
			if ('pages' == TemplatiqElementorSitesAdmin.type) {
				form_url = TemplatiqElementorSitesAdmin.templateData['astra-site-wpforms-path'];
			} else {
				form_url = (undefined != TemplatiqElementorSitesAdmin.templateData['post-meta']) ? TemplatiqElementorSitesAdmin.templateData['post-meta']['astra-site-wpforms-path'] : '';
			}

			if ( !TemplatiqElementorSitesAdmin['initial-page-refresh'] ) {

				TemplatiqElementorSitesAdmin._importWPForm(form_url, function () {
					TemplatiqElementorSitesAdmin.insertData = TemplatiqElementorSitesAdmin.templateData;
					if ('insert' == TemplatiqElementorSitesAdmin.action) {
						TemplatiqElementorSitesAdmin._insertDemo();
					} else {
						TemplatiqElementorSitesAdmin._createTemplate();
					}
				});

			}
		},

		_insert: function (e) {

			if (!TemplatiqElementorSitesAdmin.canInsert) {
				return;
			}

			TemplatiqElementorSitesAdmin.canInsert = false;
			var str = (TemplatiqElementorSitesAdmin.type == 'pages') ? astraElementorSites.template : astraElementorSites.block;

			$(this).addClass('installing');
			if ( !TemplatiqElementorSitesAdmin['initial-page-refresh'] ) {
				$(this).text('Importing ' + str + '...');
			}

			TemplatiqElementorSitesAdmin.action = 'insert';

			TemplatiqElementorSitesAdmin._bulkPluginInstallActivate();
		},

		requestInsert: function (_id, type, templateModel, afterInsert, beforeInsert, failedCallback) {

			$.ajax({
				url: astraElementorSites.ajaxurl,
				type: 'POST',
				data: {
					action: 'astra-page-elementor-insert-page',
					id: _id,
					type: type,
					_ajax_nonce: astraElementorSites._ajax_nonce,
				},
				beforeSend: function () {
					console.groupCollapsed('Inserting Demo.');
				},
			})
			.fail(function (jqXHR) {
				failedCallback(jqXHR);
			})
			.done(function (response) {

				beforeInsert();

				let page_content = response.data;

				page_content = page_content.map(function (item) {
					item.id = Math.random().toString(36).substr(2, 7);
					return item;
				});

				console.log(page_content);
				console.groupEnd();
				if (undefined !== page_content && '' !== page_content) {
					if (undefined != $e && 'undefined' != typeof $e.internal) {
						elementor.channels.data.trigger('document/import', templateModel);
						elementor.getPreviewView().addChildModel(page_content, { at: TemplatiqElementorSitesAdmin.index } || {});
						elementor.channels.data.trigger('template:after:insert', {});
						$e.internal('document/save/set-is-modified', { status: true })
					} else {
						elementor.channels.data.trigger('document/import', templateModel);
						elementor.getPreviewView().addChildModel(page_content, { at: TemplatiqElementorSitesAdmin.index } || {});
						elementor.channels.data.trigger('template:after:insert', {});
						elementor.saver.setFlagEditorChange(true);
					}
				}
				afterInsert();
			});
		},

		beforeInsert: function () {
			TemplatiqElementorSitesAdmin.processing = false;
			$elscope.find('.templatiq-sites-content-wrap').removeClass('processing');
		},

		afterInsert: function () {
			TemplatiqElementorSitesAdmin.insertActionFlag = true;
			TemplatiqElementorSitesAdmin._close();
		},

		failedCallback: function (jqXHR) {
			console.log(jqXHR);
			console.groupEnd();
		},

		_insertDemo: function () {

			var data = TemplatiqElementorSitesAdmin.templateData;

			if (undefined !== data) {

				let templateModel = new Backbone.Model({
					getTitle() {
						return data['title']
					},
				});

				let type = ( 'blocks' == TemplatiqElementorSitesAdmin.type ) ? 'astra-blocks' : 'site-pages';

				this.requestInsert( data['id'], type, templateModel, this.afterInsert, this.beforeInsert, this.failedCallback );
			}
		},

		_goBack: function (e) {

			if (TemplatiqElementorSitesAdmin.processing) {
				return;
			}

			let step = $(this).attr('data-step');

			$elscope.find('#ast-sites-floating-notice-wrap-id.error').hide();

			$elscope.find('.templatiq-sites-step-1-wrap').show();
			$elscope.find('.astra-preview-actions-wrap').remove();

			$elscope.find('.ast-template-library-toolbar').show();
			$elscope.find('.ast-sites-modal__header').removeClass('ast-preview-mode');

			let id = ( 'blocks' === TemplatiqElementorSitesAdmin.type ) ? TemplatiqElementorSitesAdmin.block_id?.replace('id-', '') : TemplatiqElementorSitesAdmin.page_id?.replace('id-', '');

			if ( '' !== id ) {
				$.ajax({
					url: astraElementorSites.ajaxurl,
					type: 'POST',
					data: {
						action: 'templatiq-sites-elementor-flush-request',
						id,
						_ajax_nonce: astraElementorSites._ajax_nonce,
					},
					beforeSend: function () {
						console.groupCollapsed('Deleting cached template data.');
					},
				})
					.fail(function (jqXHR) {
						console.log(jqXHR);
						console.groupEnd();
					})
					.done(function (response) {
						console.log(response);
					});
			}

			if ('pages' == TemplatiqElementorSitesAdmin.type) {

				if (3 == step) {
					$(this).attr('data-step', 2);
					$(document).trigger('templatiq-sites__elementor-goback-step-2');
				} else if (2 == step) {
					$(this).attr('data-step', 1);
					$(document).trigger('templatiq-sites__elementor-goback-step-1');
				}
			} else {
				$(this).attr('data-step', 1);
				$(document).trigger('templatiq-sites__elementor-goback-step-1');
			}

			$elscope.find('.templatiq-sites-content-wrap').trigger('scroll');
		},

		_goStep1: function (e) {


			// Reset site and page ids to null.
			TemplatiqElementorSitesAdmin.site_id = '';
			TemplatiqElementorSitesAdmin.page_id = '';
			TemplatiqElementorSitesAdmin.block_id = '';
			TemplatiqElementorSitesAdmin.requiredPlugins = [];
			TemplatiqElementorSitesAdmin.templateData = {};
			TemplatiqElementorSitesAdmin.canImport = false;
			TemplatiqElementorSitesAdmin.canInsert = false;

			// Hide Back button.
			$elscope.find('.back-to-layout').css('visibility', 'hidden');
			$elscope.find('.back-to-layout').css('opacity', '0');

			// Hide Preview Page.
			$elscope.find('.theme-preview').hide();
			$elscope.find('.theme-preview').html('');
			$elscope.find('.theme-preview-block').hide();
			$elscope.find('.theme-preview-block').html('');
			$elscope.find('.ast-template-library-toolbar').show();

			// Show listing page.
			if (TemplatiqElementorSitesAdmin.type == 'pages') {

				$elscope.find('.dialog-lightbox-content').show();
				$elscope.find('.dialog-lightbox-content-block').hide();

				// Set listing HTML.
				TemplatiqElementorSitesAdmin._appendSites(astraElementorSites.default_page_builder_sites);
			} else {

				// Set listing HTML.
				TemplatiqElementorSitesAdmin._appendBlocks(astraElementorSites.templatiq_blocks);

				$elscope.find('.dialog-lightbox-content-block').show();
				$elscope.find('.dialog-lightbox-content').hide();

				if ('' !== $elscope.find('#wp-filter-search-input').val()) {
					$elscope.find('#wp-filter-search-input').trigger('keyup');
				}
			}
		},

		_goStep2: function (e) {

			// Set page and site ids.
			TemplatiqElementorSitesAdmin.site_id = $elscope.find('#astra-blocks').data('site-id');
			TemplatiqElementorSitesAdmin.page_id = '';

			if (undefined === TemplatiqElementorSitesAdmin.site_id) {
				return;
			}

			// Single Preview template.
			let single_template = wp.template('templatiq-sites-list-search');
			let passing_data = astraElementorSites.default_page_builder_sites[TemplatiqElementorSitesAdmin.site_id]['pages'];
			passing_data['site_id'] = TemplatiqElementorSitesAdmin.site_id;
			pages_list = single_template(passing_data);
			$elscope.find('.dialog-lightbox-content').html(pages_list);

			// Hide Preview page.
			$elscope.find('.theme-preview').hide();
			$elscope.find('.theme-preview').html('');
			$elscope.find('.ast-template-library-toolbar').show();
			$elscope.find('.theme-preview-block').hide();
			$elscope.find('.theme-preview-block').html('');

			// Show listing page.
			$elscope.find('.dialog-lightbox-content').show();
			$elscope.find('.dialog-lightbox-content-block').hide();

			TemplatiqElementorSitesAdmin._loadLargeImages();

			if ('' !== $elscope.find('#wp-filter-search-input').val()) {
				$elscope.find('#wp-filter-search-input').trigger('keyup');
			}
		},

		_step1: function (e) {

			if ('pages' == TemplatiqElementorSitesAdmin.type) {

				let passing_data = astraElementorSites.default_page_builder_sites[TemplatiqElementorSitesAdmin.site_id]['pages'];

				var count = 0;
				var one_page = [];
				var one_page_id = '';

				for (key in passing_data) {
					if (undefined == passing_data[key]['site-pages-type']) {
						continue;
					}
					if ('gutenberg' == passing_data[key]['site-pages-page-builder']) {
						continue;
					}
					count++;
					one_page = passing_data[key];
					one_page_id = key;
				}

				if (count == 1) {

					// Logic for one page sites.
					TemplatiqElementorSitesAdmin.page_id = one_page_id;

					$elscope.find('.back-to-layout').css('visibility', 'visible');
					$elscope.find('.back-to-layout').css('opacity', '1');

					$elscope.find('.back-to-layout').attr('data-step', 2);
					$(document).trigger('templatiq-sites__elementor-do-step-2');

					return;
				}


				let single_template = wp.template('templatiq-sites-list-search');
				passing_data['site_id'] = TemplatiqElementorSitesAdmin.site_id;
				pages_list = single_template(passing_data);
				$elscope.find('.dialog-lightbox-content-block').hide();
				$elscope.find('.templatiq-sites-step-1-wrap').show();
				$elscope.find('.astra-preview-actions-wrap').remove();
				$elscope.find('.theme-preview').hide();
				$elscope.find('.theme-preview').html('');
				$elscope.find('.ast-template-library-toolbar').show();
				$elscope.find('.theme-preview-block').hide();
				$elscope.find('.theme-preview-block').html('');
				$elscope.find('.dialog-lightbox-content').show();
				$elscope.find('.dialog-lightbox-content').html(pages_list);

				TemplatiqElementorSitesAdmin._loadLargeImages();

			} else {

				$elscope.find('.dialog-lightbox-content').hide();
				$elscope.find('.dialog-lightbox-content-block').hide();
				$elscope.find('.dialog-lightbox-message').animate({ scrollTop: 0 }, 50);
				$elscope.find('.theme-preview-block').show();
				$elscope.find('.ast-template-library-toolbar').hide();
				$elscope.find('.ast-sites-modal__header').addClass('ast-preview-mode');

				// Hide.
				$elscope.find('.theme-preview').hide();
				$elscope.find('.theme-preview').html('');

				let import_template = wp.template('templatiq-sites-elementor-preview');
				let import_template_header = wp.template('templatiq-sites-elementor-preview-actions');
				let template_object = astraElementorSites.templatiq_blocks[TemplatiqElementorSitesAdmin.block_id];

				template_object['id'] = TemplatiqElementorSitesAdmin.block_id;

				preview_page_html = import_template(template_object);
				$elscope.find('.theme-preview-block').html(preview_page_html);

				$elscope.find('.templatiq-sites-step-1-wrap').hide();

				preview_action_html = import_template_header(template_object);
				$elscope.find('.elementor-templates-modal__header__items-area').append(preview_action_html);
				TemplatiqElementorSitesAdmin._masonry();

				let actual_id = TemplatiqElementorSitesAdmin.block_id.replace('id-', '');
				$(document).trigger('templatiq-sites__elementor-plugin-check', { 'id': actual_id });
			}
		},

		_step2: function (e) {

			$elscope.find('.dialog-lightbox-content').hide();
			$elscope.find('.dialog-lightbox-message').animate({ scrollTop: 0 }, 50);
			$elscope.find('.theme-preview').show();

			$elscope.find('.ast-sites-modal__header').addClass('ast-preview-mode');

			if (undefined === TemplatiqElementorSitesAdmin.site_id) {
				return;
			}

			let import_template = wp.template('templatiq-sites-elementor-preview');
			let import_template_header = wp.template('templatiq-sites-elementor-preview-actions');
			let template_object = astraElementorSites.default_page_builder_sites[TemplatiqElementorSitesAdmin.site_id]['pages'][TemplatiqElementorSitesAdmin.page_id];

			if (undefined === template_object) {
				return;
			}

			template_object['id'] = TemplatiqElementorSitesAdmin.site_id;

			preview_page_html = import_template(template_object);
			$elscope.find('.theme-preview').html(preview_page_html);

			$elscope.find('.templatiq-sites-step-1-wrap').hide();

			preview_action_html = import_template_header(template_object);
			$elscope.find('.elementor-templates-modal__header__items-area').append(preview_action_html);

			let actual_id = TemplatiqElementorSitesAdmin.page_id.replace('id-', '');
			$(document).trigger('templatiq-sites__elementor-plugin-check', { 'id': actual_id });
		},

		_preview: function (e) {

			if (TemplatiqElementorSitesAdmin.processing) {
				return;
			}

			let step = $(this).attr('data-step');

			TemplatiqElementorSitesAdmin.site_id = $(this).closest('.astra-theme').data('site-id');
			TemplatiqElementorSitesAdmin.page_id = $(this).closest('.astra-theme').data('template-id');
			TemplatiqElementorSitesAdmin.block_id = $(this).closest('.astra-theme').data('block-id');

			$elscope.find('.back-to-layout').css('visibility', 'visible');
			$elscope.find('.back-to-layout').css('opacity', '1');

			$elscope.find('.ast-template-library-toolbar').hide();
			$elscope.find('.ast-sites-modal__header').removeClass('ast-preview-mode');

			if (1 == step) {

				$elscope.find('.back-to-layout').attr('data-step', 2);
				$(document).trigger('templatiq-sites__elementor-do-step-1');

			} else {

				$elscope.find('.back-to-layout').attr('data-step', 3);
				$(document).trigger('templatiq-sites__elementor-do-step-2');

			}
		},

		_pluginCheck: function (e, data) {

			var type = ('blocks' !== TemplatiqElementorSitesAdmin.type) ? 'site-pages' : 'astra-blocks';
			var id = data['id'];

			const generateData = new FormData();
			generateData.append( 'action', 'templatiq-sites-elementor-api-request' );
			generateData.append( 'id', id );
			generateData.append( 'type', type );
			generateData.append( '_ajax_nonce', astraElementorSites._ajax_nonce );

			$.ajax({
				url: astraElementorSites.ajaxurl,
				type: 'POST',
				data: {
					action: 'templatiq-sites-elementor-api-request',
					_ajax_nonce: astraElementorSites._ajax_nonce,
					type: type,
					id: id,
				},
			})
			.fail(function (jqXHR) {
				console.log(jqXHR);
				console.groupEnd();
			})
			.done(function (response) {
				if ( response.success === true ) {
					var data = response.data;
					if ( undefined !== data ) {
						TemplatiqElementorSitesAdmin.templateData = data;
						if (type == 'site-pages') {
							if (undefined !== data['site-pages-required-plugins']) {
								TemplatiqElementorSitesAdmin._requiredPluginsMarkup(data['site-pages-required-plugins']);
							}
						} else {
							if (undefined !== data['post-meta']['astra-blocks-required-plugins']) {
								TemplatiqElementorSitesAdmin._requiredPluginsMarkup(PHP.parse(data['post-meta']['astra-blocks-required-plugins']));
							}
						}
					}
				}
			});
		},

		_requiredPluginsMarkup: function (requiredPlugins) {

			if ('' === requiredPlugins) {
				return;
			}

			if (
				TemplatiqElementorSitesAdmin.type == 'pages' &&
				astraElementorSites.default_page_builder_sites[TemplatiqElementorSitesAdmin.site_id]['templatiq-sites-type'] != undefined &&
				astraElementorSites.default_page_builder_sites[TemplatiqElementorSitesAdmin.site_id]['templatiq-sites-type'] != 'free'
			) {

				if (!astraElementorSites.license_status) {

					output = '<p class="ast-validate">' + astraElementorSites.license_msg + '</p>';

					$elscope.find('.required-plugins-list').html(output);
					$elscope.find('.ast-tooltip-wrap').css('opacity', 1);
					$elscope.find('.templatiq-sites-tooltip').css('opacity', 1);

					/**
					 * Enable Demo Import Button
					 * @type number
					 */
					TemplatiqElementorSitesAdmin.requiredPlugins = [];
					TemplatiqElementorSitesAdmin.canImport = true;
					TemplatiqElementorSitesAdmin.canInsert = true;
					$elscope.find('.templatiq-sites-import-template-action > div').removeClass('disabled');
					return;
				}

			}

			let id = ( 'blocks' === TemplatiqElementorSitesAdmin.type ) ? TemplatiqElementorSitesAdmin.block_id?.replace('id-', '') : TemplatiqElementorSitesAdmin.page_id?.replace('id-', '');

			// Required Required.
			$.ajax({
				url: astraElementorSites.ajaxurl,
				type: 'POST',
				data: {
					action: 'astra-required-plugins',
					id,
					screen: 'elementor',
					_ajax_nonce: astraElementorSites._ajax_nonce,
					required_plugins: requiredPlugins
				},
			})
				.fail(function (jqXHR) {
					console.log(jqXHR);
					console.groupEnd();
				})
				.done(function (response) {
					if (false === response.success) {

						$elscope = $('#ast-sites-modal');
						$elscope.find('#ast-sites-floating-notice-wrap-id').show().removeClass('error');
						$elscope.find('#ast-sites-floating-notice-wrap-id .ast-sites-floating-notice').show().html('<span class="message">Insufficient Permission. Please contact your Super Admin to allow the install required plugin permissions.<span>');
						$elscope.find('#ast-sites-floating-notice-wrap-id').addClass('error slide-in').removeClass('refreshed-notice');

					} else {
						var output = '';

						/**
						 * Count remaining plugins.
						 * @type number
						 */
						var remaining_plugins = 0;
						var required_plugins_markup = '';

						required_plugins = response.data['required_plugins'];

						if (response.data['third_party_required_plugins'].length) {
							$( response.data['third_party_required_plugins'] ).each(function (index, plugin) {
								output += '<li class="plugin-card plugin-card-' + plugin.slug + '" data-slug="' + plugin.slug + '" data-init="' + plugin.init + '" data-name="' + plugin.name + '">' + plugin.name + '</li>';
							});
						}

						/**
						 * Not Installed
						 *
						 * List of not installed required plugins.
						 */
						if (typeof required_plugins.notinstalled !== 'undefined') {

							// Add not have installed plugins count.
							remaining_plugins += parseInt(required_plugins.notinstalled.length);

							$(required_plugins.notinstalled).each(function (index, plugin) {
								if ('elementor' == plugin.slug) {
									return;
								}
								output += '<li class="plugin-card plugin-card-' + plugin.slug + '" data-slug="' + plugin.slug + '" data-init="' + plugin.init + '" data-name="' + plugin.name + '">' + plugin.name + '</li>';
							});
						}

						/**
						 * Inactive
						 *
						 * List of not inactive required plugins.
						 */
						if (typeof required_plugins.inactive !== 'undefined') {

							// Add inactive plugins count.
							remaining_plugins += parseInt(required_plugins.inactive.length);

							$(required_plugins.inactive).each(function (index, plugin) {
								if ('elementor' == plugin.slug) {
									return;
								}
								output += '<li class="plugin-card plugin-card-' + plugin.slug + '" data-slug="' + plugin.slug + '" data-init="' + plugin.init + '" data-name="' + plugin.name + '">' + plugin.name + '</li>';
							});
						}

						/**
						 * Active
						 *
						 * List of not active required plugins.
						 */
						if (typeof required_plugins.active !== 'undefined') {

							$(required_plugins.active).each(function (index, plugin) {
								if ('elementor' == plugin.slug) {
									return;
								}
								output += '<li class="plugin-card plugin-card-' + plugin.slug + '" data-slug="' + plugin.slug + '" data-init="' + plugin.init + '" data-name="' + plugin.name + '">' + plugin.name + '</li>';
							});
						}

						if ('' != output) {
							output = '<li class="plugin-card-head"><strong>' + astraElementorSites.install_plugin_text + '</strong></li>' + output;
							$elscope.find('.required-plugins-list').html(output);
							$elscope.find('.ast-tooltip-wrap').css('opacity', 1);
							$elscope.find('.templatiq-sites-tooltip').css('opacity', 1);
						}


						/**
						 * Enable Demo Import Button
						 * @type number
						 */
						TemplatiqElementorSitesAdmin.requiredPlugins = response.data['required_plugins'];
						TemplatiqElementorSitesAdmin['initial-page-refresh'] = TemplatiqElementorSitesAdmin['requiredPlugins']['notinstalled']?.length || 
																		   TemplatiqElementorSitesAdmin['requiredPlugins']['inactive']?.length ? true : false;
						if ( TemplatiqElementorSitesAdmin['initial-page-refresh'] ) {
							document.querySelectorAll('.templatiq-sites-import-template-action .ast-library-template-insert')[0].innerText = "Install Required Plugins & Import";
						}
						TemplatiqElementorSitesAdmin.canImport = true;
						TemplatiqElementorSitesAdmin.canInsert = true;
						$elscope.find('.templatiq-sites-import-template-action > div').removeClass('disabled');
					}
				});
		},

		removeAddedParams: function () {
			const urlObj = new URL(window.location.href);
			// Check if the query parameters exist
			if (urlObj.searchParams.has("remoteST") && urlObj.searchParams.has("blockID")) {
				// Remove specific query parameters
				urlObj.searchParams.delete("remoteST");
				urlObj.searchParams.delete("blockID");
				urlObj.searchParams.delete("type");

				// Update the URL in the browser
				window.history.replaceState({}, '', urlObj.href);
			}
		},

		saveContentAndRefresh: function () {
			const elementorPanel = document.querySelector('.elementor-panel'); // Get the Elementor panel element

			if (elementorPanel) {
			  const updateButton = elementorPanel.querySelector('#elementor-panel-saver-button-publish'); // Find the Elementor update button

			  if (updateButton) {
				updateButton.click(); // Trigger a click event on the update button
				let id = ( 'blocks' === TemplatiqElementorSitesAdmin.type ) ? TemplatiqElementorSitesAdmin.block_id?.replace('id-', '') : TemplatiqElementorSitesAdmin.page_id?.replace('id-', '');
				if ( id ){
					TemplatiqElementorSitesAdmin.updateURLParams( id );
					window.location.reload(); // Refresh the page
				}
			  }
			}
		},

		updateURLParams: function ( block_id ) {
			// Get the current URL
			var url = new URL(window.location.href);

			// Create a new URLSearchParams object from the URL's search params
			var searchParams = new URLSearchParams(url.search);

			let type = TemplatiqElementorSitesAdmin.type;

			// Add parameters to the searchParams object
			searchParams.append('remoteST', 'true');
			searchParams.append('blockID', block_id);
			searchParams.append('type', type);

			// Update the search property of the URL object with the new search params
			url.search = searchParams.toString();

			// Get the modified URL
			var modifiedUrl = url.toString();

			// Update the browser's live URL
			window.history.pushState({ path: modifiedUrl }, '', modifiedUrl);
		},

		_libraryClick: function (e) {
			$elscope.find(".elementor-template-library-menu-item").each(function () {
				$(this).removeClass('elementor-active');
			});
			$(this).addClass('elementor-active');
		},

		_loadLargeImage: function (el) {

			if (el.hasClass('loaded')) {
				return;
			}

			if (el.parents('.astra-theme').isInViewport()) {
				var large_img_url = el.data('src') || '';
				var imgLarge = new Image();
				imgLarge.src = large_img_url;
				imgLarge.onload = function () {
					el.removeClass('loading');
					el.addClass('loaded');
					el.css('background-image', 'url(\'' + imgLarge.src + '\'');
				};
			}
		},

		_loadLargeImages: function () {
			$elscope.find('.theme-screenshot').each(function (key, el) {
				TemplatiqElementorSitesAdmin._loadLargeImage($(el));
			});
		},

		_close: function (e) {
			console.groupEnd('Process Done.');
			$(document).trigger('templatiq-sites__elementor-close-before');
			setTimeout(function () {
				$elscope.fadeOut();
				$('body').removeClass('templatiq-sites__elementor-open');
			}, 300);
			$(document).trigger('templatiq-sites__elementor-close-after');
		},

		_open: function (e) {
			$(document).trigger('templatiq-sites__elementor-open-before');

			$('body').addClass('templatiq-sites__elementor-open');

			let add_section = $(this).closest('.elementor-add-section');

			if (add_section.hasClass('elementor-add-section-inline')) {
				TemplatiqElementorSitesAdmin.index = add_section.prevAll().length;
			} else {
				TemplatiqElementorSitesAdmin.index = add_section.prev().children().length;
			}
			TemplatiqElementorSitesAdmin._home();
			$elscope.fadeIn();
			if ($('.refreshed-notice').length == 1) {
				setTimeout(
					function () {
						$('.refreshed-notice').find('.notice-dismiss').click();
					},
					2500
				);
			}
			$(document).trigger('templatiq-sites__elementor-open-after');
		},

		_beforeOpen: function (e) {

			let userPrefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
			let uiTheme = elementor.settings.editorPreferences.model.get('ui_theme');

			if ('dark' === uiTheme || ('auto' === uiTheme && userPrefersDark)) {
				$('body').addClass('ast-sites-dark-mode');
			} else {
				$('body').removeClass('ast-sites-dark-mode');
			}

			// Hide preview page.
			$elscope.find('.theme-preview').hide();
			$elscope.find('.theme-preview').html('');

			// Show site listing page.
			$elscope.find('.dialog-lightbox-content').show();

			// Hide Back button.
			$elscope.find('.back-to-layout').css('visibility', 'hidden');
			$elscope.find('.back-to-layout').css('opacity', '0');
		},

		_initSites: function (e) {
			TemplatiqElementorSitesAdmin._appendSites(astraElementorSites.default_page_builder_sites);
			TemplatiqElementorSitesAdmin._goBack();
		},

		_initBlocks: function (e) {
			TemplatiqElementorSitesAdmin._appendBlocks(astraElementorSites.templatiq_blocks);
			TemplatiqElementorSitesAdmin._goBack();
		},

		/**
		 * Install Success
		 */
		_installSuccess: function (event, response) {

			event.preventDefault();

			// Transform the 'Install' button into an 'Activate' button.
			var $init = $('.plugin-card-' + response.slug).data('init');
			var $name = $('.plugin-card-' + response.slug).data('name');

			// Reset not installed plugins list.
			var pluginsList = TemplatiqElementorSitesAdmin.requiredPlugins.notinstalled;
			var curr_plugin = TemplatiqElementorSitesAdmin._getPluginFromQueue(response.slug, pluginsList);

			TemplatiqElementorSitesAdmin.requiredPlugins.notinstalled = TemplatiqElementorSitesAdmin._removePluginFromQueue(response.slug, pluginsList);


			// WordPress adds "Activate" button after waiting for 1000ms. So we will run our activation after that.
			setTimeout(function () {

				console.log('Activating Plugin - ' + curr_plugin.name);

				$.ajax({
					url: astraElementorSites.ajaxurl,
					type: 'POST',
					data: {
						'action': 'astra-required-plugin-activate',
						'init': curr_plugin.init,
						'_ajax_nonce': astraElementorSites._ajax_nonce,
					},
				})
					.done(function (result) {

						if (result.success) {
							var pluginsList = TemplatiqElementorSitesAdmin.requiredPlugins.inactive;

							console.log('Activated Plugin - ' + curr_plugin.name);

							// Reset not installed plugins list.
							TemplatiqElementorSitesAdmin.requiredPlugins.inactive = TemplatiqElementorSitesAdmin._removePluginFromQueue(response.slug, pluginsList);

							// Enable Demo Import Button
							TemplatiqElementorSitesAdmin._enableImport();

						}
					});

			}, 1200);

		},

		/**
		 * Plugin Installation Error.
		 */
		_installError: function (event, response) {
			console.log(response);
			console.log('Error Installing Plugin - ' + response.slug);
			console.log(response.errorMessage);
		},

		/**
		 * Installing Plugin
		 */
		_pluginInstalling: function (event, args) {
			console.log('Installing Plugin - ' + args.slug);
		},
	};

	/**
	 * Initialize TemplatiqElementorSitesAdmin
	 */
	$(function () {
		TemplatiqElementorSitesAdmin.init();
	});

})(jQuery);