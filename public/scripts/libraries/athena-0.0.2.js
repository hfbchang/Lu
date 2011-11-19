/*!
 * Athena UI Framwork v0.0.1
 * https://github.com/iheartweb/AthenaUIFramework
 * Copyright (c) 2011 Robert Martone
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var Class = li.require( 'libraries/ptclass' ),
  Athena;

Athena = Class.create( {
  initialize: function( settings ) {
    var Athena = this,
      defaults = {
        namespace: 'athena',
        debug: false,
        scope: $( 'body' );
      };

    settings = _.extend( defaults, settings );

    ATTR = 'data-' + settings.namespace;
    UI_CONTROL_PATTERN = '[' + ATTR + '*="ui:"]';

    /**
     * Binds to jQuery and provides helper functions.
     * @private
     * @param {Object} jQuery
     */
    ( function( $ ) {

      var queues = {},
        constructors = {},
        required = [],
        on = $.fn.on,
        off = $.fn.off,
        trigger = $.fn.trigger;

      /**
       * Queues a control for execution with selected node.
       * @method enqueue
       * @private
       * @param {String} key The name of controll to queue
       * @param {Array} $node A jQuery collection to instantiate control with
       */
      function enqueue( key, $node ) {
        if( $node.data().queued ) {
          return;
        } else {
          if( queues[key] ) {
            queues[key].push( $node );
          } else {
            queues[key] = [$node];
          }
          $node.data( 'queued', true );
        }
      }

      /**
       * Returns an array of control keys on a $node.
       * @method getKeys
       * @private
       * @param {Array} $node A jQuery collection with the selected elements.
       */
      function getKeys( $node ) {
        return ( $node.attr( ATTR ) || '' ).split( ' ' );
      }

      /**
       * Returns a jQuery collection of non instantiated children of a node.
       * @method getDecendants
       * @private
       * @param {Array} $node A jQuery collection with the selected elements.
       */
      function getDecendants( $node ) {
        return $( _.reject( $( UI_CONTROL_PATTERN, $node ), function( item, index ) {
          return isReady( $( item ) );
        } ) );
      }

      /**
       * Checks to see if a node is ready.
       * @method isReady
       * @private
       * @param {Array} $node A jQuery collection with the selected elements.
       */
      function isReady( $node ) {
        var controls;
        if( getDecendants( $node ).length === 0 ) {
          controls = $node.data( 'controls' );
          if( controls ) {
            if( _.keys( controls ).length === getKeys( $node ).length ) {
              return true;
            }
          }
        }

        return false;
      }

      /**
       * Instantiates a control with selected element.
       * @method execute
       * @private
       * @param {Array} $node A jQuery collection with the selected elements.
       * @param {String} key The name of the Control.
       * @param {Function} Control The Control's constructor.
       */
      function execute( $node, key ) {
        var Control,
          config = $node.data( settings.namespace + 'Config' );

        config = config || '{}';
        Control = constructors[key];

        Control = new Control( $node, new Function( '$this', 'var config =' + config + '[\'' + key + '\'] || {}; return config;' )( $node ) );

        console.info( 'Action ' + key + ' executed with', $node );

        if( $node.data( 'controls' ) ) {
          $node.data( 'controls' )[ key ] = Control;
        } else {
          $node.data( 'controls', {} ).data( 'controls' )[key] = Control;
        }

      }

      /**
       * Parses the DOM starting with selected element, requires nessasary JS Files, and instantiates Athena controls. 
       * @method getControl
       * @public
       * @param {String} id The id of returned control.
       */
      $.fn.execute = function() {
        var $this = $( this ),
          $nodes,
          keys = [],
          packages = [];

        $nodes = $( UI_CONTROL_PATTERN, $this );

        if( $this.is( UI_CONTROL_PATTERN ) ) {
          $nodes.add( $this );
        }

        //Construct an array of required packages
        _.each( $nodes, function( node, index ) {
          var $node = $( node );
          _.each( $node.attr( ATTR ).split( ' ' ), function( key, index ) {
            var pckg = key.replace( /\:/g, '/' );
            if( _.indexOf( required, pckg ) === -1 ) {
              keys.push( key );
              packages.push( key.replace( /\:/g, '/' ) );
            }
            required.push( pckg );
          } );
        } );

        li.require( packages, function() {
          var args = arguments;
          _.each( keys, function( key, index ) {
            constructors[key] = args[index];
          } );
          recurse( $this );
        } );

        function recurse( $node ) {
          console.log($())
        }

        return $this;

      };

      /**
       * Calls Athena.getControl with selected elements
       * @method getControl
       * @public
       * @param {String} id The id of returned control.
       */
      $.fn.getControl = function( id ) {
        return Athena.getControl( $( this ), id );
      };

      /**
       * Wrap jQuery's 'on' with Athena functionality. See: http://api.jquery.com/on/
       * @method on
       * @public
       */
      $.fn.on = function( events, selector, data, handler ) {
        var $this = $( this );
        return on.apply( $this, [events, selector, data, handler] );
      };

      /**
       * Wrap jQuery's 'off' with Athena functionality. See: http://api.jquery.com/off/
       * @method off
       * @public
       */
      $.fn.off = function( events, selector, handler ) {
        var $this = $( this );
        return off.apply( $this, [events, selector, handler] );
      };


      /**
       * Wrap jQuery's 'trigger' with Athena functionality. See: http://api.jquery.com/trigger/
       * @method trigger
       * @public
       */
      $.fn.trigger = function( event, parameters ) {
         var $this = $( this );
         $this.notify( event, parameters );
         return trigger.apply( $this, [event, parameters] );
      };

       /**
        * Notifies all observers of an event
        * @method notify
        * @public
        * @param {String} A string containing a JavaScript event type, such as click or submit.
        * @param {Array} Additional parameters to pass along to the event handler.
        */
       $.fn.notify = function( event, parameters ) {
         var $this = $( this );
         if( $this.data( '$observers' ) ) {
           $this.data( '$observers' ).trigger( event, parameters );
         }
       };

       /**
        * Adds an observer
        * @method observe
        * @public
        * @param {Array} $observer A jQuery collection of of observers.
        */
       $.fn.observe = function( $observer ) {
         var $this = $( this );
         if( $this.data( '$observers' ) ) {
           $this.data( '$observers' ).add( $observer );
         } else {
           $this.data( '$observers', $observer );
         }
       };

       /**
        * Removes an unobserve
        * @method unobserve
        * @public
        * @param {Array} $observer A jQuery collection.
        */
       $.fn.unobserve = function( $observer ) {
         var $this = $( this ),
           $observers;

         $observers = $this.data( '$observers' );

         if( $observers ){
           $observers = $( _.reject( $observers, function( item, index ) {
             return $observer.is( item );
           } ) );
           $this.data( '$observers', $observers );
         }
         return $this;

       };

    } ( jQuery ) );

    /**
     * Factory for creating Controls.
     * @public
     * @param {Object} jQuery
     * @param {Object} keys to be decorated
     * @param {Object} settings to be used in creation of controls
     */
    Athena.create = function( $node, keys, settings ) {
      return Athena.decorate( $node, keys, settings ).execute();
    };

    /**
     * Decorates a node with Athena markup.
     * @public
     * @param {Object} jQuery
     * @param {Object} keys to be decorated
     * @param {Object} settings to be used in creation of controls
     */
    Athena.decorate = function( $node, keys, settings ) {
      return $node.attr( ATTR, keys.join( ' ' ) ).attr( ATTR + '-config', settings );
    };

    /**
     * Returns a control with id, or an array of all controls instantiated with selected element.
     * @method getControl
     * @public
     * @param {String} id The id of returned controll.
     */
    Athena.getControl = function( $node, id ) {
      var controls,
        control;
      if( id ) {
        return $node.data( 'controls' )[id];
      } else {
        controls = _.values( $node.data( 'controls' ) );
      }
      return controls;
    };
    
    $( function() {
      //Athena.decorate( $body, ['ui:Abstract'] );
      $settings.scope.on( settings.namespace + '-ready', function( event ) {
        console.log( 'hella cool' );
      } ).execute();
    } );

  }
} );

if ( typeof module !== 'undefined' && module.exports ) {
  module.exports = Athena;
}