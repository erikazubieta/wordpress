/* global FusionApp, fusionOptionNetworkNames */
/* jshint -W098, -W116 */
var fusionSanitize = { // eslint-disable-line no-unused-vars

	/**
	 * Gets the customizer settings, or fusionApp settings.
	 *
	 * @since 2.0
	 * @return {Object} - Returns the options object.
	 */
	getSettings: function() {
		var settings = {};
		if ( 'undefined' !== typeof window.wp && 'undefined' !== typeof window.wp.customize ) {
			return window.wp.customize.get();
		}
		if ( 'undefined' !== typeof FusionApp ) {
			if ( 'undefined' !== typeof FusionApp.settings ) {
				settings = jQuery.extend( settings, FusionApp.settings );
			}
			if ( 'undefined' !== typeof FusionApp.data && 'undefined' !== typeof FusionApp.data.postMeta ) {
				settings = jQuery.extend( settings, FusionApp.data.postMeta );
			}
		}
		_.each( settings, function( value, key ) {
			if ( 'object' === typeof value ) {
				_.each( value, function( subVal, subKey ) {
					settings[ key + '[' + subKey + ']' ] = subVal;
				} );
			}
		} );
		return settings;
	},

	/**
	 * Get theme option or page option.
	 * This is a port of the fusion_get_option() PHP function.
	 * We're skipping the 3rd param of the PHP function (post_ID)
	 * because in JS we're only dealing with the current post.
	 *
	 * @param {string} themeOption - Theme option ID.
	 * @param {string} pageOption - Page option ID.
	 * @param {number} postID - Post/Page ID.
	 * @return {string} - Theme option or page option value.
	 */
	getOption: function( themeOption, pageOption ) {
		var self     = this,
			themeVal = '',
			pageVal  = '';

		// Get the theme value.
		if ( 'undefined' !== typeof this.getSettings()[ themeOption ] ) {
			themeVal = self.getSettings()[ themeOption ];
		} else {
			_.each( fusionOptionNetworkNames, function( val, key ) {
				if ( themeOption === key && val.theme ) {
					themeVal = self.getSettings()[ val.theme ];
				}
			} );
		}

		// Get the page value.
		pageOption = pageOption || themeOption;
		pageVal    = this.getPageOption( pageOption, true );
		_.each( fusionOptionNetworkNames, function( val, key ) {
			if ( themeOption === key ) {

				if ( val.post ) {
					pageVal = self.getPageOption( val.post, true );
				}

				if ( ! pageVal && val.term ) {
					pageVal = self.getPageOption( val.term, false );
				}

				if ( ! pageVal && val.archive ) {
					pageVal = self.getPageOption( val.archive, false );
				}
			}
		} );

		if ( themeOption && pageOption && 'default' !== pageVal && ! _.isEmpty( pageVal ) ) {
			return pageVal;
		}
		return -1 === themeVal.indexOf( '/' ) ? themeVal.toLowerCase() : themeVal;
	},

	/**
	 * Get page option value.
	 * This is a port of the fusion_get_page_option() PHP function.
	 * We're skipping the 3rd param of the PHP function (post_ID)
	 * because in JS we're only dealing with the current post.
	 *
	 * @param {string} option - ID of page option.
	 * @param {boolean}   addPyre - Whether the "pyre_" prefix should be added or not.
	 * @return {string} - Value of page option.
	 */
	getPageOption: function( option, addPyre ) {
		addPyre = ( 'undefined' === typeof addPyre ) ? true : addPyre;
		if ( option ) {
			if ( addPyre && 0 !== option.indexOf( 'pyre_' ) ) {
				option = 'pyre_' + option;
			}

			if ( ! _.isUndefined( FusionApp ) && ! _.isUndefined( FusionApp.data.postMeta ) && ! _.isUndefined( FusionApp.data.postMeta[ option ] ) ) {
				return FusionApp.data.postMeta[ option ];
			}
		}
		return '';
	},

	/**
	 * Sets the alpha channel of a color,
	 *
	 * @since 2.0.0
	 * @param {string}           value - The color we'll be adjusting.
	 * @param {string|number} adjustment - The alpha value.
	 * @return {string} - RBGA color, ready to be used in CSS.
	 */
	color_alpha_set: function( value, adjustment ) {
		var color  = jQuery.Color( value ),
			adjust = Math.abs( adjustment );

		if ( 1 < adjust ) {
			adjust = adjust / 100;
		}
		return color.alpha( adjust ).toRgbaString();
	},

	/**
	 * Returns the value if the conditions are met
	 * If they are not, then returns empty string.
	 *
	 * @since 2.0.0
	 * @param {mixed} value - The value.
	 * @param {Array} args - The arguments
	 *                       {
	 *                           conditions: [
	 *                               {option1, '===', value1},
	 *                               {option2, '!==', value2},
	 *                           ],
	 *                           value_pattern: [value, fallback]
	 *                       }
	 * @return {string} The condition check result.
	 */
	conditional_return_value: function( value, args ) {
		var self       = this,
			checks     = [],
			subChecks  = [],
			finalCheck = true,
			fallback   = '',
			success    = '$';

		if ( args.value_pattern ) {
			success  = args.value_pattern[ 0 ];
			fallback = args.value_pattern[ 1 ];
		}

		_.each( args.conditions, function( arg, i ) {
			if ( 'undefined' !== typeof arg[ 0 ] ) {
				switch ( arg[ 1 ] ) {
				case '===':
					checks[ i ] = ( self.getSettings()[ arg[ 0 ] ] === arg[ 2 ] );
					break;
				case '>':
					checks[ i ] = ( parseFloat( self.units_to_px( self.getSettings()[ arg[ 0 ] ] ) ) > parseFloat( arg[ 2 ] ) );
					break;
				case '>=':
					checks[ i ] = ( parseFloat( self.units_to_px( self.getSettings()[ arg[ 0 ] ] ) ) >= parseFloat( arg[ 2 ] ) );
					break;
				case '<':
					checks[ i ] = ( parseFloat( self.units_to_px( self.getSettings()[ arg[ 0 ] ] ) ) < parseFloat( arg[ 2 ] ) );
					break;
				case '<=':
					checks[ i ] = ( parseFloat( self.units_to_px( self.getSettings()[ arg[ 0 ] ] ) ) <= parseFloat( arg[ 2 ] ) );
					break;
				case '!==':
					checks[ i ] = ( self.getSettings()[ arg[ 0 ] ] !== arg[ 2 ] );
					break;
				case 'in':
					subChecks = [];
					_.each( arg[ 2 ], function( subArg, k ) {
						subChecks[ k ] = ( self.getSettings()[ arg[ 0 ] ] !== subArg );
					} );
					checks[ i ] = true;
					_.each( subChecks, function( subVal ) {
						if ( ! subVal ) {
							checks[ i ] = false;
						}
					} );
					break;
				case 'true':
					checks[ i ] = ( true === self.getSettings()[ arg[ 0 ] ] || 'true' === self.getSettings()[ arg[ 0 ] ] || 1 === self.getSettings()[ arg[ 0 ] ] || '1' === self.getSettings()[ arg[ 0 ] ] || 'yes' === self.getSettings()[ arg[ 0 ] ] );
					break;
				}
			}
		} );

		_.each( checks, function( check ) {
			if ( ! check ) {
				finalCheck = false;
			}
		} );
		if ( false === finalCheck ) {
			return fallback.replace( /\$/g, value );
		}
		return success.replace( /\$/g, value );
	},

	/**
	 * Takes any valid CSS unit and converts to pixels.
	 *
	 * @since 2.0.0
	 * @param {string}     value - The CSS value.
	 * @param {string|number} emSize - The size in pixels of an em.
	 * @param {string|number} screenSize - The screen-width in pixels.
	 * @return {number} - The fontsize.
	 */
	units_to_px: function( value, emSize, screenSize ) {
		var number = parseFloat( value ),
			units  = value.replace( /\d+([,.]\d+)?/g, '' );

		screenSize = screenSize || 1600;

		if ( 'em' === units || 'rem' === units ) {
			emSize = emSize || 16;
			return parseInt( number * emSize, 10 );
		}
		if ( '%' === units ) {
			return parseInt( number * screenSize / 100, 10 );
		}
		return parseInt( value, 10 );
	},

	/**
	 * If value is numeric append "px".
	 *
	 * @since 2.0
	 * @param {string} value - The CSS value.
	 * @return {string} - The value including pixels unit.
	 */
	maybe_append_px: function( value ) {
		return ( ! isNaN( value ) ) ? value + 'px' : value;
	},

	/**
	 * Returns a string when the color is solid (alpha = 1).
	 *
	 * @since 2.0.0
	 * @param {string} value - The color.
	 * @param {Object} args - An object with the values we'll return depending if transparent or not.
	 * @param {string} args.transparent - The value to return if transparent.
	 * @param {string} args.opaque - The value to return if color is opaque.
	 * @return {string} - The transparent value.
	 */
	return_color_if_opaque: function( value, args ) {
		var color;
		if ( 'transparent' === value ) {
			return args.transparent;
		}
		color = jQuery.Color( value );

		if ( 1 === color.alpha() ) {
			return args.opaque;
		}

		return args.transparent;
	},

	/**
	 * Gets a readable text color depending on the background color and the defined args.
	 *
	 * @param {string}       value - The background color.
	 * @param {Object}       args - An object with the arguments for the readable color.
	 * @param {string|number} args.threshold - The threshold. Value between 0 and 1.
	 * @param {string}       args.light - The color to return if background is light.
	 * @param {string}       args.dark - The color to return if background is dark.
	 * @return {string} - HEX color value.
	 */
	get_readable_color: function( value, args ) {
		var color     = jQuery.Color( value ),
			threshold = parseFloat( args.threshold );

		if ( 'object' !== typeof args ) {
			args = {};
		}
		if ( 'undefined' === typeof args.threshold ) {
			args.threshold = 0.547;
		}
		if ( 'undefined' === typeof args.light ) {
			args.light = '#333';
		}
		if ( 'undefined' === typeof args.dark ) {
			args.dark = '#fff';
		}
		if ( 1 < threshold ) {
			threshold = threshold / 100;
		}
		return ( color.lightness() < threshold ) ? args.dark : args.light;
	},

	/**
	 * Adjusts the brightness of a color,
	 *
	 * @since 2.0.0
	 * @param {string}           value - The color we'll be adjusting.
	 * @param {string|number} adjustment - By how much we'll be adjusting.
	 *                                        Positive numbers increase lightness.
	 *                                        Negative numbers decrease lightness.
	 * @return {string} - RBGA color, ready to be used in CSS.
	 */
	lightness_adjust: function( value, adjustment ) {
		var color  = jQuery.Color( value ),
			adjust = Math.abs( adjustment ),
			neg    = ( 0 > adjust );

		if ( 1 < adjust ) {
			adjust = adjust / 100;
		}
		if ( neg ) {
			return color.lightness( '-=' + adjust ).toRgbaString();
		}
		return color.lightness( '+=' + adjust ).toRgbaString();
	},

	/**
	 * Similar to PHP's str_replace.
	 *
	 * @since 2.0.0
	 * @param {string} value - The value.
	 * @param {Array}  args - The arguments [search,replace].
	 * @return {string} - modified value.
	 */
	string_replace: function( value, args ) {
		if ( ! _.isObject( args ) || _.isUndefined( args[ 0 ] ) || _.isUndefined( args[ 1 ] ) ) {
			return value;
		}
		return value.replace( new RegExp( args[ 0 ], 'g' ), args[ 1 ] );
	},

	/**
	 * Returns a string when the color is transparent.
	 *
	 * @since 2.0.0
	 * @param {string} value - The color.
	 * @param {Object} args - An object with the values we'll return depending if transparent or not.
	 * @param {string} args.transparent - The value to return if transparent. Use "$" to return the value.
	 * @param {string} args.opaque - The value to return if color is not transparent. Use "$" to return the value.
	 * @return {string} - The value depending on transparency.
	 */
	return_string_if_transparent: function( value, args ) {
		var color;
		if ( 'transparent' === value ) {
			return ( '$' === args.transparent ) ? value : args.transparent;
		}
		color = jQuery.Color( value );

		if ( 0 === color.alpha() ) {
			return ( '$' === args.transparent ) ? value : args.transparent;
		}
		return ( '$' === args.opaque ) ? value : args.opaque;
	},

	/**
	 * If a color is 100% transparent, then return opaque color - no transparency.
	 *
	 * @since 2.0.0
	 * @param {string} value - The color we'll be adjusting.
	 * @return {string} - RGBA/HEX color, ready to be used in CSS.
	 */
	get_non_transparent_color: function( value ) {
		var color = jQuery.Color( value );

		if ( 0 === color.alpha() ) {
			return color.alpha( 1 ).toHexString();
		}
		return value;
	},

	/**
	 * A header condition.
	 *
	 * @since 2.0.0
	 * @param {string} value - The value.
	 * @param {string} fallback - A fallback value.
	 * @return {string} - The value or fallback.
	 */
	header_border_color_condition_5: function( value, fallback ) {
		fallback = fallback || '';
		if (
			'v6' !== this.getSettings().header_layout &&
			'left' === this.getSettings().header_position &&
			this.getSettings().header_border_color &&
			0 === jQuery.Color( this.getSettings().header_border_color ).alpha()
		) {
			return value;
		}
		return fallback;
	},

	/**
	 * If the value is empty or does not exist rerurn 0, otherwise the value.
	 *
	 * @param {string} value - The value.
	 * @return {string|0} - Value or (int) 0.
	 */
	fallback_to_zero: function( value ) {
		return ( ! value || '' === value ) ? 0 : value;
	},

	/**
	 * If the value is empty or does not exist return the fallback, otherwise the value.
	 *
	 * @param {string} value - The value.
	 * @param {string|Object} fallback - The fallback .
	 * @return {string} - value or fallback.
	 */
	fallback_to_value: function( value, fallback ) {
		if ( 'object' === typeof fallback && 'undefined' !== typeof fallback[ 0 ] && 'undefined' !== typeof fallback[ 1 ] ) {
			return ( ! value || '' === value ) ? fallback[ 1 ].replace( /\$/g, value ) : fallback[ 0 ].replace( /\$/g, value );
		}
		return ( ! value || '' === value ) ? fallback : value;
	},

	/**
	 * If the value is empty or does not exist return the fallback, otherwise the value.
	 *
	 * @param {string} value - The value.
	 * @param {string|Object} fallback - The fallback .
	 * @return {string} - value or fallback.
	 */
	fallback_to_value_if_empty: function( value, fallback ) {
		if ( 'object' === typeof fallback && 'undefined' !== typeof fallback[ 0 ] && 'undefined' !== typeof fallback[ 1 ] ) {
			return ( '' === value ) ? fallback[ 1 ].replace( /\$/g, value ) : fallback[ 0 ].replace( /\$/g, value );
		}
		return ( '' === value ) ? fallback : value;
	},

	/**
	 * Returns a value if site-width is 100%, otherwise return a fallback value.
	 *
	 * @param {string} value The value.
	 * @param {Array} args [pattern,fallback]
	 * @return {string} - Value.
	 */
	site_width_100_percent: function( value, args ) {
		if ( ! args[ 0 ] ) {
			args[ 0 ] = '$';
		}
		if ( ! args[ 1 ] ) {
			args[ 1 ] = '';
		}
		if ( this.getSettings().site_width && '100%' === this.getSettings().site_width ) {
			return args[ 0 ].replace( /\$/g, value );
		}
		return args[ 1 ].replace( /\$/g, value );
	},

	/**
	 * Get the horizontal negative margin for 100%.
	 * This corresponds to the "$hundredplr_padding_negative_margin" var
	 * in previous versions of Avada's dynamic-css PHP implementation.
	 *
	 * @since 2.0
	 * @param {string} value - The value.
	 * @param {string} fallback - The value to return as a fallback.
	 * @return {string} - Negative margin value.
	 */
	hundred_percent_negative_margin: function() {
		var padding        = this.getOption( 'hundredp_padding', 'hundredp_padding' ),
			paddingValue   = parseFloat( padding ),
			paddingUnit    = 'string' === typeof padding ? padding.replace( /\d+([,.]\d+)?/g, '' ) : padding,
			negativeMargin = '',
			fullWidthMaxWidth;

		negativeMargin = '-' + padding;

		if ( '%' === paddingUnit ) {
			fullWidthMaxWidth = 100 - ( 2 * paddingValue );
			negativeMargin    = paddingValue / fullWidthMaxWidth * 100;
			negativeMargin    = '-' + negativeMargin + '%';
		}
		return negativeMargin;
	},

	/**
	 * Changes slider position.
	 *
	 * @param {string} value - The value.
	 * @param {Object} args - The arguments.
	 * @param {string} args.element - The element we want to affect.
	 * @return {void}
	 */
	change_slider_position: function( value, args ) {
		var $el = window.frames[ 0 ].jQuery( args.element );

		// We need lowercased value, so that's why global object is changed here.
		if ( 'undefined' !== typeof document.getElementById( 'fb-preview' ).contentWindow.avadaFusionSliderVars ) {
			document.getElementById( 'fb-preview' ).contentWindow.avadaFusionSliderVars.slider_position = value.toLowerCase();
		}

		if ( 'above' === value.toLowerCase() ) {
			$el.detach().insertBefore( '.avada-hook-before-header-wrapper' );
		} else if ( 'below' === value.toLowerCase() ) {
			$el.detach().insertAfter( '.avada-hook-after-header-wrapper' );
		}
	},

	/**
	 * Adds CSS class necessary for changing header position.
	 *
	 * @param {string} value - The value.
	 * @return {void}
	 */
	change_header_position: function( value ) {
		var $body = window.frames[ 0 ].jQuery( 'body' ),
			classeToRemove = 'side-header side-header-left side-header-right fusion-top-header fusion-header-layout-v1 fusion-header-layout-v2 fusion-header-layout-v3 fusion-header-layout-v4 fusion-header-layout-v5 fusion-header-layout-v6 fusion-header-layout-v7';

		value = value.toLowerCase();

		$body.removeClass( classeToRemove );

		if ( 'left' === value || 'right' === value ) {
			$body.addClass( 'side-header side-header-' + value );
		} else if ( 'top' === value ) {
			$body.addClass( 'fusion-top-header fusion-header-layout-' + this.getOption( 'header_layout' ) );
		}
	},

	/**
	 * Toggles a body class.
	 *
	 * @param {string} value - The value.
	 * @param {Object} args - The arguments.
	 * @param {Array}  args.condition - The condition [valueToCheckAgainst,comparisonOperator]
	 * @param {string} args.element - The element we want to affect.
	 * @param {string}|{Array} args.className - The class-name we want to toggle.
	 * @return {void}
	 */
	toggle_class: function( value, args ) {
		var $el = window.frames[ 0 ].jQuery( args.element );
		if ( ! args.className ) {
			return;
		}

		if ( jQuery.isArray( args.className ) ) {
			jQuery.each( args.condition, function( index, condition ) {
				if ( value === condition ) {
					$el.removeClass( args.className.join( ' ' ) );
					$el.addClass( args.className[ index ] );
					return false;
				}
			} );

			return;
		}


		switch ( args.condition[ 1 ] ) {
		case '===':
			if ( value === args.condition[ 0 ] ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case '==':
			if ( value == args.condition[ 0 ] ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case '!==':
			if ( value !== args.condition[ 0 ] ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case '!=':
			if ( value != args.condition[ 0 ] ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case '>=':
			if ( parseFloat( value ) >= parseFloat( args.condition[ 0 ] ) ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case '<=':
			if ( parseFloat( value ) <= parseFloat( args.condition[ 0 ] ) ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case '>':
			if ( parseFloat( value ) > parseFloat( args.condition[ 0 ] ) ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case '<':
			if ( parseFloat( value ) < parseFloat( args.condition[ 0 ] ) ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case 'contains':
			if ( -1 !== value.indexOf( args.condition[ 0 ] ) ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case 'does-not-contain':
			if ( -1 === value.indexOf( args.condition[ 0 ] ) ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case 'opaque':
			if ( 1 === jQuery.Color( value ).alpha() ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case 'not-opaque':
			if ( 1 > jQuery.Color( value ).alpha() ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case 'header-not-opaque':
			if ( 1 > jQuery.Color( value ).alpha() && 'undefined' !== typeof FusionApp && 'off' !== FusionApp.preferencesData.transparent_header ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case 'full-transparent':
			if ( 'transparent' === value || 0 === jQuery.Color( value ).alpha() ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case 'not-full-transparent':
			if ( 'transparent' !== value && 0 < jQuery.Color( value ).alpha() ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case 'true':
			if ( 1 === value || '1' === value || true === value || 'true' === value || 'yes' === value ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case 'false':
			if ( 1 === value || '1' === value || true === value || 'true' === value || 'yes' === value ) {
				$el.removeClass( args.className );
			} else {
				$el.addClass( args.className );
			}
			break;
		case 'has-image':
			if (
				( 'object' === typeof value && 'string' === typeof value.url && '' !== value.url ) ||
					( 'string' === typeof value && 0 <= value.indexOf( 'http' ) )
			) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case 'equal-to-option':
			if ( value === this.getOption( args.condition[ 0 ] ) ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case 'not-equal-to-option':
			if ( value !== this.getOption( args.condition[ 0 ] ) ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
			break;
		case 'is-zero-or-empty':
			if ( ! value || 0 === parseInt( value, 10 ) ) {
				$el.addClass( args.className );
			} else {
				$el.removeClass( args.className );
			}
		}
	},

	/**
	 * Converts a non-px font size to px.
	 *
	 * This is a JS post of the Fusion_Panel_Callbacks::convert_font_size_to_px() PHP method.
	 *
	 * @since 2.0
	 *
	 * @param {string} value - The font size to be changed.
	 * @param {string} baseFontSize - The font size to base calcs on.
	 * @return {string} - The changed font size.
	 */
	convert_font_size_to_px: function( value, baseFontSize ) {
		var fontSizeUnit       = 'string' === typeof value ? value.replace( /\d+([,.]\d+)?/g, '' ) : value,
			fontSizeNumber     = parseFloat( value ),
			defaultFontSize    = 15, // Browser default font size. This is the average between Safari, Chrome and FF.
			addUnits           = 'object' === typeof baseFontSize && 'undefined' !== typeof baseFontSize.addUnits && baseFontSize.addUnits,
			baseFontSizeUnit,
			baseFontSizeNumber;

		if ( 'object' === typeof baseFontSize && 'undefined' !== typeof baseFontSize.setting ) {
			baseFontSize = this.getOption( baseFontSize.setting );
		}

		baseFontSizeUnit   = 'string' === typeof baseFontSize ? baseFontSize.replace( /\d+([,.]\d+)?/g, '' ) : baseFontSize;
		baseFontSizeNumber = parseFloat( baseFontSize );

		if ( ! fontSizeNumber ) {
			return value;
		}

		if ( 'px' === fontSizeUnit ) {
			return addUnits ? fontSizeNumber + 'px' : fontSizeNumber;
		}

		if ( 'em' === baseFontSizeUnit || 'rem' === baseFontSizeUnit ) {
			baseFontSizeNumber = defaultFontSize * baseFontSizeNumber;
		} else if ( '%' === baseFontSizeUnit ) {
			baseFontSizeNumber = defaultFontSize * baseFontSizeNumber / 100;
		} else if ( 'px' !== baseFontSizeUnit ) {
			baseFontSizeNumber = defaultFontSize;
		}

		if ( 'em' === fontSizeUnit || 'rem' === fontSizeUnit ) {
			fontSizeNumber = baseFontSizeNumber * fontSizeNumber;
		} else if ( '%' === fontSizeUnit ) {
			fontSizeNumber = baseFontSizeNumber * fontSizeNumber / 100;
		} else if ( 'px' !== fontSizeUnit ) {
			fontSizeNumber = baseFontSizeNumber;
		}

		return addUnits ? fontSizeNumber + 'px' : fontSizeNumber;
	},

	/**
	 * Converts the "regular" value to 400 for font-weights.
	 *
	 * @since 2.0
	 *
	 * @param {string} value - The font-weight.
	 * @return {string} - The changed font-weight.
	 */
	font_weight_no_regular: function( value ) {
		return ( 'regular' === value ) ? '400' : value;
	}
};
