;
(function ($, elementor, tm) {

	var Library = {
		Behaviors: {},
		Layout: null,
		Manager: null,
	};

	// Perfect
	Library.Behaviors.InsertTemplate = Marionette.Behavior.extend({
		ui: {
			insertButton: '.tmTemplateLibrary__insert-button',
		},

		events: {
			'click @ui.insertButton': 'onInsertButtonClick',
		},

		onInsertButtonClick: function () {
			// window.tm.view = this.view.model;

			tm.library.insertTemplate({
				model: this.view.model,
			});
		},
	});
	
	// Perfect
	Library.Modal = elementorModules.common.views.modal.Layout.extend({
		getModalOptions: function () {
			return {
				id: 'tmTemplateLibrary__modal',
				hide: {
					onOutsideClick: false,
					onEscKeyPress: true,
					onBackgroundClick: true,
				}
			};
		},
	});

	// Perfect
	Library.Manager = function () {
		var modal,
			self = this,
			templatesCollection,
			FIND_SELECTOR = '.elementor-add-new-section .elementor-add-section-drag-title',
			$openLibraryButton = `<div class="elementor-add-section-area-button elementor-add-tm-button" style="padding:10px;align-items:center"> 
			<svg width="23" height="23" viewbox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clip-path="url(#clip0_1411_1790)">
				<path d="M11.385 0C5.106 0 0 5.106 0 11.385C0 17.664 5.106 22.77 11.385 22.77C17.664 22.77 22.77 17.664 22.77 11.385C22.77 5.106 17.664 0 11.385 0ZM18.538 11.868C18.423 13.501 17.825 14.927 16.744 16.146C15.801 17.204 14.628 17.94 13.271 18.308C12.926 18.4 12.581 18.469 12.236 18.515C11.845 18.561 11.431 18.584 11.04 18.561C9.499 18.492 8.119 17.963 6.9 17.02C5.773 16.123 4.991 14.996 4.531 13.639C4.393 13.202 4.278 12.742 4.232 12.282C4.209 12.098 4.186 11.891 4.186 11.707C4.186 11.638 4.186 11.638 4.255 11.638H8.579C8.648 11.638 8.648 11.638 8.648 11.707C8.625 12.006 8.579 12.282 8.556 12.581C8.533 12.857 8.51 13.133 8.464 13.409C8.441 13.731 8.395 14.053 8.372 14.352C8.349 14.628 8.326 14.904 8.28 15.18C8.28 15.295 8.28 15.387 8.257 15.502C8.188 16.031 8.556 16.491 9.062 16.583C9.108 16.583 9.177 16.583 9.223 16.583C9.614 16.583 10.028 16.583 10.419 16.583C10.902 16.583 11.316 16.238 11.385 15.755C11.385 15.617 11.408 15.502 11.431 15.364C11.454 15.134 11.477 14.881 11.5 14.651C11.523 14.421 11.546 14.191 11.569 13.961C11.592 13.731 11.615 13.501 11.638 13.271C11.638 13.087 11.684 12.903 11.684 12.719C11.707 12.489 11.73 12.236 11.753 12.006C11.753 11.891 11.753 11.799 11.776 11.684C11.776 11.661 11.776 11.638 11.822 11.638C11.822 11.638 11.845 11.638 11.868 11.638C12.558 11.638 13.248 11.638 13.938 11.638C14.329 11.638 14.72 11.408 14.858 10.994C14.881 10.902 14.904 10.81 14.927 10.695C14.973 10.396 15.042 10.097 15.088 9.798C15.18 9.269 14.835 8.763 14.306 8.671C14.237 8.671 14.191 8.671 14.122 8.671C13.018 8.671 11.891 8.671 10.787 8.671C10.166 8.671 9.637 8.464 9.2 8.027C8.855 7.682 8.648 7.291 8.556 6.808C8.533 6.67 8.533 6.532 8.533 6.394C8.533 6.279 8.533 6.141 8.533 6.026C8.556 5.589 8.74 5.198 9.016 4.876C9.2 4.669 9.43 4.508 9.683 4.416C9.775 4.37 9.867 4.37 9.959 4.347C10.488 4.232 11.04 4.209 11.569 4.209C12.811 4.255 13.961 4.577 15.019 5.221C16.514 6.118 17.549 7.406 18.124 9.039C18.285 9.453 18.377 9.89 18.446 10.35C18.515 10.856 18.538 11.362 18.515 11.868H18.538Z" fill="#000000"></path>
				</g>
				<defs>
					<clippath id="clip0_1411_1790">
						<rect width="23" height="23" fill="white"></rect>
					</clippath>
				</defs>
			</svg>
			</div>`;

		this.atIndex = -1;

		this.channels = {
			tabs: Backbone.Radio.channel('tabs'),
			templates: Backbone.Radio.channel('templates'),
		};

		function onAddElementButtonClick() {
			var $topSection = $(this).closest('.elementor-top-section'),
				sectionId = $topSection.data('id'),
				documentSections = elementor.documents.getCurrent().container.children,
				$addSection = $topSection.prev('.elementor-add-section');

			if (documentSections) {
				_.each(documentSections, function (sectionContainer, index) {
					if (sectionId === sectionContainer.id) {
						self.atIndex = index
					}
				});
			}

			if (!$addSection.find('.elementor-add-tm-button').length) {
				$addSection
					.find(FIND_SELECTOR)
					.before($openLibraryButton);
			}
		}

		function addLibraryModalOpenButton($previewContents) {
			var $addNewSection = $previewContents.find(FIND_SELECTOR);

			if ($addNewSection.length && ! $previewContents.find('.elementor-add-tm-button').length) {
				$addNewSection.before($openLibraryButton);
			}

			$previewContents.on(
				'click.onAddElement',
				'.elementor-editor-section-settings .elementor-editor-element-add',
				onAddElementButtonClick
			);
		}

		function onPreviewLoaded() {
			var $previewContents = window.elementor.$previewContents,
				time = setInterval(function () {
					addLibraryModalOpenButton($previewContents);
					$previewContents.find('.elementor-add-new-section').length > 0 && clearInterval(time);
				}, 100);

			$previewContents.on(
				'click.onAddTemplateButton',
				'.elementor-add-tm-button',
				self.showModal.bind(self)
			);
		}
	
		this.showModal = function () {
			self.getModal().showModal();
			self.showTemplatesView();
		};

		this.closeModal = function () {
			this.getModal().hideModal();
		};

		this.getModal = function () {
			if (!modal) {
				modal = new Library.Modal();
			}

			return modal;
		};

		this.init = function () {
			elementor.on('preview:loaded', onPreviewLoaded.bind(this));
		}

		this.showTemplatesView = function () {
			if (!templatesCollection) {
				self.loadTemplates(function () {
					self.getModal().showTemplatesView(templatesCollection);
				});
			} else {
				self.getModal().showTemplatesView(templatesCollection);
			}
		};
		
		this.loadTemplates = function (onUpdate) {
			const containerDiv = document.querySelector('.elementor-templates-modal .dialog-content');
			const templatiqRoot = document.querySelector('.templatiq-root');
			
			if (!templatiqRoot) {
				const rootDiv = document.createElement('div');
				rootDiv.className = 'templatiq-root';
				rootDiv.id = 'templatiq-root';

				containerDiv.appendChild(rootDiv);
				wp.hooks.doAction('templatiq_load_admin_app', rootDiv);
			}
		};

		this.requestTemplateData = function (template_id, ajaxOptions) {
			var options = {
				unique_id: template_id,
				data: {
					edit_mode: true,
					display: true,
					template_id: template_id,
				},
			};

			if (ajaxOptions) {
				jQuery.extend(true, options, ajaxOptions);
			}

			elementorCommon.ajax.addRequest('get_templatiq_template_data', options);
		};

		this.insertTemplate = function (args, template_id) {
			var model = args.model,
				self = this;

			self.getModal().showLoadingView();

			self.requestTemplateData(template_id, {
				success: function (data) {
					self.getModal().hideLoadingView();
					self.getModal().hideModal();

					var options = {}

					if (self.atIndex !== -1) {
						options.at = self.atIndex;
					}

					$e.run('document/elements/import', {
						model: model,
						data: data,
						options: options
					});

					self.atIndex = -1;
				},
				error: function (data) {
					self.showErrorDialog(data);
				},
				complete: function (data) {
					self.getModal().hideLoadingView();
					window.elementor.$previewContents.find('.elementor-add-section .elementor-add-section-close').click();
				},
			});
		};
	};

	tm.library = new Library.Manager();
	tm.library.init();

	window.tm = tm;
}(jQuery, window.elementor, window.tm || {}));