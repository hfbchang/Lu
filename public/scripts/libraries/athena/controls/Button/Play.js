var Class = require( 'class' ),
  Button = require( 'athena/Button' ),
  PlayButton;

/**
 * Representation of a button element preconfigured with a 'next' event
 * @class NextButton
 * @constructor
 * @extends Button
 * @param {HTMLElement} element The HTML element surrounded by the control
 * @param {Object} settings Configuration properties for this instance
 */
PlayButton = Class.create( Button, ( function () {

  // RETURN METHODS OBJECT
  return {
   /**
    * PTClass constructor 
    * @method initialize
    * @public
    * @param {Object} $super Pointer to superclass constructor
    * @param {Object} $element JQuery object for the element wrapped by the component
    * @param {Object} settings Configuration settings
    */
    initialize: function ( $super, $element, settings ) {

      // PRIVATE INSTANCE PROPERTIES
      /**
       * Instance of PlayButton
       * @property PlayButton
       * @type Object
       * @private
       */
      var PlayButton = this,
        /**
        * Default configuration values
        * @property defaults
        * @type Object
        * @private
        * @final
        */
        defaults = {
         action: 'play'
        };

      // MIX THE DEFAULTS INTO THE SETTINGS VALUES
      _.defaults( settings, defaults );

      // CALL THE PARENT'S CONSTRUCTOR
      $super( $element, settings );

      PlayButton.on( 'playing', function( event ) {
        event.stopImmediatePropagation();
        PlayButton.disable();
      } );

      PlayButton.on( 'paused', function( event ) {
        event.stopImmediatePropagation();
        PlayButton.enable();
      } );

    }

  };

}() ) );

//Export to Common JS Loader
if( module ) {
  if( typeof module.setExports === 'function' ){
    module.setExports( PlayButton );
  } else if( module.exports ) {
   module.exports = PlayButton; 
  }
}