'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj;};;(function(root,factory){if(typeof define==='function'&&define.amd){define([],function(){return factory();});}else if((typeof exports==='undefined'?'undefined':_typeof(exports))==='object'){module.exports=factory();}else {root.whatInput=factory();}})(undefined,function(){'use strict'; /*
    ---------------
    variables
    ---------------
  */ // array of actively pressed keys
var activeKeys=[]; // cache document.body
var body=document.body; // boolean: true if touch buffer timer is running
var buffer=false; // the last used input type
var currentInput=null; // array of form elements that take keyboard input
var formInputs=['input','select','textarea']; // user-set flag to allow typing in form fields to be recorded
var formTyping=body.hasAttribute('data-whatinput-formtyping'); // mapping of events to input types
var inputMap={'keydown':'keyboard','mousedown':'mouse','mouseenter':'mouse','touchstart':'touch','pointerdown':'pointer','MSPointerDown':'pointer'}; // array of all used input types
var inputTypes=[]; // mapping of key codes to common name
var keyMap={9:'tab',13:'enter',16:'shift',27:'esc',32:'space',37:'left',38:'up',39:'right',40:'down'}; // map of IE 10 pointer events
var pointerMap={2:'touch',3:'touch', // treat pen like touch
4:'mouse'}; // touch buffer timer
var timer; /*
    ---------------
    functions
    ---------------
  */function bufferInput(event){clearTimeout(timer);setInput(event);buffer=true;timer=setTimeout(function(){buffer=false;},1000);}function immediateInput(event){if(!buffer)setInput(event);}function setInput(event){var eventKey=key(event);var eventTarget=target(event);var value=inputMap[event.type];if(value==='pointer')value=pointerType(event);if(currentInput!==value){if( // only if the user flag isn't set
!formTyping&& // only if currentInput has a value
currentInput&& // only if the input is `keyboard`
value==='keyboard'&& // not if the key is `TAB`
keyMap[eventKey]!=='tab'&& // only if the target is one of the elements in `formInputs`
formInputs.indexOf(eventTarget.nodeName.toLowerCase())>=0){ // ignore keyboard typing on form elements
}else {currentInput=value;body.setAttribute('data-whatinput',currentInput);if(inputTypes.indexOf(currentInput)===-1)inputTypes.push(currentInput);}}if(value==='keyboard')logKeys(eventKey);}function key(event){return event.keyCode?event.keyCode:event.which;}function target(event){return event.target||event.srcElement;}function pointerType(event){return typeof event.pointerType==='number'?pointerMap[event.pointerType]:event.pointerType;} // keyboard logging
function logKeys(eventKey){if(activeKeys.indexOf(keyMap[eventKey])===-1&&keyMap[eventKey])activeKeys.push(keyMap[eventKey]);}function unLogKeys(event){var eventKey=key(event);var arrayPos=activeKeys.indexOf(keyMap[eventKey]);if(arrayPos!==-1)activeKeys.splice(arrayPos,1);}function bindEvents(){ // pointer/mouse
var mouseEvent='mousedown';if(window.PointerEvent){mouseEvent='pointerdown';}else if(window.MSPointerEvent){mouseEvent='MSPointerDown';}body.addEventListener(mouseEvent,immediateInput);body.addEventListener('mouseenter',immediateInput); // touch
if('ontouchstart' in window){body.addEventListener('touchstart',bufferInput);} // keyboard
body.addEventListener('keydown',immediateInput);document.addEventListener('keyup',unLogKeys);} /*
    ---------------
    init

    don't start script unless browser cuts the mustard,
    also passes if polyfills are used
    ---------------
  */if('addEventListener' in window&&Array.prototype.indexOf){bindEvents();} /*
    ---------------
    api
    ---------------
  */return { // returns string: the current input type
ask:function ask(){return currentInput;}, // returns array: currently pressed keys
keys:function keys(){return activeKeys;}, // returns array: all the detected input types
types:function types(){return inputTypes;}, // accepts string: manually set the input type
set:setInput};});
!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.2.0';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
     * Stores initialized plugins.
     */
    _plugins: {},

    /**
     * Stores generated unique ids for plugin instances
     */
    _uuids: [],

    /**
     * Returns a boolean for RTL support
     */
    rtl: function () {
      return $('html').attr('dir') === 'rtl';
    },
    /**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {Object} plugin - The constructor of the plugin.
     */
    plugin: function (plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = plugin;
    },
    /**
     * @function
     * Populates the _uuids array with pointers to each individual plugin instance.
     * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
     * Also fires the initialization event for each plugin, consolidating repeditive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @param {String} name - the name of the plugin, passed as a camelCased string.
     * @fires Plugin#init
     */
    registerPlugin: function (plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {
        plugin.$element.attr('data-' + pluginName, plugin.uuid);
      }
      if (!plugin.$element.data('zfPlugin')) {
        plugin.$element.data('zfPlugin', plugin);
      }
      /**
       * Fires when the plugin has initialized.
       * @event Plugin#init
       */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
     * @function
     * Removes the plugins uuid from the _uuids array.
     * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
     * Also fires the destroyed event for the plugin, consolidating repeditive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @fires Plugin#destroyed
     */
    unregisterPlugin: function (plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
     * @function
     * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
     * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
     * @default If no argument is passed, reflow all currently active plugins.
     */
    reInit: function (plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins,
              _this = this,
              fns = {
            'object': function (plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function () {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function () {
              this['object'](Object.keys(_this._plugins));
            }
          };
          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
     * returns a random base-36 uid with namespacing
     * @function
     * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
     * @param {String} namespace - name of plugin to be incorporated in uid, optional.
     * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
     * @returns {String} - unique id
     */
    GetYoDigits: function (length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
    reflow: function (elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
              opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {
                return el.trim();
              });
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function ($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend'
      };
      var elem = document.createElement('div'),
          end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    }
  };

  Foundation.util = {
    /**
     * Function for applying a debounce effect to a function call.
     * @function
     * @param {Function} func - Function to be called at end of timeout.
     * @param {Number} delay - Time in ms to delay the call of `func`.
     * @returns function
     */
    throttle: function (func, delay) {
      var timer = null;

      return function () {
        var context = this,
            args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }
  };

  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function (method) {
    var type = typeof method,
        $meta = $('meta.foundation-mq'),
        $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {
      //needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {
      //an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {
        //make sure both the class and method exist
        if (this.length === 1) {
          //if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {
            //otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {
        //error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {
      //error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
      return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
     * Polyfill for performance.now, required by rAF
     */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function () {
          return Date.now() - this.start;
        }
      };
    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function () {},
          fBound = function () {
        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if (/true/.test(str)) return true;else if (/false/.test(str)) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}(jQuery);
'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets
  };

  /**
   * Compares the dimensions of an element to a container and determines collision events with container.
   * @function
   * @param {jQuery} element - jQuery object to test for collisions.
   * @param {jQuery} parent - jQuery object to use as bounding container.
   * @param {Boolean} lrOnly - set to true to check left and right values only.
   * @param {Boolean} tbOnly - set to true to check top and bottom values only.
   * @default if no parent object passed, detects collisions with `window`.
   * @returns {Boolean} - true if collision free, false if a collision in any direction.
   */
  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
        top,
        bottom,
        left,
        right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width;
    } else {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
   * Uses native methods to return an object of dimension values.
   * @function
   * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
   * @returns {Object} - nested object of integer pixel values
   * TODO - if element is window, return only those values.
   */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  }

  /**
   * Returns an object of top and left integer pixel values for dynamically rendered elements,
   * such as: Tooltip, Reveal, and Dropdown
   * @function
   * @param {jQuery} element - jQuery object for the element being positioned.
   * @param {jQuery} anchor - jQuery object for the element's anchor point.
   * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
   * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
   * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
   * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
   * TODO alter/rewrite to work with `em` values as well/instead of pixels
   */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  }
}(jQuery);
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
     * Parses the (keyboard) event and returns a String that represents its key
     * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
     * @param {Event} event - the event generated by the event handler
     * @return String key - String that represents the key pressed
     */
    parseKey: function (event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();
      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;
      return key;
    },


    /**
     * Handles the given (keyboard) event
     * @param {Event} event - the event generated by the event handler
     * @param {String} component - Foundation component's name, e.g. Slider or Reveal
     * @param {Objects} functions - collection of functions that are to be executed
     */
    handleKey: function (event, component, functions) {
      var commandList = commands[component],
          keyCode = this.parseKey(event),
          cmds,
          command,
          fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {
        // this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {
          // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
          if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else cmds = $.extend({}, commandList.rtl, commandList.ltr);
        }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {
        // execute function  if exists
        fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {
          // execute function when event was handled
          functions.handled.apply();
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {
          // execute function when event was not handled
          functions.unhandled.apply();
        }
      }
    },


    /**
     * Finds all focusable elements within the given `$element`
     * @param {jQuery} $element - jQuery object to search within
     * @return {jQuery} $focusable - all focusable elements within `$element`
     */
    findFocusable: function ($element) {
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {
          return false;
        } //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },


    /**
     * Returns the component name name
     * @param {Object} component - Foundation component, e.g. Slider or Reveal
     * @return String componentName
     */

    register: function (componentName, cmds) {
      commands[componentName] = cmds;
    }
  };

  /*
   * Constants for easier comparing.
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {
      k[kcs[kc]] = kcs[kc];
    }return k;
  }

  Foundation.Keyboard = Keyboard;
}(jQuery);
'use strict';

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],

    current: '',

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function () {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        self.queries.push({
          name: key,
          value: 'only screen and (min-width: ' + namedQueries[key] + ')'
        });
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },


    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function (size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },


    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function (size) {
      for (var i in this.queries) {
        var query = this.queries[i];
        if (size === query.name) return query.value;
      }

      return null;
    },


    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function () {
      var matched;

      for (var i in this.queries) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if (typeof matched === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },


    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function () {
      var _this = this;

      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize();

        if (newSize !== _this.current) {
          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, _this.current]);

          // Change the current media query
          _this.current = newSize;
        }
      });
    }
  };

  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function (media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;
}(jQuery);
'use strict';

!function ($) {

  /**
   * Motion module.
   * @module foundation.motion
   */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function (element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function (element, animation, cb) {
      animate(false, element, animation, cb);
    }
  };

  function Move(duration, elem, fn) {
    var anim,
        prog,
        start = null;
    // console.log('called');

    function move(ts) {
      if (!start) start = window.performance.now();
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {
        anim = window.requestAnimationFrame(move, elem);
      } else {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
   * Animates an element in or out using a CSS transition class.
   * @function
   * @private
   * @param {Boolean} isIn - Defines if the animation is in or out.
   * @param {Object} element - jQuery or HTML object to animate.
   * @param {String} animation - CSS class to use.
   * @param {Function} cb - Callback to run when animation is finished.
   */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.addClass(animation).css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.css('transition', '').addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;
}(jQuery);
'use strict';

!function ($) {

  var Nest = {
    Feather: function (menu) {
      var type = arguments.length <= 1 || arguments[1] === undefined ? 'zf' : arguments[1];

      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('a:first').attr('tabindex', 0);

      items.each(function () {
        var $item = $(this),
            $sub = $item.children('ul');

        if ($sub.length) {
          $item.addClass(hasSubClass).attr({
            'aria-haspopup': true,
            'aria-expanded': false,
            'aria-label': $item.children('a:first').text()
          });

          $sub.addClass('submenu ' + subMenuClass).attr({
            'data-submenu': '',
            'aria-hidden': true,
            'role': 'menu'
          });
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },
    Burn: function (menu, type) {
      var items = menu.find('li').removeAttr('tabindex'),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('*').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    }
  };

  Foundation.Nest = Nest;
}(jQuery);
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
        duration = options.duration,
        //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        cb();
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  function onImagesLoaded(images, callback) {
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      if (this.complete) {
        singleImageLoaded();
      } else if (typeof this.naturalWidth !== 'undefined' && this.naturalWidth > 0) {
        singleImageLoaded();
      } else {
        $(this).one('load', function () {
          singleImageLoaded();
        });
      }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery);
//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200
	};

	var startPosX,
	    startPosY,
	    startTime,
	    elapsedTime,
	    isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {
			e.preventDefault();
		}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function () {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
 * Method for adding psuedo drag events to elements *
 ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function (event) {
			var touches = event.changedTouches,
			    first = touches[0],
			    eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup'
			},
			    type = eventTypes[event.type],
			    simulatedEvent;

			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY
				});
			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);

//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/
'use strict';

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function (el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    triggers($(this), 'toggle');
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
  * Fires once after all other scripts have loaded
  * @function
  * @private
  */
  $(window).load(function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if (typeof pluginName === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = undefined,
        $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = undefined,
        $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {
      return false;
    }
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function (mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);
      //trigger the event handler for the element depending on type
      switch ($target.attr("data-events")) {

        case "resize":
          $target.triggerHandler('resizeme.zf.trigger', [$target]);
          break;

        case "scroll":
          $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          break;

        // case "mutate" :
        // console.log('mutate', $target);
        // $target.triggerHandler('mutate.zf.trigger');
        //
        // //make sure we don't get stuck in an infinite loop from sloppy codeing
        // if ($target.index('[data-mutate]') == $("[data-mutate]").length-1) {
        //   domMutationObserver();
        // }
        // break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, (or coming soon mutation) add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: false, characterData: false, subtree: false, attributeFilter: ["data-events"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;
}(jQuery);

// function domMutationObserver(debounce) {
//   // !!! This is coming soon and needs more work; not active  !!! //
//   var timer,
//   nodes = document.querySelectorAll('[data-mutate]');
//   //
//   if (nodes.length) {
//     // var MutationObserver = (function () {
//     //   var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
//     //   for (var i=0; i < prefixes.length; i++) {
//     //     if (prefixes[i] + 'MutationObserver' in window) {
//     //       return window[prefixes[i] + 'MutationObserver'];
//     //     }
//     //   }
//     //   return false;
//     // }());
//
//
//     //for the body, we need to listen for all changes effecting the style and class attributes
//     var bodyObserver = new MutationObserver(bodyMutation);
//     bodyObserver.observe(document.body, { attributes: true, childList: true, characterData: false, subtree:true, attributeFilter:["style", "class"]});
//
//
//     //body callback
//     function bodyMutation(mutate) {
//       //trigger all listening elements and signal a mutation event
//       if (timer) { clearTimeout(timer); }
//
//       timer = setTimeout(function() {
//         bodyObserver.disconnect();
//         $('[data-mutate]').attr('data-events',"mutate");
//       }, debounce || 150);
//     }
//   }
// }
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Abide module.
   * @module foundation.abide
   */

  var Abide = function () {
    /**
     * Creates a new instance of Abide.
     * @class
     * @fires Abide#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Abide(element) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, Abide);

      this.$element = element;
      this.options = $.extend({}, Abide.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Abide');
    }

    /**
     * Initializes the Abide plugin and calls functions to get Abide functioning on load.
     * @private
     */


    _createClass(Abide, [{
      key: '_init',
      value: function _init() {
        this.$inputs = this.$element.find('input, textarea, select').not('[data-abide-ignore]');

        this._events();
      }

      /**
       * Initializes events for Abide.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this2 = this;

        this.$element.off('.abide').on('reset.zf.abide', function () {
          _this2.resetForm();
        }).on('submit.zf.abide', function () {
          return _this2.validateForm();
        });

        if (this.options.validateOn === 'fieldChange') {
          this.$inputs.off('change.zf.abide').on('change.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }

        if (this.options.liveValidate) {
          this.$inputs.off('input.zf.abide').on('input.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }
      }

      /**
       * Calls necessary functions to update Abide upon DOM change
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        this._init();
      }

      /**
       * Checks whether or not a form element has the required attribute and if it's checked or not
       * @param {Object} element - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'requiredCheck',
      value: function requiredCheck($el) {
        if (!$el.attr('required')) return true;

        var isGood = true;

        switch ($el[0].type) {
          case 'checkbox':
          case 'radio':
            isGood = $el[0].checked;
            break;

          case 'select':
          case 'select-one':
          case 'select-multiple':
            var opt = $el.find('option:selected');
            if (!opt.length || !opt.val()) isGood = false;
            break;

          default:
            if (!$el.val() || !$el.val().length) isGood = false;
        }

        return isGood;
      }

      /**
       * Based on $el, get the first element with selector in this order:
       * 1. The element's direct sibling('s).
       * 3. The element's parent's children.
       *
       * This allows for multiple form errors per input, though if none are found, no form errors will be shown.
       *
       * @param {Object} $el - jQuery object to use as reference to find the form error selector.
       * @returns {Object} jQuery object with the selector.
       */

    }, {
      key: 'findFormError',
      value: function findFormError($el) {
        var $error = $el.siblings(this.options.formErrorSelector);

        if (!$error.length) {
          $error = $el.parent().find(this.options.formErrorSelector);
        }

        return $error;
      }

      /**
       * Get the first element in this order:
       * 2. The <label> with the attribute `[for="someInputId"]`
       * 3. The `.closest()` <label>
       *
       * @param {Object} $el - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'findLabel',
      value: function findLabel($el) {
        var id = $el[0].id;
        var $label = this.$element.find('label[for="' + id + '"]');

        if (!$label.length) {
          return $el.closest('label');
        }

        return $label;
      }

      /**
       * Adds the CSS error class as specified by the Abide settings to the label, input, and the form
       * @param {Object} $el - jQuery object to add the class to
       */

    }, {
      key: 'addErrorClasses',
      value: function addErrorClasses($el) {
        var $label = this.findLabel($el);
        var $formError = this.findFormError($el);

        if ($label.length) {
          $label.addClass(this.options.labelErrorClass);
        }

        if ($formError.length) {
          $formError.addClass(this.options.formErrorClass);
        }

        $el.addClass(this.options.inputErrorClass).attr('data-invalid', '');
      }

      /**
       * Removes CSS error class as specified by the Abide settings from the label, input, and the form
       * @param {Object} $el - jQuery object to remove the class from
       */

    }, {
      key: 'removeErrorClasses',
      value: function removeErrorClasses($el) {
        var $label = this.findLabel($el);
        var $formError = this.findFormError($el);

        if ($label.length) {
          $label.removeClass(this.options.labelErrorClass);
        }

        if ($formError.length) {
          $formError.removeClass(this.options.formErrorClass);
        }

        $el.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
      }

      /**
       * Goes through a form to find inputs and proceeds to validate them in ways specific to their type
       * @fires Abide#invalid
       * @fires Abide#valid
       * @param {Object} element - jQuery object to validate, should be an HTML input
       * @returns {Boolean} goodToGo - If the input is valid or not.
       */

    }, {
      key: 'validateInput',
      value: function validateInput($el) {
        var clearRequire = this.requiredCheck($el),
            validated = false,
            customValidator = true,
            validator = $el.attr('data-validator'),
            equalTo = true;

        switch ($el[0].type) {
          case 'radio':
            validated = this.validateRadio($el.attr('name'));
            break;

          case 'checkbox':
            validated = clearRequire;
            break;

          case 'select':
          case 'select-one':
          case 'select-multiple':
            validated = clearRequire;
            break;

          default:
            validated = this.validateText($el);
        }

        if (validator) {
          customValidator = this.matchValidation($el, validator, $el.attr('required'));
        }

        if ($el.attr('data-equalto')) {
          equalTo = this.options.validators.equalTo($el);
        }

        var goodToGo = [clearRequire, validated, customValidator, equalTo].indexOf(false) === -1;
        var message = (goodToGo ? 'valid' : 'invalid') + '.zf.abide';

        this[goodToGo ? 'removeErrorClasses' : 'addErrorClasses']($el);

        /**
         * Fires when the input is done checking for validation. Event trigger is either `valid.zf.abide` or `invalid.zf.abide`
         * Trigger includes the DOM element of the input.
         * @event Abide#valid
         * @event Abide#invalid
         */
        $el.trigger(message, [$el]);

        return goodToGo;
      }

      /**
       * Goes through a form and if there are any invalid inputs, it will display the form error element
       * @returns {Boolean} noError - true if no errors were detected...
       * @fires Abide#formvalid
       * @fires Abide#forminvalid
       */

    }, {
      key: 'validateForm',
      value: function validateForm() {
        var acc = [];
        var _this = this;

        this.$inputs.each(function () {
          acc.push(_this.validateInput($(this)));
        });

        var noError = acc.indexOf(false) === -1;

        this.$element.find('[data-abide-error]').css('display', noError ? 'none' : 'block');

        /**
         * Fires when the form is finished validating. Event trigger is either `formvalid.zf.abide` or `forminvalid.zf.abide`.
         * Trigger includes the element of the form.
         * @event Abide#formvalid
         * @event Abide#forminvalid
         */
        this.$element.trigger((noError ? 'formvalid' : 'forminvalid') + '.zf.abide', [this.$element]);

        return noError;
      }

      /**
       * Determines whether or a not a text input is valid based on the pattern specified in the attribute. If no matching pattern is found, returns true.
       * @param {Object} $el - jQuery object to validate, should be a text input HTML element
       * @param {String} pattern - string value of one of the RegEx patterns in Abide.options.patterns
       * @returns {Boolean} Boolean value depends on whether or not the input value matches the pattern specified
       */

    }, {
      key: 'validateText',
      value: function validateText($el, pattern) {
        // pattern = pattern ? pattern : $el.attr('pattern') ? $el.attr('pattern') : $el.attr('type');
        pattern = pattern || $el.attr('pattern') || $el.attr('type');
        var inputText = $el.val();

        // if text, check if the pattern exists, if so, test it, if no text or no pattern, return true.
        return inputText.length ? this.options.patterns.hasOwnProperty(pattern) ? this.options.patterns[pattern].test(inputText) : pattern && pattern !== $el.attr('type') ? new RegExp(pattern).test(inputText) : true : true;
      }

      /**
       * Determines whether or a not a radio input is valid based on whether or not it is required and selected
       * @param {String} groupName - A string that specifies the name of a radio button group
       * @returns {Boolean} Boolean value depends on whether or not at least one radio input has been selected (if it's required)
       */

    }, {
      key: 'validateRadio',
      value: function validateRadio(groupName) {
        var $group = this.$element.find(':radio[name="' + groupName + '"]'),
            counter = [],
            _this = this;

        $group.each(function () {
          var rdio = $(this),
              clear = _this.requiredCheck(rdio);
          counter.push(clear);
          if (clear) _this.removeErrorClasses(rdio);
        });

        return counter.indexOf(false) === -1;
      }

      /**
       * Determines if a selected input passes a custom validation function. Multiple validations can be used, if passed to the element with `data-validator="foo bar baz"` in a space separated listed.
       * @param {Object} $el - jQuery input element.
       * @param {String} validators - a string of function names matching functions in the Abide.options.validators object.
       * @param {Boolean} required - self explanatory?
       * @returns {Boolean} - true if validations passed.
       */

    }, {
      key: 'matchValidation',
      value: function matchValidation($el, validators, required) {
        var _this3 = this;

        required = required ? true : false;

        var clear = validators.split(' ').map(function (v) {
          return _this3.options.validators[v]($el, required, $el.parent());
        });
        return clear.indexOf(false) === -1;
      }

      /**
       * Resets form inputs and styles
       * @fires Abide#formreset
       */

    }, {
      key: 'resetForm',
      value: function resetForm() {
        var $form = this.$element,
            opts = this.options;

        $('.' + opts.labelErrorClass, $form).not('small').removeClass(opts.labelErrorClass);
        $('.' + opts.inputErrorClass, $form).not('small').removeClass(opts.inputErrorClass);
        $(opts.formErrorSelector + '.' + opts.formErrorClass).removeClass(opts.formErrorClass);
        $form.find('[data-abide-error]').css('display', 'none');
        $(':input', $form).not(':button, :submit, :reset, :hidden, [data-abide-ignore]').val('').removeAttr('data-invalid');
        /**
         * Fires when the form has been reset.
         * @event Abide#formreset
         */
        $form.trigger('formreset.zf.abide', [$form]);
      }

      /**
       * Destroys an instance of Abide.
       * Removes error styles and classes from elements, without resetting their values.
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        var _this = this;
        this.$element.off('.abide').find('[data-abide-error]').css('display', 'none');

        this.$inputs.off('.abide').each(function () {
          _this.removeErrorClasses($(this));
        });

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Abide;
  }();

  /**
   * Default settings for plugin
   */


  Abide.defaults = {
    /**
     * The default event to validate inputs. Checkboxes and radios validate immediately.
     * Remove or change this value for manual validation.
     * @option
     * @example 'fieldChange'
     */
    validateOn: 'fieldChange',

    /**
     * Class to be applied to input labels on failed validation.
     * @option
     * @example 'is-invalid-label'
     */
    labelErrorClass: 'is-invalid-label',

    /**
     * Class to be applied to inputs on failed validation.
     * @option
     * @example 'is-invalid-input'
     */
    inputErrorClass: 'is-invalid-input',

    /**
     * Class selector to use to target Form Errors for show/hide.
     * @option
     * @example '.form-error'
     */
    formErrorSelector: '.form-error',

    /**
     * Class added to Form Errors on failed validation.
     * @option
     * @example 'is-visible'
     */
    formErrorClass: 'is-visible',

    /**
     * Set to true to validate text inputs on any value change.
     * @option
     * @example false
     */
    liveValidate: false,

    patterns: {
      alpha: /^[a-zA-Z]+$/,
      alpha_numeric: /^[a-zA-Z0-9]+$/,
      integer: /^[-+]?\d+$/,
      number: /^[-+]?\d*(?:[\.\,]\d+)?$/,

      // amex, visa, diners
      card: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
      cvv: /^([0-9]){3,4}$/,

      // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
      email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

      url: /^(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
      // abc.de
      domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,8}$/,

      datetime: /^([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))$/,
      // YYYY-MM-DD
      date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/,
      // HH:MM:SS
      time: /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}$/,
      dateISO: /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
      // MM/DD/YYYY
      month_day_year: /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d{4}$/,
      // DD/MM/YYYY
      day_month_year: /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d{4}$/,

      // #FFF or #FFFFFF
      color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
    },

    /**
     * Optional validation functions to be used. `equalTo` being the only default included function.
     * Functions should return only a boolean if the input is valid or not. Functions are given the following arguments:
     * el : The jQuery element to validate.
     * required : Boolean value of the required attribute be present or not.
     * parent : The direct parent of the input.
     * @option
     */
    validators: {
      equalTo: function (el, required, parent) {
        return $('#' + el.attr('data-equalto')).val() === el.val();
      }
    }
  };

  // Window exports
  Foundation.plugin(Abide, 'Abide');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Accordion module.
   * @module foundation.accordion
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   */

  var Accordion = function () {
    /**
     * Creates a new instance of an accordion.
     * @class
     * @fires Accordion#init
     * @param {jQuery} element - jQuery object to make into an accordion.
     * @param {Object} options - a plain object with settings to override the default options.
     */

    function Accordion(element, options) {
      _classCallCheck(this, Accordion);

      this.$element = element;
      this.options = $.extend({}, Accordion.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Accordion');
      Foundation.Keyboard.register('Accordion', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_DOWN': 'next',
        'ARROW_UP': 'previous'
      });
    }

    /**
     * Initializes the accordion by animating the preset active pane(s).
     * @private
     */


    _createClass(Accordion, [{
      key: '_init',
      value: function _init() {
        this.$element.attr('role', 'tablist');
        this.$tabs = this.$element.children('li');
        if (this.$tabs.length === 0) {
          this.$tabs = this.$element.children('[data-accordion-item]');
        }
        this.$tabs.each(function (idx, el) {

          var $el = $(el),
              $content = $el.find('[data-tab-content]'),
              id = $content[0].id || Foundation.GetYoDigits(6, 'accordion'),
              linkId = el.id || id + '-label';

          $el.find('a:first').attr({
            'aria-controls': id,
            'role': 'tab',
            'id': linkId,
            'aria-expanded': false,
            'aria-selected': false
          });
          $content.attr({ 'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id });
        });
        var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
        if ($initActive.length) {
          this.down($initActive, true);
        }
        this._events();
      }

      /**
       * Adds event handlers for items within the accordion.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$tabs.each(function () {
          var $elem = $(this);
          var $tabContent = $elem.children('[data-tab-content]');
          if ($tabContent.length) {
            $elem.children('a').off('click.zf.accordion keydown.zf.accordion').on('click.zf.accordion', function (e) {
              // $(this).children('a').on('click.zf.accordion', function(e) {
              e.preventDefault();
              if ($elem.hasClass('is-active')) {
                if (_this.options.allowAllClosed || $elem.siblings().hasClass('is-active')) {
                  _this.up($tabContent);
                }
              } else {
                _this.down($tabContent);
              }
            }).on('keydown.zf.accordion', function (e) {
              Foundation.Keyboard.handleKey(e, 'Accordion', {
                toggle: function () {
                  _this.toggle($tabContent);
                },
                next: function () {
                  $elem.next().find('a').focus().trigger('click.zf.accordion');
                },
                previous: function () {
                  $elem.prev().find('a').focus().trigger('click.zf.accordion');
                },
                handled: function () {
                  e.preventDefault();
                  e.stopPropagation();
                }
              });
            });
          }
        });
      }

      /**
       * Toggles the selected content pane's open/close state.
       * @param {jQuery} $target - jQuery object of the pane to toggle.
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle($target) {
        if ($target.parent().hasClass('is-active')) {
          if (this.options.allowAllClosed || $target.parent().siblings().hasClass('is-active')) {
            this.up($target);
          } else {
            return;
          }
        } else {
          this.down($target);
        }
      }

      /**
       * Opens the accordion tab defined by `$target`.
       * @param {jQuery} $target - Accordion pane to open.
       * @param {Boolean} firstTime - flag to determine if reflow should happen.
       * @fires Accordion#down
       * @function
       */

    }, {
      key: 'down',
      value: function down($target, firstTime) {
        var _this = this;
        if (!this.options.multiExpand && !firstTime) {
          var $currentActive = this.$element.find('.is-active').children('[data-tab-content]');
          if ($currentActive.length) {
            this.up($currentActive);
          }
        }

        $target.attr('aria-hidden', false).parent('[data-tab-content]').addBack().parent().addClass('is-active');

        // Foundation.Move(_this.options.slideSpeed, $target, function(){
        $target.slideDown(_this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done opening.
           * @event Accordion#down
           */
          _this.$element.trigger('down.zf.accordion', [$target]);
        });
        // });

        // if(!firstTime){
        //   Foundation._reflow(this.$element.attr('data-accordion'));
        // }
        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': true,
          'aria-selected': true
        });
      }

      /**
       * Closes the tab defined by `$target`.
       * @param {jQuery} $target - Accordion tab to close.
       * @fires Accordion#up
       * @function
       */

    }, {
      key: 'up',
      value: function up($target) {
        var $aunts = $target.parent().siblings(),
            _this = this;
        var canClose = this.options.multiExpand ? $aunts.hasClass('is-active') : $target.parent().hasClass('is-active');

        if (!this.options.allowAllClosed && !canClose) {
          return;
        }

        // Foundation.Move(this.options.slideSpeed, $target, function(){
        $target.slideUp(_this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done collapsing up.
           * @event Accordion#up
           */
          _this.$element.trigger('up.zf.accordion', [$target]);
        });
        // });

        $target.attr('aria-hidden', true).parent().removeClass('is-active');

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': false,
          'aria-selected': false
        });
      }

      /**
       * Destroys an instance of an accordion.
       * @fires Accordion#destroyed
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('[data-tab-content]').slideUp(0).css('display', '');
        this.$element.find('a').off('.zf.accordion');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Accordion;
  }();

  Accordion.defaults = {
    /**
     * Amount of time to animate the opening of an accordion pane.
     * @option
     * @example 250
     */
    slideSpeed: 250,
    /**
     * Allow the accordion to have multiple open panes.
     * @option
     * @example false
     */
    multiExpand: false,
    /**
     * Allow the accordion to close all panes.
     * @option
     * @example false
     */
    allowAllClosed: false
  };

  // Window exports
  Foundation.plugin(Accordion, 'Accordion');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * AccordionMenu module.
   * @module foundation.accordionMenu
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   * @requires foundation.util.nest
   */

  var AccordionMenu = function () {
    /**
     * Creates a new instance of an accordion menu.
     * @class
     * @fires AccordionMenu#init
     * @param {jQuery} element - jQuery object to make into an accordion menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function AccordionMenu(element, options) {
      _classCallCheck(this, AccordionMenu);

      this.$element = element;
      this.options = $.extend({}, AccordionMenu.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'accordion');

      this._init();

      Foundation.registerPlugin(this, 'AccordionMenu');
      Foundation.Keyboard.register('AccordionMenu', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_RIGHT': 'open',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'close',
        'ESCAPE': 'closeAll',
        'TAB': 'down',
        'SHIFT_TAB': 'up'
      });
    }

    /**
     * Initializes the accordion menu by hiding all nested menus.
     * @private
     */


    _createClass(AccordionMenu, [{
      key: '_init',
      value: function _init() {
        this.$element.find('[data-submenu]').not('.is-active').slideUp(0); //.find('a').css('padding-left', '1rem');
        this.$element.attr({
          'role': 'tablist',
          'aria-multiselectable': this.options.multiOpen
        });

        this.$menuLinks = this.$element.find('.is-accordion-submenu-parent');
        this.$menuLinks.each(function () {
          var linkId = this.id || Foundation.GetYoDigits(6, 'acc-menu-link'),
              $elem = $(this),
              $sub = $elem.children('[data-submenu]'),
              subId = $sub[0].id || Foundation.GetYoDigits(6, 'acc-menu'),
              isActive = $sub.hasClass('is-active');
          $elem.attr({
            'aria-controls': subId,
            'aria-expanded': isActive,
            'role': 'tab',
            'id': linkId
          });
          $sub.attr({
            'aria-labelledby': linkId,
            'aria-hidden': !isActive,
            'role': 'tabpanel',
            'id': subId
          });
        });
        var initPanes = this.$element.find('.is-active');
        if (initPanes.length) {
          var _this = this;
          initPanes.each(function () {
            _this.down($(this));
          });
        }
        this._events();
      }

      /**
       * Adds event handlers for items within the menu.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$element.find('li').each(function () {
          var $submenu = $(this).children('[data-submenu]');

          if ($submenu.length) {
            $(this).children('a').off('click.zf.accordionMenu').on('click.zf.accordionMenu', function (e) {
              e.preventDefault();

              _this.toggle($submenu);
            });
          }
        }).on('keydown.zf.accordionmenu', function (e) {
          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement,
              $target = $element.children('[data-submenu]');

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(Math.max(0, i - 1));
              $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));

              if ($(this).children('[data-submenu]:visible').length) {
                // has open sub menu
                $nextElement = $element.find('li:first-child');
              }
              if ($(this).is(':first-child')) {
                // is first element of sub menu
                $prevElement = $element.parents('li').first();
              } else if ($prevElement.children('[data-submenu]:visible').length) {
                // if previous element has open sub menu
                $prevElement = $prevElement.find('li:last-child');
              }
              if ($(this).is(':last-child')) {
                // is last element of sub menu
                $nextElement = $element.parents('li').first().next('li');
              }

              return;
            }
          });
          Foundation.Keyboard.handleKey(e, 'AccordionMenu', {
            open: function () {
              if ($target.is(':hidden')) {
                _this.down($target);
                $target.find('li').first().focus();
              }
            },
            close: function () {
              if ($target.length && !$target.is(':hidden')) {
                // close active sub of this item
                _this.up($target);
              } else if ($element.parent('[data-submenu]').length) {
                // close currently open sub
                _this.up($element.parent('[data-submenu]'));
                $element.parents('li').first().focus();
              }
            },
            up: function () {
              $prevElement.focus();
            },
            down: function () {
              $nextElement.focus();
            },
            toggle: function () {
              if ($element.children('[data-submenu]').length) {
                _this.toggle($element.children('[data-submenu]'));
              }
            },
            closeAll: function () {
              _this.hideAll();
            },
            handled: function () {
              e.preventDefault();
              e.stopImmediatePropagation();
            }
          });
        }); //.attr('tabindex', 0);
      }

      /**
       * Closes all panes of the menu.
       * @function
       */

    }, {
      key: 'hideAll',
      value: function hideAll() {
        this.$element.find('[data-submenu]').slideUp(this.options.slideSpeed);
      }

      /**
       * Toggles the open/close state of a submenu.
       * @function
       * @param {jQuery} $target - the submenu to toggle
       */

    }, {
      key: 'toggle',
      value: function toggle($target) {
        if (!$target.is(':animated')) {
          if (!$target.is(':hidden')) {
            this.up($target);
          } else {
            this.down($target);
          }
        }
      }

      /**
       * Opens the sub-menu defined by `$target`.
       * @param {jQuery} $target - Sub-menu to open.
       * @fires AccordionMenu#down
       */

    }, {
      key: 'down',
      value: function down($target) {
        var _this = this;

        if (!this.options.multiOpen) {
          this.up(this.$element.find('.is-active').not($target.parentsUntil(this.$element).add($target)));
        }

        $target.addClass('is-active').attr({ 'aria-hidden': false }).parent('.is-accordion-submenu-parent').attr({ 'aria-expanded': true });

        Foundation.Move(this.options.slideSpeed, $target, function () {
          $target.slideDown(_this.options.slideSpeed, function () {
            /**
             * Fires when the menu is done opening.
             * @event AccordionMenu#down
             */
            _this.$element.trigger('down.zf.accordionMenu', [$target]);
          });
        });
      }

      /**
       * Closes the sub-menu defined by `$target`. All sub-menus inside the target will be closed as well.
       * @param {jQuery} $target - Sub-menu to close.
       * @fires AccordionMenu#up
       */

    }, {
      key: 'up',
      value: function up($target) {
        var _this = this;
        Foundation.Move(this.options.slideSpeed, $target, function () {
          $target.slideUp(_this.options.slideSpeed, function () {
            /**
             * Fires when the menu is done collapsing up.
             * @event AccordionMenu#up
             */
            _this.$element.trigger('up.zf.accordionMenu', [$target]);
          });
        });

        var $menus = $target.find('[data-submenu]').slideUp(0).addBack().attr('aria-hidden', true);

        $menus.parent('.is-accordion-submenu-parent').attr('aria-expanded', false);
      }

      /**
       * Destroys an instance of accordion menu.
       * @fires AccordionMenu#destroyed
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('[data-submenu]').slideDown(0).css('display', '');
        this.$element.find('a').off('click.zf.accordionMenu');

        Foundation.Nest.Burn(this.$element, 'accordion');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return AccordionMenu;
  }();

  AccordionMenu.defaults = {
    /**
     * Amount of time to animate the opening of a submenu in ms.
     * @option
     * @example 250
     */
    slideSpeed: 250,
    /**
     * Allow the menu to have multiple open panes.
     * @option
     * @example true
     */
    multiOpen: true
  };

  // Window exports
  Foundation.plugin(AccordionMenu, 'AccordionMenu');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Drilldown module.
   * @module foundation.drilldown
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   * @requires foundation.util.nest
   */

  var Drilldown = function () {
    /**
     * Creates a new instance of a drilldown menu.
     * @class
     * @param {jQuery} element - jQuery object to make into an accordion menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Drilldown(element, options) {
      _classCallCheck(this, Drilldown);

      this.$element = element;
      this.options = $.extend({}, Drilldown.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'drilldown');

      this._init();

      Foundation.registerPlugin(this, 'Drilldown');
      Foundation.Keyboard.register('Drilldown', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close',
        'TAB': 'down',
        'SHIFT_TAB': 'up'
      });
    }

    /**
     * Initializes the drilldown by creating jQuery collections of elements
     * @private
     */


    _createClass(Drilldown, [{
      key: '_init',
      value: function _init() {
        this.$submenuAnchors = this.$element.find('li.is-drilldown-submenu-parent');
        this.$submenus = this.$submenuAnchors.children('[data-submenu]');
        this.$menuItems = this.$element.find('li').not('.js-drilldown-back').attr('role', 'menuitem');

        this._prepareMenu();

        this._keyboardEvents();
      }

      /**
       * prepares drilldown menu by setting attributes to links and elements
       * sets a min height to prevent content jumping
       * wraps the element if not already wrapped
       * @private
       * @function
       */

    }, {
      key: '_prepareMenu',
      value: function _prepareMenu() {
        var _this = this;
        // if(!this.options.holdOpen){
        //   this._menuLinkEvents();
        // }
        this.$submenuAnchors.each(function () {
          var $sub = $(this);
          var $link = $sub.find('a:first');
          if (_this.options.parentLink) {
            $link.clone().prependTo($sub.children('[data-submenu]')).wrap('<li class="is-submenu-parent-item is-submenu-item is-drilldown-submenu-item" role="menu-item"></li>');
          }
          $link.data('savedHref', $link.attr('href')).removeAttr('href');
          $sub.children('[data-submenu]').attr({
            'aria-hidden': true,
            'tabindex': 0,
            'role': 'menu'
          });
          _this._events($sub);
        });
        this.$submenus.each(function () {
          var $menu = $(this),
              $back = $menu.find('.js-drilldown-back');
          if (!$back.length) {
            $menu.prepend(_this.options.backButton);
          }
          _this._back($menu);
        });
        if (!this.$element.parent().hasClass('is-drilldown')) {
          this.$wrapper = $(this.options.wrapper).addClass('is-drilldown').css(this._getMaxDims());
          this.$element.wrap(this.$wrapper);
        }
      }

      /**
       * Adds event handlers to elements in the menu.
       * @function
       * @private
       * @param {jQuery} $elem - the current menu item to add handlers to.
       */

    }, {
      key: '_events',
      value: function _events($elem) {
        var _this = this;

        $elem.off('click.zf.drilldown').on('click.zf.drilldown', function (e) {
          if ($(e.target).parentsUntil('ul', 'li').hasClass('is-drilldown-submenu-parent')) {
            e.stopImmediatePropagation();
            e.preventDefault();
          }

          // if(e.target !== e.currentTarget.firstElementChild){
          //   return false;
          // }
          _this._show($elem);

          if (_this.options.closeOnClick) {
            var $body = $('body').not(_this.$wrapper);
            $body.off('.zf.drilldown').on('click.zf.drilldown', function (e) {
              e.preventDefault();
              _this._hideAll();
              $body.off('.zf.drilldown');
            });
          }
        });
      }

      /**
       * Adds keydown event listener to `li`'s in the menu.
       * @private
       */

    }, {
      key: '_keyboardEvents',
      value: function _keyboardEvents() {
        var _this = this;
        this.$menuItems.add(this.$element.find('.js-drilldown-back')).on('keydown.zf.drilldown', function (e) {
          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(Math.max(0, i - 1));
              $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              return;
            }
          });
          Foundation.Keyboard.handleKey(e, 'Drilldown', {
            next: function () {
              if ($element.is(_this.$submenuAnchors)) {
                _this._show($element);
                $element.on(Foundation.transitionend($element), function () {
                  $element.find('ul li').filter(_this.$menuItems).first().focus();
                });
              }
            },
            previous: function () {
              _this._hide($element.parent('ul'));
              $element.parent('ul').on(Foundation.transitionend($element), function () {
                setTimeout(function () {
                  $element.parent('ul').parent('li').focus();
                }, 1);
              });
            },
            up: function () {
              $prevElement.focus();
            },
            down: function () {
              $nextElement.focus();
            },
            close: function () {
              _this._back();
              //_this.$menuItems.first().focus(); // focus to first element
            },
            open: function () {
              if (!$element.is(_this.$menuItems)) {
                // not menu item means back button
                _this._hide($element.parent('ul'));
                setTimeout(function () {
                  $element.parent('ul').parent('li').focus();
                }, 1);
              } else if ($element.is(_this.$submenuAnchors)) {
                _this._show($element);
                setTimeout(function () {
                  $element.find('ul li').filter(_this.$menuItems).first().focus();
                }, 1);
              }
            },
            handled: function () {
              e.preventDefault();
              e.stopImmediatePropagation();
            }
          });
        }); // end keyboardAccess
      }

      /**
       * Closes all open elements, and returns to root menu.
       * @function
       * @fires Drilldown#closed
       */

    }, {
      key: '_hideAll',
      value: function _hideAll() {
        var $elem = this.$element.find('.is-drilldown-submenu.is-active').addClass('is-closing');
        $elem.one(Foundation.transitionend($elem), function (e) {
          $elem.removeClass('is-active is-closing');
        });
        /**
         * Fires when the menu is fully closed.
         * @event Drilldown#closed
         */
        this.$element.trigger('closed.zf.drilldown');
      }

      /**
       * Adds event listener for each `back` button, and closes open menus.
       * @function
       * @fires Drilldown#back
       * @param {jQuery} $elem - the current sub-menu to add `back` event.
       */

    }, {
      key: '_back',
      value: function _back($elem) {
        var _this = this;
        $elem.off('click.zf.drilldown');
        $elem.children('.js-drilldown-back').on('click.zf.drilldown', function (e) {
          e.stopImmediatePropagation();
          // console.log('mouseup on back');
          _this._hide($elem);
        });
      }

      /**
       * Adds event listener to menu items w/o submenus to close open menus on click.
       * @function
       * @private
       */

    }, {
      key: '_menuLinkEvents',
      value: function _menuLinkEvents() {
        var _this = this;
        this.$menuItems.not('.is-drilldown-submenu-parent').off('click.zf.drilldown').on('click.zf.drilldown', function (e) {
          // e.stopImmediatePropagation();
          setTimeout(function () {
            _this._hideAll();
          }, 0);
        });
      }

      /**
       * Opens a submenu.
       * @function
       * @fires Drilldown#open
       * @param {jQuery} $elem - the current element with a submenu to open.
       */

    }, {
      key: '_show',
      value: function _show($elem) {
        $elem.children('[data-submenu]').addClass('is-active');

        this.$element.trigger('open.zf.drilldown', [$elem]);
      }
    }, {
      key: '_hide',


      /**
       * Hides a submenu
       * @function
       * @fires Drilldown#hide
       * @param {jQuery} $elem - the current sub-menu to hide.
       */
      value: function _hide($elem) {
        var _this = this;
        $elem.addClass('is-closing').one(Foundation.transitionend($elem), function () {
          $elem.removeClass('is-active is-closing');
          $elem.blur();
        });
        /**
         * Fires when the submenu is has closed.
         * @event Drilldown#hide
         */
        $elem.trigger('hide.zf.drilldown', [$elem]);
      }

      /**
       * Iterates through the nested menus to calculate the min-height, and max-width for the menu.
       * Prevents content jumping.
       * @function
       * @private
       */

    }, {
      key: '_getMaxDims',
      value: function _getMaxDims() {
        var max = 0,
            result = {};
        this.$submenus.add(this.$element).each(function () {
          var numOfElems = $(this).children('li').length;
          max = numOfElems > max ? numOfElems : max;
        });

        result['min-height'] = max * this.$menuItems[0].getBoundingClientRect().height + 'px';
        result['max-width'] = this.$element[0].getBoundingClientRect().width + 'px';

        return result;
      }

      /**
       * Destroys the Drilldown Menu
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this._hideAll();
        Foundation.Nest.Burn(this.$element, 'drilldown');
        this.$element.unwrap().find('.js-drilldown-back, .is-submenu-parent-item').remove().end().find('.is-active, .is-closing, .is-drilldown-submenu').removeClass('is-active is-closing is-drilldown-submenu').end().find('[data-submenu]').removeAttr('aria-hidden tabindex role').off('.zf.drilldown').end().off('zf.drilldown');
        this.$element.find('a').each(function () {
          var $link = $(this);
          if ($link.data('savedHref')) {
            $link.attr('href', $link.data('savedHref')).removeData('savedHref');
          } else {
            return;
          }
        });
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Drilldown;
  }();

  Drilldown.defaults = {
    /**
     * Markup used for JS generated back button. Prepended to submenu lists and deleted on `destroy` method, 'js-drilldown-back' class required. Remove the backslash (`\`) if copy and pasting.
     * @option
     * @example '<\li><\a>Back<\/a><\/li>'
     */
    backButton: '<li class="js-drilldown-back"><a>Back</a></li>',
    /**
     * Markup used to wrap drilldown menu. Use a class name for independent styling; the JS applied class: `is-drilldown` is required. Remove the backslash (`\`) if copy and pasting.
     * @option
     * @example '<\div class="is-drilldown"><\/div>'
     */
    wrapper: '<div></div>',
    /**
     * Adds the parent link to the submenu.
     * @option
     * @example false
     */
    parentLink: false,
    /**
     * Allow the menu to return to root list on body click.
     * @option
     * @example false
     */
    closeOnClick: false
    // holdOpen: false
  };

  // Window exports
  Foundation.plugin(Drilldown, 'Drilldown');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Dropdown module.
   * @module foundation.dropdown
   * @requires foundation.util.keyboard
   * @requires foundation.util.box
   * @requires foundation.util.triggers
   */

  var Dropdown = function () {
    /**
     * Creates a new instance of a dropdown.
     * @class
     * @param {jQuery} element - jQuery object to make into a dropdown.
     *        Object should be of the dropdown panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Dropdown(element, options) {
      _classCallCheck(this, Dropdown);

      this.$element = element;
      this.options = $.extend({}, Dropdown.defaults, this.$element.data(), options);
      this._init();

      Foundation.registerPlugin(this, 'Dropdown');
      Foundation.Keyboard.register('Dropdown', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ESCAPE': 'close',
        'TAB': 'tab_forward',
        'SHIFT_TAB': 'tab_backward'
      });
    }

    /**
     * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
     * @function
     * @private
     */


    _createClass(Dropdown, [{
      key: '_init',
      value: function _init() {
        var $id = this.$element.attr('id');

        this.$anchor = $('[data-toggle="' + $id + '"]') || $('[data-open="' + $id + '"]');
        this.$anchor.attr({
          'aria-controls': $id,
          'data-is-focus': false,
          'data-yeti-box': $id,
          'aria-haspopup': true,
          'aria-expanded': false

        });

        this.options.positionClass = this.getPositionClass();
        this.counter = 4;
        this.usedPositions = [];
        this.$element.attr({
          'aria-hidden': 'true',
          'data-yeti-box': $id,
          'data-resize': $id,
          'aria-labelledby': this.$anchor[0].id || Foundation.GetYoDigits(6, 'dd-anchor')
        });
        this._events();
      }

      /**
       * Helper function to determine current orientation of dropdown pane.
       * @function
       * @returns {String} position - string value of a position class.
       */

    }, {
      key: 'getPositionClass',
      value: function getPositionClass() {
        var position = this.$element[0].className.match(/\b(top|left|right)\b/g);
        position = position ? position[0] : '';
        return position;
      }

      /**
       * Adjusts the dropdown panes orientation by adding/removing positioning classes.
       * @function
       * @private
       * @param {String} position - position class to remove.
       */

    }, {
      key: '_reposition',
      value: function _reposition(position) {
        this.usedPositions.push(position ? position : 'bottom');
        //default, try switching to opposite side
        if (!position && this.usedPositions.indexOf('top') < 0) {
          this.$element.addClass('top');
        } else if (position === 'top' && this.usedPositions.indexOf('bottom') < 0) {
          this.$element.removeClass(position);
        } else if (position === 'left' && this.usedPositions.indexOf('right') < 0) {
          this.$element.removeClass(position).addClass('right');
        } else if (position === 'right' && this.usedPositions.indexOf('left') < 0) {
          this.$element.removeClass(position).addClass('left');
        }

        //if default change didn't work, try bottom or left first
        else if (!position && this.usedPositions.indexOf('top') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.$element.addClass('left');
          } else if (position === 'top' && this.usedPositions.indexOf('bottom') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.$element.removeClass(position).addClass('left');
          } else if (position === 'left' && this.usedPositions.indexOf('right') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.$element.removeClass(position);
          } else if (position === 'right' && this.usedPositions.indexOf('left') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.$element.removeClass(position);
          }
          //if nothing cleared, set to bottom
          else {
              this.$element.removeClass(position);
            }
        this.classChanged = true;
        this.counter--;
      }

      /**
       * Sets the position and orientation of the dropdown pane, checks for collisions.
       * Recursively calls itself if a collision is detected, with a new position class.
       * @function
       * @private
       */

    }, {
      key: '_setPosition',
      value: function _setPosition() {
        if (this.$anchor.attr('aria-expanded') === 'false') {
          return false;
        }
        var position = this.getPositionClass(),
            $eleDims = Foundation.Box.GetDimensions(this.$element),
            $anchorDims = Foundation.Box.GetDimensions(this.$anchor),
            _this = this,
            direction = position === 'left' ? 'left' : position === 'right' ? 'left' : 'top',
            param = direction === 'top' ? 'height' : 'width',
            offset = param === 'height' ? this.options.vOffset : this.options.hOffset;

        if ($eleDims.width >= $eleDims.windowDims.width || !this.counter && !Foundation.Box.ImNotTouchingYou(this.$element)) {
          this.$element.offset(Foundation.Box.GetOffsets(this.$element, this.$anchor, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
            'width': $eleDims.windowDims.width - this.options.hOffset * 2,
            'height': 'auto'
          });
          this.classChanged = true;
          return false;
        }

        this.$element.offset(Foundation.Box.GetOffsets(this.$element, this.$anchor, position, this.options.vOffset, this.options.hOffset));

        while (!Foundation.Box.ImNotTouchingYou(this.$element) && this.counter) {
          this._reposition(position);
          this._setPosition();
        }
      }

      /**
       * Adds event listeners to the element utilizing the triggers utility library.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;
        this.$element.on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'resizeme.zf.trigger': this._setPosition.bind(this)
        });

        if (this.options.hover) {
          this.$anchor.off('mouseenter.zf.dropdown mouseleave.zf.dropdown').on('mouseenter.zf.dropdown', function () {
            clearTimeout(_this.timeout);
            _this.timeout = setTimeout(function () {
              _this.open();
              _this.$anchor.data('hover', true);
            }, _this.options.hoverDelay);
          }).on('mouseleave.zf.dropdown', function () {
            clearTimeout(_this.timeout);
            _this.timeout = setTimeout(function () {
              _this.close();
              _this.$anchor.data('hover', false);
            }, _this.options.hoverDelay);
          });
          if (this.options.hoverPane) {
            this.$element.off('mouseenter.zf.dropdown mouseleave.zf.dropdown').on('mouseenter.zf.dropdown', function () {
              clearTimeout(_this.timeout);
            }).on('mouseleave.zf.dropdown', function () {
              clearTimeout(_this.timeout);
              _this.timeout = setTimeout(function () {
                _this.close();
                _this.$anchor.data('hover', false);
              }, _this.options.hoverDelay);
            });
          }
        }
        this.$anchor.add(this.$element).on('keydown.zf.dropdown', function (e) {

          var $target = $(this),
              visibleFocusableElements = Foundation.Keyboard.findFocusable(_this.$element);

          Foundation.Keyboard.handleKey(e, 'Dropdown', {
            tab_forward: function () {
              if (_this.$element.find(':focus').is(visibleFocusableElements.eq(-1))) {
                // left modal downwards, setting focus to first element
                if (_this.options.trapFocus) {
                  // if focus shall be trapped
                  visibleFocusableElements.eq(0).focus();
                  e.preventDefault();
                } else {
                  // if focus is not trapped, close dropdown on focus out
                  _this.close();
                }
              }
            },
            tab_backward: function () {
              if (_this.$element.find(':focus').is(visibleFocusableElements.eq(0)) || _this.$element.is(':focus')) {
                // left modal upwards, setting focus to last element
                if (_this.options.trapFocus) {
                  // if focus shall be trapped
                  visibleFocusableElements.eq(-1).focus();
                  e.preventDefault();
                } else {
                  // if focus is not trapped, close dropdown on focus out
                  _this.close();
                }
              }
            },
            open: function () {
              if ($target.is(_this.$anchor)) {
                _this.open();
                _this.$element.attr('tabindex', -1).focus();
                e.preventDefault();
              }
            },
            close: function () {
              _this.close();
              _this.$anchor.focus();
            }
          });
        });
      }

      /**
       * Adds an event handler to the body to close any dropdowns on a click.
       * @function
       * @private
       */

    }, {
      key: '_addBodyHandler',
      value: function _addBodyHandler() {
        var $body = $(document.body).not(this.$element),
            _this = this;
        $body.off('click.zf.dropdown').on('click.zf.dropdown', function (e) {
          if (_this.$anchor.is(e.target) || _this.$anchor.find(e.target).length) {
            return;
          }
          if (_this.$element.find(e.target).length) {
            return;
          }
          _this.close();
          $body.off('click.zf.dropdown');
        });
      }

      /**
       * Opens the dropdown pane, and fires a bubbling event to close other dropdowns.
       * @function
       * @fires Dropdown#closeme
       * @fires Dropdown#show
       */

    }, {
      key: 'open',
      value: function open() {
        // var _this = this;
        /**
         * Fires to close other open dropdowns
         * @event Dropdown#closeme
         */
        this.$element.trigger('closeme.zf.dropdown', this.$element.attr('id'));
        this.$anchor.addClass('hover').attr({ 'aria-expanded': true });
        // this.$element/*.show()*/;
        this._setPosition();
        this.$element.addClass('is-open').attr({ 'aria-hidden': false });

        if (this.options.autoFocus) {
          var $focusable = Foundation.Keyboard.findFocusable(this.$element);
          if ($focusable.length) {
            $focusable.eq(0).focus();
          }
        }

        if (this.options.closeOnClick) {
          this._addBodyHandler();
        }

        /**
         * Fires once the dropdown is visible.
         * @event Dropdown#show
         */
        this.$element.trigger('show.zf.dropdown', [this.$element]);
      }

      /**
       * Closes the open dropdown pane.
       * @function
       * @fires Dropdown#hide
       */

    }, {
      key: 'close',
      value: function close() {
        if (!this.$element.hasClass('is-open')) {
          return false;
        }
        this.$element.removeClass('is-open').attr({ 'aria-hidden': true });

        this.$anchor.removeClass('hover').attr('aria-expanded', false);

        if (this.classChanged) {
          var curPositionClass = this.getPositionClass();
          if (curPositionClass) {
            this.$element.removeClass(curPositionClass);
          }
          this.$element.addClass(this.options.positionClass)
          /*.hide()*/.css({ height: '', width: '' });
          this.classChanged = false;
          this.counter = 4;
          this.usedPositions.length = 0;
        }
        this.$element.trigger('hide.zf.dropdown', [this.$element]);
      }

      /**
       * Toggles the dropdown pane's visibility.
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.$element.hasClass('is-open')) {
          if (this.$anchor.data('hover')) return;
          this.close();
        } else {
          this.open();
        }
      }

      /**
       * Destroys the dropdown.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.trigger').hide();
        this.$anchor.off('.zf.dropdown');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Dropdown;
  }();

  Dropdown.defaults = {
    /**
     * Amount of time to delay opening a submenu on hover event.
     * @option
     * @example 250
     */
    hoverDelay: 250,
    /**
     * Allow submenus to open on hover events
     * @option
     * @example false
     */
    hover: false,
    /**
     * Don't close dropdown when hovering over dropdown pane
     * @option
     * @example true
     */
    hoverPane: false,
    /**
     * Number of pixels between the dropdown pane and the triggering element on open.
     * @option
     * @example 1
     */
    vOffset: 1,
    /**
     * Number of pixels between the dropdown pane and the triggering element on open.
     * @option
     * @example 1
     */
    hOffset: 1,
    /**
     * Class applied to adjust open position. JS will test and fill this in.
     * @option
     * @example 'top'
     */
    positionClass: '',
    /**
     * Allow the plugin to trap focus to the dropdown pane if opened with keyboard commands.
     * @option
     * @example false
     */
    trapFocus: false,
    /**
     * Allow the plugin to set focus to the first focusable element within the pane, regardless of method of opening.
     * @option
     * @example true
     */
    autoFocus: false,
    /**
     * Allows a click on the body to close the dropdown.
     * @option
     * @example false
     */
    closeOnClick: false
  };

  // Window exports
  Foundation.plugin(Dropdown, 'Dropdown');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * DropdownMenu module.
   * @module foundation.dropdown-menu
   * @requires foundation.util.keyboard
   * @requires foundation.util.box
   * @requires foundation.util.nest
   */

  var DropdownMenu = function () {
    /**
     * Creates a new instance of DropdownMenu.
     * @class
     * @fires DropdownMenu#init
     * @param {jQuery} element - jQuery object to make into a dropdown menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function DropdownMenu(element, options) {
      _classCallCheck(this, DropdownMenu);

      this.$element = element;
      this.options = $.extend({}, DropdownMenu.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'dropdown');
      this._init();

      Foundation.registerPlugin(this, 'DropdownMenu');
      Foundation.Keyboard.register('DropdownMenu', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close'
      });
    }

    /**
     * Initializes the plugin, and calls _prepareMenu
     * @private
     * @function
     */


    _createClass(DropdownMenu, [{
      key: '_init',
      value: function _init() {
        var subs = this.$element.find('li.is-dropdown-submenu-parent');
        this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');

        this.$menuItems = this.$element.find('[role="menuitem"]');
        this.$tabs = this.$element.children('[role="menuitem"]');
        this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);

        if (this.$element.hasClass(this.options.rightClass) || this.options.alignment === 'right' || Foundation.rtl()) {
          this.options.alignment = 'right';
          subs.addClass('opens-left');
        } else {
          subs.addClass('opens-right');
        }
        this.changed = false;
        this._events();
      }
    }, {
      key: '_events',

      /**
       * Adds event listeners to elements within the menu
       * @private
       * @function
       */
      value: function _events() {
        var _this = this,
            hasTouch = 'ontouchstart' in window || typeof window.ontouchstart !== 'undefined',
            parClass = 'is-dropdown-submenu-parent';

        if (this.options.clickOpen || hasTouch) {
          this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu', function (e) {
            var $elem = $(e.target).parentsUntil('ul', '.' + parClass),
                hasSub = $elem.hasClass(parClass),
                hasClicked = $elem.attr('data-is-click') === 'true',
                $sub = $elem.children('.is-dropdown-submenu');

            if (hasSub) {
              if (hasClicked) {
                if (!_this.options.closeOnClick || !_this.options.clickOpen && !hasTouch || _this.options.forceFollow && hasTouch) {
                  return;
                } else {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  _this._hide($elem);
                }
              } else {
                e.preventDefault();
                e.stopImmediatePropagation();
                _this._show($elem.children('.is-dropdown-submenu'));
                $elem.add($elem.parentsUntil(_this.$element, '.' + parClass)).attr('data-is-click', true);
              }
            } else {
              return;
            }
          });
        }

        if (!this.options.disableHover) {
          this.$menuItems.on('mouseenter.zf.dropdownmenu', function (e) {
            e.stopImmediatePropagation();
            var $elem = $(this),
                hasSub = $elem.hasClass(parClass);

            if (hasSub) {
              clearTimeout(_this.delay);
              _this.delay = setTimeout(function () {
                _this._show($elem.children('.is-dropdown-submenu'));
              }, _this.options.hoverDelay);
            }
          }).on('mouseleave.zf.dropdownmenu', function (e) {
            var $elem = $(this),
                hasSub = $elem.hasClass(parClass);
            if (hasSub && _this.options.autoclose) {
              if ($elem.attr('data-is-click') === 'true' && _this.options.clickOpen) {
                return false;
              }

              clearTimeout(_this.delay);
              _this.delay = setTimeout(function () {
                _this._hide($elem);
              }, _this.options.closingTime);
            }
          });
        }
        this.$menuItems.on('keydown.zf.dropdownmenu', function (e) {
          var $element = $(e.target).parentsUntil('ul', '[role="menuitem"]'),
              isTab = _this.$tabs.index($element) > -1,
              $elements = isTab ? _this.$tabs : $element.siblings('li').add($element),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(i - 1);
              $nextElement = $elements.eq(i + 1);
              return;
            }
          });

          var nextSibling = function () {
            if (!$element.is(':last-child')) $nextElement.children('a:first').focus();
          },
              prevSibling = function () {
            $prevElement.children('a:first').focus();
          },
              openSub = function () {
            var $sub = $element.children('ul.is-dropdown-submenu');
            if ($sub.length) {
              _this._show($sub);
              $element.find('li > a:first').focus();
            } else {
              return;
            }
          },
              closeSub = function () {
            //if ($element.is(':first-child')) {
            var close = $element.parent('ul').parent('li');
            close.children('a:first').focus();
            _this._hide(close);
            //}
          };
          var functions = {
            open: openSub,
            close: function () {
              _this._hide(_this.$element);
              _this.$menuItems.find('a:first').focus(); // focus to first element
            },
            handled: function () {
              e.preventDefault();
              e.stopImmediatePropagation();
            }
          };

          if (isTab) {
            if (_this.vertical) {
              // vertical menu
              if (_this.options.alignment === 'left') {
                // left aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: openSub,
                  previous: closeSub
                });
              } else {
                // right aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: closeSub,
                  previous: openSub
                });
              }
            } else {
              // horizontal menu
              $.extend(functions, {
                next: nextSibling,
                previous: prevSibling,
                down: openSub,
                up: closeSub
              });
            }
          } else {
            // not tabs -> one sub
            if (_this.options.alignment === 'left') {
              // left aligned
              $.extend(functions, {
                next: openSub,
                previous: closeSub,
                down: nextSibling,
                up: prevSibling
              });
            } else {
              // right aligned
              $.extend(functions, {
                next: closeSub,
                previous: openSub,
                down: nextSibling,
                up: prevSibling
              });
            }
          }
          Foundation.Keyboard.handleKey(e, 'DropdownMenu', functions);
        });
      }

      /**
       * Adds an event handler to the body to close any dropdowns on a click.
       * @function
       * @private
       */

    }, {
      key: '_addBodyHandler',
      value: function _addBodyHandler() {
        var $body = $(document.body),
            _this = this;
        $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu').on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu', function (e) {
          var $link = _this.$element.find(e.target);
          if ($link.length) {
            return;
          }

          _this._hide();
          $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu');
        });
      }

      /**
       * Opens a dropdown pane, and checks for collisions first.
       * @param {jQuery} $sub - ul element that is a submenu to show
       * @function
       * @private
       * @fires DropdownMenu#show
       */

    }, {
      key: '_show',
      value: function _show($sub) {
        var idx = this.$tabs.index(this.$tabs.filter(function (i, el) {
          return $(el).find($sub).length > 0;
        }));
        var $sibs = $sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
        this._hide($sibs, idx);
        $sub.css('visibility', 'hidden').addClass('js-dropdown-active').attr({ 'aria-hidden': false }).parent('li.is-dropdown-submenu-parent').addClass('is-active').attr({ 'aria-expanded': true });
        var clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
        if (!clear) {
          var oldClass = this.options.alignment === 'left' ? '-right' : '-left',
              $parentLi = $sub.parent('.is-dropdown-submenu-parent');
          $parentLi.removeClass('opens' + oldClass).addClass('opens-' + this.options.alignment);
          clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
          if (!clear) {
            $parentLi.removeClass('opens-' + this.options.alignment).addClass('opens-inner');
          }
          this.changed = true;
        }
        $sub.css('visibility', '');
        if (this.options.closeOnClick) {
          this._addBodyHandler();
        }
        /**
         * Fires when the new dropdown pane is visible.
         * @event DropdownMenu#show
         */
        this.$element.trigger('show.zf.dropdownmenu', [$sub]);
      }

      /**
       * Hides a single, currently open dropdown pane, if passed a parameter, otherwise, hides everything.
       * @function
       * @param {jQuery} $elem - element with a submenu to hide
       * @param {Number} idx - index of the $tabs collection to hide
       * @private
       */

    }, {
      key: '_hide',
      value: function _hide($elem, idx) {
        var $toClose;
        if ($elem && $elem.length) {
          $toClose = $elem;
        } else if (idx !== undefined) {
          $toClose = this.$tabs.not(function (i, el) {
            return i === idx;
          });
        } else {
          $toClose = this.$element;
        }
        var somethingToClose = $toClose.hasClass('is-active') || $toClose.find('.is-active').length > 0;

        if (somethingToClose) {
          $toClose.find('li.is-active').add($toClose).attr({
            'aria-expanded': false,
            'data-is-click': false
          }).removeClass('is-active');

          $toClose.find('ul.js-dropdown-active').attr({
            'aria-hidden': true
          }).removeClass('js-dropdown-active');

          if (this.changed || $toClose.find('opens-inner').length) {
            var oldClass = this.options.alignment === 'left' ? 'right' : 'left';
            $toClose.find('li.is-dropdown-submenu-parent').add($toClose).removeClass('opens-inner opens-' + this.options.alignment).addClass('opens-' + oldClass);
            this.changed = false;
          }
          /**
           * Fires when the open menus are closed.
           * @event DropdownMenu#hide
           */
          this.$element.trigger('hide.zf.dropdownmenu', [$toClose]);
        }
      }

      /**
       * Destroys the plugin.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click').removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
        $(document.body).off('.zf.dropdownmenu');
        Foundation.Nest.Burn(this.$element, 'dropdown');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return DropdownMenu;
  }();

  /**
   * Default settings for plugin
   */


  DropdownMenu.defaults = {
    /**
     * Disallows hover events from opening submenus
     * @option
     * @example false
     */
    disableHover: false,
    /**
     * Allow a submenu to automatically close on a mouseleave event, if not clicked open.
     * @option
     * @example true
     */
    autoclose: true,
    /**
     * Amount of time to delay opening a submenu on hover event.
     * @option
     * @example 50
     */
    hoverDelay: 50,
    /**
     * Allow a submenu to open/remain open on parent click event. Allows cursor to move away from menu.
     * @option
     * @example true
     */
    clickOpen: false,
    /**
     * Amount of time to delay closing a submenu on a mouseleave event.
     * @option
     * @example 500
     */

    closingTime: 500,
    /**
     * Position of the menu relative to what direction the submenus should open. Handled by JS.
     * @option
     * @example 'left'
     */
    alignment: 'left',
    /**
     * Allow clicks on the body to close any open submenus.
     * @option
     * @example true
     */
    closeOnClick: true,
    /**
     * Class applied to vertical oriented menus, Foundation default is `vertical`. Update this if using your own class.
     * @option
     * @example 'vertical'
     */
    verticalClass: 'vertical',
    /**
     * Class applied to right-side oriented menus, Foundation default is `align-right`. Update this if using your own class.
     * @option
     * @example 'align-right'
     */
    rightClass: 'align-right',
    /**
     * Boolean to force overide the clicking of links to perform default action, on second touch event for mobile.
     * @option
     * @example false
     */
    forceFollow: true
  };

  // Window exports
  Foundation.plugin(DropdownMenu, 'DropdownMenu');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Equalizer module.
   * @module foundation.equalizer
   */

  var Equalizer = function () {
    /**
     * Creates a new instance of Equalizer.
     * @class
     * @fires Equalizer#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Equalizer(element, options) {
      _classCallCheck(this, Equalizer);

      this.$element = element;
      this.options = $.extend({}, Equalizer.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Equalizer');
    }

    /**
     * Initializes the Equalizer plugin and calls functions to get equalizer functioning on load.
     * @private
     */


    _createClass(Equalizer, [{
      key: '_init',
      value: function _init() {
        var eqId = this.$element.attr('data-equalizer') || '';
        var $watched = this.$element.find('[data-equalizer-watch="' + eqId + '"]');

        this.$watched = $watched.length ? $watched : this.$element.find('[data-equalizer-watch]');
        this.$element.attr('data-resize', eqId || Foundation.GetYoDigits(6, 'eq'));

        this.hasNested = this.$element.find('[data-equalizer]').length > 0;
        this.isNested = this.$element.parentsUntil(document.body, '[data-equalizer]').length > 0;
        this.isOn = false;

        var imgs = this.$element.find('img');
        var tooSmall;
        if (this.options.equalizeOn) {
          tooSmall = this._checkMQ();
          $(window).on('changed.zf.mediaquery', this._checkMQ.bind(this));
        } else {
          this._events();
        }
        if (tooSmall !== undefined && tooSmall === false || tooSmall === undefined) {
          if (imgs.length) {
            Foundation.onImagesLoaded(imgs, this._reflow.bind(this));
          } else {
            this._reflow();
          }
        }
      }

      /**
       * Removes event listeners if the breakpoint is too small.
       * @private
       */

    }, {
      key: '_pauseEvents',
      value: function _pauseEvents() {
        this.isOn = false;
        this.$element.off('.zf.equalizer resizeme.zf.trigger');
      }

      /**
       * Initializes events for Equalizer.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;
        this._pauseEvents();
        if (this.hasNested) {
          this.$element.on('postequalized.zf.equalizer', function (e) {
            if (e.target !== _this.$element[0]) {
              _this._reflow();
            }
          });
        } else {
          this.$element.on('resizeme.zf.trigger', this._reflow.bind(this));
        }
        this.isOn = true;
      }

      /**
       * Checks the current breakpoint to the minimum required size.
       * @private
       */

    }, {
      key: '_checkMQ',
      value: function _checkMQ() {
        var tooSmall = !Foundation.MediaQuery.atLeast(this.options.equalizeOn);
        if (tooSmall) {
          if (this.isOn) {
            this._pauseEvents();
            this.$watched.css('height', 'auto');
          }
        } else {
          if (!this.isOn) {
            this._events();
          }
        }
        return tooSmall;
      }

      /**
       * A noop version for the plugin
       * @private
       */

    }, {
      key: '_killswitch',
      value: function _killswitch() {
        return;
      }

      /**
       * Calls necessary functions to update Equalizer upon DOM change
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        if (!this.options.equalizeOnStack) {
          if (this._isStacked()) {
            this.$watched.css('height', 'auto');
            return false;
          }
        }
        if (this.options.equalizeByRow) {
          this.getHeightsByRow(this.applyHeightByRow.bind(this));
        } else {
          this.getHeights(this.applyHeight.bind(this));
        }
      }

      /**
       * Manually determines if the first 2 elements are *NOT* stacked.
       * @private
       */

    }, {
      key: '_isStacked',
      value: function _isStacked() {
        return this.$watched[0].offsetTop !== this.$watched[1].offsetTop;
      }

      /**
       * Finds the outer heights of children contained within an Equalizer parent and returns them in an array
       * @param {Function} cb - A non-optional callback to return the heights array to.
       * @returns {Array} heights - An array of heights of children within Equalizer container
       */

    }, {
      key: 'getHeights',
      value: function getHeights(cb) {
        var heights = [];
        for (var i = 0, len = this.$watched.length; i < len; i++) {
          this.$watched[i].style.height = 'auto';
          heights.push(this.$watched[i].offsetHeight);
        }
        cb(heights);
      }

      /**
       * Finds the outer heights of children contained within an Equalizer parent and returns them in an array
       * @param {Function} cb - A non-optional callback to return the heights array to.
       * @returns {Array} groups - An array of heights of children within Equalizer container grouped by row with element,height and max as last child
       */

    }, {
      key: 'getHeightsByRow',
      value: function getHeightsByRow(cb) {
        var lastElTopOffset = this.$watched.first().offset().top,
            groups = [],
            group = 0;
        //group by Row
        groups[group] = [];
        for (var i = 0, len = this.$watched.length; i < len; i++) {
          this.$watched[i].style.height = 'auto';
          //maybe could use this.$watched[i].offsetTop
          var elOffsetTop = $(this.$watched[i]).offset().top;
          if (elOffsetTop != lastElTopOffset) {
            group++;
            groups[group] = [];
            lastElTopOffset = elOffsetTop;
          }
          groups[group].push([this.$watched[i], this.$watched[i].offsetHeight]);
        }

        for (var j = 0, ln = groups.length; j < ln; j++) {
          var heights = $(groups[j]).map(function () {
            return this[1];
          }).get();
          var max = Math.max.apply(null, heights);
          groups[j].push(max);
        }
        cb(groups);
      }

      /**
       * Changes the CSS height property of each child in an Equalizer parent to match the tallest
       * @param {array} heights - An array of heights of children within Equalizer container
       * @fires Equalizer#preequalized
       * @fires Equalizer#postequalized
       */

    }, {
      key: 'applyHeight',
      value: function applyHeight(heights) {
        var max = Math.max.apply(null, heights);
        /**
         * Fires before the heights are applied
         * @event Equalizer#preequalized
         */
        this.$element.trigger('preequalized.zf.equalizer');

        this.$watched.css('height', max);

        /**
         * Fires when the heights have been applied
         * @event Equalizer#postequalized
         */
        this.$element.trigger('postequalized.zf.equalizer');
      }

      /**
       * Changes the CSS height property of each child in an Equalizer parent to match the tallest by row
       * @param {array} groups - An array of heights of children within Equalizer container grouped by row with element,height and max as last child
       * @fires Equalizer#preequalized
       * @fires Equalizer#preequalizedRow
       * @fires Equalizer#postequalizedRow
       * @fires Equalizer#postequalized
       */

    }, {
      key: 'applyHeightByRow',
      value: function applyHeightByRow(groups) {
        /**
         * Fires before the heights are applied
         */
        this.$element.trigger('preequalized.zf.equalizer');
        for (var i = 0, len = groups.length; i < len; i++) {
          var groupsILength = groups[i].length,
              max = groups[i][groupsILength - 1];
          if (groupsILength <= 2) {
            $(groups[i][0][0]).css({ 'height': 'auto' });
            continue;
          }
          /**
            * Fires before the heights per row are applied
            * @event Equalizer#preequalizedRow
            */
          this.$element.trigger('preequalizedrow.zf.equalizer');
          for (var j = 0, lenJ = groupsILength - 1; j < lenJ; j++) {
            $(groups[i][j][0]).css({ 'height': max });
          }
          /**
            * Fires when the heights per row have been applied
            * @event Equalizer#postequalizedRow
            */
          this.$element.trigger('postequalizedrow.zf.equalizer');
        }
        /**
         * Fires when the heights have been applied
         */
        this.$element.trigger('postequalized.zf.equalizer');
      }

      /**
       * Destroys an instance of Equalizer.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this._pauseEvents();
        this.$watched.css('height', 'auto');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Equalizer;
  }();

  /**
   * Default settings for plugin
   */


  Equalizer.defaults = {
    /**
     * Enable height equalization when stacked on smaller screens.
     * @option
     * @example true
     */
    equalizeOnStack: true,
    /**
     * Enable height equalization row by row.
     * @option
     * @example false
     */
    equalizeByRow: false,
    /**
     * String representing the minimum breakpoint size the plugin should equalize heights on.
     * @option
     * @example 'medium'
     */
    equalizeOn: ''
  };

  // Window exports
  Foundation.plugin(Equalizer, 'Equalizer');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Interchange module.
   * @module foundation.interchange
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.timerAndImageLoader
   */

  var Interchange = function () {
    /**
     * Creates a new instance of Interchange.
     * @class
     * @fires Interchange#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Interchange(element, options) {
      _classCallCheck(this, Interchange);

      this.$element = element;
      this.options = $.extend({}, Interchange.defaults, options);
      this.rules = [];
      this.currentPath = '';

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'Interchange');
    }

    /**
     * Initializes the Interchange plugin and calls functions to get interchange functioning on load.
     * @function
     * @private
     */


    _createClass(Interchange, [{
      key: '_init',
      value: function _init() {
        this._addBreakpoints();
        this._generateRules();
        this._reflow();
      }

      /**
       * Initializes events for Interchange.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        $(window).on('resize.zf.interchange', Foundation.util.throttle(this._reflow.bind(this), 50));
      }

      /**
       * Calls necessary functions to update Interchange upon DOM change
       * @function
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        var match;

        // Iterate through each rule, but only save the last match
        for (var i in this.rules) {
          var rule = this.rules[i];

          if (window.matchMedia(rule.query).matches) {
            match = rule;
          }
        }

        if (match) {
          this.replace(match.path);
        }
      }

      /**
       * Gets the Foundation breakpoints and adds them to the Interchange.SPECIAL_QUERIES object.
       * @function
       * @private
       */

    }, {
      key: '_addBreakpoints',
      value: function _addBreakpoints() {
        for (var i in Foundation.MediaQuery.queries) {
          var query = Foundation.MediaQuery.queries[i];
          Interchange.SPECIAL_QUERIES[query.name] = query.value;
        }
      }

      /**
       * Checks the Interchange element for the provided media query + content pairings
       * @function
       * @private
       * @param {Object} element - jQuery object that is an Interchange instance
       * @returns {Array} scenarios - Array of objects that have 'mq' and 'path' keys with corresponding keys
       */

    }, {
      key: '_generateRules',
      value: function _generateRules(element) {
        var rulesList = [];
        var rules;

        if (this.options.rules) {
          rules = this.options.rules;
        } else {
          rules = this.$element.data('interchange').match(/\[.*?\]/g);
        }

        for (var i in rules) {
          var rule = rules[i].slice(1, -1).split(', ');
          var path = rule.slice(0, -1).join('');
          var query = rule[rule.length - 1];

          if (Interchange.SPECIAL_QUERIES[query]) {
            query = Interchange.SPECIAL_QUERIES[query];
          }

          rulesList.push({
            path: path,
            query: query
          });
        }

        this.rules = rulesList;
      }

      /**
       * Update the `src` property of an image, or change the HTML of a container, to the specified path.
       * @function
       * @param {String} path - Path to the image or HTML partial.
       * @fires Interchange#replaced
       */

    }, {
      key: 'replace',
      value: function replace(path) {
        if (this.currentPath === path) return;

        var _this = this,
            trigger = 'replaced.zf.interchange';

        // Replacing images
        if (this.$element[0].nodeName === 'IMG') {
          this.$element.attr('src', path).load(function () {
            _this.currentPath = path;
          }).trigger(trigger);
        }
        // Replacing background images
        else if (path.match(/\.(gif|jpg|jpeg|tiff|png)([?#].*)?/i)) {
            this.$element.css({ 'background-image': 'url(' + path + ')' }).trigger(trigger);
          }
          // Replacing HTML
          else {
              $.get(path, function (response) {
                _this.$element.html(response).trigger(trigger);
                $(response).foundation();
                _this.currentPath = path;
              });
            }

        /**
         * Fires when content in an Interchange element is done being loaded.
         * @event Interchange#replaced
         */
        // this.$element.trigger('replaced.zf.interchange');
      }

      /**
       * Destroys an instance of interchange.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        //TODO this.
      }
    }]);

    return Interchange;
  }();

  /**
   * Default settings for plugin
   */


  Interchange.defaults = {
    /**
     * Rules to be applied to Interchange elements. Set with the `data-interchange` array notation.
     * @option
     */
    rules: null
  };

  Interchange.SPECIAL_QUERIES = {
    'landscape': 'screen and (orientation: landscape)',
    'portrait': 'screen and (orientation: portrait)',
    'retina': 'only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx)'
  };

  // Window exports
  Foundation.plugin(Interchange, 'Interchange');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Magellan module.
   * @module foundation.magellan
   */

  var Magellan = function () {
    /**
     * Creates a new instance of Magellan.
     * @class
     * @fires Magellan#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Magellan(element, options) {
      _classCallCheck(this, Magellan);

      this.$element = element;
      this.options = $.extend({}, Magellan.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Magellan');
    }

    /**
     * Initializes the Magellan plugin and calls functions to get equalizer functioning on load.
     * @private
     */


    _createClass(Magellan, [{
      key: '_init',
      value: function _init() {
        var id = this.$element[0].id || Foundation.GetYoDigits(6, 'magellan');
        var _this = this;
        this.$targets = $('[data-magellan-target]');
        this.$links = this.$element.find('a');
        this.$element.attr({
          'data-resize': id,
          'data-scroll': id,
          'id': id
        });
        this.$active = $();
        this.scrollPos = parseInt(window.pageYOffset, 10);

        this._events();
      }

      /**
       * Calculates an array of pixel values that are the demarcation lines between locations on the page.
       * Can be invoked if new elements are added or the size of a location changes.
       * @function
       */

    }, {
      key: 'calcPoints',
      value: function calcPoints() {
        var _this = this,
            body = document.body,
            html = document.documentElement;

        this.points = [];
        this.winHeight = Math.round(Math.max(window.innerHeight, html.clientHeight));
        this.docHeight = Math.round(Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight));

        this.$targets.each(function () {
          var $tar = $(this),
              pt = Math.round($tar.offset().top - _this.options.threshold);
          $tar.targetPoint = pt;
          _this.points.push(pt);
        });
      }

      /**
       * Initializes events for Magellan.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this,
            $body = $('html, body'),
            opts = {
          duration: _this.options.animationDuration,
          easing: _this.options.animationEasing
        };
        $(window).one('load', function () {
          if (_this.options.deepLinking) {
            if (location.hash) {
              _this.scrollToLoc(location.hash);
            }
          }
          _this.calcPoints();
          _this._updateActive();
        });

        this.$element.on({
          'resizeme.zf.trigger': this.reflow.bind(this),
          'scrollme.zf.trigger': this._updateActive.bind(this)
        }).on('click.zf.magellan', 'a[href^="#"]', function (e) {
          e.preventDefault();
          var arrival = this.getAttribute('href');
          _this.scrollToLoc(arrival);
        });
      }

      /**
       * Function to scroll to a given location on the page.
       * @param {String} loc - a properly formatted jQuery id selector. Example: '#foo'
       * @function
       */

    }, {
      key: 'scrollToLoc',
      value: function scrollToLoc(loc) {
        var scrollPos = Math.round($(loc).offset().top - this.options.threshold / 2 - this.options.barOffset);

        $('html, body').stop(true).animate({ scrollTop: scrollPos }, this.options.animationDuration, this.options.animationEasing);
      }

      /**
       * Calls necessary functions to update Magellan upon DOM change
       * @function
       */

    }, {
      key: 'reflow',
      value: function reflow() {
        this.calcPoints();
        this._updateActive();
      }

      /**
       * Updates the visibility of an active location link, and updates the url hash for the page, if deepLinking enabled.
       * @private
       * @function
       * @fires Magellan#update
       */

    }, {
      key: '_updateActive',
      value: function _updateActive() /*evt, elem, scrollPos*/{
        var winPos = /*scrollPos ||*/parseInt(window.pageYOffset, 10),
            curIdx;

        if (winPos + this.winHeight === this.docHeight) {
          curIdx = this.points.length - 1;
        } else if (winPos < this.points[0]) {
          curIdx = 0;
        } else {
          var isDown = this.scrollPos < winPos,
              _this = this,
              curVisible = this.points.filter(function (p, i) {
            return isDown ? p <= winPos : p - _this.options.threshold <= winPos; //&& winPos >= _this.points[i -1] - _this.options.threshold;
          });
          curIdx = curVisible.length ? curVisible.length - 1 : 0;
        }

        this.$active.removeClass(this.options.activeClass);
        this.$active = this.$links.eq(curIdx).addClass(this.options.activeClass);

        if (this.options.deepLinking) {
          var hash = this.$active[0].getAttribute('href');
          if (window.history.pushState) {
            window.history.pushState(null, null, hash);
          } else {
            window.location.hash = hash;
          }
        }

        this.scrollPos = winPos;
        /**
         * Fires when magellan is finished updating to the new active element.
         * @event Magellan#update
         */
        this.$element.trigger('update.zf.magellan', [this.$active]);
      }

      /**
       * Destroys an instance of Magellan and resets the url of the window.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.trigger .zf.magellan').find('.' + this.options.activeClass).removeClass(this.options.activeClass);

        if (this.options.deepLinking) {
          var hash = this.$active[0].getAttribute('href');
          window.location.hash.replace(hash, '');
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Magellan;
  }();

  /**
   * Default settings for plugin
   */


  Magellan.defaults = {
    /**
     * Amount of time, in ms, the animated scrolling should take between locations.
     * @option
     * @example 500
     */
    animationDuration: 500,
    /**
     * Animation style to use when scrolling between locations.
     * @option
     * @example 'ease-in-out'
     */
    animationEasing: 'linear',
    /**
     * Number of pixels to use as a marker for location changes.
     * @option
     * @example 50
     */
    threshold: 50,
    /**
     * Class applied to the active locations link on the magellan container.
     * @option
     * @example 'active'
     */
    activeClass: 'active',
    /**
     * Allows the script to manipulate the url of the current page, and if supported, alter the history.
     * @option
     * @example true
     */
    deepLinking: false,
    /**
     * Number of pixels to offset the scroll of the page on item click if using a sticky nav bar.
     * @option
     * @example 25
     */
    barOffset: 0
  };

  // Window exports
  Foundation.plugin(Magellan, 'Magellan');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * OffCanvas module.
   * @module foundation.offcanvas
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.triggers
   * @requires foundation.util.motion
   */

  var OffCanvas = function () {
    /**
     * Creates a new instance of an off-canvas wrapper.
     * @class
     * @fires OffCanvas#init
     * @param {Object} element - jQuery object to initialize.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function OffCanvas(element, options) {
      _classCallCheck(this, OffCanvas);

      this.$element = element;
      this.options = $.extend({}, OffCanvas.defaults, this.$element.data(), options);
      this.$lastTrigger = $();

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'OffCanvas');
    }

    /**
     * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
     * @function
     * @private
     */


    _createClass(OffCanvas, [{
      key: '_init',
      value: function _init() {
        var id = this.$element.attr('id');

        this.$element.attr('aria-hidden', 'true');

        // Find triggers that affect this element and add aria-expanded to them
        $(document).find('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-expanded', 'false').attr('aria-controls', id);

        // Add a close trigger over the body if necessary
        if (this.options.closeOnClick) {
          if ($('.js-off-canvas-exit').length) {
            this.$exiter = $('.js-off-canvas-exit');
          } else {
            var exiter = document.createElement('div');
            exiter.setAttribute('class', 'js-off-canvas-exit');
            $('[data-off-canvas-content]').append(exiter);

            this.$exiter = $(exiter);
          }
        }

        this.options.isRevealed = this.options.isRevealed || new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);

        if (this.options.isRevealed) {
          this.options.revealOn = this.options.revealOn || this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
          this._setMQChecker();
        }
        if (!this.options.transitionTime) {
          this.options.transitionTime = parseFloat(window.getComputedStyle($('[data-off-canvas-wrapper]')[0]).transitionDuration) * 1000;
        }
      }

      /**
       * Adds event handlers to the off-canvas wrapper and the exit overlay.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this.$element.off('.zf.trigger .zf.offcanvas').on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'keydown.zf.offcanvas': this._handleKeyboard.bind(this)
        });

        if (this.options.closeOnClick && this.$exiter.length) {
          this.$exiter.on({ 'click.zf.offcanvas': this.close.bind(this) });
        }
      }

      /**
       * Applies event listener for elements that will reveal at certain breakpoints.
       * @private
       */

    }, {
      key: '_setMQChecker',
      value: function _setMQChecker() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          } else {
            _this.reveal(false);
          }
        }).one('load.zf.offcanvas', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          }
        });
      }

      /**
       * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
       * @param {Boolean} isRevealed - true if element should be revealed.
       * @function
       */

    }, {
      key: 'reveal',
      value: function reveal(isRevealed) {
        var $closer = this.$element.find('[data-close]');
        if (isRevealed) {
          this.close();
          this.isRevealed = true;
          // if (!this.options.forceTop) {
          //   var scrollPos = parseInt(window.pageYOffset);
          //   this.$element[0].style.transform = 'translate(0,' + scrollPos + 'px)';
          // }
          // if (this.options.isSticky) { this._stick(); }
          this.$element.off('open.zf.trigger toggle.zf.trigger');
          if ($closer.length) {
            $closer.hide();
          }
        } else {
          this.isRevealed = false;
          // if (this.options.isSticky || !this.options.forceTop) {
          //   this.$element[0].style.transform = '';
          //   $(window).off('scroll.zf.offcanvas');
          // }
          this.$element.on({
            'open.zf.trigger': this.open.bind(this),
            'toggle.zf.trigger': this.toggle.bind(this)
          });
          if ($closer.length) {
            $closer.show();
          }
        }
      }

      /**
       * Opens the off-canvas menu.
       * @function
       * @param {Object} event - Event object passed from listener.
       * @param {jQuery} trigger - element that triggered the off-canvas to open.
       * @fires OffCanvas#opened
       */

    }, {
      key: 'open',
      value: function open(event, trigger) {
        if (this.$element.hasClass('is-open') || this.isRevealed) {
          return;
        }
        var _this = this,
            $body = $(document.body);

        if (this.options.forceTop) {
          $('body').scrollTop(0);
        }
        // window.pageYOffset = 0;

        // if (!this.options.forceTop) {
        //   var scrollPos = parseInt(window.pageYOffset);
        //   this.$element[0].style.transform = 'translate(0,' + scrollPos + 'px)';
        //   if (this.$exiter.length) {
        //     this.$exiter[0].style.transform = 'translate(0,' + scrollPos + 'px)';
        //   }
        // }
        /**
         * Fires when the off-canvas menu opens.
         * @event OffCanvas#opened
         */
        Foundation.Move(this.options.transitionTime, this.$element, function () {
          $('[data-off-canvas-wrapper]').addClass('is-off-canvas-open is-open-' + _this.options.position);

          _this.$element.addClass('is-open');

          // if (_this.options.isSticky) {
          //   _this._stick();
          // }
        });
        this.$element.attr('aria-hidden', 'false').trigger('opened.zf.offcanvas');

        if (this.options.closeOnClick) {
          this.$exiter.addClass('is-visible');
        }

        if (trigger) {
          this.$lastTrigger = trigger.attr('aria-expanded', 'true');
        }

        if (this.options.autoFocus) {
          this.$element.one(Foundation.transitionend(this.$element), function () {
            _this.$element.find('a, button').eq(0).focus();
          });
        }

        if (this.options.trapFocus) {
          $('[data-off-canvas-content]').attr('tabindex', '-1');
          this._trapFocus();
        }
      }

      /**
       * Traps focus within the offcanvas on open.
       * @private
       */

    }, {
      key: '_trapFocus',
      value: function _trapFocus() {
        var focusable = Foundation.Keyboard.findFocusable(this.$element),
            first = focusable.eq(0),
            last = focusable.eq(-1);

        focusable.off('.zf.offcanvas').on('keydown.zf.offcanvas', function (e) {
          if (e.which === 9 || e.keycode === 9) {
            if (e.target === last[0] && !e.shiftKey) {
              e.preventDefault();
              first.focus();
            }
            if (e.target === first[0] && e.shiftKey) {
              e.preventDefault();
              last.focus();
            }
          }
        });
      }

      /**
       * Allows the offcanvas to appear sticky utilizing translate properties.
       * @private
       */
      // OffCanvas.prototype._stick = function() {
      //   var elStyle = this.$element[0].style;
      //
      //   if (this.options.closeOnClick) {
      //     var exitStyle = this.$exiter[0].style;
      //   }
      //
      //   $(window).on('scroll.zf.offcanvas', function(e) {
      //     console.log(e);
      //     var pageY = window.pageYOffset;
      //     elStyle.transform = 'translate(0,' + pageY + 'px)';
      //     if (exitStyle !== undefined) { exitStyle.transform = 'translate(0,' + pageY + 'px)'; }
      //   });
      //   // this.$element.trigger('stuck.zf.offcanvas');
      // };
      /**
       * Closes the off-canvas menu.
       * @function
       * @param {Function} cb - optional cb to fire after closure.
       * @fires OffCanvas#closed
       */

    }, {
      key: 'close',
      value: function close(cb) {
        if (!this.$element.hasClass('is-open') || this.isRevealed) {
          return;
        }

        var _this = this;

        //  Foundation.Move(this.options.transitionTime, this.$element, function() {
        $('[data-off-canvas-wrapper]').removeClass('is-off-canvas-open is-open-' + _this.options.position);
        _this.$element.removeClass('is-open');
        // Foundation._reflow();
        // });
        this.$element.attr('aria-hidden', 'true')
        /**
         * Fires when the off-canvas menu opens.
         * @event OffCanvas#closed
         */
        .trigger('closed.zf.offcanvas');
        // if (_this.options.isSticky || !_this.options.forceTop) {
        //   setTimeout(function() {
        //     _this.$element[0].style.transform = '';
        //     $(window).off('scroll.zf.offcanvas');
        //   }, this.options.transitionTime);
        // }
        if (this.options.closeOnClick) {
          this.$exiter.removeClass('is-visible');
        }

        this.$lastTrigger.attr('aria-expanded', 'false');
        if (this.options.trapFocus) {
          $('[data-off-canvas-content]').removeAttr('tabindex');
        }
      }

      /**
       * Toggles the off-canvas menu open or closed.
       * @function
       * @param {Object} event - Event object passed from listener.
       * @param {jQuery} trigger - element that triggered the off-canvas to open.
       */

    }, {
      key: 'toggle',
      value: function toggle(event, trigger) {
        if (this.$element.hasClass('is-open')) {
          this.close(event, trigger);
        } else {
          this.open(event, trigger);
        }
      }

      /**
       * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
       * @function
       * @private
       */

    }, {
      key: '_handleKeyboard',
      value: function _handleKeyboard(event) {
        if (event.which !== 27) return;

        event.stopPropagation();
        event.preventDefault();
        this.close();
        this.$lastTrigger.focus();
      }

      /**
       * Destroys the offcanvas plugin.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.close();
        this.$element.off('.zf.trigger .zf.offcanvas');
        this.$exiter.off('.zf.offcanvas');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return OffCanvas;
  }();

  OffCanvas.defaults = {
    /**
     * Allow the user to click outside of the menu to close it.
     * @option
     * @example true
     */
    closeOnClick: true,

    /**
     * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
     * @option
     * @example 500
     */
    transitionTime: 0,

    /**
     * Direction the offcanvas opens from. Determines class applied to body.
     * @option
     * @example left
     */
    position: 'left',

    /**
     * Force the page to scroll to top on open.
     * @option
     * @example true
     */
    forceTop: true,

    /**
     * Allow the offcanvas to remain open for certain breakpoints.
     * @option
     * @example false
     */
    isRevealed: false,

    /**
     * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class with the `revealClass` option.
     * @option
     * @example reveal-for-large
     */
    revealOn: null,

    /**
     * Force focus to the offcanvas on open. If true, will focus the opening trigger on close.
     * @option
     * @example true
     */
    autoFocus: true,

    /**
     * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
     * @option
     * TODO improve the regex testing for this.
     * @example reveal-for-large
     */
    revealClass: 'reveal-for-',

    /**
     * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
     * @option
     * @example true
     */
    trapFocus: false
  };

  // Window exports
  Foundation.plugin(OffCanvas, 'OffCanvas');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Orbit module.
   * @module foundation.orbit
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   * @requires foundation.util.timerAndImageLoader
   * @requires foundation.util.touch
   */

  var Orbit = function () {
    /**
    * Creates a new instance of an orbit carousel.
    * @class
    * @param {jQuery} element - jQuery object to make into an Orbit Carousel.
    * @param {Object} options - Overrides to the default plugin settings.
    */

    function Orbit(element, options) {
      _classCallCheck(this, Orbit);

      this.$element = element;
      this.options = $.extend({}, Orbit.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Orbit');
      Foundation.Keyboard.register('Orbit', {
        'ltr': {
          'ARROW_RIGHT': 'next',
          'ARROW_LEFT': 'previous'
        },
        'rtl': {
          'ARROW_LEFT': 'next',
          'ARROW_RIGHT': 'previous'
        }
      });
    }

    /**
    * Initializes the plugin by creating jQuery collections, setting attributes, and starting the animation.
    * @function
    * @private
    */


    _createClass(Orbit, [{
      key: '_init',
      value: function _init() {
        this.$wrapper = this.$element.find('.' + this.options.containerClass);
        this.$slides = this.$element.find('.' + this.options.slideClass);
        var $images = this.$element.find('img'),
            initActive = this.$slides.filter('.is-active');

        if (!initActive.length) {
          this.$slides.eq(0).addClass('is-active');
        }

        if (!this.options.useMUI) {
          this.$slides.addClass('no-motionui');
        }

        if ($images.length) {
          Foundation.onImagesLoaded($images, this._prepareForOrbit.bind(this));
        } else {
          this._prepareForOrbit(); //hehe
        }

        if (this.options.bullets) {
          this._loadBullets();
        }

        this._events();

        if (this.options.autoPlay && this.$slides.length > 1) {
          this.geoSync();
        }

        if (this.options.accessible) {
          // allow wrapper to be focusable to enable arrow navigation
          this.$wrapper.attr('tabindex', 0);
        }
      }

      /**
      * Creates a jQuery collection of bullets, if they are being used.
      * @function
      * @private
      */

    }, {
      key: '_loadBullets',
      value: function _loadBullets() {
        this.$bullets = this.$element.find('.' + this.options.boxOfBullets).find('button');
      }

      /**
      * Sets a `timer` object on the orbit, and starts the counter for the next slide.
      * @function
      */

    }, {
      key: 'geoSync',
      value: function geoSync() {
        var _this = this;
        this.timer = new Foundation.Timer(this.$element, {
          duration: this.options.timerDelay,
          infinite: false
        }, function () {
          _this.changeSlide(true);
        });
        this.timer.start();
      }

      /**
      * Sets wrapper and slide heights for the orbit.
      * @function
      * @private
      */

    }, {
      key: '_prepareForOrbit',
      value: function _prepareForOrbit() {
        var _this = this;
        this._setWrapperHeight(function (max) {
          _this._setSlideHeight(max);
        });
      }

      /**
      * Calulates the height of each slide in the collection, and uses the tallest one for the wrapper height.
      * @function
      * @private
      * @param {Function} cb - a callback function to fire when complete.
      */

    }, {
      key: '_setWrapperHeight',
      value: function _setWrapperHeight(cb) {
        //rewrite this to `for` loop
        var max = 0,
            temp,
            counter = 0;

        this.$slides.each(function () {
          temp = this.getBoundingClientRect().height;
          $(this).attr('data-slide', counter);

          if (counter) {
            //if not the first slide, set css position and display property
            $(this).css({ 'position': 'relative', 'display': 'none' });
          }
          max = temp > max ? temp : max;
          counter++;
        });

        if (counter === this.$slides.length) {
          this.$wrapper.css({ 'height': max }); //only change the wrapper height property once.
          cb(max); //fire callback with max height dimension.
        }
      }

      /**
      * Sets the max-height of each slide.
      * @function
      * @private
      */

    }, {
      key: '_setSlideHeight',
      value: function _setSlideHeight(height) {
        this.$slides.each(function () {
          $(this).css('max-height', height);
        });
      }

      /**
      * Adds event listeners to basically everything within the element.
      * @function
      * @private
      */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        //***************************************
        //**Now using custom event - thanks to:**
        //**      Yohai Ararat of Toronto      **
        //***************************************
        if (this.$slides.length > 1) {

          if (this.options.swipe) {
            this.$slides.off('swipeleft.zf.orbit swiperight.zf.orbit').on('swipeleft.zf.orbit', function (e) {
              e.preventDefault();
              _this.changeSlide(true);
            }).on('swiperight.zf.orbit', function (e) {
              e.preventDefault();
              _this.changeSlide(false);
            });
          }
          //***************************************

          if (this.options.autoPlay) {
            this.$slides.on('click.zf.orbit', function () {
              _this.$element.data('clickedOn', _this.$element.data('clickedOn') ? false : true);
              _this.timer[_this.$element.data('clickedOn') ? 'pause' : 'start']();
            });

            if (this.options.pauseOnHover) {
              this.$element.on('mouseenter.zf.orbit', function () {
                _this.timer.pause();
              }).on('mouseleave.zf.orbit', function () {
                if (!_this.$element.data('clickedOn')) {
                  _this.timer.start();
                }
              });
            }
          }

          if (this.options.navButtons) {
            var $controls = this.$element.find('.' + this.options.nextClass + ', .' + this.options.prevClass);
            $controls.attr('tabindex', 0)
            //also need to handle enter/return and spacebar key presses
            .on('click.zf.orbit touchend.zf.orbit', function () {
              _this.changeSlide($(this).hasClass(_this.options.nextClass));
            });
          }

          if (this.options.bullets) {
            this.$bullets.on('click.zf.orbit touchend.zf.orbit', function () {
              if (/is-active/g.test(this.className)) {
                return false;
              } //if this is active, kick out of function.
              var idx = $(this).data('slide'),
                  ltr = idx > _this.$slides.filter('.is-active').data('slide'),
                  $slide = _this.$slides.eq(idx);

              _this.changeSlide(ltr, $slide, idx);
            });
          }

          this.$wrapper.add(this.$bullets).on('keydown.zf.orbit', function (e) {
            // handle keyboard event with keyboard util
            Foundation.Keyboard.handleKey(e, 'Orbit', {
              next: function () {
                _this.changeSlide(true);
              },
              previous: function () {
                _this.changeSlide(false);
              },
              handled: function () {
                // if bullet is focused, make sure focus moves
                if ($(e.target).is(_this.$bullets)) {
                  _this.$bullets.filter('.is-active').focus();
                }
              }
            });
          });
        }
      }

      /**
      * Changes the current slide to a new one.
      * @function
      * @param {Boolean} isLTR - flag if the slide should move left to right.
      * @param {jQuery} chosenSlide - the jQuery element of the slide to show next, if one is selected.
      * @param {Number} idx - the index of the new slide in its collection, if one chosen.
      * @fires Orbit#slidechange
      */

    }, {
      key: 'changeSlide',
      value: function changeSlide(isLTR, chosenSlide, idx) {
        var $curSlide = this.$slides.filter('.is-active').eq(0);

        if (/mui/g.test($curSlide[0].className)) {
          return false;
        } //if the slide is currently animating, kick out of the function

        var $firstSlide = this.$slides.first(),
            $lastSlide = this.$slides.last(),
            dirIn = isLTR ? 'Right' : 'Left',
            dirOut = isLTR ? 'Left' : 'Right',
            _this = this,
            $newSlide;

        if (!chosenSlide) {
          //most of the time, this will be auto played or clicked from the navButtons.
          $newSlide = isLTR ? //if wrapping enabled, check to see if there is a `next` or `prev` sibling, if not, select the first or last slide to fill in. if wrapping not enabled, attempt to select `next` or `prev`, if there's nothing there, the function will kick out on next step. CRAZY NESTED TERNARIES!!!!!
          this.options.infiniteWrap ? $curSlide.next('.' + this.options.slideClass).length ? $curSlide.next('.' + this.options.slideClass) : $firstSlide : $curSlide.next('.' + this.options.slideClass) : //pick next slide if moving left to right
          this.options.infiniteWrap ? $curSlide.prev('.' + this.options.slideClass).length ? $curSlide.prev('.' + this.options.slideClass) : $lastSlide : $curSlide.prev('.' + this.options.slideClass); //pick prev slide if moving right to left
        } else {
            $newSlide = chosenSlide;
          }

        if ($newSlide.length) {
          if (this.options.bullets) {
            idx = idx || this.$slides.index($newSlide); //grab index to update bullets
            this._updateBullets(idx);
          }

          if (this.options.useMUI) {
            Foundation.Motion.animateIn($newSlide.addClass('is-active').css({ 'position': 'absolute', 'top': 0 }), this.options['animInFrom' + dirIn], function () {
              $newSlide.css({ 'position': 'relative', 'display': 'block' }).attr('aria-live', 'polite');
            });

            Foundation.Motion.animateOut($curSlide.removeClass('is-active'), this.options['animOutTo' + dirOut], function () {
              $curSlide.removeAttr('aria-live');
              if (_this.options.autoPlay && !_this.timer.isPaused) {
                _this.timer.restart();
              }
              //do stuff?
            });
          } else {
              $curSlide.removeClass('is-active is-in').removeAttr('aria-live').hide();
              $newSlide.addClass('is-active is-in').attr('aria-live', 'polite').show();
              if (this.options.autoPlay && !this.timer.isPaused) {
                this.timer.restart();
              }
            }
          /**
          * Triggers when the slide has finished animating in.
          * @event Orbit#slidechange
          */
          this.$element.trigger('slidechange.zf.orbit', [$newSlide]);
        }
      }

      /**
      * Updates the active state of the bullets, if displayed.
      * @function
      * @private
      * @param {Number} idx - the index of the current slide.
      */

    }, {
      key: '_updateBullets',
      value: function _updateBullets(idx) {
        var $oldBullet = this.$element.find('.' + this.options.boxOfBullets).find('.is-active').removeClass('is-active').blur(),
            span = $oldBullet.find('span:last').detach(),
            $newBullet = this.$bullets.eq(idx).addClass('is-active').append(span);
      }

      /**
      * Destroys the carousel and hides the element.
      * @function
      */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.orbit').find('*').off('.zf.orbit').end().hide();
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Orbit;
  }();

  Orbit.defaults = {
    /**
    * Tells the JS to look for and loadBullets.
    * @option
    * @example true
    */
    bullets: true,
    /**
    * Tells the JS to apply event listeners to nav buttons
    * @option
    * @example true
    */
    navButtons: true,
    /**
    * motion-ui animation class to apply
    * @option
    * @example 'slide-in-right'
    */
    animInFromRight: 'slide-in-right',
    /**
    * motion-ui animation class to apply
    * @option
    * @example 'slide-out-right'
    */
    animOutToRight: 'slide-out-right',
    /**
    * motion-ui animation class to apply
    * @option
    * @example 'slide-in-left'
    *
    */
    animInFromLeft: 'slide-in-left',
    /**
    * motion-ui animation class to apply
    * @option
    * @example 'slide-out-left'
    */
    animOutToLeft: 'slide-out-left',
    /**
    * Allows Orbit to automatically animate on page load.
    * @option
    * @example true
    */
    autoPlay: true,
    /**
    * Amount of time, in ms, between slide transitions
    * @option
    * @example 5000
    */
    timerDelay: 5000,
    /**
    * Allows Orbit to infinitely loop through the slides
    * @option
    * @example true
    */
    infiniteWrap: true,
    /**
    * Allows the Orbit slides to bind to swipe events for mobile, requires an additional util library
    * @option
    * @example true
    */
    swipe: true,
    /**
    * Allows the timing function to pause animation on hover.
    * @option
    * @example true
    */
    pauseOnHover: true,
    /**
    * Allows Orbit to bind keyboard events to the slider, to animate frames with arrow keys
    * @option
    * @example true
    */
    accessible: true,
    /**
    * Class applied to the container of Orbit
    * @option
    * @example 'orbit-container'
    */
    containerClass: 'orbit-container',
    /**
    * Class applied to individual slides.
    * @option
    * @example 'orbit-slide'
    */
    slideClass: 'orbit-slide',
    /**
    * Class applied to the bullet container. You're welcome.
    * @option
    * @example 'orbit-bullets'
    */
    boxOfBullets: 'orbit-bullets',
    /**
    * Class applied to the `next` navigation button.
    * @option
    * @example 'orbit-next'
    */
    nextClass: 'orbit-next',
    /**
    * Class applied to the `previous` navigation button.
    * @option
    * @example 'orbit-previous'
    */
    prevClass: 'orbit-previous',
    /**
    * Boolean to flag the js to use motion ui classes or not. Default to true for backwards compatability.
    * @option
    * @example true
    */
    useMUI: true
  };

  // Window exports
  Foundation.plugin(Orbit, 'Orbit');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * ResponsiveMenu module.
   * @module foundation.responsiveMenu
   * @requires foundation.util.triggers
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.accordionMenu
   * @requires foundation.util.drilldown
   * @requires foundation.util.dropdown-menu
   */

  var ResponsiveMenu = function () {
    /**
     * Creates a new instance of a responsive menu.
     * @class
     * @fires ResponsiveMenu#init
     * @param {jQuery} element - jQuery object to make into a dropdown menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function ResponsiveMenu(element, options) {
      _classCallCheck(this, ResponsiveMenu);

      this.$element = $(element);
      this.rules = this.$element.data('responsive-menu');
      this.currentMq = null;
      this.currentPlugin = null;

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveMenu');
    }

    /**
     * Initializes the Menu by parsing the classes from the 'data-ResponsiveMenu' attribute on the element.
     * @function
     * @private
     */


    _createClass(ResponsiveMenu, [{
      key: '_init',
      value: function _init() {
        var rulesTree = {};

        // Parse rules from "classes" in data attribute
        var rules = this.rules.split(' ');

        // Iterate through every rule found
        for (var i = 0; i < rules.length; i++) {
          var rule = rules[i].split('-');
          var ruleSize = rule.length > 1 ? rule[0] : 'small';
          var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

          if (MenuPlugins[rulePlugin] !== null) {
            rulesTree[ruleSize] = MenuPlugins[rulePlugin];
          }
        }

        this.rules = rulesTree;

        if (!$.isEmptyObject(rulesTree)) {
          this._checkMediaQueries();
        }
      }

      /**
       * Initializes events for the Menu.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          _this._checkMediaQueries();
        });
        // $(window).on('resize.zf.ResponsiveMenu', function() {
        //   _this._checkMediaQueries();
        // });
      }

      /**
       * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
       * @function
       * @private
       */

    }, {
      key: '_checkMediaQueries',
      value: function _checkMediaQueries() {
        var matchedMq,
            _this = this;
        // Iterate through each rule and find the last matching rule
        $.each(this.rules, function (key) {
          if (Foundation.MediaQuery.atLeast(key)) {
            matchedMq = key;
          }
        });

        // No match? No dice
        if (!matchedMq) return;

        // Plugin already initialized? We good
        if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

        // Remove existing plugin-specific CSS classes
        $.each(MenuPlugins, function (key, value) {
          _this.$element.removeClass(value.cssClass);
        });

        // Add the CSS class for the new plugin
        this.$element.addClass(this.rules[matchedMq].cssClass);

        // Create an instance of the new plugin
        if (this.currentPlugin) this.currentPlugin.destroy();
        this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {});
      }

      /**
       * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.currentPlugin.destroy();
        $(window).off('.zf.ResponsiveMenu');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return ResponsiveMenu;
  }();

  ResponsiveMenu.defaults = {};

  // The plugin matches the plugin classes with these plugin instances.
  var MenuPlugins = {
    dropdown: {
      cssClass: 'dropdown',
      plugin: Foundation._plugins['dropdown-menu'] || null
    },
    drilldown: {
      cssClass: 'drilldown',
      plugin: Foundation._plugins['drilldown'] || null
    },
    accordion: {
      cssClass: 'accordion-menu',
      plugin: Foundation._plugins['accordion-menu'] || null
    }
  };

  // Window exports
  Foundation.plugin(ResponsiveMenu, 'ResponsiveMenu');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * ResponsiveToggle module.
   * @module foundation.responsiveToggle
   * @requires foundation.util.mediaQuery
   */

  var ResponsiveToggle = function () {
    /**
     * Creates a new instance of Tab Bar.
     * @class
     * @fires ResponsiveToggle#init
     * @param {jQuery} element - jQuery object to attach tab bar functionality to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function ResponsiveToggle(element, options) {
      _classCallCheck(this, ResponsiveToggle);

      this.$element = $(element);
      this.options = $.extend({}, ResponsiveToggle.defaults, this.$element.data(), options);

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveToggle');
    }

    /**
     * Initializes the tab bar by finding the target element, toggling element, and running update().
     * @function
     * @private
     */


    _createClass(ResponsiveToggle, [{
      key: '_init',
      value: function _init() {
        var targetID = this.$element.data('responsive-toggle');
        if (!targetID) {
          console.error('Your tab bar needs an ID of a Menu as the value of data-tab-bar.');
        }

        this.$targetMenu = $('#' + targetID);
        this.$toggler = this.$element.find('[data-toggle]');

        this._update();
      }

      /**
       * Adds necessary event handlers for the tab bar to work.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', this._update.bind(this));

        this.$toggler.on('click.zf.responsiveToggle', this.toggleMenu.bind(this));
      }

      /**
       * Checks the current media query to determine if the tab bar should be visible or hidden.
       * @function
       * @private
       */

    }, {
      key: '_update',
      value: function _update() {
        // Mobile
        if (!Foundation.MediaQuery.atLeast(this.options.hideFor)) {
          this.$element.show();
          this.$targetMenu.hide();
        }

        // Desktop
        else {
            this.$element.hide();
            this.$targetMenu.show();
          }
      }

      /**
       * Toggles the element attached to the tab bar. The toggle only happens if the screen is small enough to allow it.
       * @function
       * @fires ResponsiveToggle#toggled
       */

    }, {
      key: 'toggleMenu',
      value: function toggleMenu() {
        if (!Foundation.MediaQuery.atLeast(this.options.hideFor)) {
          this.$targetMenu.toggle(0);

          /**
           * Fires when the element attached to the tab bar toggles.
           * @event ResponsiveToggle#toggled
           */
          this.$element.trigger('toggled.zf.responsiveToggle');
        }
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        //TODO this...
      }
    }]);

    return ResponsiveToggle;
  }();

  ResponsiveToggle.defaults = {
    /**
     * The breakpoint after which the menu is always shown, and the tab bar is hidden.
     * @option
     * @example 'medium'
     */
    hideFor: 'medium'
  };

  // Window exports
  Foundation.plugin(ResponsiveToggle, 'ResponsiveToggle');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Reveal module.
   * @module foundation.reveal
   * @requires foundation.util.keyboard
   * @requires foundation.util.box
   * @requires foundation.util.triggers
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.motion if using animations
   */

  var Reveal = function () {
    /**
     * Creates a new instance of Reveal.
     * @class
     * @param {jQuery} element - jQuery object to use for the modal.
     * @param {Object} options - optional parameters.
     */

    function Reveal(element, options) {
      _classCallCheck(this, Reveal);

      this.$element = element;
      this.options = $.extend({}, Reveal.defaults, this.$element.data(), options);
      this._init();

      Foundation.registerPlugin(this, 'Reveal');
      Foundation.Keyboard.register('Reveal', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ESCAPE': 'close',
        'TAB': 'tab_forward',
        'SHIFT_TAB': 'tab_backward'
      });
    }

    /**
     * Initializes the modal by adding the overlay and close buttons, (if selected).
     * @private
     */


    _createClass(Reveal, [{
      key: '_init',
      value: function _init() {
        this.id = this.$element.attr('id');
        this.isActive = false;
        this.cached = { mq: Foundation.MediaQuery.current };
        this.isiOS = iPhoneSniff();

        if (this.isiOS) {
          this.$element.addClass('is-ios');
        }

        this.$anchor = $('[data-open="' + this.id + '"]').length ? $('[data-open="' + this.id + '"]') : $('[data-toggle="' + this.id + '"]');

        if (this.$anchor.length) {
          var anchorId = this.$anchor[0].id || Foundation.GetYoDigits(6, 'reveal');

          this.$anchor.attr({
            'aria-controls': this.id,
            'id': anchorId,
            'aria-haspopup': true,
            'tabindex': 0
          });
          this.$element.attr({ 'aria-labelledby': anchorId });
        }

        if (this.options.fullScreen || this.$element.hasClass('full')) {
          this.options.fullScreen = true;
          this.options.overlay = false;
        }
        if (this.options.overlay && !this.$overlay) {
          this.$overlay = this._makeOverlay(this.id);
        }

        this.$element.attr({
          'role': 'dialog',
          'aria-hidden': true,
          'data-yeti-box': this.id,
          'data-resize': this.id
        });

        if (this.$overlay) {
          this.$element.detach().appendTo(this.$overlay);
        } else {
          this.$element.detach().appendTo($('body'));
          this.$element.addClass('without-overlay');
        }
        this._events();
        if (this.options.deepLink && window.location.hash === '#' + this.id) {
          $(window).one('load.zf.reveal', this.open.bind(this));
        }
      }

      /**
       * Creates an overlay div to display behind the modal.
       * @private
       */

    }, {
      key: '_makeOverlay',
      value: function _makeOverlay(id) {
        var $overlay = $('<div></div>').addClass('reveal-overlay').attr({ 'tabindex': -1, 'aria-hidden': true }).appendTo('body');
        return $overlay;
      }

      /**
       * Updates position of modal
       * TODO:  Figure out if we actually need to cache these values or if it doesn't matter
       * @private
       */

    }, {
      key: '_updatePosition',
      value: function _updatePosition() {
        var width = this.$element.outerWidth();
        var outerWidth = $(window).width();
        var height = this.$element.outerHeight();
        var outerHeight = $(window).height();
        var left = parseInt((outerWidth - width) / 2, 10);
        var top;
        if (height > outerHeight) {
          top = parseInt(Math.min(100, outerHeight / 10), 10);
        } else {
          top = parseInt((outerHeight - height) / 4, 10);
        }
        this.$element.css({ top: top + 'px' });
        // only worry about left if we don't have an overlay, otherwise we're perfectly in the middle
        if (!this.$overlay) {
          this.$element.css({ left: left + 'px' });
        }
      }

      /**
       * Adds event handlers for the modal.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$element.on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'resizeme.zf.trigger': function () {
            _this._updatePosition();
          }
        });

        if (this.$anchor.length) {
          this.$anchor.on('keydown.zf.reveal', function (e) {
            if (e.which === 13 || e.which === 32) {
              e.stopPropagation();
              e.preventDefault();
              _this.open();
            }
          });
        }

        if (this.options.closeOnClick && this.options.overlay) {
          this.$overlay.off('.zf.reveal').on('click.zf.reveal', function (e) {
            if (e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)) {
              return;
            }
            _this.close();
          });
        }
        if (this.options.deepLink) {
          $(window).on('popstate.zf.reveal:' + this.id, this._handleState.bind(this));
        }
      }

      /**
       * Handles modal methods on back/forward button clicks or any other event that triggers popstate.
       * @private
       */

    }, {
      key: '_handleState',
      value: function _handleState(e) {
        if (window.location.hash === '#' + this.id && !this.isActive) {
          this.open();
        } else {
          this.close();
        }
      }

      /**
       * Opens the modal controlled by `this.$anchor`, and closes all others by default.
       * @function
       * @fires Reveal#closeme
       * @fires Reveal#open
       */

    }, {
      key: 'open',
      value: function open() {
        var _this2 = this;

        if (this.options.deepLink) {
          var hash = '#' + this.id;

          if (window.history.pushState) {
            window.history.pushState(null, null, hash);
          } else {
            window.location.hash = hash;
          }
        }

        this.isActive = true;

        // Make elements invisible, but remove display: none so we can get size and positioning
        this.$element.css({ 'visibility': 'hidden' }).show().scrollTop(0);
        if (this.options.overlay) {
          this.$overlay.css({ 'visibility': 'hidden' }).show();
        }

        this._updatePosition();

        this.$element.hide().css({ 'visibility': '' });

        if (this.$overlay) {
          this.$overlay.css({ 'visibility': '' }).hide();
        }

        if (!this.options.multipleOpened) {
          /**
           * Fires immediately before the modal opens.
           * Closes any other modals that are currently open
           * @event Reveal#closeme
           */
          this.$element.trigger('closeme.zf.reveal', this.id);
        }

        // Motion UI method of reveal
        if (this.options.animationIn) {
          if (this.options.overlay) {
            Foundation.Motion.animateIn(this.$overlay, 'fade-in');
          }
          Foundation.Motion.animateIn(this.$element, this.options.animationIn, function () {
            this.focusableElements = Foundation.Keyboard.findFocusable(this.$element);
          });
        }
        // jQuery method of reveal
        else {
            if (this.options.overlay) {
              this.$overlay.show(0);
            }
            this.$element.show(this.options.showDelay);
          }

        // handle accessibility
        this.$element.attr({
          'aria-hidden': false,
          'tabindex': -1
        }).focus();

        /**
         * Fires when the modal has successfully opened.
         * @event Reveal#open
         */
        this.$element.trigger('open.zf.reveal');

        if (this.isiOS) {
          var scrollPos = window.pageYOffset;
          $('html, body').addClass('is-reveal-open').scrollTop(scrollPos);
        } else {
          $('body').addClass('is-reveal-open');
        }

        $('body').addClass('is-reveal-open').attr('aria-hidden', this.options.overlay || this.options.fullScreen ? true : false);

        setTimeout(function () {
          _this2._extraHandlers();
        }, 0);
      }

      /**
       * Adds extra event handlers for the body and window if necessary.
       * @private
       */

    }, {
      key: '_extraHandlers',
      value: function _extraHandlers() {
        var _this = this;
        this.focusableElements = Foundation.Keyboard.findFocusable(this.$element);

        if (!this.options.overlay && this.options.closeOnClick && !this.options.fullScreen) {
          $('body').on('click.zf.reveal', function (e) {
            if (e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)) {
              return;
            }
            _this.close();
          });
        }

        if (this.options.closeOnEsc) {
          $(window).on('keydown.zf.reveal', function (e) {
            Foundation.Keyboard.handleKey(e, 'Reveal', {
              close: function () {
                if (_this.options.closeOnEsc) {
                  _this.close();
                  _this.$anchor.focus();
                }
              }
            });
            if (_this.focusableElements.length === 0) {
              // no focusable elements inside the modal at all, prevent tabbing in general
              e.preventDefault();
            }
          });
        }

        // lock focus within modal while tabbing
        this.$element.on('keydown.zf.reveal', function (e) {
          var $target = $(this);
          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Reveal', {
            tab_forward: function () {
              if (_this.$element.find(':focus').is(_this.focusableElements.eq(-1))) {
                // left modal downwards, setting focus to first element
                _this.focusableElements.eq(0).focus();
                e.preventDefault();
              }
            },
            tab_backward: function () {
              if (_this.$element.find(':focus').is(_this.focusableElements.eq(0)) || _this.$element.is(':focus')) {
                // left modal upwards, setting focus to last element
                _this.focusableElements.eq(-1).focus();
                e.preventDefault();
              }
            },
            open: function () {
              if (_this.$element.find(':focus').is(_this.$element.find('[data-close]'))) {
                setTimeout(function () {
                  // set focus back to anchor if close button has been activated
                  _this.$anchor.focus();
                }, 1);
              } else if ($target.is(_this.focusableElements)) {
                // dont't trigger if acual element has focus (i.e. inputs, links, ...)
                _this.open();
              }
            },
            close: function () {
              if (_this.options.closeOnEsc) {
                _this.close();
                _this.$anchor.focus();
              }
            }
          });
        });
      }

      /**
       * Closes the modal.
       * @function
       * @fires Reveal#closed
       */

    }, {
      key: 'close',
      value: function close() {
        if (!this.isActive || !this.$element.is(':visible')) {
          return false;
        }
        var _this = this;

        // Motion UI method of hiding
        if (this.options.animationOut) {
          if (this.options.overlay) {
            Foundation.Motion.animateOut(this.$overlay, 'fade-out', finishUp);
          } else {
            finishUp();
          }

          Foundation.Motion.animateOut(this.$element, this.options.animationOut);
        }
        // jQuery method of hiding
        else {
            if (this.options.overlay) {
              this.$overlay.hide(0, finishUp);
            } else {
              finishUp();
            }

            this.$element.hide(this.options.hideDelay);
          }

        // Conditionals to remove extra event listeners added on open
        if (this.options.closeOnEsc) {
          $(window).off('keydown.zf.reveal');
        }

        if (!this.options.overlay && this.options.closeOnClick) {
          $('body').off('click.zf.reveal');
        }

        this.$element.off('keydown.zf.reveal');

        function finishUp() {
          if (_this.isiOS) {
            $('html, body').removeClass('is-reveal-open');
          } else {
            $('body').removeClass('is-reveal-open');
          }

          $('body').attr({
            'aria-hidden': false,
            'tabindex': ''
          });

          _this.$element.attr('aria-hidden', true);

          /**
          * Fires when the modal is done closing.
          * @event Reveal#closed
          */
          _this.$element.trigger('closed.zf.reveal');
        }

        /**
        * Resets the modal content
        * This prevents a running video to keep going in the background
        */
        if (this.options.resetOnClose) {
          this.$element.html(this.$element.html());
        }

        this.isActive = false;
        if (_this.options.deepLink) {
          if (window.history.replaceState) {
            window.history.replaceState("", document.title, window.location.pathname);
          } else {
            window.location.hash = '';
          }
        }
      }

      /**
       * Toggles the open/closed state of a modal.
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.isActive) {
          this.close();
        } else {
          this.open();
        }
      }
    }, {
      key: 'destroy',


      /**
       * Destroys an instance of a modal.
       * @function
       */
      value: function destroy() {
        if (this.options.overlay) {
          this.$overlay.hide().off().remove();
        }
        this.$element.hide().off();
        this.$anchor.off('.zf');
        $(window).off('.zf.reveal:' + this.id);

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Reveal;
  }();

  Reveal.defaults = {
    /**
     * Motion-UI class to use for animated elements. If none used, defaults to simple show/hide.
     * @option
     * @example 'slide-in-left'
     */
    animationIn: '',
    /**
     * Motion-UI class to use for animated elements. If none used, defaults to simple show/hide.
     * @option
     * @example 'slide-out-right'
     */
    animationOut: '',
    /**
     * Time, in ms, to delay the opening of a modal after a click if no animation used.
     * @option
     * @example 10
     */
    showDelay: 0,
    /**
     * Time, in ms, to delay the closing of a modal after a click if no animation used.
     * @option
     * @example 10
     */
    hideDelay: 0,
    /**
     * Allows a click on the body/overlay to close the modal.
     * @option
     * @example true
     */
    closeOnClick: true,
    /**
     * Allows the modal to close if the user presses the `ESCAPE` key.
     * @option
     * @example true
     */
    closeOnEsc: true,
    /**
     * If true, allows multiple modals to be displayed at once.
     * @option
     * @example false
     */
    multipleOpened: false,
    /**
     * Distance, in pixels, the modal should push down from the top of the screen.
     * @option
     * @example 100
     */
    vOffset: 100,
    /**
     * Distance, in pixels, the modal should push in from the side of the screen.
     * @option
     * @example 0
     */
    hOffset: 0,
    /**
     * Allows the modal to be fullscreen, completely blocking out the rest of the view. JS checks for this as well.
     * @option
     * @example false
     */
    fullScreen: false,
    /**
     * Percentage of screen height the modal should push up from the bottom of the view.
     * @option
     * @example 10
     */
    btmOffsetPct: 10,
    /**
     * Allows the modal to generate an overlay div, which will cover the view when modal opens.
     * @option
     * @example true
     */
    overlay: true,
    /**
     * Allows the modal to remove and reinject markup on close. Should be true if using video elements w/o using provider's api, otherwise, videos will continue to play in the background.
     * @option
     * @example false
     */
    resetOnClose: false,
    /**
     * Allows the modal to alter the url on open/close, and allows the use of the `back` button to close modals. ALSO, allows a modal to auto-maniacally open on page load IF the hash === the modal's user-set id.
     * @option
     * @example false
     */
    deepLink: false
  };

  // Window exports
  Foundation.plugin(Reveal, 'Reveal');

  function iPhoneSniff() {
    return (/iP(ad|hone|od).*OS/.test(window.navigator.userAgent)
    );
  }
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Slider module.
   * @module foundation.slider
   * @requires foundation.util.motion
   * @requires foundation.util.triggers
   * @requires foundation.util.keyboard
   * @requires foundation.util.touch
   */

  var Slider = function () {
    /**
     * Creates a new instance of a drilldown menu.
     * @class
     * @param {jQuery} element - jQuery object to make into an accordion menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Slider(element, options) {
      _classCallCheck(this, Slider);

      this.$element = element;
      this.options = $.extend({}, Slider.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Slider');
      Foundation.Keyboard.register('Slider', {
        'ltr': {
          'ARROW_RIGHT': 'increase',
          'ARROW_UP': 'increase',
          'ARROW_DOWN': 'decrease',
          'ARROW_LEFT': 'decrease',
          'SHIFT_ARROW_RIGHT': 'increase_fast',
          'SHIFT_ARROW_UP': 'increase_fast',
          'SHIFT_ARROW_DOWN': 'decrease_fast',
          'SHIFT_ARROW_LEFT': 'decrease_fast'
        },
        'rtl': {
          'ARROW_LEFT': 'increase',
          'ARROW_RIGHT': 'decrease',
          'SHIFT_ARROW_LEFT': 'increase_fast',
          'SHIFT_ARROW_RIGHT': 'decrease_fast'
        }
      });
    }

    /**
     * Initilizes the plugin by reading/setting attributes, creating collections and setting the initial position of the handle(s).
     * @function
     * @private
     */


    _createClass(Slider, [{
      key: '_init',
      value: function _init() {
        this.inputs = this.$element.find('input');
        this.handles = this.$element.find('[data-slider-handle]');

        this.$handle = this.handles.eq(0);
        this.$input = this.inputs.length ? this.inputs.eq(0) : $('#' + this.$handle.attr('aria-controls'));
        this.$fill = this.$element.find('[data-slider-fill]').css(this.options.vertical ? 'height' : 'width', 0);

        var isDbl = false,
            _this = this;
        if (this.options.disabled || this.$element.hasClass(this.options.disabledClass)) {
          this.options.disabled = true;
          this.$element.addClass(this.options.disabledClass);
        }
        if (!this.inputs.length) {
          this.inputs = $().add(this.$input);
          this.options.binding = true;
        }
        this._setInitAttr(0);
        this._events(this.$handle);

        if (this.handles[1]) {
          this.options.doubleSided = true;
          this.$handle2 = this.handles.eq(1);
          this.$input2 = this.inputs.length > 1 ? this.inputs.eq(1) : $('#' + this.$handle2.attr('aria-controls'));

          if (!this.inputs[1]) {
            this.inputs = this.inputs.add(this.$input2);
          }
          isDbl = true;

          this._setHandlePos(this.$handle, this.options.initialStart, true, function () {

            _this._setHandlePos(_this.$handle2, _this.options.initialEnd, true);
          });
          // this.$handle.triggerHandler('click.zf.slider');
          this._setInitAttr(1);
          this._events(this.$handle2);
        }

        if (!isDbl) {
          this._setHandlePos(this.$handle, this.options.initialStart, true);
        }
      }

      /**
       * Sets the position of the selected handle and fill bar.
       * @function
       * @private
       * @param {jQuery} $hndl - the selected handle to move.
       * @param {Number} location - floating point between the start and end values of the slider bar.
       * @param {Function} cb - callback function to fire on completion.
       * @fires Slider#moved
       */

    }, {
      key: '_setHandlePos',
      value: function _setHandlePos($hndl, location, noInvert, cb) {
        //might need to alter that slightly for bars that will have odd number selections.
        location = parseFloat(location); //on input change events, convert string to number...grumble.

        // prevent slider from running out of bounds, if value exceeds the limits set through options, override the value to min/max
        if (location < this.options.start) {
          location = this.options.start;
        } else if (location > this.options.end) {
          location = this.options.end;
        }

        var isDbl = this.options.doubleSided;

        if (isDbl) {
          //this block is to prevent 2 handles from crossing eachother. Could/should be improved.
          if (this.handles.index($hndl) === 0) {
            var h2Val = parseFloat(this.$handle2.attr('aria-valuenow'));
            location = location >= h2Val ? h2Val - this.options.step : location;
          } else {
            var h1Val = parseFloat(this.$handle.attr('aria-valuenow'));
            location = location <= h1Val ? h1Val + this.options.step : location;
          }
        }

        //this is for single-handled vertical sliders, it adjusts the value to account for the slider being "upside-down"
        //for click and drag events, it's weird due to the scale(-1, 1) css property
        if (this.options.vertical && !noInvert) {
          location = this.options.end - location;
        }

        var _this = this,
            vert = this.options.vertical,
            hOrW = vert ? 'height' : 'width',
            lOrT = vert ? 'top' : 'left',
            handleDim = $hndl[0].getBoundingClientRect()[hOrW],
            elemDim = this.$element[0].getBoundingClientRect()[hOrW],

        //percentage of bar min/max value based on click or drag point
        pctOfBar = percent(location, this.options.end).toFixed(2),

        //number of actual pixels to shift the handle, based on the percentage obtained above
        pxToMove = (elemDim - handleDim) * pctOfBar,

        //percentage of bar to shift the handle
        movement = (percent(pxToMove, elemDim) * 100).toFixed(this.options.decimal);
        //fixing the decimal value for the location number, is passed to other methods as a fixed floating-point value
        location = parseFloat(location.toFixed(this.options.decimal));
        // declare empty object for css adjustments, only used with 2 handled-sliders
        var css = {};

        this._setValues($hndl, location);

        // TODO update to calculate based on values set to respective inputs??
        if (isDbl) {
          var isLeftHndl = this.handles.index($hndl) === 0,

          //empty variable, will be used for min-height/width for fill bar
          dim,

          //percentage w/h of the handle compared to the slider bar
          handlePct = ~ ~(percent(handleDim, elemDim) * 100);
          //if left handle, the math is slightly different than if it's the right handle, and the left/top property needs to be changed for the fill bar
          if (isLeftHndl) {
            //left or top percentage value to apply to the fill bar.
            css[lOrT] = movement + '%';
            //calculate the new min-height/width for the fill bar.
            dim = parseFloat(this.$handle2[0].style[lOrT]) - movement + handlePct;
            //this callback is necessary to prevent errors and allow the proper placement and initialization of a 2-handled slider
            //plus, it means we don't care if 'dim' isNaN on init, it won't be in the future.
            if (cb && typeof cb === 'function') {
              cb();
            } //this is only needed for the initialization of 2 handled sliders
          } else {
              //just caching the value of the left/bottom handle's left/top property
              var handlePos = parseFloat(this.$handle[0].style[lOrT]);
              //calculate the new min-height/width for the fill bar. Use isNaN to prevent false positives for numbers <= 0
              //based on the percentage of movement of the handle being manipulated, less the opposing handle's left/top position, plus the percentage w/h of the handle itself
              dim = movement - (isNaN(handlePos) ? this.options.initialStart / ((this.options.end - this.options.start) / 100) : handlePos) + handlePct;
            }
          // assign the min-height/width to our css object
          css['min-' + hOrW] = dim + '%';
        }

        this.$element.one('finished.zf.animate', function () {
          /**
           * Fires when the handle is done moving.
           * @event Slider#moved
           */
          _this.$element.trigger('moved.zf.slider', [$hndl]);
        });

        //because we don't know exactly how the handle will be moved, check the amount of time it should take to move.
        var moveTime = this.$element.data('dragging') ? 1000 / 60 : this.options.moveTime;

        Foundation.Move(moveTime, $hndl, function () {
          //adjusting the left/top property of the handle, based on the percentage calculated above
          $hndl.css(lOrT, movement + '%');

          if (!_this.options.doubleSided) {
            //if single-handled, a simple method to expand the fill bar
            _this.$fill.css(hOrW, pctOfBar * 100 + '%');
          } else {
            //otherwise, use the css object we created above
            _this.$fill.css(css);
          }
        });
      }

      /**
       * Sets the initial attribute for the slider element.
       * @function
       * @private
       * @param {Number} idx - index of the current handle/input to use.
       */

    }, {
      key: '_setInitAttr',
      value: function _setInitAttr(idx) {
        var id = this.inputs.eq(idx).attr('id') || Foundation.GetYoDigits(6, 'slider');
        this.inputs.eq(idx).attr({
          'id': id,
          'max': this.options.end,
          'min': this.options.start,
          'step': this.options.step
        });
        this.handles.eq(idx).attr({
          'role': 'slider',
          'aria-controls': id,
          'aria-valuemax': this.options.end,
          'aria-valuemin': this.options.start,
          'aria-valuenow': idx === 0 ? this.options.initialStart : this.options.initialEnd,
          'aria-orientation': this.options.vertical ? 'vertical' : 'horizontal',
          'tabindex': 0
        });
      }

      /**
       * Sets the input and `aria-valuenow` values for the slider element.
       * @function
       * @private
       * @param {jQuery} $handle - the currently selected handle.
       * @param {Number} val - floating point of the new value.
       */

    }, {
      key: '_setValues',
      value: function _setValues($handle, val) {
        var idx = this.options.doubleSided ? this.handles.index($handle) : 0;
        this.inputs.eq(idx).val(val);
        $handle.attr('aria-valuenow', val);
      }

      /**
       * Handles events on the slider element.
       * Calculates the new location of the current handle.
       * If there are two handles and the bar was clicked, it determines which handle to move.
       * @function
       * @private
       * @param {Object} e - the `event` object passed from the listener.
       * @param {jQuery} $handle - the current handle to calculate for, if selected.
       * @param {Number} val - floating point number for the new value of the slider.
       * TODO clean this up, there's a lot of repeated code between this and the _setHandlePos fn.
       */

    }, {
      key: '_handleEvent',
      value: function _handleEvent(e, $handle, val) {
        var value, hasVal;
        if (!val) {
          //click or drag events
          e.preventDefault();
          var _this = this,
              vertical = this.options.vertical,
              param = vertical ? 'height' : 'width',
              direction = vertical ? 'top' : 'left',
              pageXY = vertical ? e.pageY : e.pageX,
              halfOfHandle = this.$handle[0].getBoundingClientRect()[param] / 2,
              barDim = this.$element[0].getBoundingClientRect()[param],
              barOffset = this.$element.offset()[direction] - pageXY,

          //if the cursor position is less than or greater than the elements bounding coordinates, set coordinates within those bounds
          barXY = barOffset > 0 ? -halfOfHandle : barOffset - halfOfHandle < -barDim ? barDim : Math.abs(barOffset),
              offsetPct = percent(barXY, barDim);
          value = (this.options.end - this.options.start) * offsetPct;

          // turn everything around for RTL, yay math!
          if (Foundation.rtl() && !this.options.vertical) {
            value = this.options.end - value;
          }

          value = _this._adjustValue(null, value);
          //boolean flag for the setHandlePos fn, specifically for vertical sliders
          hasVal = false;

          if (!$handle) {
            //figure out which handle it is, pass it to the next function.
            var firstHndlPos = absPosition(this.$handle, direction, barXY, param),
                secndHndlPos = absPosition(this.$handle2, direction, barXY, param);
            $handle = firstHndlPos <= secndHndlPos ? this.$handle : this.$handle2;
          }
        } else {
          //change event on input
          value = this._adjustValue(null, val);
          hasVal = true;
        }

        this._setHandlePos($handle, value, hasVal);
      }

      /**
       * Adjustes value for handle in regard to step value. returns adjusted value
       * @function
       * @private
       * @param {jQuery} $handle - the selected handle.
       * @param {Number} value - value to adjust. used if $handle is falsy
       */

    }, {
      key: '_adjustValue',
      value: function _adjustValue($handle, value) {
        var val,
            step = this.options.step,
            div = parseFloat(step / 2),
            left,
            prev_val,
            next_val;
        if (!!$handle) {
          val = parseFloat($handle.attr('aria-valuenow'));
        } else {
          val = value;
        }
        left = val % step;
        prev_val = val - left;
        next_val = prev_val + step;
        if (left === 0) {
          return val;
        }
        val = val >= prev_val + div ? next_val : prev_val;
        return val;
      }

      /**
       * Adds event listeners to the slider elements.
       * @function
       * @private
       * @param {jQuery} $handle - the current handle to apply listeners to.
       */

    }, {
      key: '_events',
      value: function _events($handle) {
        if (this.options.disabled) {
          return false;
        }

        var _this = this,
            curHandle,
            timer;

        this.inputs.off('change.zf.slider').on('change.zf.slider', function (e) {
          var idx = _this.inputs.index($(this));
          _this._handleEvent(e, _this.handles.eq(idx), $(this).val());
        });

        if (this.options.clickSelect) {
          this.$element.off('click.zf.slider').on('click.zf.slider', function (e) {
            if (_this.$element.data('dragging')) {
              return false;
            }

            if (!$(e.target).is('[data-slider-handle]')) {
              if (_this.options.doubleSided) {
                _this._handleEvent(e);
              } else {
                _this._handleEvent(e, _this.$handle);
              }
            }
          });
        }

        if (this.options.draggable) {
          this.handles.addTouch();

          var $body = $('body');
          $handle.off('mousedown.zf.slider').on('mousedown.zf.slider', function (e) {
            $handle.addClass('is-dragging');
            _this.$fill.addClass('is-dragging'); //
            _this.$element.data('dragging', true);

            curHandle = $(e.currentTarget);

            $body.on('mousemove.zf.slider', function (e) {
              e.preventDefault();

              _this._handleEvent(e, curHandle);
            }).on('mouseup.zf.slider', function (e) {
              _this._handleEvent(e, curHandle);

              $handle.removeClass('is-dragging');
              _this.$fill.removeClass('is-dragging');
              _this.$element.data('dragging', false);

              $body.off('mousemove.zf.slider mouseup.zf.slider');
            });
          });
        }

        $handle.off('keydown.zf.slider').on('keydown.zf.slider', function (e) {
          var _$handle = $(this),
              idx = _this.options.doubleSided ? _this.handles.index(_$handle) : 0,
              oldValue = parseFloat(_this.inputs.eq(idx).val()),
              newValue;

          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Slider', {
            decrease: function () {
              newValue = oldValue - _this.options.step;
            },
            increase: function () {
              newValue = oldValue + _this.options.step;
            },
            decrease_fast: function () {
              newValue = oldValue - _this.options.step * 10;
            },
            increase_fast: function () {
              newValue = oldValue + _this.options.step * 10;
            },
            handled: function () {
              // only set handle pos when event was handled specially
              e.preventDefault();
              _this._setHandlePos(_$handle, newValue, true);
            }
          });
          /*if (newValue) { // if pressed key has special function, update value
            e.preventDefault();
            _this._setHandlePos(_$handle, newValue);
          }*/
        });
      }

      /**
       * Destroys the slider plugin.
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.handles.off('.zf.slider');
        this.inputs.off('.zf.slider');
        this.$element.off('.zf.slider');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Slider;
  }();

  Slider.defaults = {
    /**
     * Minimum value for the slider scale.
     * @option
     * @example 0
     */
    start: 0,
    /**
     * Maximum value for the slider scale.
     * @option
     * @example 100
     */
    end: 100,
    /**
     * Minimum value change per change event.
     * @option
     * @example 1
     */
    step: 1,
    /**
     * Value at which the handle/input *(left handle/first input)* should be set to on initialization.
     * @option
     * @example 0
     */
    initialStart: 0,
    /**
     * Value at which the right handle/second input should be set to on initialization.
     * @option
     * @example 100
     */
    initialEnd: 100,
    /**
     * Allows the input to be located outside the container and visible. Set to by the JS
     * @option
     * @example false
     */
    binding: false,
    /**
     * Allows the user to click/tap on the slider bar to select a value.
     * @option
     * @example true
     */
    clickSelect: true,
    /**
     * Set to true and use the `vertical` class to change alignment to vertical.
     * @option
     * @example false
     */
    vertical: false,
    /**
     * Allows the user to drag the slider handle(s) to select a value.
     * @option
     * @example true
     */
    draggable: true,
    /**
     * Disables the slider and prevents event listeners from being applied. Double checked by JS with `disabledClass`.
     * @option
     * @example false
     */
    disabled: false,
    /**
     * Allows the use of two handles. Double checked by the JS. Changes some logic handling.
     * @option
     * @example false
     */
    doubleSided: false,
    /**
     * Potential future feature.
     */
    // steps: 100,
    /**
     * Number of decimal places the plugin should go to for floating point precision.
     * @option
     * @example 2
     */
    decimal: 2,
    /**
     * Time delay for dragged elements.
     */
    // dragDelay: 0,
    /**
     * Time, in ms, to animate the movement of a slider handle if user clicks/taps on the bar. Needs to be manually set if updating the transition time in the Sass settings.
     * @option
     * @example 200
     */
    moveTime: 200, //update this if changing the transition time in the sass
    /**
     * Class applied to disabled sliders.
     * @option
     * @example 'disabled'
     */
    disabledClass: 'disabled',
    /**
     * Will invert the default layout for a vertical<span data-tooltip title="who would do this???"> </span>slider.
     * @option
     * @example false
     */
    invertVertical: false
  };

  function percent(frac, num) {
    return frac / num;
  }
  function absPosition($handle, dir, clickPos, param) {
    return Math.abs($handle.position()[dir] + $handle[param]() / 2 - clickPos);
  }

  // Window exports
  Foundation.plugin(Slider, 'Slider');
}(jQuery);

//*********this is in case we go to static, absolute positions instead of dynamic positioning********
// this.setSteps(function() {
//   _this._events();
//   var initStart = _this.options.positions[_this.options.initialStart - 1] || null;
//   var initEnd = _this.options.initialEnd ? _this.options.position[_this.options.initialEnd - 1] : null;
//   if (initStart || initEnd) {
//     _this._handleEvent(initStart, initEnd);
//   }
// });

//***********the other part of absolute positions*************
// Slider.prototype.setSteps = function(cb) {
//   var posChange = this.$element.outerWidth() / this.options.steps;
//   var counter = 0
//   while(counter < this.options.steps) {
//     if (counter) {
//       this.options.positions.push(this.options.positions[counter - 1] + posChange);
//     } else {
//       this.options.positions.push(posChange);
//     }
//     counter++;
//   }
//   cb();
// };
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Sticky module.
   * @module foundation.sticky
   * @requires foundation.util.triggers
   * @requires foundation.util.mediaQuery
   */

  var Sticky = function () {
    /**
     * Creates a new instance of a sticky thing.
     * @class
     * @param {jQuery} element - jQuery object to make sticky.
     * @param {Object} options - options object passed when creating the element programmatically.
     */

    function Sticky(element, options) {
      _classCallCheck(this, Sticky);

      this.$element = element;
      this.options = $.extend({}, Sticky.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Sticky');
    }

    /**
     * Initializes the sticky element by adding classes, getting/setting dimensions, breakpoints and attributes
     * @function
     * @private
     */


    _createClass(Sticky, [{
      key: '_init',
      value: function _init() {
        var $parent = this.$element.parent('[data-sticky-container]'),
            id = this.$element[0].id || Foundation.GetYoDigits(6, 'sticky'),
            _this = this;

        if (!$parent.length) {
          this.wasWrapped = true;
        }
        this.$container = $parent.length ? $parent : $(this.options.container).wrapInner(this.$element);
        this.$container.addClass(this.options.containerClass);

        this.$element.addClass(this.options.stickyClass).attr({ 'data-resize': id });

        this.scrollCount = this.options.checkEvery;
        this.isStuck = false;
        $(window).one('load.zf.sticky', function () {
          if (_this.options.anchor !== '') {
            _this.$anchor = $('#' + _this.options.anchor);
          } else {
            _this._parsePoints();
          }

          _this._setSizes(function () {
            _this._calc(false);
          });
          _this._events(id.split('-').reverse().join('-'));
        });
      }

      /**
       * If using multiple elements as anchors, calculates the top and bottom pixel values the sticky thing should stick and unstick on.
       * @function
       * @private
       */

    }, {
      key: '_parsePoints',
      value: function _parsePoints() {
        var top = this.options.topAnchor,
            btm = this.options.btmAnchor,
            pts = [top, btm],
            breaks = {};
        if (top && btm) {

          for (var i = 0, len = pts.length; i < len && pts[i]; i++) {
            var pt;
            if (typeof pts[i] === 'number') {
              pt = pts[i];
            } else {
              var place = pts[i].split(':'),
                  anchor = $('#' + place[0]);

              pt = anchor.offset().top;
              if (place[1] && place[1].toLowerCase() === 'bottom') {
                pt += anchor[0].getBoundingClientRect().height;
              }
            }
            breaks[i] = pt;
          }
        } else {
          breaks = { 0: 1, 1: document.documentElement.scrollHeight };
        }

        this.points = breaks;
        return;
      }

      /**
       * Adds event handlers for the scrolling element.
       * @private
       * @param {String} id - psuedo-random id for unique scroll event listener.
       */

    }, {
      key: '_events',
      value: function _events(id) {
        var _this = this,
            scrollListener = this.scrollListener = 'scroll.zf.' + id;
        if (this.isOn) {
          return;
        }
        if (this.canStick) {
          this.isOn = true;
          $(window).off(scrollListener).on(scrollListener, function (e) {
            if (_this.scrollCount === 0) {
              _this.scrollCount = _this.options.checkEvery;
              _this._setSizes(function () {
                _this._calc(false, window.pageYOffset);
              });
            } else {
              _this.scrollCount--;
              _this._calc(false, window.pageYOffset);
            }
          });
        }

        this.$element.off('resizeme.zf.trigger').on('resizeme.zf.trigger', function (e, el) {
          _this._setSizes(function () {
            _this._calc(false);
            if (_this.canStick) {
              if (!_this.isOn) {
                _this._events(id);
              }
            } else if (_this.isOn) {
              _this._pauseListeners(scrollListener);
            }
          });
        });
      }

      /**
       * Removes event handlers for scroll and change events on anchor.
       * @fires Sticky#pause
       * @param {String} scrollListener - unique, namespaced scroll listener attached to `window`
       */

    }, {
      key: '_pauseListeners',
      value: function _pauseListeners(scrollListener) {
        this.isOn = false;
        $(window).off(scrollListener);

        /**
         * Fires when the plugin is paused due to resize event shrinking the view.
         * @event Sticky#pause
         * @private
         */
        this.$element.trigger('pause.zf.sticky');
      }

      /**
       * Called on every `scroll` event and on `_init`
       * fires functions based on booleans and cached values
       * @param {Boolean} checkSizes - true if plugin should recalculate sizes and breakpoints.
       * @param {Number} scroll - current scroll position passed from scroll event cb function. If not passed, defaults to `window.pageYOffset`.
       */

    }, {
      key: '_calc',
      value: function _calc(checkSizes, scroll) {
        if (checkSizes) {
          this._setSizes();
        }

        if (!this.canStick) {
          if (this.isStuck) {
            this._removeSticky(true);
          }
          return false;
        }

        if (!scroll) {
          scroll = window.pageYOffset;
        }

        if (scroll >= this.topPoint) {
          if (scroll <= this.bottomPoint) {
            if (!this.isStuck) {
              this._setSticky();
            }
          } else {
            if (this.isStuck) {
              this._removeSticky(false);
            }
          }
        } else {
          if (this.isStuck) {
            this._removeSticky(true);
          }
        }
      }

      /**
       * Causes the $element to become stuck.
       * Adds `position: fixed;`, and helper classes.
       * @fires Sticky#stuckto
       * @function
       * @private
       */

    }, {
      key: '_setSticky',
      value: function _setSticky() {
        var stickTo = this.options.stickTo,
            mrgn = stickTo === 'top' ? 'marginTop' : 'marginBottom',
            notStuckTo = stickTo === 'top' ? 'bottom' : 'top',
            css = {};

        css[mrgn] = this.options[mrgn] + 'em';
        css[stickTo] = 0;
        css[notStuckTo] = 'auto';
        css['left'] = this.$container.offset().left + parseInt(window.getComputedStyle(this.$container[0])["padding-left"], 10);
        this.isStuck = true;
        this.$element.removeClass('is-anchored is-at-' + notStuckTo).addClass('is-stuck is-at-' + stickTo).css(css)
        /**
         * Fires when the $element has become `position: fixed;`
         * Namespaced to `top` or `bottom`, e.g. `sticky.zf.stuckto:top`
         * @event Sticky#stuckto
         */
        .trigger('sticky.zf.stuckto:' + stickTo);
      }

      /**
       * Causes the $element to become unstuck.
       * Removes `position: fixed;`, and helper classes.
       * Adds other helper classes.
       * @param {Boolean} isTop - tells the function if the $element should anchor to the top or bottom of its $anchor element.
       * @fires Sticky#unstuckfrom
       * @private
       */

    }, {
      key: '_removeSticky',
      value: function _removeSticky(isTop) {
        var stickTo = this.options.stickTo,
            stickToTop = stickTo === 'top',
            css = {},
            anchorPt = (this.points ? this.points[1] - this.points[0] : this.anchorHeight) - this.elemHeight,
            mrgn = stickToTop ? 'marginTop' : 'marginBottom',
            notStuckTo = stickToTop ? 'bottom' : 'top',
            topOrBottom = isTop ? 'top' : 'bottom';

        css[mrgn] = 0;

        if (isTop && !stickToTop || stickToTop && !isTop) {
          css[stickTo] = anchorPt;
          css[notStuckTo] = 0;
        } else {
          css[stickTo] = 0;
          css[notStuckTo] = anchorPt;
        }

        css['left'] = '';
        this.isStuck = false;
        this.$element.removeClass('is-stuck is-at-' + stickTo).addClass('is-anchored is-at-' + topOrBottom).css(css)
        /**
         * Fires when the $element has become anchored.
         * Namespaced to `top` or `bottom`, e.g. `sticky.zf.unstuckfrom:bottom`
         * @event Sticky#unstuckfrom
         */
        .trigger('sticky.zf.unstuckfrom:' + topOrBottom);
      }

      /**
       * Sets the $element and $container sizes for plugin.
       * Calls `_setBreakPoints`.
       * @param {Function} cb - optional callback function to fire on completion of `_setBreakPoints`.
       * @private
       */

    }, {
      key: '_setSizes',
      value: function _setSizes(cb) {
        this.canStick = Foundation.MediaQuery.atLeast(this.options.stickyOn);
        if (!this.canStick) {
          cb();
        }
        var _this = this,
            newElemWidth = this.$container[0].getBoundingClientRect().width,
            comp = window.getComputedStyle(this.$container[0]),
            pdng = parseInt(comp['padding-right'], 10);

        if (this.$anchor && this.$anchor.length) {
          this.anchorHeight = this.$anchor[0].getBoundingClientRect().height;
        } else {
          this._parsePoints();
        }

        this.$element.css({
          'max-width': newElemWidth - pdng + 'px'
        });

        var newContainerHeight = this.$element[0].getBoundingClientRect().height || this.containerHeight;
        this.containerHeight = newContainerHeight;
        this.$container.css({
          height: newContainerHeight
        });
        this.elemHeight = newContainerHeight;

        if (this.isStuck) {
          this.$element.css({ "left": this.$container.offset().left + parseInt(comp['padding-left'], 10) });
        }

        this._setBreakPoints(newContainerHeight, function () {
          if (cb) {
            cb();
          }
        });
      }

      /**
       * Sets the upper and lower breakpoints for the element to become sticky/unsticky.
       * @param {Number} elemHeight - px value for sticky.$element height, calculated by `_setSizes`.
       * @param {Function} cb - optional callback function to be called on completion.
       * @private
       */

    }, {
      key: '_setBreakPoints',
      value: function _setBreakPoints(elemHeight, cb) {
        if (!this.canStick) {
          if (cb) {
            cb();
          } else {
            return false;
          }
        }
        var mTop = emCalc(this.options.marginTop),
            mBtm = emCalc(this.options.marginBottom),
            topPoint = this.points ? this.points[0] : this.$anchor.offset().top,
            bottomPoint = this.points ? this.points[1] : topPoint + this.anchorHeight,

        // topPoint = this.$anchor.offset().top || this.points[0],
        // bottomPoint = topPoint + this.anchorHeight || this.points[1],
        winHeight = window.innerHeight;

        if (this.options.stickTo === 'top') {
          topPoint -= mTop;
          bottomPoint -= elemHeight + mTop;
        } else if (this.options.stickTo === 'bottom') {
          topPoint -= winHeight - (elemHeight + mBtm);
          bottomPoint -= winHeight - mBtm;
        } else {
          //this would be the stickTo: both option... tricky
        }

        this.topPoint = topPoint;
        this.bottomPoint = bottomPoint;

        if (cb) {
          cb();
        }
      }

      /**
       * Destroys the current sticky element.
       * Resets the element to the top position first.
       * Removes event listeners, JS-added css properties and classes, and unwraps the $element if the JS added the $container.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this._removeSticky(true);

        this.$element.removeClass(this.options.stickyClass + ' is-anchored is-at-top').css({
          height: '',
          top: '',
          bottom: '',
          'max-width': ''
        }).off('resizeme.zf.trigger');

        this.$anchor.off('change.zf.sticky');
        $(window).off(this.scrollListener);

        if (this.wasWrapped) {
          this.$element.unwrap();
        } else {
          this.$container.removeClass(this.options.containerClass).css({
            height: ''
          });
        }
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Sticky;
  }();

  Sticky.defaults = {
    /**
     * Customizable container template. Add your own classes for styling and sizing.
     * @option
     * @example '&lt;div data-sticky-container class="small-6 columns"&gt;&lt;/div&gt;'
     */
    container: '<div data-sticky-container></div>',
    /**
     * Location in the view the element sticks to.
     * @option
     * @example 'top'
     */
    stickTo: 'top',
    /**
     * If anchored to a single element, the id of that element.
     * @option
     * @example 'exampleId'
     */
    anchor: '',
    /**
     * If using more than one element as anchor points, the id of the top anchor.
     * @option
     * @example 'exampleId:top'
     */
    topAnchor: '',
    /**
     * If using more than one element as anchor points, the id of the bottom anchor.
     * @option
     * @example 'exampleId:bottom'
     */
    btmAnchor: '',
    /**
     * Margin, in `em`'s to apply to the top of the element when it becomes sticky.
     * @option
     * @example 1
     */
    marginTop: 1,
    /**
     * Margin, in `em`'s to apply to the bottom of the element when it becomes sticky.
     * @option
     * @example 1
     */
    marginBottom: 1,
    /**
     * Breakpoint string that is the minimum screen size an element should become sticky.
     * @option
     * @example 'medium'
     */
    stickyOn: 'medium',
    /**
     * Class applied to sticky element, and removed on destruction. Foundation defaults to `sticky`.
     * @option
     * @example 'sticky'
     */
    stickyClass: 'sticky',
    /**
     * Class applied to sticky container. Foundation defaults to `sticky-container`.
     * @option
     * @example 'sticky-container'
     */
    containerClass: 'sticky-container',
    /**
     * Number of scroll events between the plugin's recalculating sticky points. Setting it to `0` will cause it to recalc every scroll event, setting it to `-1` will prevent recalc on scroll.
     * @option
     * @example 50
     */
    checkEvery: -1
  };

  /**
   * Helper function to calculate em values
   * @param Number {em} - number of em's to calculate into pixels
   */
  function emCalc(em) {
    return parseInt(window.getComputedStyle(document.body, null).fontSize, 10) * em;
  }

  // Window exports
  Foundation.plugin(Sticky, 'Sticky');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Tabs module.
   * @module foundation.tabs
   * @requires foundation.util.keyboard
   * @requires foundation.util.timerAndImageLoader if tabs contain images
   */

  var Tabs = function () {
    /**
     * Creates a new instance of tabs.
     * @class
     * @fires Tabs#init
     * @param {jQuery} element - jQuery object to make into tabs.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Tabs(element, options) {
      _classCallCheck(this, Tabs);

      this.$element = element;
      this.options = $.extend({}, Tabs.defaults, this.$element.data(), options);

      this._init();
      Foundation.registerPlugin(this, 'Tabs');
      Foundation.Keyboard.register('Tabs', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'previous',
        'ARROW_DOWN': 'next',
        'ARROW_LEFT': 'previous'
        // 'TAB': 'next',
        // 'SHIFT_TAB': 'previous'
      });
    }

    /**
     * Initializes the tabs by showing and focusing (if autoFocus=true) the preset active tab.
     * @private
     */


    _createClass(Tabs, [{
      key: '_init',
      value: function _init() {
        var _this = this;

        this.$tabTitles = this.$element.find('.' + this.options.linkClass);
        this.$tabContent = $('[data-tabs-content="' + this.$element[0].id + '"]');

        this.$tabTitles.each(function () {
          var $elem = $(this),
              $link = $elem.find('a'),
              isActive = $elem.hasClass('is-active'),
              hash = $link[0].hash.slice(1),
              linkId = $link[0].id ? $link[0].id : hash + '-label',
              $tabContent = $('#' + hash);

          $elem.attr({ 'role': 'presentation' });

          $link.attr({
            'role': 'tab',
            'aria-controls': hash,
            'aria-selected': isActive,
            'id': linkId
          });

          $tabContent.attr({
            'role': 'tabpanel',
            'aria-hidden': !isActive,
            'aria-labelledby': linkId
          });

          if (isActive && _this.options.autoFocus) {
            $link.focus();
          }
        });

        if (this.options.matchHeight) {
          var $images = this.$tabContent.find('img');

          if ($images.length) {
            Foundation.onImagesLoaded($images, this._setHeight.bind(this));
          } else {
            this._setHeight();
          }
        }

        this._events();
      }

      /**
       * Adds event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this._addKeyHandler();
        this._addClickHandler();

        if (this.options.matchHeight) {
          $(window).on('changed.zf.mediaquery', this._setHeight.bind(this));
        }
      }

      /**
       * Adds click handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addClickHandler',
      value: function _addClickHandler() {
        var _this = this;

        this.$element.off('click.zf.tabs').on('click.zf.tabs', '.' + this.options.linkClass, function (e) {
          e.preventDefault();
          e.stopPropagation();
          if ($(this).hasClass('is-active')) {
            return;
          }
          _this._handleTabChange($(this));
        });
      }

      /**
       * Adds keyboard event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addKeyHandler',
      value: function _addKeyHandler() {
        var _this = this;
        var $firstTab = _this.$element.find('li:first-of-type');
        var $lastTab = _this.$element.find('li:last-of-type');

        this.$tabTitles.off('keydown.zf.tabs').on('keydown.zf.tabs', function (e) {
          if (e.which === 9) return;
          e.stopPropagation();
          e.preventDefault();

          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              if (_this.options.wrapOnKeys) {
                $prevElement = i === 0 ? $elements.last() : $elements.eq(i - 1);
                $nextElement = i === $elements.length - 1 ? $elements.first() : $elements.eq(i + 1);
              } else {
                $prevElement = $elements.eq(Math.max(0, i - 1));
                $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              }
              return;
            }
          });

          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Tabs', {
            open: function () {
              $element.find('[role="tab"]').focus();
              _this._handleTabChange($element);
            },
            previous: function () {
              $prevElement.find('[role="tab"]').focus();
              _this._handleTabChange($prevElement);
            },
            next: function () {
              $nextElement.find('[role="tab"]').focus();
              _this._handleTabChange($nextElement);
            }
          });
        });
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to open.
       * @fires Tabs#change
       * @function
       */

    }, {
      key: '_handleTabChange',
      value: function _handleTabChange($target) {
        var $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash),
            $oldTab = this.$element.find('.' + this.options.linkClass + '.is-active').removeClass('is-active').find('[role="tab"]').attr({ 'aria-selected': 'false' });

        $('#' + $oldTab.attr('aria-controls')).removeClass('is-active').attr({ 'aria-hidden': 'true' });

        $target.addClass('is-active');

        $tabLink.attr({ 'aria-selected': 'true' });

        $targetContent.addClass('is-active').attr({ 'aria-hidden': 'false' });

        /**
         * Fires when the plugin has successfully changed tabs.
         * @event Tabs#change
         */
        this.$element.trigger('change.zf.tabs', [$target]);
      }

      /**
       * Public method for selecting a content pane to display.
       * @param {jQuery | String} elem - jQuery object or string of the id of the pane to display.
       * @function
       */

    }, {
      key: 'selectTab',
      value: function selectTab(elem) {
        var idStr;

        if (typeof elem === 'object') {
          idStr = elem[0].id;
        } else {
          idStr = elem;
        }

        if (idStr.indexOf('#') < 0) {
          idStr = '#' + idStr;
        }

        var $target = this.$tabTitles.find('[href="' + idStr + '"]').parent('.' + this.options.linkClass);

        this._handleTabChange($target);
      }
    }, {
      key: '_setHeight',

      /**
       * Sets the height of each panel to the height of the tallest panel.
       * If enabled in options, gets called on media query change.
       * If loading content via external source, can be called directly or with _reflow.
       * @function
       * @private
       */
      value: function _setHeight() {
        var max = 0;
        this.$tabContent.find('.' + this.options.panelClass).css('height', '').each(function () {
          var panel = $(this),
              isActive = panel.hasClass('is-active');

          if (!isActive) {
            panel.css({ 'visibility': 'hidden', 'display': 'block' });
          }

          var temp = this.getBoundingClientRect().height;

          if (!isActive) {
            panel.css({
              'visibility': '',
              'display': ''
            });
          }

          max = temp > max ? temp : max;
        }).css('height', max + 'px');
      }

      /**
       * Destroys an instance of an tabs.
       * @fires Tabs#destroyed
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('.' + this.options.linkClass).off('.zf.tabs').hide().end().find('.' + this.options.panelClass).hide();

        if (this.options.matchHeight) {
          $(window).off('changed.zf.mediaquery');
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Tabs;
  }();

  Tabs.defaults = {
    /**
     * Allows the window to scroll to content of active pane on load if set to true.
     * @option
     * @example false
     */
    autoFocus: false,

    /**
     * Allows keyboard input to 'wrap' around the tab links.
     * @option
     * @example true
     */
    wrapOnKeys: true,

    /**
     * Allows the tab content panes to match heights if set to true.
     * @option
     * @example false
     */
    matchHeight: false,

    /**
     * Class applied to `li`'s in tab link list.
     * @option
     * @example 'tabs-title'
     */
    linkClass: 'tabs-title',

    /**
     * Class applied to the content containers.
     * @option
     * @example 'tabs-panel'
     */
    panelClass: 'tabs-panel'
  };

  function checkClass($elem) {
    return $elem.hasClass('is-active');
  }

  // Window exports
  Foundation.plugin(Tabs, 'Tabs');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Toggler module.
   * @module foundation.toggler
   * @requires foundation.util.motion
   * @requires foundation.util.triggers
   */

  var Toggler = function () {
    /**
     * Creates a new instance of Toggler.
     * @class
     * @fires Toggler#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Toggler(element, options) {
      _classCallCheck(this, Toggler);

      this.$element = element;
      this.options = $.extend({}, Toggler.defaults, element.data(), options);
      this.className = '';

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'Toggler');
    }

    /**
     * Initializes the Toggler plugin by parsing the toggle class from data-toggler, or animation classes from data-animate.
     * @function
     * @private
     */


    _createClass(Toggler, [{
      key: '_init',
      value: function _init() {
        var input;
        // Parse animation classes if they were set
        if (this.options.animate) {
          input = this.options.animate.split(' ');

          this.animationIn = input[0];
          this.animationOut = input[1] || null;
        }
        // Otherwise, parse toggle class
        else {
            input = this.$element.data('toggler');
            // Allow for a . at the beginning of the string
            this.className = input[0] === '.' ? input.slice(1) : input;
          }

        // Add ARIA attributes to triggers
        var id = this.$element[0].id;
        $('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-controls', id);
        // If the target is hidden, add aria-hidden
        this.$element.attr('aria-expanded', this.$element.is(':hidden') ? false : true);
      }

      /**
       * Initializes events for the toggle trigger.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this.$element.off('toggle.zf.trigger').on('toggle.zf.trigger', this.toggle.bind(this));
      }

      /**
       * Toggles the target class on the target element. An event is fired from the original trigger depending on if the resultant state was "on" or "off".
       * @function
       * @fires Toggler#on
       * @fires Toggler#off
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        this[this.options.animate ? '_toggleAnimate' : '_toggleClass']();
      }
    }, {
      key: '_toggleClass',
      value: function _toggleClass() {
        this.$element.toggleClass(this.className);

        var isOn = this.$element.hasClass(this.className);
        if (isOn) {
          /**
           * Fires if the target element has the class after a toggle.
           * @event Toggler#on
           */
          this.$element.trigger('on.zf.toggler');
        } else {
          /**
           * Fires if the target element does not have the class after a toggle.
           * @event Toggler#off
           */
          this.$element.trigger('off.zf.toggler');
        }

        this._updateARIA(isOn);
      }
    }, {
      key: '_toggleAnimate',
      value: function _toggleAnimate() {
        var _this = this;

        if (this.$element.is(':hidden')) {
          Foundation.Motion.animateIn(this.$element, this.animationIn, function () {
            this.trigger('on.zf.toggler');
            _this._updateARIA(true);
          });
        } else {
          Foundation.Motion.animateOut(this.$element, this.animationOut, function () {
            this.trigger('off.zf.toggler');
            _this._updateARIA(false);
          });
        }
      }
    }, {
      key: '_updateARIA',
      value: function _updateARIA(isOn) {
        this.$element.attr('aria-expanded', isOn ? true : false);
      }

      /**
       * Destroys the instance of Toggler on the element.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.toggler');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Toggler;
  }();

  Toggler.defaults = {
    /**
     * Tells the plugin if the element should animated when toggled.
     * @option
     * @example false
     */
    animate: false
  };

  // Window exports
  Foundation.plugin(Toggler, 'Toggler');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Tooltip module.
   * @module foundation.tooltip
   * @requires foundation.util.box
   * @requires foundation.util.triggers
   */

  var Tooltip = function () {
    /**
     * Creates a new instance of a Tooltip.
     * @class
     * @fires Tooltip#init
     * @param {jQuery} element - jQuery object to attach a tooltip to.
     * @param {Object} options - object to extend the default configuration.
     */

    function Tooltip(element, options) {
      _classCallCheck(this, Tooltip);

      this.$element = element;
      this.options = $.extend({}, Tooltip.defaults, this.$element.data(), options);

      this.isActive = false;
      this.isClick = false;
      this._init();

      Foundation.registerPlugin(this, 'Tooltip');
    }

    /**
     * Initializes the tooltip by setting the creating the tip element, adding it's text, setting private variables and setting attributes on the anchor.
     * @private
     */


    _createClass(Tooltip, [{
      key: '_init',
      value: function _init() {
        var elemId = this.$element.attr('aria-describedby') || Foundation.GetYoDigits(6, 'tooltip');

        this.options.positionClass = this._getPositionClass(this.$element);
        this.options.tipText = this.options.tipText || this.$element.attr('title');
        this.template = this.options.template ? $(this.options.template) : this._buildTemplate(elemId);

        this.template.appendTo(document.body).text(this.options.tipText).hide();

        this.$element.attr({
          'title': '',
          'aria-describedby': elemId,
          'data-yeti-box': elemId,
          'data-toggle': elemId,
          'data-resize': elemId
        }).addClass(this.triggerClass);

        //helper variables to track movement on collisions
        this.usedPositions = [];
        this.counter = 4;
        this.classChanged = false;

        this._events();
      }

      /**
       * Grabs the current positioning class, if present, and returns the value or an empty string.
       * @private
       */

    }, {
      key: '_getPositionClass',
      value: function _getPositionClass(element) {
        if (!element) {
          return '';
        }
        // var position = element.attr('class').match(/top|left|right/g);
        var position = element[0].className.match(/\b(top|left|right)\b/g);
        position = position ? position[0] : '';
        return position;
      }
    }, {
      key: '_buildTemplate',

      /**
       * builds the tooltip element, adds attributes, and returns the template.
       * @private
       */
      value: function _buildTemplate(id) {
        var templateClasses = (this.options.tooltipClass + ' ' + this.options.positionClass + ' ' + this.options.templateClasses).trim();
        var $template = $('<div></div>').addClass(templateClasses).attr({
          'role': 'tooltip',
          'aria-hidden': true,
          'data-is-active': false,
          'data-is-focus': false,
          'id': id
        });
        return $template;
      }

      /**
       * Function that gets called if a collision event is detected.
       * @param {String} position - positioning class to try
       * @private
       */

    }, {
      key: '_reposition',
      value: function _reposition(position) {
        this.usedPositions.push(position ? position : 'bottom');

        //default, try switching to opposite side
        if (!position && this.usedPositions.indexOf('top') < 0) {
          this.template.addClass('top');
        } else if (position === 'top' && this.usedPositions.indexOf('bottom') < 0) {
          this.template.removeClass(position);
        } else if (position === 'left' && this.usedPositions.indexOf('right') < 0) {
          this.template.removeClass(position).addClass('right');
        } else if (position === 'right' && this.usedPositions.indexOf('left') < 0) {
          this.template.removeClass(position).addClass('left');
        }

        //if default change didn't work, try bottom or left first
        else if (!position && this.usedPositions.indexOf('top') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.template.addClass('left');
          } else if (position === 'top' && this.usedPositions.indexOf('bottom') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.template.removeClass(position).addClass('left');
          } else if (position === 'left' && this.usedPositions.indexOf('right') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.template.removeClass(position);
          } else if (position === 'right' && this.usedPositions.indexOf('left') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.template.removeClass(position);
          }
          //if nothing cleared, set to bottom
          else {
              this.template.removeClass(position);
            }
        this.classChanged = true;
        this.counter--;
      }

      /**
       * sets the position class of an element and recursively calls itself until there are no more possible positions to attempt, or the tooltip element is no longer colliding.
       * if the tooltip is larger than the screen width, default to full width - any user selected margin
       * @private
       */

    }, {
      key: '_setPosition',
      value: function _setPosition() {
        var position = this._getPositionClass(this.template),
            $tipDims = Foundation.Box.GetDimensions(this.template),
            $anchorDims = Foundation.Box.GetDimensions(this.$element),
            direction = position === 'left' ? 'left' : position === 'right' ? 'left' : 'top',
            param = direction === 'top' ? 'height' : 'width',
            offset = param === 'height' ? this.options.vOffset : this.options.hOffset,
            _this = this;

        if ($tipDims.width >= $tipDims.windowDims.width || !this.counter && !Foundation.Box.ImNotTouchingYou(this.template)) {
          this.template.offset(Foundation.Box.GetOffsets(this.template, this.$element, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
            // this.$element.offset(Foundation.GetOffsets(this.template, this.$element, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
            'width': $anchorDims.windowDims.width - this.options.hOffset * 2,
            'height': 'auto'
          });
          return false;
        }

        this.template.offset(Foundation.Box.GetOffsets(this.template, this.$element, 'center ' + (position || 'bottom'), this.options.vOffset, this.options.hOffset));

        while (!Foundation.Box.ImNotTouchingYou(this.template) && this.counter) {
          this._reposition(position);
          this._setPosition();
        }
      }

      /**
       * reveals the tooltip, and fires an event to close any other open tooltips on the page
       * @fires Tooltip#closeme
       * @fires Tooltip#show
       * @function
       */

    }, {
      key: 'show',
      value: function show() {
        if (this.options.showOn !== 'all' && !Foundation.MediaQuery.atLeast(this.options.showOn)) {
          // console.error('The screen is too small to display this tooltip');
          return false;
        }

        var _this = this;
        this.template.css('visibility', 'hidden').show();
        this._setPosition();

        /**
         * Fires to close all other open tooltips on the page
         * @event Closeme#tooltip
         */
        this.$element.trigger('closeme.zf.tooltip', this.template.attr('id'));

        this.template.attr({
          'data-is-active': true,
          'aria-hidden': false
        });
        _this.isActive = true;
        // console.log(this.template);
        this.template.stop().hide().css('visibility', '').fadeIn(this.options.fadeInDuration, function () {
          //maybe do stuff?
        });
        /**
         * Fires when the tooltip is shown
         * @event Tooltip#show
         */
        this.$element.trigger('show.zf.tooltip');
      }

      /**
       * Hides the current tooltip, and resets the positioning class if it was changed due to collision
       * @fires Tooltip#hide
       * @function
       */

    }, {
      key: 'hide',
      value: function hide() {
        // console.log('hiding', this.$element.data('yeti-box'));
        var _this = this;
        this.template.stop().attr({
          'aria-hidden': true,
          'data-is-active': false
        }).fadeOut(this.options.fadeOutDuration, function () {
          _this.isActive = false;
          _this.isClick = false;
          if (_this.classChanged) {
            _this.template.removeClass(_this._getPositionClass(_this.template)).addClass(_this.options.positionClass);

            _this.usedPositions = [];
            _this.counter = 4;
            _this.classChanged = false;
          }
        });
        /**
         * fires when the tooltip is hidden
         * @event Tooltip#hide
         */
        this.$element.trigger('hide.zf.tooltip');
      }

      /**
       * adds event listeners for the tooltip and its anchor
       * TODO combine some of the listeners like focus and mouseenter, etc.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;
        var $template = this.template;
        var isFocus = false;

        if (!this.options.disableHover) {

          this.$element.on('mouseenter.zf.tooltip', function (e) {
            if (!_this.isActive) {
              _this.timeout = setTimeout(function () {
                _this.show();
              }, _this.options.hoverDelay);
            }
          }).on('mouseleave.zf.tooltip', function (e) {
            clearTimeout(_this.timeout);
            if (!isFocus || !_this.isClick && _this.options.clickOpen) {
              _this.hide();
            }
          });
        }

        if (this.options.clickOpen) {
          this.$element.on('mousedown.zf.tooltip', function (e) {
            e.stopImmediatePropagation();
            if (_this.isClick) {
              _this.hide();
              // _this.isClick = false;
            } else {
                _this.isClick = true;
                if ((_this.options.disableHover || !_this.$element.attr('tabindex')) && !_this.isActive) {
                  _this.show();
                }
              }
          });
        }

        if (!this.options.disableForTouch) {
          this.$element.on('tap.zf.tooltip touchend.zf.tooltip', function (e) {
            _this.isActive ? _this.hide() : _this.show();
          });
        }

        this.$element.on({
          // 'toggle.zf.trigger': this.toggle.bind(this),
          // 'close.zf.trigger': this.hide.bind(this)
          'close.zf.trigger': this.hide.bind(this)
        });

        this.$element.on('focus.zf.tooltip', function (e) {
          isFocus = true;
          // console.log(_this.isClick);
          if (_this.isClick) {
            return false;
          } else {
            // $(window)
            _this.show();
          }
        }).on('focusout.zf.tooltip', function (e) {
          isFocus = false;
          _this.isClick = false;
          _this.hide();
        }).on('resizeme.zf.trigger', function () {
          if (_this.isActive) {
            _this._setPosition();
          }
        });
      }

      /**
       * adds a toggle method, in addition to the static show() & hide() functions
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.isActive) {
          this.hide();
        } else {
          this.show();
        }
      }

      /**
       * Destroys an instance of tooltip, removes template element from the view.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.attr('title', this.template.text()).off('.zf.trigger .zf.tootip')
        //  .removeClass('has-tip')
        .removeAttr('aria-describedby').removeAttr('data-yeti-box').removeAttr('data-toggle').removeAttr('data-resize');

        this.template.remove();

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Tooltip;
  }();

  Tooltip.defaults = {
    disableForTouch: false,
    /**
     * Time, in ms, before a tooltip should open on hover.
     * @option
     * @example 200
     */
    hoverDelay: 200,
    /**
     * Time, in ms, a tooltip should take to fade into view.
     * @option
     * @example 150
     */
    fadeInDuration: 150,
    /**
     * Time, in ms, a tooltip should take to fade out of view.
     * @option
     * @example 150
     */
    fadeOutDuration: 150,
    /**
     * Disables hover events from opening the tooltip if set to true
     * @option
     * @example false
     */
    disableHover: false,
    /**
     * Optional addtional classes to apply to the tooltip template on init.
     * @option
     * @example 'my-cool-tip-class'
     */
    templateClasses: '',
    /**
     * Non-optional class added to tooltip templates. Foundation default is 'tooltip'.
     * @option
     * @example 'tooltip'
     */
    tooltipClass: 'tooltip',
    /**
     * Class applied to the tooltip anchor element.
     * @option
     * @example 'has-tip'
     */
    triggerClass: 'has-tip',
    /**
     * Minimum breakpoint size at which to open the tooltip.
     * @option
     * @example 'small'
     */
    showOn: 'small',
    /**
     * Custom template to be used to generate markup for tooltip.
     * @option
     * @example '&lt;div class="tooltip"&gt;&lt;/div&gt;'
     */
    template: '',
    /**
     * Text displayed in the tooltip template on open.
     * @option
     * @example 'Some cool space fact here.'
     */
    tipText: '',
    touchCloseText: 'Tap to close.',
    /**
     * Allows the tooltip to remain open if triggered with a click or touch event.
     * @option
     * @example true
     */
    clickOpen: true,
    /**
     * Additional positioning classes, set by the JS
     * @option
     * @example 'top'
     */
    positionClass: '',
    /**
     * Distance, in pixels, the template should push away from the anchor on the Y axis.
     * @option
     * @example 10
     */
    vOffset: 10,
    /**
     * Distance, in pixels, the template should push away from the anchor on the X axis, if aligned to a side.
     * @option
     * @example 12
     */
    hOffset: 12
  };

  /**
   * TODO utilize resize event trigger
   */

  // Window exports
  Foundation.plugin(Tooltip, 'Tooltip');
}(jQuery);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWJpZGUuanMiLCJmb3VuZGF0aW9uLmFjY29yZGlvbi5qcyIsImZvdW5kYXRpb24uYWNjb3JkaW9uTWVudS5qcyIsImZvdW5kYXRpb24uZHJpbGxkb3duLmpzIiwiZm91bmRhdGlvbi5kcm9wZG93bi5qcyIsImZvdW5kYXRpb24uZHJvcGRvd25NZW51LmpzIiwiZm91bmRhdGlvbi5lcXVhbGl6ZXIuanMiLCJmb3VuZGF0aW9uLmludGVyY2hhbmdlLmpzIiwiZm91bmRhdGlvbi5tYWdlbGxhbi5qcyIsImZvdW5kYXRpb24ub2ZmY2FudmFzLmpzIiwiZm91bmRhdGlvbi5vcmJpdC5qcyIsImZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnUuanMiLCJmb3VuZGF0aW9uLnJlc3BvbnNpdmVUb2dnbGUuanMiLCJmb3VuZGF0aW9uLnJldmVhbC5qcyIsImZvdW5kYXRpb24uc2xpZGVyLmpzIiwiZm91bmRhdGlvbi5zdGlja3kuanMiLCJmb3VuZGF0aW9uLnRhYnMuanMiLCJmb3VuZGF0aW9uLnRvZ2dsZXIuanMiLCJmb3VuZGF0aW9uLnRvb2x0aXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjhOQUFBLENBQUMsQ0FBQyxTQUFTLElBQVQsQ0FBZSxPQUFmLENBQXdCLENBQ3hCLEdBQUksT0FBTyxNQUFQLEdBQWtCLFVBQWxCLEVBQWdDLE9BQU8sR0FB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Qix3QkFEbEI7O1NBR2MsVUFIZCxDQUd5QixrQkFIekIsRUFJYyxVQUpkLENBSXlCLGVBSnpCLEVBS2MsVUFMZCxDQUt5QixhQUx6QixFQU1jLFVBTmQsQ0FNeUIsYUFOekIsRUFEUTs7QUFTUixhQUFLLFFBQUwsQ0FBYyxNQUFkLEdBVFE7O0FBV1IsbUJBQVcsZ0JBQVgsQ0FBNEIsSUFBNUIsRUFYUTs7OztXQTNUTjtNQVRPOztBQW1WYixVQUFRLFFBQVIsR0FBbUI7QUFDakIscUJBQWlCLEtBQWpCOzs7Ozs7QUFNQSxnQkFBWSxHQUFaOzs7Ozs7QUFNQSxvQkFBZ0IsR0FBaEI7Ozs7OztBQU1BLHFCQUFpQixHQUFqQjs7Ozs7O0FBTUEsa0JBQWMsS0FBZDs7Ozs7O0FBTUEscUJBQWlCLEVBQWpCOzs7Ozs7QUFNQSxrQkFBYyxTQUFkOzs7Ozs7QUFNQSxrQkFBYyxTQUFkOzs7Ozs7QUFNQSxZQUFRLE9BQVI7Ozs7OztBQU1BLGNBQVUsRUFBVjs7Ozs7O0FBTUEsYUFBUyxFQUFUO0FBQ0Esb0JBQWdCLGVBQWhCOzs7Ozs7QUFNQSxlQUFXLElBQVg7Ozs7OztBQU1BLG1CQUFlLEVBQWY7Ozs7OztBQU1BLGFBQVMsRUFBVDs7Ozs7O0FBTUEsYUFBUyxFQUFUO0dBdEZGOzs7Ozs7O0FBblZhLFlBaWJiLENBQVcsTUFBWCxDQUFrQixPQUFsQixFQUEyQixTQUEzQixFQWpiYTtDQUFaLENBbWJDLE1BbmJELENBQUQiLCJmaWxlIjoiZm91bmRhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIjsoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoZmFjdG9yeSgpKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICByb290LndoYXRJbnB1dCA9IGZhY3RvcnkoKTtcbiAgfVxufSAodGhpcywgZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuXG4gIC8qXG4gICAgLS0tLS0tLS0tLS0tLS0tXG4gICAgdmFyaWFibGVzXG4gICAgLS0tLS0tLS0tLS0tLS0tXG4gICovXG5cbiAgLy8gYXJyYXkgb2YgYWN0aXZlbHkgcHJlc3NlZCBrZXlzXG4gIHZhciBhY3RpdmVLZXlzID0gW107XG5cbiAgLy8gY2FjaGUgZG9jdW1lbnQuYm9keVxuICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XG5cbiAgLy8gYm9vbGVhbjogdHJ1ZSBpZiB0b3VjaCBidWZmZXIgdGltZXIgaXMgcnVubmluZ1xuICB2YXIgYnVmZmVyID0gZmFsc2U7XG5cbiAgLy8gdGhlIGxhc3QgdXNlZCBpbnB1dCB0eXBlXG4gIHZhciBjdXJyZW50SW5wdXQgPSBudWxsO1xuXG4gIC8vIGFycmF5IG9mIGZvcm0gZWxlbWVudHMgdGhhdCB0YWtlIGtleWJvYXJkIGlucHV0XG4gIHZhciBmb3JtSW5wdXRzID0gW1xuICAgICdpbnB1dCcsXG4gICAgJ3NlbGVjdCcsXG4gICAgJ3RleHRhcmVhJ1xuICBdO1xuXG4gIC8vIHVzZXItc2V0IGZsYWcgdG8gYWxsb3cgdHlwaW5nIGluIGZvcm0gZmllbGRzIHRvIGJlIHJlY29yZGVkXG4gIHZhciBmb3JtVHlwaW5nID0gYm9keS5oYXNBdHRyaWJ1dGUoJ2RhdGEtd2hhdGlucHV0LWZvcm10eXBpbmcnKTtcblxuICAvLyBtYXBwaW5nIG9mIGV2ZW50cyB0byBpbnB1dCB0eXBlc1xuICB2YXIgaW5wdXRNYXAgPSB7XG4gICAgJ2tleWRvd24nOiAna2V5Ym9hcmQnLFxuICAgICdtb3VzZWRvd24nOiAnbW91c2UnLFxuICAgICdtb3VzZWVudGVyJzogJ21vdXNlJyxcbiAgICAndG91Y2hzdGFydCc6ICd0b3VjaCcsXG4gICAgJ3BvaW50ZXJkb3duJzogJ3BvaW50ZXInLFxuICAgICdNU1BvaW50ZXJEb3duJzogJ3BvaW50ZXInXG4gIH07XG5cbiAgLy8gYXJyYXkgb2YgYWxsIHVzZWQgaW5wdXQgdHlwZXNcbiAgdmFyIGlucHV0VHlwZXMgPSBbXTtcblxuICAvLyBtYXBwaW5nIG9mIGtleSBjb2RlcyB0byBjb21tb24gbmFtZVxuICB2YXIga2V5TWFwID0ge1xuICAgIDk6ICd0YWInLFxuICAgIDEzOiAnZW50ZXInLFxuICAgIDE2OiAnc2hpZnQnLFxuICAgIDI3OiAnZXNjJyxcbiAgICAzMjogJ3NwYWNlJyxcbiAgICAzNzogJ2xlZnQnLFxuICAgIDM4OiAndXAnLFxuICAgIDM5OiAncmlnaHQnLFxuICAgIDQwOiAnZG93bidcbiAgfTtcblxuICAvLyBtYXAgb2YgSUUgMTAgcG9pbnRlciBldmVudHNcbiAgdmFyIHBvaW50ZXJNYXAgPSB7XG4gICAgMjogJ3RvdWNoJyxcbiAgICAzOiAndG91Y2gnLCAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuICAgIDQ6ICdtb3VzZSdcbiAgfTtcblxuICAvLyB0b3VjaCBidWZmZXIgdGltZXJcbiAgdmFyIHRpbWVyO1xuXG5cbiAgLypcbiAgICAtLS0tLS0tLS0tLS0tLS1cbiAgICBmdW5jdGlvbnNcbiAgICAtLS0tLS0tLS0tLS0tLS1cbiAgKi9cblxuICBmdW5jdGlvbiBidWZmZXJJbnB1dChldmVudCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG5cbiAgICBzZXRJbnB1dChldmVudCk7XG5cbiAgICBidWZmZXIgPSB0cnVlO1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGJ1ZmZlciA9IGZhbHNlO1xuICAgIH0sIDEwMDApO1xuICB9XG5cbiAgZnVuY3Rpb24gaW1tZWRpYXRlSW5wdXQoZXZlbnQpIHtcbiAgICBpZiAoIWJ1ZmZlcikgc2V0SW5wdXQoZXZlbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0SW5wdXQoZXZlbnQpIHtcbiAgICB2YXIgZXZlbnRLZXkgPSBrZXkoZXZlbnQpO1xuICAgIHZhciBldmVudFRhcmdldCA9IHRhcmdldChldmVudCk7XG4gICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG4gICAgaWYgKHZhbHVlID09PSAncG9pbnRlcicpIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXG4gICAgaWYgKGN1cnJlbnRJbnB1dCAhPT0gdmFsdWUpIHtcbiAgICAgIGlmIChcbiAgICAgICAgLy8gb25seSBpZiB0aGUgdXNlciBmbGFnIGlzbid0IHNldFxuICAgICAgICAhZm9ybVR5cGluZyAmJlxuXG4gICAgICAgIC8vIG9ubHkgaWYgY3VycmVudElucHV0IGhhcyBhIHZhbHVlXG4gICAgICAgIGN1cnJlbnRJbnB1dCAmJlxuXG4gICAgICAgIC8vIG9ubHkgaWYgdGhlIGlucHV0IGlzIGBrZXlib2FyZGBcbiAgICAgICAgdmFsdWUgPT09ICdrZXlib2FyZCcgJiZcblxuICAgICAgICAvLyBub3QgaWYgdGhlIGtleSBpcyBgVEFCYFxuICAgICAgICBrZXlNYXBbZXZlbnRLZXldICE9PSAndGFiJyAmJlxuXG4gICAgICAgIC8vIG9ubHkgaWYgdGhlIHRhcmdldCBpcyBvbmUgb2YgdGhlIGVsZW1lbnRzIGluIGBmb3JtSW5wdXRzYFxuICAgICAgICBmb3JtSW5wdXRzLmluZGV4T2YoZXZlbnRUYXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkgPj0gMFxuICAgICAgKSB7XG4gICAgICAgIC8vIGlnbm9yZSBrZXlib2FyZCB0eXBpbmcgb24gZm9ybSBlbGVtZW50c1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudElucHV0ID0gdmFsdWU7XG4gICAgICAgIGJvZHkuc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnB1dCcsIGN1cnJlbnRJbnB1dCk7XG5cbiAgICAgICAgaWYgKGlucHV0VHlwZXMuaW5kZXhPZihjdXJyZW50SW5wdXQpID09PSAtMSkgaW5wdXRUeXBlcy5wdXNoKGN1cnJlbnRJbnB1dCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlID09PSAna2V5Ym9hcmQnKSBsb2dLZXlzKGV2ZW50S2V5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGtleShldmVudCkge1xuICAgIHJldHVybiAoZXZlbnQua2V5Q29kZSkgPyBldmVudC5rZXlDb2RlIDogZXZlbnQud2hpY2g7XG4gIH1cblxuICBmdW5jdGlvbiB0YXJnZXQoZXZlbnQpIHtcbiAgICByZXR1cm4gZXZlbnQudGFyZ2V0IHx8IGV2ZW50LnNyY0VsZW1lbnQ7XG4gIH1cblxuICBmdW5jdGlvbiBwb2ludGVyVHlwZShldmVudCkge1xuICAgIHJldHVybiAodHlwZW9mIGV2ZW50LnBvaW50ZXJUeXBlID09PSAnbnVtYmVyJykgPyBwb2ludGVyTWFwW2V2ZW50LnBvaW50ZXJUeXBlXSA6IGV2ZW50LnBvaW50ZXJUeXBlO1xuICB9XG5cbiAgLy8ga2V5Ym9hcmQgbG9nZ2luZ1xuICBmdW5jdGlvbiBsb2dLZXlzKGV2ZW50S2V5KSB7XG4gICAgaWYgKGFjdGl2ZUtleXMuaW5kZXhPZihrZXlNYXBbZXZlbnRLZXldKSA9PT0gLTEgJiYga2V5TWFwW2V2ZW50S2V5XSkgYWN0aXZlS2V5cy5wdXNoKGtleU1hcFtldmVudEtleV0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5Mb2dLZXlzKGV2ZW50KSB7XG4gICAgdmFyIGV2ZW50S2V5ID0ga2V5KGV2ZW50KTtcbiAgICB2YXIgYXJyYXlQb3MgPSBhY3RpdmVLZXlzLmluZGV4T2Yoa2V5TWFwW2V2ZW50S2V5XSk7XG5cbiAgICBpZiAoYXJyYXlQb3MgIT09IC0xKSBhY3RpdmVLZXlzLnNwbGljZShhcnJheVBvcywgMSk7XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xuXG4gICAgLy8gcG9pbnRlci9tb3VzZVxuICAgIHZhciBtb3VzZUV2ZW50ID0gJ21vdXNlZG93bic7XG5cbiAgICBpZiAod2luZG93LlBvaW50ZXJFdmVudCkge1xuICAgICAgbW91c2VFdmVudCA9ICdwb2ludGVyZG93bic7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQpIHtcbiAgICAgIG1vdXNlRXZlbnQgPSAnTVNQb2ludGVyRG93bic7XG4gICAgfVxuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKG1vdXNlRXZlbnQsIGltbWVkaWF0ZUlucHV0KTtcbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBpbW1lZGlhdGVJbnB1dCk7XG5cbiAgICAvLyB0b3VjaFxuICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcbiAgICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGJ1ZmZlcklucHV0KTtcbiAgICB9XG5cbiAgICAvLyBrZXlib2FyZFxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGltbWVkaWF0ZUlucHV0KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVuTG9nS2V5cyk7XG4gIH1cblxuXG4gIC8qXG4gICAgLS0tLS0tLS0tLS0tLS0tXG4gICAgaW5pdFxuXG4gICAgZG9uJ3Qgc3RhcnQgc2NyaXB0IHVubGVzcyBicm93c2VyIGN1dHMgdGhlIG11c3RhcmQsXG4gICAgYWxzbyBwYXNzZXMgaWYgcG9seWZpbGxzIGFyZSB1c2VkXG4gICAgLS0tLS0tLS0tLS0tLS0tXG4gICovXG5cbiAgaWYgKCdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cgJiYgQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICBiaW5kRXZlbnRzKCk7XG4gIH1cblxuXG4gIC8qXG4gICAgLS0tLS0tLS0tLS0tLS0tXG4gICAgYXBpXG4gICAgLS0tLS0tLS0tLS0tLS0tXG4gICovXG5cbiAgcmV0dXJuIHtcblxuICAgIC8vIHJldHVybnMgc3RyaW5nOiB0aGUgY3VycmVudCBpbnB1dCB0eXBlXG4gICAgYXNrOiBmdW5jdGlvbigpIHsgcmV0dXJuIGN1cnJlbnRJbnB1dDsgfSxcblxuICAgIC8vIHJldHVybnMgYXJyYXk6IGN1cnJlbnRseSBwcmVzc2VkIGtleXNcbiAgICBrZXlzOiBmdW5jdGlvbigpIHsgcmV0dXJuIGFjdGl2ZUtleXM7IH0sXG5cbiAgICAvLyByZXR1cm5zIGFycmF5OiBhbGwgdGhlIGRldGVjdGVkIGlucHV0IHR5cGVzXG4gICAgdHlwZXM6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaW5wdXRUeXBlczsgfSxcblxuICAgIC8vIGFjY2VwdHMgc3RyaW5nOiBtYW51YWxseSBzZXQgdGhlIGlucHV0IHR5cGVcbiAgICBzZXQ6IHNldElucHV0XG4gIH07XG5cbn0pKTtcbiIsIiFmdW5jdGlvbigkKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgRk9VTkRBVElPTl9WRVJTSU9OID0gJzYuMi4wJztcblxuLy8gR2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4vLyBUaGlzIGlzIGF0dGFjaGVkIHRvIHRoZSB3aW5kb3csIG9yIHVzZWQgYXMgYSBtb2R1bGUgZm9yIEFNRC9Ccm93c2VyaWZ5XG52YXIgRm91bmRhdGlvbiA9IHtcbiAgdmVyc2lvbjogRk9VTkRBVElPTl9WRVJTSU9OLFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgaW5pdGlhbGl6ZWQgcGx1Z2lucy5cbiAgICovXG4gIF9wbHVnaW5zOiB7fSxcblxuICAvKipcbiAgICogU3RvcmVzIGdlbmVyYXRlZCB1bmlxdWUgaWRzIGZvciBwbHVnaW4gaW5zdGFuY2VzXG4gICAqL1xuICBfdXVpZHM6IFtdLFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3IgUlRMIHN1cHBvcnRcbiAgICovXG4gIHJ0bDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09PSAncnRsJztcbiAgfSxcbiAgLyoqXG4gICAqIERlZmluZXMgYSBGb3VuZGF0aW9uIHBsdWdpbiwgYWRkaW5nIGl0IHRvIHRoZSBgRm91bmRhdGlvbmAgbmFtZXNwYWNlIGFuZCB0aGUgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUgd2hlbiByZWZsb3dpbmcuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBUaGUgY29uc3RydWN0b3Igb2YgdGhlIHBsdWdpbi5cbiAgICovXG4gIHBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKSB7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBhZGRpbmcgdG8gZ2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4gICAgLy8gRXhhbXBsZXM6IEZvdW5kYXRpb24uUmV2ZWFsLCBGb3VuZGF0aW9uLk9mZkNhbnZhc1xuICAgIHZhciBjbGFzc05hbWUgPSAobmFtZSB8fCBmdW5jdGlvbk5hbWUocGx1Z2luKSk7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBzdG9yaW5nIHRoZSBwbHVnaW4sIGFsc28gdXNlZCB0byBjcmVhdGUgdGhlIGlkZW50aWZ5aW5nIGRhdGEgYXR0cmlidXRlIGZvciB0aGUgcGx1Z2luXG4gICAgLy8gRXhhbXBsZXM6IGRhdGEtcmV2ZWFsLCBkYXRhLW9mZi1jYW52YXNcbiAgICB2YXIgYXR0ck5hbWUgID0gaHlwaGVuYXRlKGNsYXNzTmFtZSk7XG5cbiAgICAvLyBBZGQgdG8gdGhlIEZvdW5kYXRpb24gb2JqZWN0IGFuZCB0aGUgcGx1Z2lucyBsaXN0IChmb3IgcmVmbG93aW5nKVxuICAgIHRoaXMuX3BsdWdpbnNbYXR0ck5hbWVdID0gdGhpc1tjbGFzc05hbWVdID0gcGx1Z2luO1xuICB9LFxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIFBvcHVsYXRlcyB0aGUgX3V1aWRzIGFycmF5IHdpdGggcG9pbnRlcnMgdG8gZWFjaCBpbmRpdmlkdWFsIHBsdWdpbiBpbnN0YW5jZS5cbiAgICogQWRkcyB0aGUgYHpmUGx1Z2luYCBkYXRhLWF0dHJpYnV0ZSB0byBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZWQgcGx1Z2lucyB0byBhbGxvdyB1c2Ugb2YgJChzZWxlY3RvcikuZm91bmRhdGlvbihtZXRob2QpIGNhbGxzLlxuICAgKiBBbHNvIGZpcmVzIHRoZSBpbml0aWFsaXphdGlvbiBldmVudCBmb3IgZWFjaCBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZWRpdGl2ZSBjb2RlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIHBsdWdpbiwgcGFzc2VkIGFzIGEgY2FtZWxDYXNlZCBzdHJpbmcuXG4gICAqIEBmaXJlcyBQbHVnaW4jaW5pdFxuICAgKi9cbiAgcmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSl7XG4gICAgdmFyIHBsdWdpbk5hbWUgPSBuYW1lID8gaHlwaGVuYXRlKG5hbWUpIDogZnVuY3Rpb25OYW1lKHBsdWdpbi5jb25zdHJ1Y3RvcikudG9Mb3dlckNhc2UoKTtcbiAgICBwbHVnaW4udXVpZCA9IHRoaXMuR2V0WW9EaWdpdHMoNiwgcGx1Z2luTmFtZSk7XG5cbiAgICBpZighcGx1Z2luLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApKXsgcGx1Z2luLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWAsIHBsdWdpbi51dWlkKTsgfVxuICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKSl7IHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicsIHBsdWdpbik7IH1cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGluaXRpYWxpemVkLlxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jaW5pdFxuICAgICAgICAgICAqL1xuICAgIHBsdWdpbi4kZWxlbWVudC50cmlnZ2VyKGBpbml0LnpmLiR7cGx1Z2luTmFtZX1gKTtcblxuICAgIHRoaXMuX3V1aWRzLnB1c2gocGx1Z2luLnV1aWQpO1xuXG4gICAgcmV0dXJuO1xuICB9LFxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIFJlbW92ZXMgdGhlIHBsdWdpbnMgdXVpZCBmcm9tIHRoZSBfdXVpZHMgYXJyYXkuXG4gICAqIFJlbW92ZXMgdGhlIHpmUGx1Z2luIGRhdGEgYXR0cmlidXRlLCBhcyB3ZWxsIGFzIHRoZSBkYXRhLXBsdWdpbi1uYW1lIGF0dHJpYnV0ZS5cbiAgICogQWxzbyBmaXJlcyB0aGUgZGVzdHJveWVkIGV2ZW50IGZvciB0aGUgcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGVkaXRpdmUgY29kZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgKiBAZmlyZXMgUGx1Z2luI2Rlc3Ryb3llZFxuICAgKi9cbiAgdW5yZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luKXtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IGh5cGhlbmF0ZShmdW5jdGlvbk5hbWUocGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykuY29uc3RydWN0b3IpKTtcblxuICAgIHRoaXMuX3V1aWRzLnNwbGljZSh0aGlzLl91dWlkcy5pbmRleE9mKHBsdWdpbi51dWlkKSwgMSk7XG4gICAgcGx1Z2luLiRlbGVtZW50LnJlbW92ZUF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApLnJlbW92ZURhdGEoJ3pmUGx1Z2luJylcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jZGVzdHJveWVkXG4gICAgICAgICAgICovXG4gICAgICAgICAgLnRyaWdnZXIoYGRlc3Ryb3llZC56Zi4ke3BsdWdpbk5hbWV9YCk7XG4gICAgZm9yKHZhciBwcm9wIGluIHBsdWdpbil7XG4gICAgICBwbHVnaW5bcHJvcF0gPSBudWxsOy8vY2xlYW4gdXAgc2NyaXB0IHRvIHByZXAgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAgICB9XG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQ2F1c2VzIG9uZSBvciBtb3JlIGFjdGl2ZSBwbHVnaW5zIHRvIHJlLWluaXRpYWxpemUsIHJlc2V0dGluZyBldmVudCBsaXN0ZW5lcnMsIHJlY2FsY3VsYXRpbmcgcG9zaXRpb25zLCBldGMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwbHVnaW5zIC0gb3B0aW9uYWwgc3RyaW5nIG9mIGFuIGluZGl2aWR1YWwgcGx1Z2luIGtleSwgYXR0YWluZWQgYnkgY2FsbGluZyBgJChlbGVtZW50KS5kYXRhKCdwbHVnaW5OYW1lJylgLCBvciBzdHJpbmcgb2YgYSBwbHVnaW4gY2xhc3MgaS5lLiBgJ2Ryb3Bkb3duJ2BcbiAgICogQGRlZmF1bHQgSWYgbm8gYXJndW1lbnQgaXMgcGFzc2VkLCByZWZsb3cgYWxsIGN1cnJlbnRseSBhY3RpdmUgcGx1Z2lucy5cbiAgICovXG4gICByZUluaXQ6IGZ1bmN0aW9uKHBsdWdpbnMpe1xuICAgICB2YXIgaXNKUSA9IHBsdWdpbnMgaW5zdGFuY2VvZiAkO1xuICAgICB0cnl7XG4gICAgICAgaWYoaXNKUSl7XG4gICAgICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgJCh0aGlzKS5kYXRhKCd6ZlBsdWdpbicpLl9pbml0KCk7XG4gICAgICAgICB9KTtcbiAgICAgICB9ZWxzZXtcbiAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHBsdWdpbnMsXG4gICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICBmbnMgPSB7XG4gICAgICAgICAgICdvYmplY3QnOiBmdW5jdGlvbihwbGdzKXtcbiAgICAgICAgICAgICBwbGdzLmZvckVhY2goZnVuY3Rpb24ocCl7XG4gICAgICAgICAgICAgICBwID0gaHlwaGVuYXRlKHApO1xuICAgICAgICAgICAgICAgJCgnW2RhdGEtJysgcCArJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICAnc3RyaW5nJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICBwbHVnaW5zID0gaHlwaGVuYXRlKHBsdWdpbnMpO1xuICAgICAgICAgICAgICQoJ1tkYXRhLScrIHBsdWdpbnMgKyddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgfSxcbiAgICAgICAgICAgJ3VuZGVmaW5lZCc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgdGhpc1snb2JqZWN0J10oT2JqZWN0LmtleXMoX3RoaXMuX3BsdWdpbnMpKTtcbiAgICAgICAgICAgfVxuICAgICAgICAgfTtcbiAgICAgICAgIGZuc1t0eXBlXShwbHVnaW5zKTtcbiAgICAgICB9XG4gICAgIH1jYXRjaChlcnIpe1xuICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgfWZpbmFsbHl7XG4gICAgICAgcmV0dXJuIHBsdWdpbnM7XG4gICAgIH1cbiAgIH0sXG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSByYW5kb20gYmFzZS0zNiB1aWQgd2l0aCBuYW1lc3BhY2luZ1xuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCAtIG51bWJlciBvZiByYW5kb20gYmFzZS0zNiBkaWdpdHMgZGVzaXJlZC4gSW5jcmVhc2UgZm9yIG1vcmUgcmFuZG9tIHN0cmluZ3MuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgLSBuYW1lIG9mIHBsdWdpbiB0byBiZSBpbmNvcnBvcmF0ZWQgaW4gdWlkLCBvcHRpb25hbC5cbiAgICogQGRlZmF1bHQge1N0cmluZ30gJycgLSBpZiBubyBwbHVnaW4gbmFtZSBpcyBwcm92aWRlZCwgbm90aGluZyBpcyBhcHBlbmRlZCB0byB0aGUgdWlkLlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSAtIHVuaXF1ZSBpZFxuICAgKi9cbiAgR2V0WW9EaWdpdHM6IGZ1bmN0aW9uKGxlbmd0aCwgbmFtZXNwYWNlKXtcbiAgICBsZW5ndGggPSBsZW5ndGggfHwgNjtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCgoTWF0aC5wb3coMzYsIGxlbmd0aCArIDEpIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDM2LCBsZW5ndGgpKSkudG9TdHJpbmcoMzYpLnNsaWNlKDEpICsgKG5hbWVzcGFjZSA/IGAtJHtuYW1lc3BhY2V9YCA6ICcnKTtcbiAgfSxcbiAgLyoqXG4gICAqIEluaXRpYWxpemUgcGx1Z2lucyBvbiBhbnkgZWxlbWVudHMgd2l0aGluIGBlbGVtYCAoYW5kIGBlbGVtYCBpdHNlbGYpIHRoYXQgYXJlbid0IGFscmVhZHkgaW5pdGlhbGl6ZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0galF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBlbGVtZW50IHRvIGNoZWNrIGluc2lkZS4gQWxzbyBjaGVja3MgdGhlIGVsZW1lbnQgaXRzZWxmLCB1bmxlc3MgaXQncyB0aGUgYGRvY3VtZW50YCBvYmplY3QuXG4gICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBwbHVnaW5zIC0gQSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZS4gTGVhdmUgdGhpcyBvdXQgdG8gaW5pdGlhbGl6ZSBldmVyeXRoaW5nLlxuICAgKi9cbiAgcmVmbG93OiBmdW5jdGlvbihlbGVtLCBwbHVnaW5zKSB7XG5cbiAgICAvLyBJZiBwbHVnaW5zIGlzIHVuZGVmaW5lZCwganVzdCBncmFiIGV2ZXJ5dGhpbmdcbiAgICBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwbHVnaW5zID0gT2JqZWN0LmtleXModGhpcy5fcGx1Z2lucyk7XG4gICAgfVxuICAgIC8vIElmIHBsdWdpbnMgaXMgYSBzdHJpbmcsIGNvbnZlcnQgaXQgdG8gYW4gYXJyYXkgd2l0aCBvbmUgaXRlbVxuICAgIGVsc2UgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAnc3RyaW5nJykge1xuICAgICAgcGx1Z2lucyA9IFtwbHVnaW5zXTtcbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcGx1Z2luXG4gICAgJC5lYWNoKHBsdWdpbnMsIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwbHVnaW5cbiAgICAgIHZhciBwbHVnaW4gPSBfdGhpcy5fcGx1Z2luc1tuYW1lXTtcblxuICAgICAgLy8gTG9jYWxpemUgdGhlIHNlYXJjaCB0byBhbGwgZWxlbWVudHMgaW5zaWRlIGVsZW0sIGFzIHdlbGwgYXMgZWxlbSBpdHNlbGYsIHVubGVzcyBlbGVtID09PSBkb2N1bWVudFxuICAgICAgdmFyICRlbGVtID0gJChlbGVtKS5maW5kKCdbZGF0YS0nK25hbWUrJ10nKS5hZGRCYWNrKCdbZGF0YS0nK25hbWUrJ10nKTtcblxuICAgICAgLy8gRm9yIGVhY2ggcGx1Z2luIGZvdW5kLCBpbml0aWFsaXplIGl0XG4gICAgICAkZWxlbS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgLy8gRG9uJ3QgZG91YmxlLWRpcCBvbiBwbHVnaW5zXG4gICAgICAgIGlmICgkZWwuZGF0YSgnemZQbHVnaW4nKSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIGluaXRpYWxpemUgXCIrbmFtZStcIiBvbiBhbiBlbGVtZW50IHRoYXQgYWxyZWFkeSBoYXMgYSBGb3VuZGF0aW9uIHBsdWdpbi5cIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpKXtcbiAgICAgICAgICB2YXIgdGhpbmcgPSAkZWwuYXR0cignZGF0YS1vcHRpb25zJykuc3BsaXQoJzsnKS5mb3JFYWNoKGZ1bmN0aW9uKGUsIGkpe1xuICAgICAgICAgICAgdmFyIG9wdCA9IGUuc3BsaXQoJzonKS5tYXAoZnVuY3Rpb24oZWwpeyByZXR1cm4gZWwudHJpbSgpOyB9KTtcbiAgICAgICAgICAgIGlmKG9wdFswXSkgb3B0c1tvcHRbMF1dID0gcGFyc2VWYWx1ZShvcHRbMV0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAkZWwuZGF0YSgnemZQbHVnaW4nLCBuZXcgcGx1Z2luKCQodGhpcyksIG9wdHMpKTtcbiAgICAgICAgfWNhdGNoKGVyKXtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVyKTtcbiAgICAgICAgfWZpbmFsbHl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcbiAgZ2V0Rm5OYW1lOiBmdW5jdGlvbk5hbWUsXG4gIHRyYW5zaXRpb25lbmQ6IGZ1bmN0aW9uKCRlbGVtKXtcbiAgICB2YXIgdHJhbnNpdGlvbnMgPSB7XG4gICAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgJ01velRyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAnT1RyYW5zaXRpb24nOiAnb3RyYW5zaXRpb25lbmQnXG4gICAgfTtcbiAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICBlbmQ7XG5cbiAgICBmb3IgKHZhciB0IGluIHRyYW5zaXRpb25zKXtcbiAgICAgIGlmICh0eXBlb2YgZWxlbS5zdHlsZVt0XSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBlbmQgPSB0cmFuc2l0aW9uc1t0XTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoZW5kKXtcbiAgICAgIHJldHVybiBlbmQ7XG4gICAgfWVsc2V7XG4gICAgICBlbmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICRlbGVtLnRyaWdnZXJIYW5kbGVyKCd0cmFuc2l0aW9uZW5kJywgWyRlbGVtXSk7XG4gICAgICB9LCAxKTtcbiAgICAgIHJldHVybiAndHJhbnNpdGlvbmVuZCc7XG4gICAgfVxuICB9XG59O1xuXG5Gb3VuZGF0aW9uLnV0aWwgPSB7XG4gIC8qKlxuICAgKiBGdW5jdGlvbiBmb3IgYXBwbHlpbmcgYSBkZWJvdW5jZSBlZmZlY3QgdG8gYSBmdW5jdGlvbiBjYWxsLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyAtIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhdCBlbmQgb2YgdGltZW91dC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IC0gVGltZSBpbiBtcyB0byBkZWxheSB0aGUgY2FsbCBvZiBgZnVuY2AuXG4gICAqIEByZXR1cm5zIGZ1bmN0aW9uXG4gICAqL1xuICB0aHJvdHRsZTogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5KSB7XG4gICAgdmFyIHRpbWVyID0gbnVsbDtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgIGlmICh0aW1lciA9PT0gbnVsbCkge1xuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxuLy8gVE9ETzogY29uc2lkZXIgbm90IG1ha2luZyB0aGlzIGEgalF1ZXJ5IGZ1bmN0aW9uXG4vLyBUT0RPOiBuZWVkIHdheSB0byByZWZsb3cgdnMuIHJlLWluaXRpYWxpemVcbi8qKlxuICogVGhlIEZvdW5kYXRpb24galF1ZXJ5IG1ldGhvZC5cbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBtZXRob2QgLSBBbiBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0aGUgY3VycmVudCBqUXVlcnkgb2JqZWN0LlxuICovXG52YXIgZm91bmRhdGlvbiA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiBtZXRob2QsXG4gICAgICAkbWV0YSA9ICQoJ21ldGEuZm91bmRhdGlvbi1tcScpLFxuICAgICAgJG5vSlMgPSAkKCcubm8tanMnKTtcblxuICBpZighJG1ldGEubGVuZ3RoKXtcbiAgICAkKCc8bWV0YSBjbGFzcz1cImZvdW5kYXRpb24tbXFcIj4nKS5hcHBlbmRUbyhkb2N1bWVudC5oZWFkKTtcbiAgfVxuICBpZigkbm9KUy5sZW5ndGgpe1xuICAgICRub0pTLnJlbW92ZUNsYXNzKCduby1qcycpO1xuICB9XG5cbiAgaWYodHlwZSA9PT0gJ3VuZGVmaW5lZCcpey8vbmVlZHMgdG8gaW5pdGlhbGl6ZSB0aGUgRm91bmRhdGlvbiBvYmplY3QsIG9yIGFuIGluZGl2aWR1YWwgcGx1Z2luLlxuICAgIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5faW5pdCgpO1xuICAgIEZvdW5kYXRpb24ucmVmbG93KHRoaXMpO1xuICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7Ly9hbiBpbmRpdmlkdWFsIG1ldGhvZCB0byBpbnZva2Ugb24gYSBwbHVnaW4gb3IgZ3JvdXAgb2YgcGx1Z2luc1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTsvL2NvbGxlY3QgYWxsIHRoZSBhcmd1bWVudHMsIGlmIG5lY2Vzc2FyeVxuICAgIHZhciBwbHVnQ2xhc3MgPSB0aGlzLmRhdGEoJ3pmUGx1Z2luJyk7Ly9kZXRlcm1pbmUgdGhlIGNsYXNzIG9mIHBsdWdpblxuXG4gICAgaWYocGx1Z0NsYXNzICE9PSB1bmRlZmluZWQgJiYgcGx1Z0NsYXNzW21ldGhvZF0gIT09IHVuZGVmaW5lZCl7Ly9tYWtlIHN1cmUgYm90aCB0aGUgY2xhc3MgYW5kIG1ldGhvZCBleGlzdFxuICAgICAgaWYodGhpcy5sZW5ndGggPT09IDEpey8vaWYgdGhlcmUncyBvbmx5IG9uZSwgY2FsbCBpdCBkaXJlY3RseS5cbiAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseShwbHVnQ2xhc3MsIGFyZ3MpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLCBlbCl7Ly9vdGhlcndpc2UgbG9vcCB0aHJvdWdoIHRoZSBqUXVlcnkgY29sbGVjdGlvbiBhbmQgaW52b2tlIHRoZSBtZXRob2Qgb24gZWFjaFxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KCQoZWwpLmRhdGEoJ3pmUGx1Z2luJyksIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9ZWxzZXsvL2Vycm9yIGZvciBubyBjbGFzcyBvciBubyBtZXRob2RcbiAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIldlJ3JlIHNvcnJ5LCAnXCIgKyBtZXRob2QgKyBcIicgaXMgbm90IGFuIGF2YWlsYWJsZSBtZXRob2QgZm9yIFwiICsgKHBsdWdDbGFzcyA/IGZ1bmN0aW9uTmFtZShwbHVnQ2xhc3MpIDogJ3RoaXMgZWxlbWVudCcpICsgJy4nKTtcbiAgICB9XG4gIH1lbHNley8vZXJyb3IgZm9yIGludmFsaWQgYXJndW1lbnQgdHlwZVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFdlJ3JlIHNvcnJ5LCAke3R5cGV9IGlzIG5vdCBhIHZhbGlkIHBhcmFtZXRlci4gWW91IG11c3QgdXNlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWV0aG9kIHlvdSB3aXNoIHRvIGludm9rZS5gKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbndpbmRvdy5Gb3VuZGF0aW9uID0gRm91bmRhdGlvbjtcbiQuZm4uZm91bmRhdGlvbiA9IGZvdW5kYXRpb247XG5cbi8vIFBvbHlmaWxsIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbihmdW5jdGlvbigpIHtcbiAgaWYgKCFEYXRlLm5vdyB8fCAhd2luZG93LkRhdGUubm93KVxuICAgIHdpbmRvdy5EYXRlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcblxuICB2YXIgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcbiAgICAgIHZhciB2cCA9IHZlbmRvcnNbaV07XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZwKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9ICh3aW5kb3dbdnArJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IHdpbmRvd1t2cCsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ10pO1xuICB9XG4gIGlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgfHwgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSkge1xuICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICB2YXIgbmV4dFRpbWUgPSBNYXRoLm1heChsYXN0VGltZSArIDE2LCBub3cpO1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUaW1lIC0gbm93KTtcbiAgICB9O1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGNsZWFyVGltZW91dDtcbiAgfVxuICAvKipcbiAgICogUG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdywgcmVxdWlyZWQgYnkgckFGXG4gICAqL1xuICBpZighd2luZG93LnBlcmZvcm1hbmNlIHx8ICF3aW5kb3cucGVyZm9ybWFuY2Uubm93KXtcbiAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7XG4gICAgICBzdGFydDogRGF0ZS5ub3coKSxcbiAgICAgIG5vdzogZnVuY3Rpb24oKXsgcmV0dXJuIERhdGUubm93KCkgLSB0aGlzLnN0YXJ0OyB9XG4gICAgfTtcbiAgfVxufSkoKTtcbmlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihvVGhpcykge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gY2xvc2VzdCB0aGluZyBwb3NzaWJsZSB0byB0aGUgRUNNQVNjcmlwdCA1XG4gICAgICAvLyBpbnRlcm5hbCBJc0NhbGxhYmxlIGZ1bmN0aW9uXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgIH1cblxuICAgIHZhciBhQXJncyAgID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgZlRvQmluZCA9IHRoaXMsXG4gICAgICAgIGZOT1AgICAgPSBmdW5jdGlvbigpIHt9LFxuICAgICAgICBmQm91bmQgID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1BcbiAgICAgICAgICAgICAgICAgPyB0aGlzXG4gICAgICAgICAgICAgICAgIDogb1RoaXMsXG4gICAgICAgICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgIH07XG5cbiAgICBpZiAodGhpcy5wcm90b3R5cGUpIHtcbiAgICAgIC8vIG5hdGl2ZSBmdW5jdGlvbnMgZG9uJ3QgaGF2ZSBhIHByb3RvdHlwZVxuICAgICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICB9XG4gICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG5cbiAgICByZXR1cm4gZkJvdW5kO1xuICB9O1xufVxuLy8gUG9seWZpbGwgdG8gZ2V0IHRoZSBuYW1lIG9mIGEgZnVuY3Rpb24gaW4gSUU5XG5mdW5jdGlvbiBmdW5jdGlvbk5hbWUoZm4pIHtcbiAgaWYgKEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccyhbXihdezEsfSlcXCgvO1xuICAgIHZhciByZXN1bHRzID0gKGZ1bmNOYW1lUmVnZXgpLmV4ZWMoKGZuKS50b1N0cmluZygpKTtcbiAgICByZXR1cm4gKHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAxKSA/IHJlc3VsdHNbMV0udHJpbSgpIDogXCJcIjtcbiAgfVxuICBlbHNlIGlmIChmbi5wcm90b3R5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmbi5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBmbi5wcm90b3R5cGUuY29uc3RydWN0b3IubmFtZTtcbiAgfVxufVxuZnVuY3Rpb24gcGFyc2VWYWx1ZShzdHIpe1xuICBpZigvdHJ1ZS8udGVzdChzdHIpKSByZXR1cm4gdHJ1ZTtcbiAgZWxzZSBpZigvZmFsc2UvLnRlc3Qoc3RyKSkgcmV0dXJuIGZhbHNlO1xuICBlbHNlIGlmKCFpc05hTihzdHIgKiAxKSkgcmV0dXJuIHBhcnNlRmxvYXQoc3RyKTtcbiAgcmV0dXJuIHN0cjtcbn1cbi8vIENvbnZlcnQgUGFzY2FsQ2FzZSB0byBrZWJhYi1jYXNlXG4vLyBUaGFuayB5b3U6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzg5NTU1ODBcbmZ1bmN0aW9uIGh5cGhlbmF0ZShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xufVxuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbkZvdW5kYXRpb24uQm94ID0ge1xuICBJbU5vdFRvdWNoaW5nWW91OiBJbU5vdFRvdWNoaW5nWW91LFxuICBHZXREaW1lbnNpb25zOiBHZXREaW1lbnNpb25zLFxuICBHZXRPZmZzZXRzOiBHZXRPZmZzZXRzXG59XG5cbi8qKlxuICogQ29tcGFyZXMgdGhlIGRpbWVuc2lvbnMgb2YgYW4gZWxlbWVudCB0byBhIGNvbnRhaW5lciBhbmQgZGV0ZXJtaW5lcyBjb2xsaXNpb24gZXZlbnRzIHdpdGggY29udGFpbmVyLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gdGVzdCBmb3IgY29sbGlzaW9ucy5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBwYXJlbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBhcyBib3VuZGluZyBjb250YWluZXIuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGxyT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIGxlZnQgYW5kIHJpZ2h0IHZhbHVlcyBvbmx5LlxuICogQHBhcmFtIHtCb29sZWFufSB0Yk9ubHkgLSBzZXQgdG8gdHJ1ZSB0byBjaGVjayB0b3AgYW5kIGJvdHRvbSB2YWx1ZXMgb25seS5cbiAqIEBkZWZhdWx0IGlmIG5vIHBhcmVudCBvYmplY3QgcGFzc2VkLCBkZXRlY3RzIGNvbGxpc2lvbnMgd2l0aCBgd2luZG93YC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSAtIHRydWUgaWYgY29sbGlzaW9uIGZyZWUsIGZhbHNlIGlmIGEgY29sbGlzaW9uIGluIGFueSBkaXJlY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIEltTm90VG91Y2hpbmdZb3UoZWxlbWVudCwgcGFyZW50LCBsck9ubHksIHRiT25seSkge1xuICB2YXIgZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICB0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHQ7XG5cbiAgaWYgKHBhcmVudCkge1xuICAgIHZhciBwYXJEaW1zID0gR2V0RGltZW5zaW9ucyhwYXJlbnQpO1xuXG4gICAgYm90dG9tID0gKGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IHBhckRpbXMuaGVpZ2h0ICsgcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IHBhckRpbXMub2Zmc2V0LnRvcCk7XG4gICAgbGVmdCAgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgPj0gcGFyRGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IHBhckRpbXMud2lkdGgpO1xuICB9XG4gIGVsc2Uge1xuICAgIGJvdHRvbSA9IChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0ICsgZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IGVsZURpbXMud2luZG93RGltcy53aWR0aCk7XG4gIH1cblxuICB2YXIgYWxsRGlycyA9IFtib3R0b20sIHRvcCwgbGVmdCwgcmlnaHRdO1xuXG4gIGlmIChsck9ubHkpIHtcbiAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQgPT09IHRydWU7XG4gIH1cblxuICBpZiAodGJPbmx5KSB7XG4gICAgcmV0dXJuIHRvcCA9PT0gYm90dG9tID09PSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGFsbERpcnMuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xufTtcblxuLyoqXG4gKiBVc2VzIG5hdGl2ZSBtZXRob2RzIHRvIHJldHVybiBhbiBvYmplY3Qgb2YgZGltZW5zaW9uIHZhbHVlcy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnkgfHwgSFRNTH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3Qgb3IgRE9NIGVsZW1lbnQgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGltZW5zaW9ucy4gQ2FuIGJlIGFueSBlbGVtZW50IG90aGVyIHRoYXQgZG9jdW1lbnQgb3Igd2luZG93LlxuICogQHJldHVybnMge09iamVjdH0gLSBuZXN0ZWQgb2JqZWN0IG9mIGludGVnZXIgcGl4ZWwgdmFsdWVzXG4gKiBUT0RPIC0gaWYgZWxlbWVudCBpcyB3aW5kb3csIHJldHVybiBvbmx5IHRob3NlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gR2V0RGltZW5zaW9ucyhlbGVtLCB0ZXN0KXtcbiAgZWxlbSA9IGVsZW0ubGVuZ3RoID8gZWxlbVswXSA6IGVsZW07XG5cbiAgaWYgKGVsZW0gPT09IHdpbmRvdyB8fCBlbGVtID09PSBkb2N1bWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO1xuICB9XG5cbiAgdmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgcGFyUmVjdCA9IGVsZW0ucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblJlY3QgPSBkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgd2luWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgICAgIHdpblggPSB3aW5kb3cucGFnZVhPZmZzZXQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxuICAgIG9mZnNldDoge1xuICAgICAgdG9wOiByZWN0LnRvcCArIHdpblksXG4gICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW5YXG4gICAgfSxcbiAgICBwYXJlbnREaW1zOiB7XG4gICAgICB3aWR0aDogcGFyUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogcGFyUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiBwYXJSZWN0LnRvcCArIHdpblksXG4gICAgICAgIGxlZnQ6IHBhclJlY3QubGVmdCArIHdpblhcbiAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd0RpbXM6IHtcbiAgICAgIHdpZHRoOiB3aW5SZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiB3aW5SZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHdpblksXG4gICAgICAgIGxlZnQ6IHdpblhcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCBvZiB0b3AgYW5kIGxlZnQgaW50ZWdlciBwaXhlbCB2YWx1ZXMgZm9yIGR5bmFtaWNhbGx5IHJlbmRlcmVkIGVsZW1lbnRzLFxuICogc3VjaCBhczogVG9vbHRpcCwgUmV2ZWFsLCBhbmQgRHJvcGRvd25cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCBiZWluZyBwb3NpdGlvbmVkLlxuICogQHBhcmFtIHtqUXVlcnl9IGFuY2hvciAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50J3MgYW5jaG9yIHBvaW50LlxuICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gYSBzdHJpbmcgcmVsYXRpbmcgdG8gdGhlIGRlc2lyZWQgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIHJlbGF0aXZlIHRvIGl0J3MgYW5jaG9yXG4gKiBAcGFyYW0ge051bWJlcn0gdk9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCB2ZXJ0aWNhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IGhPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgaG9yaXpvbnRhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtCb29sZWFufSBpc092ZXJmbG93IC0gaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQsIHNldHMgdG8gdHJ1ZSB0byBkZWZhdWx0IHRoZSBlbGVtZW50IHRvIGZ1bGwgd2lkdGggLSBhbnkgZGVzaXJlZCBvZmZzZXQuXG4gKiBUT0RPIGFsdGVyL3Jld3JpdGUgdG8gd29yayB3aXRoIGBlbWAgdmFsdWVzIGFzIHdlbGwvaW5zdGVhZCBvZiBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gR2V0T2Zmc2V0cyhlbGVtZW50LCBhbmNob3IsIHBvc2l0aW9uLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KSB7XG4gIHZhciAkZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICAkYW5jaG9yRGltcyA9IGFuY2hvciA/IEdldERpbWVuc2lvbnMoYW5jaG9yKSA6IG51bGw7XG5cbiAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgIGNhc2UgJ3RvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIHRvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IGlzT3ZlcmZsb3cgPyBoT2Zmc2V0IDogKCgkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICgkYW5jaG9yRGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGxlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAoJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICgkYW5jaG9yRGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciByaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCArIDEsXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXInOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQgKyAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpLFxuICAgICAgICB0b3A6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyAoJGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JldmVhbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAtICRlbGVEaW1zLndpZHRoKSAvIDIsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgdk9mZnNldFxuICAgICAgfVxuICAgIGNhc2UgJ3JldmVhbCBmdWxsJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgfVxufVxuXG59KGpRdWVyeSk7XG4iLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqIFRoaXMgdXRpbCB3YXMgY3JlYXRlZCBieSBNYXJpdXMgT2xiZXJ0eiAqXG4gKiBQbGVhc2UgdGhhbmsgTWFyaXVzIG9uIEdpdEh1YiAvb3dsYmVydHogKlxuICogb3IgdGhlIHdlYiBodHRwOi8vd3d3Lm1hcml1c29sYmVydHouZGUvICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4ndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IGtleUNvZGVzID0ge1xuICA5OiAnVEFCJyxcbiAgMTM6ICdFTlRFUicsXG4gIDI3OiAnRVNDQVBFJyxcbiAgMzI6ICdTUEFDRScsXG4gIDM3OiAnQVJST1dfTEVGVCcsXG4gIDM4OiAnQVJST1dfVVAnLFxuICAzOTogJ0FSUk9XX1JJR0hUJyxcbiAgNDA6ICdBUlJPV19ET1dOJ1xufVxuXG52YXIgY29tbWFuZHMgPSB7fVxuXG52YXIgS2V5Ym9hcmQgPSB7XG4gIGtleXM6IGdldEtleUNvZGVzKGtleUNvZGVzKSxcblxuICAvKipcbiAgICogUGFyc2VzIHRoZSAoa2V5Ym9hcmQpIGV2ZW50IGFuZCByZXR1cm5zIGEgU3RyaW5nIHRoYXQgcmVwcmVzZW50cyBpdHMga2V5XG4gICAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHJldHVybiBTdHJpbmcga2V5IC0gU3RyaW5nIHRoYXQgcmVwcmVzZW50cyB0aGUga2V5IHByZXNzZWRcbiAgICovXG4gIHBhcnNlS2V5KGV2ZW50KSB7XG4gICAgdmFyIGtleSA9IGtleUNvZGVzW2V2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGVdIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQud2hpY2gpLnRvVXBwZXJDYXNlKCk7XG4gICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSBrZXkgPSBgU0hJRlRfJHtrZXl9YDtcbiAgICBpZiAoZXZlbnQuY3RybEtleSkga2V5ID0gYENUUkxfJHtrZXl9YDtcbiAgICBpZiAoZXZlbnQuYWx0S2V5KSBrZXkgPSBgQUxUXyR7a2V5fWA7XG4gICAgcmV0dXJuIGtleTtcbiAgfSxcblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgZ2l2ZW4gKGtleWJvYXJkKSBldmVudFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50J3MgbmFtZSwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEBwYXJhbSB7T2JqZWN0c30gZnVuY3Rpb25zIC0gY29sbGVjdGlvbiBvZiBmdW5jdGlvbnMgdGhhdCBhcmUgdG8gYmUgZXhlY3V0ZWRcbiAgICovXG4gIGhhbmRsZUtleShldmVudCwgY29tcG9uZW50LCBmdW5jdGlvbnMpIHtcbiAgICB2YXIgY29tbWFuZExpc3QgPSBjb21tYW5kc1tjb21wb25lbnRdLFxuICAgICAga2V5Q29kZSA9IHRoaXMucGFyc2VLZXkoZXZlbnQpLFxuICAgICAgY21kcyxcbiAgICAgIGNvbW1hbmQsXG4gICAgICBmbjtcblxuICAgIGlmICghY29tbWFuZExpc3QpIHJldHVybiBjb25zb2xlLndhcm4oJ0NvbXBvbmVudCBub3QgZGVmaW5lZCEnKTtcblxuICAgIGlmICh0eXBlb2YgY29tbWFuZExpc3QubHRyID09PSAndW5kZWZpbmVkJykgeyAvLyB0aGlzIGNvbXBvbmVudCBkb2VzIG5vdCBkaWZmZXJlbnRpYXRlIGJldHdlZW4gbHRyIGFuZCBydGxcbiAgICAgICAgY21kcyA9IGNvbW1hbmRMaXN0OyAvLyB1c2UgcGxhaW4gbGlzdFxuICAgIH0gZWxzZSB7IC8vIG1lcmdlIGx0ciBhbmQgcnRsOiBpZiBkb2N1bWVudCBpcyBydGwsIHJ0bCBvdmVyd3JpdGVzIGx0ciBhbmQgdmljZSB2ZXJzYVxuICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5sdHIsIGNvbW1hbmRMaXN0LnJ0bCk7XG5cbiAgICAgICAgZWxzZSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0LnJ0bCwgY29tbWFuZExpc3QubHRyKTtcbiAgICB9XG4gICAgY29tbWFuZCA9IGNtZHNba2V5Q29kZV07XG5cbiAgICBmbiA9IGZ1bmN0aW9uc1tjb21tYW5kXTtcbiAgICBpZiAoZm4gJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gIGlmIGV4aXN0c1xuICAgICAgZm4uYXBwbHkoKTtcbiAgICAgIGlmIChmdW5jdGlvbnMuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLmhhbmRsZWQuYXBwbHkoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGZ1bmN0aW9ucy51bmhhbmRsZWQgfHwgdHlwZW9mIGZ1bmN0aW9ucy51bmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBub3QgaGFuZGxlZFxuICAgICAgICAgIGZ1bmN0aW9ucy51bmhhbmRsZWQuYXBwbHkoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZpbmRzIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIHRoZSBnaXZlbiBgJGVsZW1lbnRgXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gc2VhcmNoIHdpdGhpblxuICAgKiBAcmV0dXJuIHtqUXVlcnl9ICRmb2N1c2FibGUgLSBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiBgJGVsZW1lbnRgXG4gICAqL1xuICBmaW5kRm9jdXNhYmxlKCRlbGVtZW50KSB7XG4gICAgcmV0dXJuICRlbGVtZW50LmZpbmQoJ2FbaHJlZl0sIGFyZWFbaHJlZl0sIGlucHV0Om5vdChbZGlzYWJsZWRdKSwgc2VsZWN0Om5vdChbZGlzYWJsZWRdKSwgdGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pLCBidXR0b246bm90KFtkaXNhYmxlZF0pLCBpZnJhbWUsIG9iamVjdCwgZW1iZWQsICpbdGFiaW5kZXhdLCAqW2NvbnRlbnRlZGl0YWJsZV0nKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISQodGhpcykuaXMoJzp2aXNpYmxlJykgfHwgJCh0aGlzKS5hdHRyKCd0YWJpbmRleCcpIDwgMCkgeyByZXR1cm4gZmFsc2U7IH0gLy9vbmx5IGhhdmUgdmlzaWJsZSBlbGVtZW50cyBhbmQgdGhvc2UgdGhhdCBoYXZlIGEgdGFiaW5kZXggZ3JlYXRlciBvciBlcXVhbCAwXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY29tcG9uZW50IG5hbWUgbmFtZVxuICAgKiBAcGFyYW0ge09iamVjdH0gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgKiBAcmV0dXJuIFN0cmluZyBjb21wb25lbnROYW1lXG4gICAqL1xuXG4gIHJlZ2lzdGVyKGNvbXBvbmVudE5hbWUsIGNtZHMpIHtcbiAgICBjb21tYW5kc1tjb21wb25lbnROYW1lXSA9IGNtZHM7XG4gIH1cbn1cblxuLypcbiAqIENvbnN0YW50cyBmb3IgZWFzaWVyIGNvbXBhcmluZy5cbiAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICovXG5mdW5jdGlvbiBnZXRLZXlDb2RlcyhrY3MpIHtcbiAgdmFyIGsgPSB7fTtcbiAgZm9yICh2YXIga2MgaW4ga2NzKSBrW2tjc1trY11dID0ga2NzW2tjXTtcbiAgcmV0dXJuIGs7XG59XG5cbkZvdW5kYXRpb24uS2V5Ym9hcmQgPSBLZXlib2FyZDtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vLyBEZWZhdWx0IHNldCBvZiBtZWRpYSBxdWVyaWVzXG5jb25zdCBkZWZhdWx0UXVlcmllcyA9IHtcbiAgJ2RlZmF1bHQnIDogJ29ubHkgc2NyZWVuJyxcbiAgbGFuZHNjYXBlIDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSknLFxuICBwb3J0cmFpdCA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICByZXRpbmEgOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi0tbW96LWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMTkyZHBpKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xufTtcblxudmFyIE1lZGlhUXVlcnkgPSB7XG4gIHF1ZXJpZXM6IFtdLFxuXG4gIGN1cnJlbnQ6ICcnLFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbWVkaWEgcXVlcnkgaGVscGVyLCBieSBleHRyYWN0aW5nIHRoZSBicmVha3BvaW50IGxpc3QgZnJvbSB0aGUgQ1NTIGFuZCBhY3RpdmF0aW5nIHRoZSBicmVha3BvaW50IHdhdGNoZXIuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBleHRyYWN0ZWRTdHlsZXMgPSAkKCcuZm91bmRhdGlvbi1tcScpLmNzcygnZm9udC1mYW1pbHknKTtcbiAgICB2YXIgbmFtZWRRdWVyaWVzO1xuXG4gICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbmFtZWRRdWVyaWVzKSB7XG4gICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgdmFsdWU6IGBvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogJHtuYW1lZFF1ZXJpZXNba2V5XX0pYFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50ID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKTtcblxuICAgIHRoaXMuX3dhdGNoZXIoKTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCdzIHNtYWxsZXIuXG4gICAqL1xuICBhdExlYXN0KHNpemUpIHtcbiAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KS5tYXRjaGVzO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgbWVkaWEgcXVlcnkgb2YgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGdldC5cbiAgICogQHJldHVybnMge1N0cmluZ3xudWxsfSAtIFRoZSBtZWRpYSBxdWVyeSBvZiB0aGUgYnJlYWtwb2ludCwgb3IgYG51bGxgIGlmIHRoZSBicmVha3BvaW50IGRvZXNuJ3QgZXhpc3QuXG4gICAqL1xuICBnZXQoc2l6ZSkge1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5xdWVyaWVzKSB7XG4gICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAoc2l6ZSA9PT0gcXVlcnkubmFtZSkgcmV0dXJuIHF1ZXJ5LnZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgbmFtZSBieSB0ZXN0aW5nIGV2ZXJ5IGJyZWFrcG9pbnQgYW5kIHJldHVybmluZyB0aGUgbGFzdCBvbmUgdG8gbWF0Y2ggKHRoZSBiaWdnZXN0IG9uZSkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBOYW1lIG9mIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQuXG4gICAqL1xuICBfZ2V0Q3VycmVudFNpemUoKSB7XG4gICAgdmFyIG1hdGNoZWQ7XG5cbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuXG4gICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEocXVlcnkudmFsdWUpLm1hdGNoZXMpIHtcbiAgICAgICAgbWF0Y2hlZCA9IHF1ZXJ5O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbWF0Y2hlZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBtYXRjaGVkLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtYXRjaGVkO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQWN0aXZhdGVzIHRoZSBicmVha3BvaW50IHdhdGNoZXIsIHdoaWNoIGZpcmVzIGFuIGV2ZW50IG9uIHRoZSB3aW5kb3cgd2hlbmV2ZXIgdGhlIGJyZWFrcG9pbnQgY2hhbmdlcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfd2F0Y2hlcigpIHtcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5tZWRpYXF1ZXJ5JywgKCkgPT4ge1xuICAgICAgdmFyIG5ld1NpemUgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgICBpZiAobmV3U2l6ZSAhPT0gdGhpcy5jdXJyZW50KSB7XG4gICAgICAgIC8vIEJyb2FkY2FzdCB0aGUgbWVkaWEgcXVlcnkgY2hhbmdlIG9uIHRoZSB3aW5kb3dcbiAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIFtuZXdTaXplLCB0aGlzLmN1cnJlbnRdKTtcblxuICAgICAgICAvLyBDaGFuZ2UgdGhlIGN1cnJlbnQgbWVkaWEgcXVlcnlcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV3U2l6ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxuLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxuLy8gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2VcbndpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcbiAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gIGlmICghc3R5bGVNZWRpYSkge1xuICAgIHZhciBzdHlsZSAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICBzY3JpcHQgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICBpbmZvICAgICAgICA9IG51bGw7XG5cbiAgICBzdHlsZS50eXBlICA9ICd0ZXh0L2Nzcyc7XG4gICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgc2NyaXB0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBzY3JpcHQpO1xuXG4gICAgLy8gJ3N0eWxlLmN1cnJlbnRTdHlsZScgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnd2luZG93LmdldENvbXB1dGVkU3R5bGUnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICBpbmZvID0gKCdnZXRDb21wdXRlZFN0eWxlJyBpbiB3aW5kb3cpICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgbWF0Y2hNZWRpdW0obWVkaWEpIHtcbiAgICAgICAgdmFyIHRleHQgPSBgQG1lZGlhICR7bWVkaWF9eyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH1gO1xuXG4gICAgICAgIC8vICdzdHlsZS5zdHlsZVNoZWV0JyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICdzdHlsZS50ZXh0Q29udGVudCcgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGVzdCBpZiBtZWRpYSBxdWVyeSBpcyB0cnVlIG9yIGZhbHNlXG4gICAgICAgIHJldHVybiBpbmZvLndpZHRoID09PSAnMXB4JztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24obWVkaWEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hlczogc3R5bGVNZWRpYS5tYXRjaE1lZGl1bShtZWRpYSB8fCAnYWxsJyksXG4gICAgICBtZWRpYTogbWVkaWEgfHwgJ2FsbCdcbiAgICB9O1xuICB9XG59KCkpO1xuXG4vLyBUaGFuayB5b3U6IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvcXVlcnktc3RyaW5nXG5mdW5jdGlvbiBwYXJzZVN0eWxlVG9PYmplY3Qoc3RyKSB7XG4gIHZhciBzdHlsZU9iamVjdCA9IHt9O1xuXG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0ciA9IHN0ci50cmltKCkuc2xpY2UoMSwgLTEpOyAvLyBicm93c2VycyByZS1xdW90ZSBzdHJpbmcgc3R5bGUgdmFsdWVzXG5cbiAgaWYgKCFzdHIpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHlsZU9iamVjdCA9IHN0ci5zcGxpdCgnJicpLnJlZHVjZShmdW5jdGlvbihyZXQsIHBhcmFtKSB7XG4gICAgdmFyIHBhcnRzID0gcGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykuc3BsaXQoJz0nKTtcbiAgICB2YXIga2V5ID0gcGFydHNbMF07XG4gICAgdmFyIHZhbCA9IHBhcnRzWzFdO1xuICAgIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChrZXkpO1xuXG4gICAgLy8gbWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcbiAgICAvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG4gICAgdmFsID0gdmFsID09PSB1bmRlZmluZWQgPyBudWxsIDogZGVjb2RlVVJJQ29tcG9uZW50KHZhbCk7XG5cbiAgICBpZiAoIXJldC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXRba2V5XSA9IHZhbDtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmV0W2tleV0pKSB7XG4gICAgICByZXRba2V5XS5wdXNoKHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldFtrZXldID0gW3JldFtrZXldLCB2YWxdO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9LCB7fSk7XG5cbiAgcmV0dXJuIHN0eWxlT2JqZWN0O1xufVxuXG5Gb3VuZGF0aW9uLk1lZGlhUXVlcnkgPSBNZWRpYVF1ZXJ5O1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogTW90aW9uIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5tb3Rpb25cbiAqL1xuXG5jb25zdCBpbml0Q2xhc3NlcyAgID0gWydtdWktZW50ZXInLCAnbXVpLWxlYXZlJ107XG5jb25zdCBhY3RpdmVDbGFzc2VzID0gWydtdWktZW50ZXItYWN0aXZlJywgJ211aS1sZWF2ZS1hY3RpdmUnXTtcblxuY29uc3QgTW90aW9uID0ge1xuICBhbmltYXRlSW46IGZ1bmN0aW9uKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICBhbmltYXRlKHRydWUsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICB9LFxuXG4gIGFuaW1hdGVPdXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICBhbmltYXRlKGZhbHNlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNb3ZlKGR1cmF0aW9uLCBlbGVtLCBmbil7XG4gIHZhciBhbmltLCBwcm9nLCBzdGFydCA9IG51bGw7XG4gIC8vIGNvbnNvbGUubG9nKCdjYWxsZWQnKTtcblxuICBmdW5jdGlvbiBtb3ZlKHRzKXtcbiAgICBpZighc3RhcnQpIHN0YXJ0ID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0LCB0cyk7XG4gICAgcHJvZyA9IHRzIC0gc3RhcnQ7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG5cbiAgICBpZihwcm9nIDwgZHVyYXRpb24peyBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlLCBlbGVtKTsgfVxuICAgIGVsc2V7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbSk7XG4gICAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICB9XG4gIH1cbiAgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSk7XG59XG5cbi8qKlxuICogQW5pbWF0ZXMgYW4gZWxlbWVudCBpbiBvciBvdXQgdXNpbmcgYSBDU1MgdHJhbnNpdGlvbiBjbGFzcy5cbiAqIEBmdW5jdGlvblxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNJbiAtIERlZmluZXMgaWYgdGhlIGFuaW1hdGlvbiBpcyBpbiBvciBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvciBIVE1MIG9iamVjdCB0byBhbmltYXRlLlxuICogQHBhcmFtIHtTdHJpbmd9IGFuaW1hdGlvbiAtIENTUyBjbGFzcyB0byB1c2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIENhbGxiYWNrIHRvIHJ1biB3aGVuIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cbiAqL1xuZnVuY3Rpb24gYW5pbWF0ZShpc0luLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gIGVsZW1lbnQgPSAkKGVsZW1lbnQpLmVxKDApO1xuXG4gIGlmICghZWxlbWVudC5sZW5ndGgpIHJldHVybjtcblxuICB2YXIgaW5pdENsYXNzID0gaXNJbiA/IGluaXRDbGFzc2VzWzBdIDogaW5pdENsYXNzZXNbMV07XG4gIHZhciBhY3RpdmVDbGFzcyA9IGlzSW4gPyBhY3RpdmVDbGFzc2VzWzBdIDogYWN0aXZlQ2xhc3Nlc1sxXTtcblxuICAvLyBTZXQgdXAgdGhlIGFuaW1hdGlvblxuICByZXNldCgpO1xuXG4gIGVsZW1lbnRcbiAgICAuYWRkQ2xhc3MoYW5pbWF0aW9uKVxuICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgZWxlbWVudC5hZGRDbGFzcyhpbml0Q2xhc3MpO1xuICAgIGlmIChpc0luKSBlbGVtZW50LnNob3coKTtcbiAgfSk7XG5cbiAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGg7XG4gICAgZWxlbWVudFxuICAgICAgLmNzcygndHJhbnNpdGlvbicsICcnKVxuICAgICAgLmFkZENsYXNzKGFjdGl2ZUNsYXNzKTtcbiAgfSk7XG5cbiAgLy8gQ2xlYW4gdXAgdGhlIGFuaW1hdGlvbiB3aGVuIGl0IGZpbmlzaGVzXG4gIGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZChlbGVtZW50KSwgZmluaXNoKTtcblxuICAvLyBIaWRlcyB0aGUgZWxlbWVudCAoZm9yIG91dCBhbmltYXRpb25zKSwgcmVzZXRzIHRoZSBlbGVtZW50LCBhbmQgcnVucyBhIGNhbGxiYWNrXG4gIGZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICBpZiAoIWlzSW4pIGVsZW1lbnQuaGlkZSgpO1xuICAgIHJlc2V0KCk7XG4gICAgaWYgKGNiKSBjYi5hcHBseShlbGVtZW50KTtcbiAgfVxuXG4gIC8vIFJlc2V0cyB0cmFuc2l0aW9ucyBhbmQgcmVtb3ZlcyBtb3Rpb24tc3BlY2lmaWMgY2xhc3Nlc1xuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBlbGVtZW50WzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IDA7XG4gICAgZWxlbWVudC5yZW1vdmVDbGFzcyhgJHtpbml0Q2xhc3N9ICR7YWN0aXZlQ2xhc3N9ICR7YW5pbWF0aW9ufWApO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTW92ZSA9IE1vdmU7XG5Gb3VuZGF0aW9uLk1vdGlvbiA9IE1vdGlvbjtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBOZXN0ID0ge1xuICBGZWF0aGVyKG1lbnUsIHR5cGUgPSAnemYnKSB7XG4gICAgbWVudS5hdHRyKCdyb2xlJywgJ21lbnViYXInKTtcblxuICAgIHZhciBpdGVtcyA9IG1lbnUuZmluZCgnbGknKS5hdHRyKHsncm9sZSc6ICdtZW51aXRlbSd9KSxcbiAgICAgICAgc3ViTWVudUNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudWAsXG4gICAgICAgIHN1Ykl0ZW1DbGFzcyA9IGAke3N1Yk1lbnVDbGFzc30taXRlbWAsXG4gICAgICAgIGhhc1N1YkNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudS1wYXJlbnRgO1xuXG4gICAgbWVudS5maW5kKCdhOmZpcnN0JykuYXR0cigndGFiaW5kZXgnLCAwKTtcblxuICAgIGl0ZW1zLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcblxuICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtXG4gICAgICAgICAgLmFkZENsYXNzKGhhc1N1YkNsYXNzKVxuICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICdhcmlhLWhhc3BvcHVwJzogdHJ1ZSxcbiAgICAgICAgICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXG4gICAgICAgICAgICAnYXJpYS1sYWJlbCc6ICRpdGVtLmNoaWxkcmVuKCdhOmZpcnN0JykudGV4dCgpXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgJHN1YlxuICAgICAgICAgIC5hZGRDbGFzcyhgc3VibWVudSAke3N1Yk1lbnVDbGFzc31gKVxuICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICdkYXRhLXN1Ym1lbnUnOiAnJyxcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6IHRydWUsXG4gICAgICAgICAgICAncm9sZSc6ICdtZW51J1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCkge1xuICAgICAgICAkaXRlbS5hZGRDbGFzcyhgaXMtc3VibWVudS1pdGVtICR7c3ViSXRlbUNsYXNzfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIEJ1cm4obWVudSwgdHlwZSkge1xuICAgIHZhciBpdGVtcyA9IG1lbnUuZmluZCgnbGknKS5yZW1vdmVBdHRyKCd0YWJpbmRleCcpLFxuICAgICAgICBzdWJNZW51Q2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51YCxcbiAgICAgICAgc3ViSXRlbUNsYXNzID0gYCR7c3ViTWVudUNsYXNzfS1pdGVtYCxcbiAgICAgICAgaGFzU3ViQ2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51LXBhcmVudGA7XG5cbiAgICBtZW51XG4gICAgICAuZmluZCgnKicpXG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7c3ViTWVudUNsYXNzfSAke3N1Ykl0ZW1DbGFzc30gJHtoYXNTdWJDbGFzc30gaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUgaXMtYWN0aXZlYClcbiAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyggICAgICBtZW51LmZpbmQoJy4nICsgc3ViTWVudUNsYXNzICsgJywgLicgKyBzdWJJdGVtQ2xhc3MgKyAnLCAuaGFzLXN1Ym1lbnUsIC5pcy1zdWJtZW51LWl0ZW0sIC5zdWJtZW51LCBbZGF0YS1zdWJtZW51XScpXG4gICAgLy8gICAgICAgICAgIC5yZW1vdmVDbGFzcyhzdWJNZW51Q2xhc3MgKyAnICcgKyBzdWJJdGVtQ2xhc3MgKyAnIGhhcy1zdWJtZW51IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51JylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpKTtcbiAgICAvLyBpdGVtcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgLy8gICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgIC8vICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcbiAgICAvLyAgIGlmKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpe1xuICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaXMtc3VibWVudS1pdGVtICcgKyBzdWJJdGVtQ2xhc3MpO1xuICAgIC8vICAgfVxuICAgIC8vICAgaWYoJHN1Yi5sZW5ndGgpe1xuICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaGFzLXN1Ym1lbnUnKTtcbiAgICAvLyAgICAgJHN1Yi5yZW1vdmVDbGFzcygnc3VibWVudSAnICsgc3ViTWVudUNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9KTtcbiAgfVxufVxuXG5Gb3VuZGF0aW9uLk5lc3QgPSBOZXN0O1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmZ1bmN0aW9uIFRpbWVyKGVsZW0sIG9wdGlvbnMsIGNiKSB7XG4gIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICBkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24sLy9vcHRpb25zIGlzIGFuIG9iamVjdCBmb3IgZWFzaWx5IGFkZGluZyBmZWF0dXJlcyBsYXRlci5cbiAgICAgIG5hbWVTcGFjZSA9IE9iamVjdC5rZXlzKGVsZW0uZGF0YSgpKVswXSB8fCAndGltZXInLFxuICAgICAgcmVtYWluID0gLTEsXG4gICAgICBzdGFydCxcbiAgICAgIHRpbWVyO1xuXG4gIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcblxuICB0aGlzLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICByZW1haW4gPSAtMTtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfVxuXG4gIHRoaXMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG4gICAgLy8gaWYoIWVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICByZW1haW4gPSByZW1haW4gPD0gMCA/IGR1cmF0aW9uIDogcmVtYWluO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgZmFsc2UpO1xuICAgIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIGlmKG9wdGlvbnMuaW5maW5pdGUpe1xuICAgICAgICBfdGhpcy5yZXN0YXJ0KCk7Ly9yZXJ1biB0aGUgdGltZXIuXG4gICAgICB9XG4gICAgICBjYigpO1xuICAgIH0sIHJlbWFpbik7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnN0YXJ0LnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG5cbiAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xuICAgIC8vaWYoZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgdHJ1ZSk7XG4gICAgdmFyIGVuZCA9IERhdGUubm93KCk7XG4gICAgcmVtYWluID0gcmVtYWluIC0gKGVuZCAtIHN0YXJ0KTtcbiAgICBlbGVtLnRyaWdnZXIoYHRpbWVycGF1c2VkLnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG59XG5cbi8qKlxuICogUnVucyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQuXG4gKiBAcGFyYW0ge09iamVjdH0gaW1hZ2VzIC0gSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICogQHBhcmFtIHtGdW5jfSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gKi9cbmZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkKGltYWdlcywgY2FsbGJhY2spe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIGltYWdlcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmNvbXBsZXRlKSB7XG4gICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgdGhpcy5uYXR1cmFsV2lkdGggIT09ICd1bmRlZmluZWQnICYmIHRoaXMubmF0dXJhbFdpZHRoID4gMCkge1xuICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAkKHRoaXMpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBzaW5nbGVJbWFnZUxvYWRlZCgpIHtcbiAgICB1bmxvYWRlZC0tO1xuICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cbn1cblxuRm91bmRhdGlvbi5UaW1lciA9IFRpbWVyO1xuRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCA9IG9uSW1hZ2VzTG9hZGVkO1xuXG59KGpRdWVyeSk7XG4iLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqV29yayBpbnNwaXJlZCBieSBtdWx0aXBsZSBqcXVlcnkgc3dpcGUgcGx1Z2lucyoqXG4vLyoqRG9uZSBieSBZb2hhaSBBcmFyYXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4oZnVuY3Rpb24oJCkge1xuXG4gICQuc3BvdFN3aXBlID0ge1xuICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgZW5hYmxlZDogJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZSxcbiAgICBtb3ZlVGhyZXNob2xkOiA3NSxcbiAgICB0aW1lVGhyZXNob2xkOiAyMDBcbiAgfTtcblxuICB2YXIgICBzdGFydFBvc1gsXG4gICAgICAgIHN0YXJ0UG9zWSxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbGFwc2VkVGltZSxcbiAgICAgICAgaXNNb3ZpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xuICAgIC8vICBhbGVydCh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gICAgaXNNb3ZpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hNb3ZlKGUpIHtcbiAgICBpZiAoJC5zcG90U3dpcGUucHJldmVudERlZmF1bHQpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9XG4gICAgaWYoaXNNb3ZpbmcpIHtcbiAgICAgIHZhciB4ID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgdmFyIHkgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICB2YXIgZHggPSBzdGFydFBvc1ggLSB4O1xuICAgICAgdmFyIGR5ID0gc3RhcnRQb3NZIC0geTtcbiAgICAgIHZhciBkaXI7XG4gICAgICBlbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lO1xuICAgICAgaWYoTWF0aC5hYnMoZHgpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgICBkaXIgPSBkeCA+IDAgPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgICAgfVxuICAgICAgLy8gZWxzZSBpZihNYXRoLmFicyhkeSkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG4gICAgICAvLyAgIGRpciA9IGR5ID4gMCA/ICdkb3duJyA6ICd1cCc7XG4gICAgICAvLyB9XG4gICAgICBpZihkaXIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvblRvdWNoRW5kLmNhbGwodGhpcyk7XG4gICAgICAgICQodGhpcykudHJpZ2dlcignc3dpcGUnLCBkaXIpLnRyaWdnZXIoYHN3aXBlJHtkaXJ9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBzdGFydFBvc1ggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICBzdGFydFBvc1kgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICBpc01vdmluZyA9IHRydWU7XG4gICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIgJiYgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG4gIH1cblxuICBmdW5jdGlvbiB0ZWFyZG93bigpIHtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuICB9XG5cbiAgJC5ldmVudC5zcGVjaWFsLnN3aXBlID0geyBzZXR1cDogaW5pdCB9O1xuXG4gICQuZWFjaChbJ2xlZnQnLCAndXAnLCAnZG93bicsICdyaWdodCddLCBmdW5jdGlvbiAoKSB7XG4gICAgJC5ldmVudC5zcGVjaWFsW2Bzd2lwZSR7dGhpc31gXSA9IHsgc2V0dXA6IGZ1bmN0aW9uKCl7XG4gICAgICAkKHRoaXMpLm9uKCdzd2lwZScsICQubm9vcCk7XG4gICAgfSB9O1xuICB9KTtcbn0pKGpRdWVyeSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWV0aG9kIGZvciBhZGRpbmcgcHN1ZWRvIGRyYWcgZXZlbnRzIHRvIGVsZW1lbnRzICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4hZnVuY3Rpb24oJCl7XG4gICQuZm4uYWRkVG91Y2ggPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLGVsKXtcbiAgICAgICQoZWwpLmJpbmQoJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJyxmdW5jdGlvbigpe1xuICAgICAgICAvL3dlIHBhc3MgdGhlIG9yaWdpbmFsIGV2ZW50IG9iamVjdCBiZWNhdXNlIHRoZSBqUXVlcnkgZXZlbnRcbiAgICAgICAgLy9vYmplY3QgaXMgbm9ybWFsaXplZCB0byB3M2Mgc3BlY3MgYW5kIGRvZXMgbm90IHByb3ZpZGUgdGhlIFRvdWNoTGlzdFxuICAgICAgICBoYW5kbGVUb3VjaChldmVudCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBoYW5kbGVUb3VjaCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG4gICAgICAgICAgZmlyc3QgPSB0b3VjaGVzWzBdLFxuICAgICAgICAgIGV2ZW50VHlwZXMgPSB7XG4gICAgICAgICAgICB0b3VjaHN0YXJ0OiAnbW91c2Vkb3duJyxcbiAgICAgICAgICAgIHRvdWNobW92ZTogJ21vdXNlbW92ZScsXG4gICAgICAgICAgICB0b3VjaGVuZDogJ21vdXNldXAnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0eXBlID0gZXZlbnRUeXBlc1tldmVudC50eXBlXSxcbiAgICAgICAgICBzaW11bGF0ZWRFdmVudFxuICAgICAgICA7XG5cbiAgICAgIGlmKCdNb3VzZUV2ZW50JyBpbiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gd2luZG93Lk1vdXNlRXZlbnQodHlwZSwge1xuICAgICAgICAgICdidWJibGVzJzogdHJ1ZSxcbiAgICAgICAgICAnY2FuY2VsYWJsZSc6IHRydWUsXG4gICAgICAgICAgJ3NjcmVlblgnOiBmaXJzdC5zY3JlZW5YLFxuICAgICAgICAgICdzY3JlZW5ZJzogZmlyc3Quc2NyZWVuWSxcbiAgICAgICAgICAnY2xpZW50WCc6IGZpcnN0LmNsaWVudFgsXG4gICAgICAgICAgJ2NsaWVudFknOiBmaXJzdC5jbGllbnRZXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudCcpO1xuICAgICAgICBzaW11bGF0ZWRFdmVudC5pbml0TW91c2VFdmVudCh0eXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csIDEsIGZpcnN0LnNjcmVlblgsIGZpcnN0LnNjcmVlblksIGZpcnN0LmNsaWVudFgsIGZpcnN0LmNsaWVudFksIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwLypsZWZ0Ki8sIG51bGwpO1xuICAgICAgfVxuICAgICAgZmlyc3QudGFyZ2V0LmRpc3BhdGNoRXZlbnQoc2ltdWxhdGVkRXZlbnQpO1xuICAgIH07XG4gIH07XG59KGpRdWVyeSk7XG5cblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqRnJvbSB0aGUgalF1ZXJ5IE1vYmlsZSBMaWJyYXJ5Kipcbi8vKipuZWVkIHRvIHJlY3JlYXRlIGZ1bmN0aW9uYWxpdHkqKlxuLy8qKmFuZCB0cnkgdG8gaW1wcm92ZSBpZiBwb3NzaWJsZSoqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuLyogUmVtb3ZpbmcgdGhlIGpRdWVyeSBmdW5jdGlvbiAqKioqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuKGZ1bmN0aW9uKCAkLCB3aW5kb3csIHVuZGVmaW5lZCApIHtcblxuXHR2YXIgJGRvY3VtZW50ID0gJCggZG9jdW1lbnQgKSxcblx0XHQvLyBzdXBwb3J0VG91Y2ggPSAkLm1vYmlsZS5zdXBwb3J0LnRvdWNoLFxuXHRcdHRvdWNoU3RhcnRFdmVudCA9ICd0b3VjaHN0YXJ0Jy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaHN0YXJ0XCIgOiBcIm1vdXNlZG93blwiLFxuXHRcdHRvdWNoU3RvcEV2ZW50ID0gJ3RvdWNoZW5kJy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaGVuZFwiIDogXCJtb3VzZXVwXCIsXG5cdFx0dG91Y2hNb3ZlRXZlbnQgPSAndG91Y2htb3ZlJy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaG1vdmVcIiA6IFwibW91c2Vtb3ZlXCI7XG5cblx0Ly8gc2V0dXAgbmV3IGV2ZW50IHNob3J0Y3V0c1xuXHQkLmVhY2goICggXCJ0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCBcIiArXG5cdFx0XCJzd2lwZSBzd2lwZWxlZnQgc3dpcGVyaWdodFwiICkuc3BsaXQoIFwiIFwiICksIGZ1bmN0aW9uKCBpLCBuYW1lICkge1xuXG5cdFx0JC5mblsgbmFtZSBdID0gZnVuY3Rpb24oIGZuICkge1xuXHRcdFx0cmV0dXJuIGZuID8gdGhpcy5iaW5kKCBuYW1lLCBmbiApIDogdGhpcy50cmlnZ2VyKCBuYW1lICk7XG5cdFx0fTtcblxuXHRcdC8vIGpRdWVyeSA8IDEuOFxuXHRcdGlmICggJC5hdHRyRm4gKSB7XG5cdFx0XHQkLmF0dHJGblsgbmFtZSBdID0gdHJ1ZTtcblx0XHR9XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIHRyaWdnZXJDdXN0b21FdmVudCggb2JqLCBldmVudFR5cGUsIGV2ZW50LCBidWJibGUgKSB7XG5cdFx0dmFyIG9yaWdpbmFsVHlwZSA9IGV2ZW50LnR5cGU7XG5cdFx0ZXZlbnQudHlwZSA9IGV2ZW50VHlwZTtcblx0XHRpZiAoIGJ1YmJsZSApIHtcblx0XHRcdCQuZXZlbnQudHJpZ2dlciggZXZlbnQsIHVuZGVmaW5lZCwgb2JqICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQuZXZlbnQuZGlzcGF0Y2guY2FsbCggb2JqLCBldmVudCApO1xuXHRcdH1cblx0XHRldmVudC50eXBlID0gb3JpZ2luYWxUeXBlO1xuXHR9XG5cblx0Ly8gYWxzbyBoYW5kbGVzIHRhcGhvbGRcblxuXHQvLyBBbHNvIGhhbmRsZXMgc3dpcGVsZWZ0LCBzd2lwZXJpZ2h0XG5cdCQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHtcblxuXHRcdC8vIE1vcmUgdGhhbiB0aGlzIGhvcml6b250YWwgZGlzcGxhY2VtZW50LCBhbmQgd2Ugd2lsbCBzdXBwcmVzcyBzY3JvbGxpbmcuXG5cdFx0c2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZDogMzAsXG5cblx0XHQvLyBNb3JlIHRpbWUgdGhhbiB0aGlzLCBhbmQgaXQgaXNuJ3QgYSBzd2lwZS5cblx0XHRkdXJhdGlvblRocmVzaG9sZDogMTAwMCxcblxuXHRcdC8vIFN3aXBlIGhvcml6b250YWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbW9yZSB0aGFuIHRoaXMuXG5cdFx0aG9yaXpvbnRhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdC8vIFN3aXBlIHZlcnRpY2FsIGRpc3BsYWNlbWVudCBtdXN0IGJlIGxlc3MgdGhhbiB0aGlzLlxuXHRcdHZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Z2V0TG9jYXRpb246IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHR2YXIgd2luUGFnZVggPSB3aW5kb3cucGFnZVhPZmZzZXQsXG5cdFx0XHRcdHdpblBhZ2VZID0gd2luZG93LnBhZ2VZT2Zmc2V0LFxuXHRcdFx0XHR4ID0gZXZlbnQuY2xpZW50WCxcblx0XHRcdFx0eSA9IGV2ZW50LmNsaWVudFk7XG5cblx0XHRcdGlmICggZXZlbnQucGFnZVkgPT09IDAgJiYgTWF0aC5mbG9vciggeSApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVkgKSB8fFxuXHRcdFx0XHRldmVudC5wYWdlWCA9PT0gMCAmJiBNYXRoLmZsb29yKCB4ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWCApICkge1xuXG5cdFx0XHRcdC8vIGlPUzQgY2xpZW50WC9jbGllbnRZIGhhdmUgdGhlIHZhbHVlIHRoYXQgc2hvdWxkIGhhdmUgYmVlblxuXHRcdFx0XHQvLyBpbiBwYWdlWC9wYWdlWS4gV2hpbGUgcGFnZVgvcGFnZS8gaGF2ZSB0aGUgdmFsdWUgMFxuXHRcdFx0XHR4ID0geCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0geSAtIHdpblBhZ2VZO1xuXHRcdFx0fSBlbHNlIGlmICggeSA8ICggZXZlbnQucGFnZVkgLSB3aW5QYWdlWSkgfHwgeCA8ICggZXZlbnQucGFnZVggLSB3aW5QYWdlWCApICkge1xuXG5cdFx0XHRcdC8vIFNvbWUgQW5kcm9pZCBicm93c2VycyBoYXZlIHRvdGFsbHkgYm9ndXMgdmFsdWVzIGZvciBjbGllbnRYL1lcblx0XHRcdFx0Ly8gd2hlbiBzY3JvbGxpbmcvem9vbWluZyBhIHBhZ2UuIERldGVjdGFibGUgc2luY2UgY2xpZW50WC9jbGllbnRZXG5cdFx0XHRcdC8vIHNob3VsZCBuZXZlciBiZSBzbWFsbGVyIHRoYW4gcGFnZVgvcGFnZVkgbWludXMgcGFnZSBzY3JvbGxcblx0XHRcdFx0eCA9IGV2ZW50LnBhZ2VYIC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSBldmVudC5wYWdlWSAtIHdpblBhZ2VZO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4OiB4LFxuXHRcdFx0XHR5OiB5XG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRzdGFydDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXSxcblx0XHRcdFx0XHRcdG9yaWdpbjogJCggZXZlbnQudGFyZ2V0IClcblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRzdG9wOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0aGFuZGxlU3dpcGU6IGZ1bmN0aW9uKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApIHtcblx0XHRcdGlmICggc3RvcC50aW1lIC0gc3RhcnQudGltZSA8ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5kdXJhdGlvblRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaG9yaXpvbnRhbERpc3RhbmNlVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDEgXSAtIHN0b3AuY29vcmRzWyAxIF0gKSA8ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS52ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkICkge1xuXHRcdFx0XHR2YXIgZGlyZWN0aW9uID0gc3RhcnQuY29vcmRzWzBdID4gc3RvcC5jb29yZHNbIDAgXSA/IFwic3dpcGVsZWZ0XCIgOiBcInN3aXBlcmlnaHRcIjtcblxuXHRcdFx0XHR0cmlnZ2VyQ3VzdG9tRXZlbnQoIHRoaXNPYmplY3QsIFwic3dpcGVcIiwgJC5FdmVudCggXCJzd2lwZVwiLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9KSwgdHJ1ZSApO1xuXHRcdFx0XHR0cmlnZ2VyQ3VzdG9tRXZlbnQoIHRoaXNPYmplY3QsIGRpcmVjdGlvbiwkLkV2ZW50KCBkaXJlY3Rpb24sIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0gKSwgdHJ1ZSApO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH0sXG5cblx0XHQvLyBUaGlzIHNlcnZlcyBhcyBhIGZsYWcgdG8gZW5zdXJlIHRoYXQgYXQgbW9zdCBvbmUgc3dpcGUgZXZlbnQgZXZlbnQgaXNcblx0XHQvLyBpbiB3b3JrIGF0IGFueSBnaXZlbiB0aW1lXG5cdFx0ZXZlbnRJblByb2dyZXNzOiBmYWxzZSxcblxuXHRcdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsXG5cdFx0XHRcdHRoaXNPYmplY3QgPSB0aGlzLFxuXHRcdFx0XHQkdGhpcyA9ICQoIHRoaXNPYmplY3QgKSxcblx0XHRcdFx0Y29udGV4dCA9IHt9O1xuXG5cdFx0XHQvLyBSZXRyaWV2ZSB0aGUgZXZlbnRzIGRhdGEgZm9yIHRoaXMgZWxlbWVudCBhbmQgYWRkIHRoZSBzd2lwZSBjb250ZXh0XG5cdFx0XHRldmVudHMgPSAkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRpZiAoICFldmVudHMgKSB7XG5cdFx0XHRcdGV2ZW50cyA9IHsgbGVuZ3RoOiAwIH07XG5cdFx0XHRcdCQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIsIGV2ZW50cyApO1xuXHRcdFx0fVxuXHRcdFx0ZXZlbnRzLmxlbmd0aCsrO1xuXHRcdFx0ZXZlbnRzLnN3aXBlID0gY29udGV4dDtcblxuXHRcdFx0Y29udGV4dC5zdGFydCA9IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdFx0XHQvLyBCYWlsIGlmIHdlJ3JlIGFscmVhZHkgd29ya2luZyBvbiBhIHN3aXBlIGV2ZW50XG5cdFx0XHRcdGlmICggJC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IHRydWU7XG5cblx0XHRcdFx0dmFyIHN0b3AsXG5cdFx0XHRcdFx0c3RhcnQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc3RhcnQoIGV2ZW50ICksXG5cdFx0XHRcdFx0b3JpZ1RhcmdldCA9IGV2ZW50LnRhcmdldCxcblx0XHRcdFx0XHRlbWl0dGVkID0gZmFsc2U7XG5cblx0XHRcdFx0Y29udGV4dC5tb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRcdGlmICggIXN0YXJ0IHx8IGV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHN0b3AgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc3RvcCggZXZlbnQgKTtcblx0XHRcdFx0XHRpZiAoICFlbWl0dGVkICkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5oYW5kbGVTd2lwZSggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKTtcblx0XHRcdFx0XHRcdGlmICggZW1pdHRlZCApIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBSZXNldCB0aGUgY29udGV4dCB0byBtYWtlIHdheSBmb3IgdGhlIG5leHQgc3dpcGUgZXZlbnRcblx0XHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBwcmV2ZW50IHNjcm9sbGluZ1xuXHRcdFx0XHRcdGlmICggTWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQgKSB7XG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHRjb250ZXh0LnN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHQvLyBSZXNldCB0aGUgY29udGV4dCB0byBtYWtlIHdheSBmb3IgdGhlIG5leHQgc3dpcGUgZXZlbnRcblx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKTtcblx0XHRcdFx0XHRcdGNvbnRleHQubW92ZSA9IG51bGw7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0JGRvY3VtZW50Lm9uKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlIClcblx0XHRcdFx0XHQub25lKCB0b3VjaFN0b3BFdmVudCwgY29udGV4dC5zdG9wICk7XG5cdFx0XHR9O1xuXHRcdFx0JHRoaXMub24oIHRvdWNoU3RhcnRFdmVudCwgY29udGV4dC5zdGFydCApO1xuXHRcdH0sXG5cblx0XHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLCBjb250ZXh0O1xuXG5cdFx0XHRldmVudHMgPSAkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRpZiAoIGV2ZW50cyApIHtcblx0XHRcdFx0Y29udGV4dCA9IGV2ZW50cy5zd2lwZTtcblx0XHRcdFx0ZGVsZXRlIGV2ZW50cy5zd2lwZTtcblx0XHRcdFx0ZXZlbnRzLmxlbmd0aC0tO1xuXHRcdFx0XHRpZiAoIGV2ZW50cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRcdFx0JC5yZW1vdmVEYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICggY29udGV4dCApIHtcblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0YXJ0ICkge1xuXHRcdFx0XHRcdCQoIHRoaXMgKS5vZmYoIHRvdWNoU3RhcnRFdmVudCwgY29udGV4dC5zdGFydCApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5tb3ZlICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RvcCApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaFN0b3BFdmVudCwgY29udGV4dC5zdG9wICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdCQuZWFjaCh7XG5cdFx0c3dpcGVsZWZ0OiBcInN3aXBlLmxlZnRcIixcblx0XHRzd2lwZXJpZ2h0OiBcInN3aXBlLnJpZ2h0XCJcblx0fSwgZnVuY3Rpb24oIGV2ZW50LCBzb3VyY2VFdmVudCApIHtcblxuXHRcdCQuZXZlbnQuc3BlY2lhbFsgZXZlbnQgXSA9IHtcblx0XHRcdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLmJpbmQoIHNvdXJjZUV2ZW50LCAkLm5vb3AgKTtcblx0XHRcdH0sXG5cdFx0XHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS51bmJpbmQoIHNvdXJjZUV2ZW50ICk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG59KSggalF1ZXJ5LCB0aGlzICk7XG4qL1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHByZWZpeGVzID0gWydXZWJLaXQnLCAnTW96JywgJ08nLCAnTXMnLCAnJ107XG4gIGZvciAodmFyIGk9MDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGAke3ByZWZpeGVzW2ldfU11dGF0aW9uT2JzZXJ2ZXJgIGluIHdpbmRvdykge1xuICAgICAgcmV0dXJuIHdpbmRvd1tgJHtwcmVmaXhlc1tpXX1NdXRhdGlvbk9ic2VydmVyYF07XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn0oKSk7XG5cbmNvbnN0IHRyaWdnZXJzID0gKGVsLCB0eXBlKSA9PiB7XG4gIGVsLmRhdGEodHlwZSkuc3BsaXQoJyAnKS5mb3JFYWNoKGlkID0+IHtcbiAgICAkKGAjJHtpZH1gKVsgdHlwZSA9PT0gJ2Nsb3NlJyA/ICd0cmlnZ2VyJyA6ICd0cmlnZ2VySGFuZGxlciddKGAke3R5cGV9LnpmLnRyaWdnZXJgLCBbZWxdKTtcbiAgfSk7XG59O1xuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1vcGVuXSB3aWxsIHJldmVhbCBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLW9wZW5dJywgZnVuY3Rpb24oKSB7XG4gIHRyaWdnZXJzKCQodGhpcyksICdvcGVuJyk7XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zZV0gd2lsbCBjbG9zZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbi8vIElmIHVzZWQgd2l0aG91dCBhIHZhbHVlIG9uIFtkYXRhLWNsb3NlXSwgdGhlIGV2ZW50IHdpbGwgYnViYmxlLCBhbGxvd2luZyBpdCB0byBjbG9zZSBhIHBhcmVudCBjb21wb25lbnQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1jbG9zZV0nLCBmdW5jdGlvbigpIHtcbiAgbGV0IGlkID0gJCh0aGlzKS5kYXRhKCdjbG9zZScpO1xuICBpZiAoaWQpIHtcbiAgICB0cmlnZ2VycygkKHRoaXMpLCAnY2xvc2UnKTtcbiAgfVxuICBlbHNlIHtcbiAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlLnpmLnRyaWdnZXInKTtcbiAgfVxufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtdG9nZ2xlXSB3aWxsIHRvZ2dsZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLXRvZ2dsZV0nLCBmdW5jdGlvbigpIHtcbiAgdHJpZ2dlcnMoJCh0aGlzKSwgJ3RvZ2dsZScpO1xufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2FibGVdIHdpbGwgcmVzcG9uZCB0byBjbG9zZS56Zi50cmlnZ2VyIGV2ZW50cy5cbiQoZG9jdW1lbnQpLm9uKCdjbG9zZS56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NhYmxlXScsIGZ1bmN0aW9uKGUpe1xuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBsZXQgYW5pbWF0aW9uID0gJCh0aGlzKS5kYXRhKCdjbG9zYWJsZScpO1xuXG4gIGlmKGFuaW1hdGlvbiAhPT0gJycpe1xuICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQoJCh0aGlzKSwgYW5pbWF0aW9uLCBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcykudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gICAgfSk7XG4gIH1lbHNle1xuICAgICQodGhpcykuZmFkZU91dCgpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICB9XG59KTtcblxuJChkb2N1bWVudCkub24oJ2ZvY3VzLnpmLnRyaWdnZXIgYmx1ci56Zi50cmlnZ2VyJywgJ1tkYXRhLXRvZ2dsZS1mb2N1c10nLCBmdW5jdGlvbigpIHtcbiAgbGV0IGlkID0gJCh0aGlzKS5kYXRhKCd0b2dnbGUtZm9jdXMnKTtcbiAgJChgIyR7aWR9YCkudHJpZ2dlckhhbmRsZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJywgWyQodGhpcyldKTtcbn0pO1xuXG4vKipcbiogRmlyZXMgb25jZSBhZnRlciBhbGwgb3RoZXIgc2NyaXB0cyBoYXZlIGxvYWRlZFxuKiBAZnVuY3Rpb25cbiogQHByaXZhdGVcbiovXG4kKHdpbmRvdykubG9hZCgoKSA9PiB7XG4gIGNoZWNrTGlzdGVuZXJzKCk7XG59KTtcblxuZnVuY3Rpb24gY2hlY2tMaXN0ZW5lcnMoKSB7XG4gIGV2ZW50c0xpc3RlbmVyKCk7XG4gIHJlc2l6ZUxpc3RlbmVyKCk7XG4gIHNjcm9sbExpc3RlbmVyKCk7XG4gIGNsb3NlbWVMaXN0ZW5lcigpO1xufVxuXG4vLyoqKioqKioqIG9ubHkgZmlyZXMgdGhpcyBmdW5jdGlvbiBvbmNlIG9uIGxvYWQsIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIHRvIHdhdGNoICoqKioqKioqXG5mdW5jdGlvbiBjbG9zZW1lTGlzdGVuZXIocGx1Z2luTmFtZSkge1xuICB2YXIgeWV0aUJveGVzID0gJCgnW2RhdGEteWV0aS1ib3hdJyksXG4gICAgICBwbHVnTmFtZXMgPSBbJ2Ryb3Bkb3duJywgJ3Rvb2x0aXAnLCAncmV2ZWFsJ107XG5cbiAgaWYocGx1Z2luTmFtZSl7XG4gICAgaWYodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdzdHJpbmcnKXtcbiAgICAgIHBsdWdOYW1lcy5wdXNoKHBsdWdpbk5hbWUpO1xuICAgIH1lbHNlIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcGx1Z2luTmFtZVswXSA9PT0gJ3N0cmluZycpe1xuICAgICAgcGx1Z05hbWVzLmNvbmNhdChwbHVnaW5OYW1lKTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1BsdWdpbiBuYW1lcyBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gIH1cbiAgaWYoeWV0aUJveGVzLmxlbmd0aCl7XG4gICAgbGV0IGxpc3RlbmVycyA9IHBsdWdOYW1lcy5tYXAoKG5hbWUpID0+IHtcbiAgICAgIHJldHVybiBgY2xvc2VtZS56Zi4ke25hbWV9YDtcbiAgICB9KS5qb2luKCcgJyk7XG5cbiAgICAkKHdpbmRvdykub2ZmKGxpc3RlbmVycykub24obGlzdGVuZXJzLCBmdW5jdGlvbihlLCBwbHVnaW5JZCl7XG4gICAgICBsZXQgcGx1Z2luID0gZS5uYW1lc3BhY2Uuc3BsaXQoJy4nKVswXTtcbiAgICAgIGxldCBwbHVnaW5zID0gJChgW2RhdGEtJHtwbHVnaW59XWApLm5vdChgW2RhdGEteWV0aS1ib3g9XCIke3BsdWdpbklkfVwiXWApO1xuXG4gICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgbGV0IF90aGlzID0gJCh0aGlzKTtcblxuICAgICAgICBfdGhpcy50cmlnZ2VySGFuZGxlcignY2xvc2UuemYudHJpZ2dlcicsIFtfdGhpc10pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzaXplTGlzdGVuZXIoZGVib3VuY2Upe1xuICBsZXQgdGltZXIsXG4gICAgICAkbm9kZXMgPSAkKCdbZGF0YS1yZXNpemVdJyk7XG4gIGlmKCRub2Rlcy5sZW5ndGgpe1xuICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS56Zi50cmlnZ2VyJylcbiAgICAub24oJ3Jlc2l6ZS56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRpbWVyKSB7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cblxuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSByZXNpemUgZXZlbnRcbiAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJyZXNpemVcIik7XG4gICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7Ly9kZWZhdWx0IHRpbWUgdG8gZW1pdCByZXNpemUgZXZlbnRcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzY3JvbGxMaXN0ZW5lcihkZWJvdW5jZSl7XG4gIGxldCB0aW1lcixcbiAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXNjcm9sbF0nKTtcbiAgaWYoJG5vZGVzLmxlbmd0aCl7XG4gICAgJCh3aW5kb3cpLm9mZignc2Nyb2xsLnpmLnRyaWdnZXInKVxuICAgIC5vbignc2Nyb2xsLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlKXtcbiAgICAgIGlmKHRpbWVyKXsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuXG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICBpZighTXV0YXRpb25PYnNlcnZlcil7Ly9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHNjcm9sbCBldmVudFxuICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInNjcm9sbFwiKTtcbiAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsvL2RlZmF1bHQgdGltZSB0byBlbWl0IHNjcm9sbCBldmVudFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50c0xpc3RlbmVyKCkge1xuICBpZighTXV0YXRpb25PYnNlcnZlcil7IHJldHVybiBmYWxzZTsgfVxuICBsZXQgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1yZXNpemVdLCBbZGF0YS1zY3JvbGxdLCBbZGF0YS1tdXRhdGVdJyk7XG5cbiAgLy9lbGVtZW50IGNhbGxiYWNrXG4gIHZhciBsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uID0gZnVuY3Rpb24obXV0YXRpb25SZWNvcmRzTGlzdCkge1xuICAgIHZhciAkdGFyZ2V0ID0gJChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnRhcmdldCk7XG4gICAgLy90cmlnZ2VyIHRoZSBldmVudCBoYW5kbGVyIGZvciB0aGUgZWxlbWVudCBkZXBlbmRpbmcgb24gdHlwZVxuICAgIHN3aXRjaCAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikpIHtcblxuICAgICAgY2FzZSBcInJlc2l6ZVwiIDpcbiAgICAgICR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldF0pO1xuICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJzY3JvbGxcIiA6XG4gICAgICAkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQsIHdpbmRvdy5wYWdlWU9mZnNldF0pO1xuICAgICAgYnJlYWs7XG5cbiAgICAgIC8vIGNhc2UgXCJtdXRhdGVcIiA6XG4gICAgICAvLyBjb25zb2xlLmxvZygnbXV0YXRlJywgJHRhcmdldCk7XG4gICAgICAvLyAkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdtdXRhdGUuemYudHJpZ2dlcicpO1xuICAgICAgLy9cbiAgICAgIC8vIC8vbWFrZSBzdXJlIHdlIGRvbid0IGdldCBzdHVjayBpbiBhbiBpbmZpbml0ZSBsb29wIGZyb20gc2xvcHB5IGNvZGVpbmdcbiAgICAgIC8vIGlmICgkdGFyZ2V0LmluZGV4KCdbZGF0YS1tdXRhdGVdJykgPT0gJChcIltkYXRhLW11dGF0ZV1cIikubGVuZ3RoLTEpIHtcbiAgICAgIC8vICAgZG9tTXV0YXRpb25PYnNlcnZlcigpO1xuICAgICAgLy8gfVxuICAgICAgLy8gYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQgOlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgLy9ub3RoaW5nXG4gICAgfVxuICB9XG5cbiAgaWYobm9kZXMubGVuZ3RoKXtcbiAgICAvL2ZvciBlYWNoIGVsZW1lbnQgdGhhdCBuZWVkcyB0byBsaXN0ZW4gZm9yIHJlc2l6aW5nLCBzY3JvbGxpbmcsIChvciBjb21pbmcgc29vbiBtdXRhdGlvbikgYWRkIGEgc2luZ2xlIG9ic2VydmVyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gbm9kZXMubGVuZ3RoLTE7IGkrKykge1xuICAgICAgbGV0IGVsZW1lbnRPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24pO1xuICAgICAgZWxlbWVudE9ic2VydmVyLm9ic2VydmUobm9kZXNbaV0sIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiBmYWxzZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6ZmFsc2UsIGF0dHJpYnV0ZUZpbHRlcjpbXCJkYXRhLWV2ZW50c1wiXX0pO1xuICAgIH1cbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gW1BIXVxuLy8gRm91bmRhdGlvbi5DaGVja1dhdGNoZXJzID0gY2hlY2tXYXRjaGVycztcbkZvdW5kYXRpb24uSUhlYXJZb3UgPSBjaGVja0xpc3RlbmVycztcbi8vIEZvdW5kYXRpb24uSVNlZVlvdSA9IHNjcm9sbExpc3RlbmVyO1xuLy8gRm91bmRhdGlvbi5JRmVlbFlvdSA9IGNsb3NlbWVMaXN0ZW5lcjtcblxufShqUXVlcnkpO1xuXG4vLyBmdW5jdGlvbiBkb21NdXRhdGlvbk9ic2VydmVyKGRlYm91bmNlKSB7XG4vLyAgIC8vICEhISBUaGlzIGlzIGNvbWluZyBzb29uIGFuZCBuZWVkcyBtb3JlIHdvcms7IG5vdCBhY3RpdmUgICEhISAvL1xuLy8gICB2YXIgdGltZXIsXG4vLyAgIG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtbXV0YXRlXScpO1xuLy8gICAvL1xuLy8gICBpZiAobm9kZXMubGVuZ3RoKSB7XG4vLyAgICAgLy8gdmFyIE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xuLy8gICAgIC8vICAgdmFyIHByZWZpeGVzID0gWydXZWJLaXQnLCAnTW96JywgJ08nLCAnTXMnLCAnJ107XG4vLyAgICAgLy8gICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuLy8gICAgIC8vICAgICBpZiAocHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlcicgaW4gd2luZG93KSB7XG4vLyAgICAgLy8gICAgICAgcmV0dXJuIHdpbmRvd1twcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJ107XG4vLyAgICAgLy8gICAgIH1cbi8vICAgICAvLyAgIH1cbi8vICAgICAvLyAgIHJldHVybiBmYWxzZTtcbi8vICAgICAvLyB9KCkpO1xuLy9cbi8vXG4vLyAgICAgLy9mb3IgdGhlIGJvZHksIHdlIG5lZWQgdG8gbGlzdGVuIGZvciBhbGwgY2hhbmdlcyBlZmZlY3RpbmcgdGhlIHN0eWxlIGFuZCBjbGFzcyBhdHRyaWJ1dGVzXG4vLyAgICAgdmFyIGJvZHlPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGJvZHlNdXRhdGlvbik7XG4vLyAgICAgYm9keU9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOnRydWUsIGF0dHJpYnV0ZUZpbHRlcjpbXCJzdHlsZVwiLCBcImNsYXNzXCJdfSk7XG4vL1xuLy9cbi8vICAgICAvL2JvZHkgY2FsbGJhY2tcbi8vICAgICBmdW5jdGlvbiBib2R5TXV0YXRpb24obXV0YXRlKSB7XG4vLyAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgbXV0YXRpb24gZXZlbnRcbi8vICAgICAgIGlmICh0aW1lcikgeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG4vL1xuLy8gICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuLy8gICAgICAgICBib2R5T2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuLy8gICAgICAgICAkKCdbZGF0YS1tdXRhdGVdJykuYXR0cignZGF0YS1ldmVudHMnLFwibXV0YXRlXCIpO1xuLy8gICAgICAgfSwgZGVib3VuY2UgfHwgMTUwKTtcbi8vICAgICB9XG4vLyAgIH1cbi8vIH1cbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBBYmlkZSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uYWJpZGVcbiAqL1xuXG5jbGFzcyBBYmlkZSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEFiaWRlLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIEFiaWRlI2luaXRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGFkZCB0aGUgdHJpZ2dlciB0by5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zICA9ICQuZXh0ZW5kKHt9LCBBYmlkZS5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnQWJpZGUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgQWJpZGUgcGx1Z2luIGFuZCBjYWxscyBmdW5jdGlvbnMgdG8gZ2V0IEFiaWRlIGZ1bmN0aW9uaW5nIG9uIGxvYWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLiRpbnB1dHMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0Jykubm90KCdbZGF0YS1hYmlkZS1pZ25vcmVdJyk7XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIEFiaWRlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLmFiaWRlJylcbiAgICAgIC5vbigncmVzZXQuemYuYWJpZGUnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMucmVzZXRGb3JtKCk7XG4gICAgICB9KVxuICAgICAgLm9uKCdzdWJtaXQuemYuYWJpZGUnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlRm9ybSgpO1xuICAgICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnZhbGlkYXRlT24gPT09ICdmaWVsZENoYW5nZScpIHtcbiAgICAgIHRoaXMuJGlucHV0c1xuICAgICAgICAub2ZmKCdjaGFuZ2UuemYuYWJpZGUnKVxuICAgICAgICAub24oJ2NoYW5nZS56Zi5hYmlkZScsIChlKSA9PiB7XG4gICAgICAgICAgdGhpcy52YWxpZGF0ZUlucHV0KCQoZS50YXJnZXQpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5saXZlVmFsaWRhdGUpIHtcbiAgICAgIHRoaXMuJGlucHV0c1xuICAgICAgICAub2ZmKCdpbnB1dC56Zi5hYmlkZScpXG4gICAgICAgIC5vbignaW5wdXQuemYuYWJpZGUnLCAoZSkgPT4ge1xuICAgICAgICAgIHRoaXMudmFsaWRhdGVJbnB1dCgkKGUudGFyZ2V0KSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBuZWNlc3NhcnkgZnVuY3Rpb25zIHRvIHVwZGF0ZSBBYmlkZSB1cG9uIERPTSBjaGFuZ2VcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9yZWZsb3coKSB7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIG9yIG5vdCBhIGZvcm0gZWxlbWVudCBoYXMgdGhlIHJlcXVpcmVkIGF0dHJpYnV0ZSBhbmQgaWYgaXQncyBjaGVja2VkIG9yIG5vdFxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gY2hlY2sgZm9yIHJlcXVpcmVkIGF0dHJpYnV0ZVxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IGF0dHJpYnV0ZSBpcyBjaGVja2VkIG9yIGVtcHR5XG4gICAqL1xuICByZXF1aXJlZENoZWNrKCRlbCkge1xuICAgIGlmICghJGVsLmF0dHIoJ3JlcXVpcmVkJykpIHJldHVybiB0cnVlO1xuXG4gICAgdmFyIGlzR29vZCA9IHRydWU7XG5cbiAgICBzd2l0Y2ggKCRlbFswXS50eXBlKSB7XG4gICAgICBjYXNlICdjaGVja2JveCc6XG4gICAgICBjYXNlICdyYWRpbyc6XG4gICAgICAgIGlzR29vZCA9ICRlbFswXS5jaGVja2VkO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgIGNhc2UgJ3NlbGVjdC1vbmUnOlxuICAgICAgY2FzZSAnc2VsZWN0LW11bHRpcGxlJzpcbiAgICAgICAgdmFyIG9wdCA9ICRlbC5maW5kKCdvcHRpb246c2VsZWN0ZWQnKTtcbiAgICAgICAgaWYgKCFvcHQubGVuZ3RoIHx8ICFvcHQudmFsKCkpIGlzR29vZCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYoISRlbC52YWwoKSB8fCAhJGVsLnZhbCgpLmxlbmd0aCkgaXNHb29kID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGlzR29vZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBCYXNlZCBvbiAkZWwsIGdldCB0aGUgZmlyc3QgZWxlbWVudCB3aXRoIHNlbGVjdG9yIGluIHRoaXMgb3JkZXI6XG4gICAqIDEuIFRoZSBlbGVtZW50J3MgZGlyZWN0IHNpYmxpbmcoJ3MpLlxuICAgKiAzLiBUaGUgZWxlbWVudCdzIHBhcmVudCdzIGNoaWxkcmVuLlxuICAgKlxuICAgKiBUaGlzIGFsbG93cyBmb3IgbXVsdGlwbGUgZm9ybSBlcnJvcnMgcGVyIGlucHV0LCB0aG91Z2ggaWYgbm9uZSBhcmUgZm91bmQsIG5vIGZvcm0gZXJyb3JzIHdpbGwgYmUgc2hvd24uXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBhcyByZWZlcmVuY2UgdG8gZmluZCB0aGUgZm9ybSBlcnJvciBzZWxlY3Rvci5cbiAgICogQHJldHVybnMge09iamVjdH0galF1ZXJ5IG9iamVjdCB3aXRoIHRoZSBzZWxlY3Rvci5cbiAgICovXG4gIGZpbmRGb3JtRXJyb3IoJGVsKSB7XG4gICAgdmFyICRlcnJvciA9ICRlbC5zaWJsaW5ncyh0aGlzLm9wdGlvbnMuZm9ybUVycm9yU2VsZWN0b3IpO1xuXG4gICAgaWYgKCEkZXJyb3IubGVuZ3RoKSB7XG4gICAgICAkZXJyb3IgPSAkZWwucGFyZW50KCkuZmluZCh0aGlzLm9wdGlvbnMuZm9ybUVycm9yU2VsZWN0b3IpO1xuICAgIH1cblxuICAgIHJldHVybiAkZXJyb3I7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBmaXJzdCBlbGVtZW50IGluIHRoaXMgb3JkZXI6XG4gICAqIDIuIFRoZSA8bGFiZWw+IHdpdGggdGhlIGF0dHJpYnV0ZSBgW2Zvcj1cInNvbWVJbnB1dElkXCJdYFxuICAgKiAzLiBUaGUgYC5jbG9zZXN0KClgIDxsYWJlbD5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gY2hlY2sgZm9yIHJlcXVpcmVkIGF0dHJpYnV0ZVxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IGF0dHJpYnV0ZSBpcyBjaGVja2VkIG9yIGVtcHR5XG4gICAqL1xuICBmaW5kTGFiZWwoJGVsKSB7XG4gICAgdmFyIGlkID0gJGVsWzBdLmlkO1xuICAgIHZhciAkbGFiZWwgPSB0aGlzLiRlbGVtZW50LmZpbmQoYGxhYmVsW2Zvcj1cIiR7aWR9XCJdYCk7XG5cbiAgICBpZiAoISRsYWJlbC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiAkZWwuY2xvc2VzdCgnbGFiZWwnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gJGxhYmVsO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIENTUyBlcnJvciBjbGFzcyBhcyBzcGVjaWZpZWQgYnkgdGhlIEFiaWRlIHNldHRpbmdzIHRvIHRoZSBsYWJlbCwgaW5wdXQsIGFuZCB0aGUgZm9ybVxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byBhZGQgdGhlIGNsYXNzIHRvXG4gICAqL1xuICBhZGRFcnJvckNsYXNzZXMoJGVsKSB7XG4gICAgdmFyICRsYWJlbCA9IHRoaXMuZmluZExhYmVsKCRlbCk7XG4gICAgdmFyICRmb3JtRXJyb3IgPSB0aGlzLmZpbmRGb3JtRXJyb3IoJGVsKTtcblxuICAgIGlmICgkbGFiZWwubGVuZ3RoKSB7XG4gICAgICAkbGFiZWwuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmxhYmVsRXJyb3JDbGFzcyk7XG4gICAgfVxuXG4gICAgaWYgKCRmb3JtRXJyb3IubGVuZ3RoKSB7XG4gICAgICAkZm9ybUVycm9yLmFkZENsYXNzKHRoaXMub3B0aW9ucy5mb3JtRXJyb3JDbGFzcyk7XG4gICAgfVxuXG4gICAgJGVsLmFkZENsYXNzKHRoaXMub3B0aW9ucy5pbnB1dEVycm9yQ2xhc3MpLmF0dHIoJ2RhdGEtaW52YWxpZCcsICcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIENTUyBlcnJvciBjbGFzcyBhcyBzcGVjaWZpZWQgYnkgdGhlIEFiaWRlIHNldHRpbmdzIGZyb20gdGhlIGxhYmVsLCBpbnB1dCwgYW5kIHRoZSBmb3JtXG4gICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgb2JqZWN0IHRvIHJlbW92ZSB0aGUgY2xhc3MgZnJvbVxuICAgKi9cbiAgcmVtb3ZlRXJyb3JDbGFzc2VzKCRlbCkge1xuICAgIHZhciAkbGFiZWwgPSB0aGlzLmZpbmRMYWJlbCgkZWwpO1xuICAgIHZhciAkZm9ybUVycm9yID0gdGhpcy5maW5kRm9ybUVycm9yKCRlbCk7XG5cbiAgICBpZiAoJGxhYmVsLmxlbmd0aCkge1xuICAgICAgJGxhYmVsLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5sYWJlbEVycm9yQ2xhc3MpO1xuICAgIH1cblxuICAgIGlmICgkZm9ybUVycm9yLmxlbmd0aCkge1xuICAgICAgJGZvcm1FcnJvci5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuZm9ybUVycm9yQ2xhc3MpO1xuICAgIH1cblxuICAgICRlbC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuaW5wdXRFcnJvckNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLWludmFsaWQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHb2VzIHRocm91Z2ggYSBmb3JtIHRvIGZpbmQgaW5wdXRzIGFuZCBwcm9jZWVkcyB0byB2YWxpZGF0ZSB0aGVtIGluIHdheXMgc3BlY2lmaWMgdG8gdGhlaXIgdHlwZVxuICAgKiBAZmlyZXMgQWJpZGUjaW52YWxpZFxuICAgKiBAZmlyZXMgQWJpZGUjdmFsaWRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHZhbGlkYXRlLCBzaG91bGQgYmUgYW4gSFRNTCBpbnB1dFxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gZ29vZFRvR28gLSBJZiB0aGUgaW5wdXQgaXMgdmFsaWQgb3Igbm90LlxuICAgKi9cbiAgdmFsaWRhdGVJbnB1dCgkZWwpIHtcbiAgICB2YXIgY2xlYXJSZXF1aXJlID0gdGhpcy5yZXF1aXJlZENoZWNrKCRlbCksXG4gICAgICAgIHZhbGlkYXRlZCA9IGZhbHNlLFxuICAgICAgICBjdXN0b21WYWxpZGF0b3IgPSB0cnVlLFxuICAgICAgICB2YWxpZGF0b3IgPSAkZWwuYXR0cignZGF0YS12YWxpZGF0b3InKSxcbiAgICAgICAgZXF1YWxUbyA9IHRydWU7XG5cbiAgICBzd2l0Y2ggKCRlbFswXS50eXBlKSB7XG4gICAgICBjYXNlICdyYWRpbyc6XG4gICAgICAgIHZhbGlkYXRlZCA9IHRoaXMudmFsaWRhdGVSYWRpbygkZWwuYXR0cignbmFtZScpKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICAgICAgdmFsaWRhdGVkID0gY2xlYXJSZXF1aXJlO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgIGNhc2UgJ3NlbGVjdC1vbmUnOlxuICAgICAgY2FzZSAnc2VsZWN0LW11bHRpcGxlJzpcbiAgICAgICAgdmFsaWRhdGVkID0gY2xlYXJSZXF1aXJlO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFsaWRhdGVkID0gdGhpcy52YWxpZGF0ZVRleHQoJGVsKTtcbiAgICB9XG5cbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICBjdXN0b21WYWxpZGF0b3IgPSB0aGlzLm1hdGNoVmFsaWRhdGlvbigkZWwsIHZhbGlkYXRvciwgJGVsLmF0dHIoJ3JlcXVpcmVkJykpO1xuICAgIH1cblxuICAgIGlmICgkZWwuYXR0cignZGF0YS1lcXVhbHRvJykpIHtcbiAgICAgIGVxdWFsVG8gPSB0aGlzLm9wdGlvbnMudmFsaWRhdG9ycy5lcXVhbFRvKCRlbCk7XG4gICAgfVxuXG4gICAgdmFyIGdvb2RUb0dvID0gW2NsZWFyUmVxdWlyZSwgdmFsaWRhdGVkLCBjdXN0b21WYWxpZGF0b3IsIGVxdWFsVG9dLmluZGV4T2YoZmFsc2UpID09PSAtMTtcbiAgICB2YXIgbWVzc2FnZSA9IChnb29kVG9HbyA/ICd2YWxpZCcgOiAnaW52YWxpZCcpICsgJy56Zi5hYmlkZSc7XG5cbiAgICB0aGlzW2dvb2RUb0dvID8gJ3JlbW92ZUVycm9yQ2xhc3NlcycgOiAnYWRkRXJyb3JDbGFzc2VzJ10oJGVsKTtcblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIGlucHV0IGlzIGRvbmUgY2hlY2tpbmcgZm9yIHZhbGlkYXRpb24uIEV2ZW50IHRyaWdnZXIgaXMgZWl0aGVyIGB2YWxpZC56Zi5hYmlkZWAgb3IgYGludmFsaWQuemYuYWJpZGVgXG4gICAgICogVHJpZ2dlciBpbmNsdWRlcyB0aGUgRE9NIGVsZW1lbnQgb2YgdGhlIGlucHV0LlxuICAgICAqIEBldmVudCBBYmlkZSN2YWxpZFxuICAgICAqIEBldmVudCBBYmlkZSNpbnZhbGlkXG4gICAgICovXG4gICAgJGVsLnRyaWdnZXIobWVzc2FnZSwgWyRlbF0pO1xuXG4gICAgcmV0dXJuIGdvb2RUb0dvO1xuICB9XG5cbiAgLyoqXG4gICAqIEdvZXMgdGhyb3VnaCBhIGZvcm0gYW5kIGlmIHRoZXJlIGFyZSBhbnkgaW52YWxpZCBpbnB1dHMsIGl0IHdpbGwgZGlzcGxheSB0aGUgZm9ybSBlcnJvciBlbGVtZW50XG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBub0Vycm9yIC0gdHJ1ZSBpZiBubyBlcnJvcnMgd2VyZSBkZXRlY3RlZC4uLlxuICAgKiBAZmlyZXMgQWJpZGUjZm9ybXZhbGlkXG4gICAqIEBmaXJlcyBBYmlkZSNmb3JtaW52YWxpZFxuICAgKi9cbiAgdmFsaWRhdGVGb3JtKCkge1xuICAgIHZhciBhY2MgPSBbXTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kaW5wdXRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICBhY2MucHVzaChfdGhpcy52YWxpZGF0ZUlucHV0KCQodGhpcykpKTtcbiAgICB9KTtcblxuICAgIHZhciBub0Vycm9yID0gYWNjLmluZGV4T2YoZmFsc2UpID09PSAtMTtcblxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJykuY3NzKCdkaXNwbGF5JywgKG5vRXJyb3IgPyAnbm9uZScgOiAnYmxvY2snKSk7XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBmb3JtIGlzIGZpbmlzaGVkIHZhbGlkYXRpbmcuIEV2ZW50IHRyaWdnZXIgaXMgZWl0aGVyIGBmb3JtdmFsaWQuemYuYWJpZGVgIG9yIGBmb3JtaW52YWxpZC56Zi5hYmlkZWAuXG4gICAgICogVHJpZ2dlciBpbmNsdWRlcyB0aGUgZWxlbWVudCBvZiB0aGUgZm9ybS5cbiAgICAgKiBAZXZlbnQgQWJpZGUjZm9ybXZhbGlkXG4gICAgICogQGV2ZW50IEFiaWRlI2Zvcm1pbnZhbGlkXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKChub0Vycm9yID8gJ2Zvcm12YWxpZCcgOiAnZm9ybWludmFsaWQnKSArICcuemYuYWJpZGUnLCBbdGhpcy4kZWxlbWVudF0pO1xuXG4gICAgcmV0dXJuIG5vRXJyb3I7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIGEgbm90IGEgdGV4dCBpbnB1dCBpcyB2YWxpZCBiYXNlZCBvbiB0aGUgcGF0dGVybiBzcGVjaWZpZWQgaW4gdGhlIGF0dHJpYnV0ZS4gSWYgbm8gbWF0Y2hpbmcgcGF0dGVybiBpcyBmb3VuZCwgcmV0dXJucyB0cnVlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byB2YWxpZGF0ZSwgc2hvdWxkIGJlIGEgdGV4dCBpbnB1dCBIVE1MIGVsZW1lbnRcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdHRlcm4gLSBzdHJpbmcgdmFsdWUgb2Ygb25lIG9mIHRoZSBSZWdFeCBwYXR0ZXJucyBpbiBBYmlkZS5vcHRpb25zLnBhdHRlcm5zXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBCb29sZWFuIHZhbHVlIGRlcGVuZHMgb24gd2hldGhlciBvciBub3QgdGhlIGlucHV0IHZhbHVlIG1hdGNoZXMgdGhlIHBhdHRlcm4gc3BlY2lmaWVkXG4gICAqL1xuICB2YWxpZGF0ZVRleHQoJGVsLCBwYXR0ZXJuKSB7XG4gICAgLy8gcGF0dGVybiA9IHBhdHRlcm4gPyBwYXR0ZXJuIDogJGVsLmF0dHIoJ3BhdHRlcm4nKSA/ICRlbC5hdHRyKCdwYXR0ZXJuJykgOiAkZWwuYXR0cigndHlwZScpO1xuICAgIHBhdHRlcm4gPSAocGF0dGVybiB8fCAkZWwuYXR0cigncGF0dGVybicpIHx8ICRlbC5hdHRyKCd0eXBlJykpO1xuICAgIHZhciBpbnB1dFRleHQgPSAkZWwudmFsKCk7XG5cbiAgICAvLyBpZiB0ZXh0LCBjaGVjayBpZiB0aGUgcGF0dGVybiBleGlzdHMsIGlmIHNvLCB0ZXN0IGl0LCBpZiBubyB0ZXh0IG9yIG5vIHBhdHRlcm4sIHJldHVybiB0cnVlLlxuICAgIHJldHVybiBpbnB1dFRleHQubGVuZ3RoID9cbiAgICAgIHRoaXMub3B0aW9ucy5wYXR0ZXJucy5oYXNPd25Qcm9wZXJ0eShwYXR0ZXJuKSA/IHRoaXMub3B0aW9ucy5wYXR0ZXJuc1twYXR0ZXJuXS50ZXN0KGlucHV0VGV4dCkgOlxuICAgICAgICBwYXR0ZXJuICYmIHBhdHRlcm4gIT09ICRlbC5hdHRyKCd0eXBlJykgP1xuICAgICAgICAgIG5ldyBSZWdFeHAocGF0dGVybikudGVzdChpbnB1dFRleHQpIDpcbiAgICAgICAgdHJ1ZSA6XG4gICAgICB0cnVlO1xuICAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgb3IgYSBub3QgYSByYWRpbyBpbnB1dCBpcyB2YWxpZCBiYXNlZCBvbiB3aGV0aGVyIG9yIG5vdCBpdCBpcyByZXF1aXJlZCBhbmQgc2VsZWN0ZWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IGdyb3VwTmFtZSAtIEEgc3RyaW5nIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lIG9mIGEgcmFkaW8gYnV0dG9uIGdyb3VwXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBCb29sZWFuIHZhbHVlIGRlcGVuZHMgb24gd2hldGhlciBvciBub3QgYXQgbGVhc3Qgb25lIHJhZGlvIGlucHV0IGhhcyBiZWVuIHNlbGVjdGVkIChpZiBpdCdzIHJlcXVpcmVkKVxuICAgKi9cbiAgdmFsaWRhdGVSYWRpbyhncm91cE5hbWUpIHtcbiAgICB2YXIgJGdyb3VwID0gdGhpcy4kZWxlbWVudC5maW5kKGA6cmFkaW9bbmFtZT1cIiR7Z3JvdXBOYW1lfVwiXWApLFxuICAgICAgICBjb3VudGVyID0gW10sXG4gICAgICAgIF90aGlzID0gdGhpcztcblxuICAgICRncm91cC5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcmRpbyA9ICQodGhpcyksXG4gICAgICAgICAgY2xlYXIgPSBfdGhpcy5yZXF1aXJlZENoZWNrKHJkaW8pO1xuICAgICAgY291bnRlci5wdXNoKGNsZWFyKTtcbiAgICAgIGlmKGNsZWFyKSBfdGhpcy5yZW1vdmVFcnJvckNsYXNzZXMocmRpbyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY291bnRlci5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiBhIHNlbGVjdGVkIGlucHV0IHBhc3NlcyBhIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uLiBNdWx0aXBsZSB2YWxpZGF0aW9ucyBjYW4gYmUgdXNlZCwgaWYgcGFzc2VkIHRvIHRoZSBlbGVtZW50IHdpdGggYGRhdGEtdmFsaWRhdG9yPVwiZm9vIGJhciBiYXpcImAgaW4gYSBzcGFjZSBzZXBhcmF0ZWQgbGlzdGVkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IGlucHV0IGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB2YWxpZGF0b3JzIC0gYSBzdHJpbmcgb2YgZnVuY3Rpb24gbmFtZXMgbWF0Y2hpbmcgZnVuY3Rpb25zIGluIHRoZSBBYmlkZS5vcHRpb25zLnZhbGlkYXRvcnMgb2JqZWN0LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHJlcXVpcmVkIC0gc2VsZiBleHBsYW5hdG9yeT9cbiAgICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiB2YWxpZGF0aW9ucyBwYXNzZWQuXG4gICAqL1xuICBtYXRjaFZhbGlkYXRpb24oJGVsLCB2YWxpZGF0b3JzLCByZXF1aXJlZCkge1xuICAgIHJlcXVpcmVkID0gcmVxdWlyZWQgPyB0cnVlIDogZmFsc2U7XG5cbiAgICB2YXIgY2xlYXIgPSB2YWxpZGF0b3JzLnNwbGl0KCcgJykubWFwKCh2KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnZhbGlkYXRvcnNbdl0oJGVsLCByZXF1aXJlZCwgJGVsLnBhcmVudCgpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY2xlYXIuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyBmb3JtIGlucHV0cyBhbmQgc3R5bGVzXG4gICAqIEBmaXJlcyBBYmlkZSNmb3JtcmVzZXRcbiAgICovXG4gIHJlc2V0Rm9ybSgpIHtcbiAgICB2YXIgJGZvcm0gPSB0aGlzLiRlbGVtZW50LFxuICAgICAgICBvcHRzID0gdGhpcy5vcHRpb25zO1xuXG4gICAgJChgLiR7b3B0cy5sYWJlbEVycm9yQ2xhc3N9YCwgJGZvcm0pLm5vdCgnc21hbGwnKS5yZW1vdmVDbGFzcyhvcHRzLmxhYmVsRXJyb3JDbGFzcyk7XG4gICAgJChgLiR7b3B0cy5pbnB1dEVycm9yQ2xhc3N9YCwgJGZvcm0pLm5vdCgnc21hbGwnKS5yZW1vdmVDbGFzcyhvcHRzLmlucHV0RXJyb3JDbGFzcyk7XG4gICAgJChgJHtvcHRzLmZvcm1FcnJvclNlbGVjdG9yfS4ke29wdHMuZm9ybUVycm9yQ2xhc3N9YCkucmVtb3ZlQ2xhc3Mob3B0cy5mb3JtRXJyb3JDbGFzcyk7XG4gICAgJGZvcm0uZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAkKCc6aW5wdXQnLCAkZm9ybSkubm90KCc6YnV0dG9uLCA6c3VibWl0LCA6cmVzZXQsIDpoaWRkZW4sIFtkYXRhLWFiaWRlLWlnbm9yZV0nKS52YWwoJycpLnJlbW92ZUF0dHIoJ2RhdGEtaW52YWxpZCcpO1xuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIGZvcm0gaGFzIGJlZW4gcmVzZXQuXG4gICAgICogQGV2ZW50IEFiaWRlI2Zvcm1yZXNldFxuICAgICAqL1xuICAgICRmb3JtLnRyaWdnZXIoJ2Zvcm1yZXNldC56Zi5hYmlkZScsIFskZm9ybV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIEFiaWRlLlxuICAgKiBSZW1vdmVzIGVycm9yIHN0eWxlcyBhbmQgY2xhc3NlcyBmcm9tIGVsZW1lbnRzLCB3aXRob3V0IHJlc2V0dGluZyB0aGVpciB2YWx1ZXMuXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLm9mZignLmFiaWRlJylcbiAgICAgIC5maW5kKCdbZGF0YS1hYmlkZS1lcnJvcl0nKVxuICAgICAgICAuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcblxuICAgIHRoaXMuJGlucHV0c1xuICAgICAgLm9mZignLmFiaWRlJylcbiAgICAgIC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5yZW1vdmVFcnJvckNsYXNzZXMoJCh0aGlzKSk7XG4gICAgICB9KTtcblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgc2V0dGluZ3MgZm9yIHBsdWdpblxuICovXG5BYmlkZS5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIFRoZSBkZWZhdWx0IGV2ZW50IHRvIHZhbGlkYXRlIGlucHV0cy4gQ2hlY2tib3hlcyBhbmQgcmFkaW9zIHZhbGlkYXRlIGltbWVkaWF0ZWx5LlxuICAgKiBSZW1vdmUgb3IgY2hhbmdlIHRoaXMgdmFsdWUgZm9yIG1hbnVhbCB2YWxpZGF0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdmaWVsZENoYW5nZSdcbiAgICovXG4gIHZhbGlkYXRlT246ICdmaWVsZENoYW5nZScsXG5cbiAgLyoqXG4gICAqIENsYXNzIHRvIGJlIGFwcGxpZWQgdG8gaW5wdXQgbGFiZWxzIG9uIGZhaWxlZCB2YWxpZGF0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdpcy1pbnZhbGlkLWxhYmVsJ1xuICAgKi9cbiAgbGFiZWxFcnJvckNsYXNzOiAnaXMtaW52YWxpZC1sYWJlbCcsXG5cbiAgLyoqXG4gICAqIENsYXNzIHRvIGJlIGFwcGxpZWQgdG8gaW5wdXRzIG9uIGZhaWxlZCB2YWxpZGF0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdpcy1pbnZhbGlkLWlucHV0J1xuICAgKi9cbiAgaW5wdXRFcnJvckNsYXNzOiAnaXMtaW52YWxpZC1pbnB1dCcsXG5cbiAgLyoqXG4gICAqIENsYXNzIHNlbGVjdG9yIHRvIHVzZSB0byB0YXJnZXQgRm9ybSBFcnJvcnMgZm9yIHNob3cvaGlkZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnLmZvcm0tZXJyb3InXG4gICAqL1xuICBmb3JtRXJyb3JTZWxlY3RvcjogJy5mb3JtLWVycm9yJyxcblxuICAvKipcbiAgICogQ2xhc3MgYWRkZWQgdG8gRm9ybSBFcnJvcnMgb24gZmFpbGVkIHZhbGlkYXRpb24uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2lzLXZpc2libGUnXG4gICAqL1xuICBmb3JtRXJyb3JDbGFzczogJ2lzLXZpc2libGUnLFxuXG4gIC8qKlxuICAgKiBTZXQgdG8gdHJ1ZSB0byB2YWxpZGF0ZSB0ZXh0IGlucHV0cyBvbiBhbnkgdmFsdWUgY2hhbmdlLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBsaXZlVmFsaWRhdGU6IGZhbHNlLFxuXG4gIHBhdHRlcm5zOiB7XG4gICAgYWxwaGEgOiAvXlthLXpBLVpdKyQvLFxuICAgIGFscGhhX251bWVyaWMgOiAvXlthLXpBLVowLTldKyQvLFxuICAgIGludGVnZXIgOiAvXlstK10/XFxkKyQvLFxuICAgIG51bWJlciA6IC9eWy0rXT9cXGQqKD86W1xcLlxcLF1cXGQrKT8kLyxcblxuICAgIC8vIGFtZXgsIHZpc2EsIGRpbmVyc1xuICAgIGNhcmQgOiAvXig/OjRbMC05XXsxMn0oPzpbMC05XXszfSk/fDVbMS01XVswLTldezE0fXw2KD86MDExfDVbMC05XVswLTldKVswLTldezEyfXwzWzQ3XVswLTldezEzfXwzKD86MFswLTVdfFs2OF1bMC05XSlbMC05XXsxMX18KD86MjEzMXwxODAwfDM1XFxkezN9KVxcZHsxMX0pJC8sXG4gICAgY3Z2IDogL14oWzAtOV0pezMsNH0kLyxcblxuICAgIC8vIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3N0YXRlcy1vZi10aGUtdHlwZS1hdHRyaWJ1dGUuaHRtbCN2YWxpZC1lLW1haWwtYWRkcmVzc1xuICAgIGVtYWlsIDogL15bYS16QS1aMC05LiEjJCUmJyorXFwvPT9eX2B7fH1+LV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykrJC8sXG5cbiAgICB1cmwgOiAvXihodHRwcz98ZnRwfGZpbGV8c3NoKTpcXC9cXC8oKCgoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OikqQCk/KCgoXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pKXwoKChbYS16QS1aXXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2EtekEtWl18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2EtekEtWl18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuKSsoKFthLXpBLVpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpBLVpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2EtekEtWl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4/KSg6XFxkKik/KShcXC8oKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApKyhcXC8oKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCkqKSopPyk/KFxcPygoKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8W1xcdUUwMDAtXFx1RjhGRl18XFwvfFxcPykqKT8oXFwjKCgoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKXxcXC98XFw/KSopPyQvLFxuICAgIC8vIGFiYy5kZVxuICAgIGRvbWFpbiA6IC9eKFthLXpBLVowLTldKFthLXpBLVowLTlcXC1dezAsNjF9W2EtekEtWjAtOV0pP1xcLikrW2EtekEtWl17Miw4fSQvLFxuXG4gICAgZGF0ZXRpbWUgOiAvXihbMC0yXVswLTldezN9KVxcLShbMC0xXVswLTldKVxcLShbMC0zXVswLTldKVQoWzAtNV1bMC05XSlcXDooWzAtNV1bMC05XSlcXDooWzAtNV1bMC05XSkoWnwoW1xcLVxcK10oWzAtMV1bMC05XSlcXDowMCkpJC8sXG4gICAgLy8gWVlZWS1NTS1ERFxuICAgIGRhdGUgOiAvKD86MTl8MjApWzAtOV17Mn0tKD86KD86MFsxLTldfDFbMC0yXSktKD86MFsxLTldfDFbMC05XXwyWzAtOV0pfCg/Oig/ITAyKSg/OjBbMS05XXwxWzAtMl0pLSg/OjMwKSl8KD86KD86MFsxMzU3OF18MVswMl0pLTMxKSkkLyxcbiAgICAvLyBISDpNTTpTU1xuICAgIHRpbWUgOiAvXigwWzAtOV18MVswLTldfDJbMC0zXSkoOlswLTVdWzAtOV0pezJ9JC8sXG4gICAgZGF0ZUlTTyA6IC9eXFxkezR9W1xcL1xcLV1cXGR7MSwyfVtcXC9cXC1dXFxkezEsMn0kLyxcbiAgICAvLyBNTS9ERC9ZWVlZXG4gICAgbW9udGhfZGF5X3llYXIgOiAvXigwWzEtOV18MVswMTJdKVstIFxcLy5dKDBbMS05XXxbMTJdWzAtOV18M1swMV0pWy0gXFwvLl1cXGR7NH0kLyxcbiAgICAvLyBERC9NTS9ZWVlZXG4gICAgZGF5X21vbnRoX3llYXIgOiAvXigwWzEtOV18WzEyXVswLTldfDNbMDFdKVstIFxcLy5dKDBbMS05XXwxWzAxMl0pWy0gXFwvLl1cXGR7NH0kLyxcblxuICAgIC8vICNGRkYgb3IgI0ZGRkZGRlxuICAgIGNvbG9yIDogL14jPyhbYS1mQS1GMC05XXs2fXxbYS1mQS1GMC05XXszfSkkL1xuICB9LFxuXG4gIC8qKlxuICAgKiBPcHRpb25hbCB2YWxpZGF0aW9uIGZ1bmN0aW9ucyB0byBiZSB1c2VkLiBgZXF1YWxUb2AgYmVpbmcgdGhlIG9ubHkgZGVmYXVsdCBpbmNsdWRlZCBmdW5jdGlvbi5cbiAgICogRnVuY3Rpb25zIHNob3VsZCByZXR1cm4gb25seSBhIGJvb2xlYW4gaWYgdGhlIGlucHV0IGlzIHZhbGlkIG9yIG5vdC4gRnVuY3Rpb25zIGFyZSBnaXZlbiB0aGUgZm9sbG93aW5nIGFyZ3VtZW50czpcbiAgICogZWwgOiBUaGUgalF1ZXJ5IGVsZW1lbnQgdG8gdmFsaWRhdGUuXG4gICAqIHJlcXVpcmVkIDogQm9vbGVhbiB2YWx1ZSBvZiB0aGUgcmVxdWlyZWQgYXR0cmlidXRlIGJlIHByZXNlbnQgb3Igbm90LlxuICAgKiBwYXJlbnQgOiBUaGUgZGlyZWN0IHBhcmVudCBvZiB0aGUgaW5wdXQuXG4gICAqIEBvcHRpb25cbiAgICovXG4gIHZhbGlkYXRvcnM6IHtcbiAgICBlcXVhbFRvOiBmdW5jdGlvbiAoZWwsIHJlcXVpcmVkLCBwYXJlbnQpIHtcbiAgICAgIHJldHVybiAkKGAjJHtlbC5hdHRyKCdkYXRhLWVxdWFsdG8nKX1gKS52YWwoKSA9PT0gZWwudmFsKCk7XG4gICAgfVxuICB9XG59XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihBYmlkZSwgJ0FiaWRlJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBBY2NvcmRpb24gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmFjY29yZGlvblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAqL1xuXG5jbGFzcyBBY2NvcmRpb24ge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBhY2NvcmRpb24uXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2luaXRcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhbiBhY2NvcmRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gYSBwbGFpbiBvYmplY3Qgd2l0aCBzZXR0aW5ncyB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBBY2NvcmRpb24uZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0FjY29yZGlvbicpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ0FjY29yZGlvbicsIHtcbiAgICAgICdFTlRFUic6ICd0b2dnbGUnLFxuICAgICAgJ1NQQUNFJzogJ3RvZ2dsZScsXG4gICAgICAnQVJST1dfRE9XTic6ICduZXh0JyxcbiAgICAgICdBUlJPV19VUCc6ICdwcmV2aW91cydcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgYWNjb3JkaW9uIGJ5IGFuaW1hdGluZyB0aGUgcHJlc2V0IGFjdGl2ZSBwYW5lKHMpLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdyb2xlJywgJ3RhYmxpc3QnKTtcbiAgICB0aGlzLiR0YWJzID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignbGknKTtcbiAgICBpZiAodGhpcy4kdGFicy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuJHRhYnMgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCdbZGF0YS1hY2NvcmRpb24taXRlbV0nKTtcbiAgICB9XG4gICAgdGhpcy4kdGFicy5lYWNoKGZ1bmN0aW9uKGlkeCwgZWwpe1xuXG4gICAgICB2YXIgJGVsID0gJChlbCksXG4gICAgICAgICAgJGNvbnRlbnQgPSAkZWwuZmluZCgnW2RhdGEtdGFiLWNvbnRlbnRdJyksXG4gICAgICAgICAgaWQgPSAkY29udGVudFswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdhY2NvcmRpb24nKSxcbiAgICAgICAgICBsaW5rSWQgPSBlbC5pZCB8fCBgJHtpZH0tbGFiZWxgO1xuXG4gICAgICAkZWwuZmluZCgnYTpmaXJzdCcpLmF0dHIoe1xuICAgICAgICAnYXJpYS1jb250cm9scyc6IGlkLFxuICAgICAgICAncm9sZSc6ICd0YWInLFxuICAgICAgICAnaWQnOiBsaW5rSWQsXG4gICAgICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogZmFsc2VcbiAgICAgIH0pO1xuICAgICAgJGNvbnRlbnQuYXR0cih7J3JvbGUnOiAndGFicGFuZWwnLCAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkLCAnYXJpYS1oaWRkZW4nOiB0cnVlLCAnaWQnOiBpZH0pO1xuICAgIH0pO1xuICAgIHZhciAkaW5pdEFjdGl2ZSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWFjdGl2ZScpLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcbiAgICBpZigkaW5pdEFjdGl2ZS5sZW5ndGgpe1xuICAgICAgdGhpcy5kb3duKCRpbml0QWN0aXZlLCB0cnVlKTtcbiAgICB9XG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSBhY2NvcmRpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiR0YWJzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpO1xuICAgICAgdmFyICR0YWJDb250ZW50ID0gJGVsZW0uY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgICAgaWYgKCR0YWJDb250ZW50Lmxlbmd0aCkge1xuICAgICAgICAkZWxlbS5jaGlsZHJlbignYScpLm9mZignY2xpY2suemYuYWNjb3JkaW9uIGtleWRvd24uemYuYWNjb3JkaW9uJylcbiAgICAgICAgICAgICAgIC5vbignY2xpY2suemYuYWNjb3JkaW9uJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAvLyAkKHRoaXMpLmNoaWxkcmVuKCdhJykub24oJ2NsaWNrLnpmLmFjY29yZGlvbicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgaWYgKCRlbGVtLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgICAgICAgaWYoX3RoaXMub3B0aW9ucy5hbGxvd0FsbENsb3NlZCB8fCAkZWxlbS5zaWJsaW5ncygpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSl7XG4gICAgICAgICAgICAgIF90aGlzLnVwKCR0YWJDb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBfdGhpcy5kb3duKCR0YWJDb250ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLm9uKCdrZXlkb3duLnpmLmFjY29yZGlvbicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdBY2NvcmRpb24nLCB7XG4gICAgICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBfdGhpcy50b2dnbGUoJHRhYkNvbnRlbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAkZWxlbS5uZXh0KCkuZmluZCgnYScpLmZvY3VzKCkudHJpZ2dlcignY2xpY2suemYuYWNjb3JkaW9uJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAkZWxlbS5wcmV2KCkuZmluZCgnYScpLmZvY3VzKCkudHJpZ2dlcignY2xpY2suemYuYWNjb3JkaW9uJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgc2VsZWN0ZWQgY29udGVudCBwYW5lJ3Mgb3Blbi9jbG9zZSBzdGF0ZS5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBqUXVlcnkgb2JqZWN0IG9mIHRoZSBwYW5lIHRvIHRvZ2dsZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICB0b2dnbGUoJHRhcmdldCkge1xuICAgIGlmKCR0YXJnZXQucGFyZW50KCkuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICBpZih0aGlzLm9wdGlvbnMuYWxsb3dBbGxDbG9zZWQgfHwgJHRhcmdldC5wYXJlbnQoKS5zaWJsaW5ncygpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSl7XG4gICAgICAgIHRoaXMudXAoJHRhcmdldCk7XG4gICAgICB9IGVsc2UgeyByZXR1cm47IH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb3duKCR0YXJnZXQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgYWNjb3JkaW9uIHRhYiBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBBY2NvcmRpb24gcGFuZSB0byBvcGVuLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGZpcnN0VGltZSAtIGZsYWcgdG8gZGV0ZXJtaW5lIGlmIHJlZmxvdyBzaG91bGQgaGFwcGVuLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2Rvd25cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkb3duKCR0YXJnZXQsIGZpcnN0VGltZSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgaWYoIXRoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCAmJiAhZmlyc3RUaW1lKXtcbiAgICAgIHZhciAkY3VycmVudEFjdGl2ZSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWFjdGl2ZScpLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcbiAgICAgIGlmKCRjdXJyZW50QWN0aXZlLmxlbmd0aCl7XG4gICAgICAgIHRoaXMudXAoJGN1cnJlbnRBY3RpdmUpO1xuICAgICAgfVxuICAgIH1cblxuICAgICR0YXJnZXRcbiAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKVxuICAgICAgLnBhcmVudCgnW2RhdGEtdGFiLWNvbnRlbnRdJylcbiAgICAgIC5hZGRCYWNrKClcbiAgICAgIC5wYXJlbnQoKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAvLyBGb3VuZGF0aW9uLk1vdmUoX3RoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAkdGFyZ2V0LCBmdW5jdGlvbigpe1xuICAgICAgJHRhcmdldC5zbGlkZURvd24oX3RoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB0YWIgaXMgZG9uZSBvcGVuaW5nLlxuICAgICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uI2Rvd25cbiAgICAgICAgICovXG4gICAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Rvd24uemYuYWNjb3JkaW9uJywgWyR0YXJnZXRdKTtcbiAgICAgIH0pO1xuICAgIC8vIH0pO1xuXG4gICAgLy8gaWYoIWZpcnN0VGltZSl7XG4gICAgLy8gICBGb3VuZGF0aW9uLl9yZWZsb3codGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLWFjY29yZGlvbicpKTtcbiAgICAvLyB9XG4gICAgJChgIyR7JHRhcmdldC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKX1gKS5hdHRyKHtcbiAgICAgICdhcmlhLWV4cGFuZGVkJzogdHJ1ZSxcbiAgICAgICdhcmlhLXNlbGVjdGVkJzogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgdGFiIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIEFjY29yZGlvbiB0YWIgdG8gY2xvc2UuXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jdXBcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICB1cCgkdGFyZ2V0KSB7XG4gICAgdmFyICRhdW50cyA9ICR0YXJnZXQucGFyZW50KCkuc2libGluZ3MoKSxcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBjYW5DbG9zZSA9IHRoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCA/ICRhdW50cy5oYXNDbGFzcygnaXMtYWN0aXZlJykgOiAkdGFyZ2V0LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKTtcblxuICAgIGlmKCF0aGlzLm9wdGlvbnMuYWxsb3dBbGxDbG9zZWQgJiYgIWNhbkNsb3NlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRm91bmRhdGlvbi5Nb3ZlKHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAkdGFyZ2V0LCBmdW5jdGlvbigpe1xuICAgICAgJHRhcmdldC5zbGlkZVVwKF90aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgdGFiIGlzIGRvbmUgY29sbGFwc2luZyB1cC5cbiAgICAgICAgICogQGV2ZW50IEFjY29yZGlvbiN1cFxuICAgICAgICAgKi9cbiAgICAgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcigndXAuemYuYWNjb3JkaW9uJywgWyR0YXJnZXRdKTtcbiAgICAgIH0pO1xuICAgIC8vIH0pO1xuXG4gICAgJHRhcmdldC5hdHRyKCdhcmlhLWhpZGRlbicsIHRydWUpXG4gICAgICAgICAgIC5wYXJlbnQoKS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAkKGAjJHskdGFyZ2V0LmF0dHIoJ2FyaWEtbGFiZWxsZWRieScpfWApLmF0dHIoe1xuICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxuICAgICAnYXJpYS1zZWxlY3RlZCc6IGZhbHNlXG4gICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBhbiBhY2NvcmRpb24uXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jZGVzdHJveWVkXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXRhYi1jb250ZW50XScpLnNsaWRlVXAoMCkuY3NzKCdkaXNwbGF5JywgJycpO1xuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnYScpLm9mZignLnpmLmFjY29yZGlvbicpO1xuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbkFjY29yZGlvbi5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIHRvIGFuaW1hdGUgdGhlIG9wZW5pbmcgb2YgYW4gYWNjb3JkaW9uIHBhbmUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgMjUwXG4gICAqL1xuICBzbGlkZVNwZWVkOiAyNTAsXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgYWNjb3JkaW9uIHRvIGhhdmUgbXVsdGlwbGUgb3BlbiBwYW5lcy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgbXVsdGlFeHBhbmQ6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIGFjY29yZGlvbiB0byBjbG9zZSBhbGwgcGFuZXMuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGFsbG93QWxsQ2xvc2VkOiBmYWxzZVxufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKEFjY29yZGlvbiwgJ0FjY29yZGlvbicpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogQWNjb3JkaW9uTWVudSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uYWNjb3JkaW9uTWVudVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubmVzdFxuICovXG5cbmNsYXNzIEFjY29yZGlvbk1lbnUge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBhY2NvcmRpb24gbWVudS5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBBY2NvcmRpb25NZW51I2luaXRcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhbiBhY2NvcmRpb24gbWVudS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBBY2NvcmRpb25NZW51LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICBGb3VuZGF0aW9uLk5lc3QuRmVhdGhlcih0aGlzLiRlbGVtZW50LCAnYWNjb3JkaW9uJyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdBY2NvcmRpb25NZW51Jyk7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignQWNjb3JkaW9uTWVudScsIHtcbiAgICAgICdFTlRFUic6ICd0b2dnbGUnLFxuICAgICAgJ1NQQUNFJzogJ3RvZ2dsZScsXG4gICAgICAnQVJST1dfUklHSFQnOiAnb3BlbicsXG4gICAgICAnQVJST1dfVVAnOiAndXAnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnZG93bicsXG4gICAgICAnQVJST1dfTEVGVCc6ICdjbG9zZScsXG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlQWxsJyxcbiAgICAgICdUQUInOiAnZG93bicsXG4gICAgICAnU0hJRlRfVEFCJzogJ3VwJ1xuICAgIH0pO1xuICB9XG5cblxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgYWNjb3JkaW9uIG1lbnUgYnkgaGlkaW5nIGFsbCBuZXN0ZWQgbWVudXMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXN1Ym1lbnVdJykubm90KCcuaXMtYWN0aXZlJykuc2xpZGVVcCgwKTsvLy5maW5kKCdhJykuY3NzKCdwYWRkaW5nLWxlZnQnLCAnMXJlbScpO1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cih7XG4gICAgICAncm9sZSc6ICd0YWJsaXN0JyxcbiAgICAgICdhcmlhLW11bHRpc2VsZWN0YWJsZSc6IHRoaXMub3B0aW9ucy5tdWx0aU9wZW5cbiAgICB9KTtcblxuICAgIHRoaXMuJG1lbnVMaW5rcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWFjY29yZGlvbi1zdWJtZW51LXBhcmVudCcpO1xuICAgIHRoaXMuJG1lbnVMaW5rcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbGlua0lkID0gdGhpcy5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdhY2MtbWVudS1saW5rJyksXG4gICAgICAgICAgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRzdWIgPSAkZWxlbS5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKSxcbiAgICAgICAgICBzdWJJZCA9ICRzdWJbMF0uaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnYWNjLW1lbnUnKSxcbiAgICAgICAgICBpc0FjdGl2ZSA9ICRzdWIuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgJGVsZW0uYXR0cih7XG4gICAgICAgICdhcmlhLWNvbnRyb2xzJzogc3ViSWQsXG4gICAgICAgICdhcmlhLWV4cGFuZGVkJzogaXNBY3RpdmUsXG4gICAgICAgICdyb2xlJzogJ3RhYicsXG4gICAgICAgICdpZCc6IGxpbmtJZFxuICAgICAgfSk7XG4gICAgICAkc3ViLmF0dHIoe1xuICAgICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkLFxuICAgICAgICAnYXJpYS1oaWRkZW4nOiAhaXNBY3RpdmUsXG4gICAgICAgICdyb2xlJzogJ3RhYnBhbmVsJyxcbiAgICAgICAgJ2lkJzogc3ViSWRcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHZhciBpbml0UGFuZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pcy1hY3RpdmUnKTtcbiAgICBpZihpbml0UGFuZXMubGVuZ3RoKXtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICBpbml0UGFuZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICBfdGhpcy5kb3duKCQodGhpcykpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX2V2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgbWVudS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnbGknKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRzdWJtZW51ID0gJCh0aGlzKS5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKTtcblxuICAgICAgaWYgKCRzdWJtZW51Lmxlbmd0aCkge1xuICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCdhJykub2ZmKCdjbGljay56Zi5hY2NvcmRpb25NZW51Jykub24oJ2NsaWNrLnpmLmFjY29yZGlvbk1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgX3RoaXMudG9nZ2xlKCRzdWJtZW51KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSkub24oJ2tleWRvd24uemYuYWNjb3JkaW9ubWVudScsIGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICAkZWxlbWVudHMgPSAkZWxlbWVudC5wYXJlbnQoJ3VsJykuY2hpbGRyZW4oJ2xpJyksXG4gICAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAgICRuZXh0RWxlbWVudCxcbiAgICAgICAgICAkdGFyZ2V0ID0gJGVsZW1lbnQuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJyk7XG5cbiAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgaWYgKCQodGhpcykuaXMoJGVsZW1lbnQpKSB7XG4gICAgICAgICAgJHByZXZFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWF4KDAsIGktMSkpO1xuICAgICAgICAgICRuZXh0RWxlbWVudCA9ICRlbGVtZW50cy5lcShNYXRoLm1pbihpKzEsICRlbGVtZW50cy5sZW5ndGgtMSkpO1xuXG4gICAgICAgICAgaWYgKCQodGhpcykuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdOnZpc2libGUnKS5sZW5ndGgpIHsgLy8gaGFzIG9wZW4gc3ViIG1lbnVcbiAgICAgICAgICAgICRuZXh0RWxlbWVudCA9ICRlbGVtZW50LmZpbmQoJ2xpOmZpcnN0LWNoaWxkJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgkKHRoaXMpLmlzKCc6Zmlyc3QtY2hpbGQnKSkgeyAvLyBpcyBmaXJzdCBlbGVtZW50IG9mIHN1YiBtZW51XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudC5wYXJlbnRzKCdsaScpLmZpcnN0KCk7XG4gICAgICAgICAgfSBlbHNlIGlmICgkcHJldkVsZW1lbnQuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdOnZpc2libGUnKS5sZW5ndGgpIHsgLy8gaWYgcHJldmlvdXMgZWxlbWVudCBoYXMgb3BlbiBzdWIgbWVudVxuICAgICAgICAgICAgJHByZXZFbGVtZW50ID0gJHByZXZFbGVtZW50LmZpbmQoJ2xpOmxhc3QtY2hpbGQnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCQodGhpcykuaXMoJzpsYXN0LWNoaWxkJykpIHsgLy8gaXMgbGFzdCBlbGVtZW50IG9mIHN1YiBtZW51XG4gICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudC5wYXJlbnRzKCdsaScpLmZpcnN0KCkubmV4dCgnbGknKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0FjY29yZGlvbk1lbnUnLCB7XG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICgkdGFyZ2V0LmlzKCc6aGlkZGVuJykpIHtcbiAgICAgICAgICAgIF90aGlzLmRvd24oJHRhcmdldCk7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJ2xpJykuZmlyc3QoKS5mb2N1cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICgkdGFyZ2V0Lmxlbmd0aCAmJiAhJHRhcmdldC5pcygnOmhpZGRlbicpKSB7IC8vIGNsb3NlIGFjdGl2ZSBzdWIgb2YgdGhpcyBpdGVtXG4gICAgICAgICAgICBfdGhpcy51cCgkdGFyZ2V0KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCRlbGVtZW50LnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpIHsgLy8gY2xvc2UgY3VycmVudGx5IG9wZW4gc3ViXG4gICAgICAgICAgICBfdGhpcy51cCgkZWxlbWVudC5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykpO1xuICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50cygnbGknKS5maXJzdCgpLmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJHByZXZFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRuZXh0RWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9LFxuICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICgkZWxlbWVudC5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIF90aGlzLnRvZ2dsZSgkZWxlbWVudC5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjbG9zZUFsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuaGlkZUFsbCgpO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7Ly8uYXR0cigndGFiaW5kZXgnLCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgYWxsIHBhbmVzIG9mIHRoZSBtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGhpZGVBbGwoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1zdWJtZW51XScpLnNsaWRlVXAodGhpcy5vcHRpb25zLnNsaWRlU3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIG9wZW4vY2xvc2Ugc3RhdGUgb2YgYSBzdWJtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSB0aGUgc3VibWVudSB0byB0b2dnbGVcbiAgICovXG4gIHRvZ2dsZSgkdGFyZ2V0KXtcbiAgICBpZighJHRhcmdldC5pcygnOmFuaW1hdGVkJykpIHtcbiAgICAgIGlmICghJHRhcmdldC5pcygnOmhpZGRlbicpKSB7XG4gICAgICAgIHRoaXMudXAoJHRhcmdldCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5kb3duKCR0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgc3ViLW1lbnUgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gU3ViLW1lbnUgdG8gb3Blbi5cbiAgICogQGZpcmVzIEFjY29yZGlvbk1lbnUjZG93blxuICAgKi9cbiAgZG93bigkdGFyZ2V0KSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmKCF0aGlzLm9wdGlvbnMubXVsdGlPcGVuKSB7XG4gICAgICB0aGlzLnVwKHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWFjdGl2ZScpLm5vdCgkdGFyZ2V0LnBhcmVudHNVbnRpbCh0aGlzLiRlbGVtZW50KS5hZGQoJHRhcmdldCkpKTtcbiAgICB9XG5cbiAgICAkdGFyZ2V0LmFkZENsYXNzKCdpcy1hY3RpdmUnKS5hdHRyKHsnYXJpYS1oaWRkZW4nOiBmYWxzZX0pXG4gICAgICAucGFyZW50KCcuaXMtYWNjb3JkaW9uLXN1Ym1lbnUtcGFyZW50JykuYXR0cih7J2FyaWEtZXhwYW5kZWQnOiB0cnVlfSk7XG5cbiAgICAgIEZvdW5kYXRpb24uTW92ZSh0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgJHRhcmdldCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICR0YXJnZXQuc2xpZGVEb3duKF90aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1lbnUgaXMgZG9uZSBvcGVuaW5nLlxuICAgICAgICAgICAqIEBldmVudCBBY2NvcmRpb25NZW51I2Rvd25cbiAgICAgICAgICAgKi9cbiAgICAgICAgICBfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdkb3duLnpmLmFjY29yZGlvbk1lbnUnLCBbJHRhcmdldF0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgc3ViLW1lbnUgZGVmaW5lZCBieSBgJHRhcmdldGAuIEFsbCBzdWItbWVudXMgaW5zaWRlIHRoZSB0YXJnZXQgd2lsbCBiZSBjbG9zZWQgYXMgd2VsbC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBTdWItbWVudSB0byBjbG9zZS5cbiAgICogQGZpcmVzIEFjY29yZGlvbk1lbnUjdXBcbiAgICovXG4gIHVwKCR0YXJnZXQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIEZvdW5kYXRpb24uTW92ZSh0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgJHRhcmdldCwgZnVuY3Rpb24oKXtcbiAgICAgICR0YXJnZXQuc2xpZGVVcChfdGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1lbnUgaXMgZG9uZSBjb2xsYXBzaW5nIHVwLlxuICAgICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uTWVudSN1cFxuICAgICAgICAgKi9cbiAgICAgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcigndXAuemYuYWNjb3JkaW9uTWVudScsIFskdGFyZ2V0XSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciAkbWVudXMgPSAkdGFyZ2V0LmZpbmQoJ1tkYXRhLXN1Ym1lbnVdJykuc2xpZGVVcCgwKS5hZGRCYWNrKCkuYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKTtcblxuICAgICRtZW51cy5wYXJlbnQoJy5pcy1hY2NvcmRpb24tc3VibWVudS1wYXJlbnQnKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGFjY29yZGlvbiBtZW51LlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uTWVudSNkZXN0cm95ZWRcbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1zdWJtZW51XScpLnNsaWRlRG93bigwKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdhJykub2ZmKCdjbGljay56Zi5hY2NvcmRpb25NZW51Jyk7XG5cbiAgICBGb3VuZGF0aW9uLk5lc3QuQnVybih0aGlzLiRlbGVtZW50LCAnYWNjb3JkaW9uJyk7XG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbkFjY29yZGlvbk1lbnUuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSB0byBhbmltYXRlIHRoZSBvcGVuaW5nIG9mIGEgc3VibWVudSBpbiBtcy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAyNTBcbiAgICovXG4gIHNsaWRlU3BlZWQ6IDI1MCxcbiAgLyoqXG4gICAqIEFsbG93IHRoZSBtZW51IHRvIGhhdmUgbXVsdGlwbGUgb3BlbiBwYW5lcy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBtdWx0aU9wZW46IHRydWVcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihBY2NvcmRpb25NZW51LCAnQWNjb3JkaW9uTWVudScpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogRHJpbGxkb3duIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5kcmlsbGRvd25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm5lc3RcbiAqL1xuXG5jbGFzcyBEcmlsbGRvd24ge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIGRyaWxsZG93biBtZW51LlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhbiBhY2NvcmRpb24gbWVudS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBEcmlsbGRvd24uZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIEZvdW5kYXRpb24uTmVzdC5GZWF0aGVyKHRoaXMuJGVsZW1lbnQsICdkcmlsbGRvd24nKTtcblxuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0RyaWxsZG93bicpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ0RyaWxsZG93bicsIHtcbiAgICAgICdFTlRFUic6ICdvcGVuJyxcbiAgICAgICdTUEFDRSc6ICdvcGVuJyxcbiAgICAgICdBUlJPV19SSUdIVCc6ICduZXh0JyxcbiAgICAgICdBUlJPV19VUCc6ICd1cCcsXG4gICAgICAnQVJST1dfRE9XTic6ICdkb3duJyxcbiAgICAgICdBUlJPV19MRUZUJzogJ3ByZXZpb3VzJyxcbiAgICAgICdFU0NBUEUnOiAnY2xvc2UnLFxuICAgICAgJ1RBQic6ICdkb3duJyxcbiAgICAgICdTSElGVF9UQUInOiAndXAnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGRyaWxsZG93biBieSBjcmVhdGluZyBqUXVlcnkgY29sbGVjdGlvbnMgb2YgZWxlbWVudHNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuJHN1Ym1lbnVBbmNob3JzID0gdGhpcy4kZWxlbWVudC5maW5kKCdsaS5pcy1kcmlsbGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICB0aGlzLiRzdWJtZW51cyA9IHRoaXMuJHN1Ym1lbnVBbmNob3JzLmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpO1xuICAgIHRoaXMuJG1lbnVJdGVtcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGknKS5ub3QoJy5qcy1kcmlsbGRvd24tYmFjaycpLmF0dHIoJ3JvbGUnLCAnbWVudWl0ZW0nKTtcblxuICAgIHRoaXMuX3ByZXBhcmVNZW51KCk7XG5cbiAgICB0aGlzLl9rZXlib2FyZEV2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIHByZXBhcmVzIGRyaWxsZG93biBtZW51IGJ5IHNldHRpbmcgYXR0cmlidXRlcyB0byBsaW5rcyBhbmQgZWxlbWVudHNcbiAgICogc2V0cyBhIG1pbiBoZWlnaHQgdG8gcHJldmVudCBjb250ZW50IGp1bXBpbmdcbiAgICogd3JhcHMgdGhlIGVsZW1lbnQgaWYgbm90IGFscmVhZHkgd3JhcHBlZFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9wcmVwYXJlTWVudSgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIC8vIGlmKCF0aGlzLm9wdGlvbnMuaG9sZE9wZW4pe1xuICAgIC8vICAgdGhpcy5fbWVudUxpbmtFdmVudHMoKTtcbiAgICAvLyB9XG4gICAgdGhpcy4kc3VibWVudUFuY2hvcnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyICRzdWIgPSAkKHRoaXMpO1xuICAgICAgdmFyICRsaW5rID0gJHN1Yi5maW5kKCdhOmZpcnN0Jyk7XG4gICAgICBpZihfdGhpcy5vcHRpb25zLnBhcmVudExpbmspe1xuICAgICAgICAkbGluay5jbG9uZSgpLnByZXBlbmRUbygkc3ViLmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpKS53cmFwKCc8bGkgY2xhc3M9XCJpcy1zdWJtZW51LXBhcmVudC1pdGVtIGlzLXN1Ym1lbnUtaXRlbSBpcy1kcmlsbGRvd24tc3VibWVudS1pdGVtXCIgcm9sZT1cIm1lbnUtaXRlbVwiPjwvbGk+Jyk7XG4gICAgICB9XG4gICAgICAkbGluay5kYXRhKCdzYXZlZEhyZWYnLCAkbGluay5hdHRyKCdocmVmJykpLnJlbW92ZUF0dHIoJ2hyZWYnKTtcbiAgICAgICRzdWIuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJylcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiB0cnVlLFxuICAgICAgICAgICAgJ3RhYmluZGV4JzogMCxcbiAgICAgICAgICAgICdyb2xlJzogJ21lbnUnXG4gICAgICAgICAgfSk7XG4gICAgICBfdGhpcy5fZXZlbnRzKCRzdWIpO1xuICAgIH0pO1xuICAgIHRoaXMuJHN1Ym1lbnVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkbWVudSA9ICQodGhpcyksXG4gICAgICAgICAgJGJhY2sgPSAkbWVudS5maW5kKCcuanMtZHJpbGxkb3duLWJhY2snKTtcbiAgICAgIGlmKCEkYmFjay5sZW5ndGgpe1xuICAgICAgICAkbWVudS5wcmVwZW5kKF90aGlzLm9wdGlvbnMuYmFja0J1dHRvbik7XG4gICAgICB9XG4gICAgICBfdGhpcy5fYmFjaygkbWVudSk7XG4gICAgfSk7XG4gICAgaWYoIXRoaXMuJGVsZW1lbnQucGFyZW50KCkuaGFzQ2xhc3MoJ2lzLWRyaWxsZG93bicpKXtcbiAgICAgIHRoaXMuJHdyYXBwZXIgPSAkKHRoaXMub3B0aW9ucy53cmFwcGVyKS5hZGRDbGFzcygnaXMtZHJpbGxkb3duJykuY3NzKHRoaXMuX2dldE1heERpbXMoKSk7XG4gICAgICB0aGlzLiRlbGVtZW50LndyYXAodGhpcy4kd3JhcHBlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgdG8gZWxlbWVudHMgaW4gdGhlIG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSB0aGUgY3VycmVudCBtZW51IGl0ZW0gdG8gYWRkIGhhbmRsZXJzIHRvLlxuICAgKi9cbiAgX2V2ZW50cygkZWxlbSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAkZWxlbS5vZmYoJ2NsaWNrLnpmLmRyaWxsZG93bicpXG4gICAgLm9uKCdjbGljay56Zi5kcmlsbGRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgIGlmKCQoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCAnbGknKS5oYXNDbGFzcygnaXMtZHJpbGxkb3duLXN1Ym1lbnUtcGFyZW50Jykpe1xuICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmKGUudGFyZ2V0ICE9PSBlLmN1cnJlbnRUYXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQpe1xuICAgICAgLy8gICByZXR1cm4gZmFsc2U7XG4gICAgICAvLyB9XG4gICAgICBfdGhpcy5fc2hvdygkZWxlbSk7XG5cbiAgICAgIGlmKF90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKXtcbiAgICAgICAgdmFyICRib2R5ID0gJCgnYm9keScpLm5vdChfdGhpcy4kd3JhcHBlcik7XG4gICAgICAgICRib2R5Lm9mZignLnpmLmRyaWxsZG93bicpLm9uKCdjbGljay56Zi5kcmlsbGRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgX3RoaXMuX2hpZGVBbGwoKTtcbiAgICAgICAgICAkYm9keS5vZmYoJy56Zi5kcmlsbGRvd24nKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBrZXlkb3duIGV2ZW50IGxpc3RlbmVyIHRvIGBsaWAncyBpbiB0aGUgbWVudS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9rZXlib2FyZEV2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuJG1lbnVJdGVtcy5hZGQodGhpcy4kZWxlbWVudC5maW5kKCcuanMtZHJpbGxkb3duLWJhY2snKSkub24oJ2tleWRvd24uemYuZHJpbGxkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAgICRlbGVtZW50cyA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5jaGlsZHJlbignbGknKSxcbiAgICAgICAgICAkcHJldkVsZW1lbnQsXG4gICAgICAgICAgJG5leHRFbGVtZW50O1xuXG4gICAgICAkZWxlbWVudHMuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgIGlmICgkKHRoaXMpLmlzKCRlbGVtZW50KSkge1xuICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50cy5lcShNYXRoLm1heCgwLCBpLTEpKTtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5taW4oaSsxLCAkZWxlbWVudHMubGVuZ3RoLTEpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0RyaWxsZG93bicsIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCRlbGVtZW50LmlzKF90aGlzLiRzdWJtZW51QW5jaG9ycykpIHtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtZW50KTtcbiAgICAgICAgICAgICRlbGVtZW50Lm9uKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJ3VsIGxpJykuZmlsdGVyKF90aGlzLiRtZW51SXRlbXMpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLl9oaWRlKCRlbGVtZW50LnBhcmVudCgndWwnKSk7XG4gICAgICAgICAgJGVsZW1lbnQucGFyZW50KCd1bCcpLm9uKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAkZWxlbWVudC5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpLmZvY3VzKCk7XG4gICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgdXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRwcmV2RWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9LFxuICAgICAgICBkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLl9iYWNrKCk7XG4gICAgICAgICAgLy9fdGhpcy4kbWVudUl0ZW1zLmZpcnN0KCkuZm9jdXMoKTsgLy8gZm9jdXMgdG8gZmlyc3QgZWxlbWVudFxuICAgICAgICB9LFxuICAgICAgICBvcGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoISRlbGVtZW50LmlzKF90aGlzLiRtZW51SXRlbXMpKSB7IC8vIG5vdCBtZW51IGl0ZW0gbWVhbnMgYmFjayBidXR0b25cbiAgICAgICAgICAgIF90aGlzLl9oaWRlKCRlbGVtZW50LnBhcmVudCgndWwnKSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7JGVsZW1lbnQucGFyZW50KCd1bCcpLnBhcmVudCgnbGknKS5mb2N1cygpO30sIDEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoJGVsZW1lbnQuaXMoX3RoaXMuJHN1Ym1lbnVBbmNob3JzKSkge1xuICAgICAgICAgICAgX3RoaXMuX3Nob3coJGVsZW1lbnQpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyRlbGVtZW50LmZpbmQoJ3VsIGxpJykuZmlsdGVyKF90aGlzLiRtZW51SXRlbXMpLmZpcnN0KCkuZm9jdXMoKTt9LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTsgLy8gZW5kIGtleWJvYXJkQWNjZXNzXG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIGFsbCBvcGVuIGVsZW1lbnRzLCBhbmQgcmV0dXJucyB0byByb290IG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgRHJpbGxkb3duI2Nsb3NlZFxuICAgKi9cbiAgX2hpZGVBbGwoKSB7XG4gICAgdmFyICRlbGVtID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXMtZHJpbGxkb3duLXN1Ym1lbnUuaXMtYWN0aXZlJykuYWRkQ2xhc3MoJ2lzLWNsb3NpbmcnKTtcbiAgICAkZWxlbS5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKCRlbGVtKSwgZnVuY3Rpb24oZSl7XG4gICAgICAkZWxlbS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLWNsb3NpbmcnKTtcbiAgICB9KTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1lbnUgaXMgZnVsbHkgY2xvc2VkLlxuICAgICAgICAgKiBAZXZlbnQgRHJpbGxkb3duI2Nsb3NlZFxuICAgICAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Nsb3NlZC56Zi5kcmlsbGRvd24nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVyIGZvciBlYWNoIGBiYWNrYCBidXR0b24sIGFuZCBjbG9zZXMgb3BlbiBtZW51cy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBmaXJlcyBEcmlsbGRvd24jYmFja1xuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSB0aGUgY3VycmVudCBzdWItbWVudSB0byBhZGQgYGJhY2tgIGV2ZW50LlxuICAgKi9cbiAgX2JhY2soJGVsZW0pIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICRlbGVtLm9mZignY2xpY2suemYuZHJpbGxkb3duJyk7XG4gICAgJGVsZW0uY2hpbGRyZW4oJy5qcy1kcmlsbGRvd24tYmFjaycpXG4gICAgICAub24oJ2NsaWNrLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnbW91c2V1cCBvbiBiYWNrJyk7XG4gICAgICAgIF90aGlzLl9oaWRlKCRlbGVtKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgbGlzdGVuZXIgdG8gbWVudSBpdGVtcyB3L28gc3VibWVudXMgdG8gY2xvc2Ugb3BlbiBtZW51cyBvbiBjbGljay5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfbWVudUxpbmtFdmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLiRtZW51SXRlbXMubm90KCcuaXMtZHJpbGxkb3duLXN1Ym1lbnUtcGFyZW50JylcbiAgICAgICAgLm9mZignY2xpY2suemYuZHJpbGxkb3duJylcbiAgICAgICAgLm9uKCdjbGljay56Zi5kcmlsbGRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAvLyBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIF90aGlzLl9oaWRlQWxsKCk7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyBhIHN1Ym1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgRHJpbGxkb3duI29wZW5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtIC0gdGhlIGN1cnJlbnQgZWxlbWVudCB3aXRoIGEgc3VibWVudSB0byBvcGVuLlxuICAgKi9cbiAgX3Nob3coJGVsZW0pIHtcbiAgICAkZWxlbS5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ29wZW4uemYuZHJpbGxkb3duJywgWyRlbGVtXSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhpZGVzIGEgc3VibWVudVxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIERyaWxsZG93biNoaWRlXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIHRoZSBjdXJyZW50IHN1Yi1tZW51IHRvIGhpZGUuXG4gICAqL1xuICBfaGlkZSgkZWxlbSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgJGVsZW0uYWRkQ2xhc3MoJ2lzLWNsb3NpbmcnKVxuICAgICAgICAgLm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoJGVsZW0pLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAkZWxlbS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLWNsb3NpbmcnKTtcbiAgICAgICAgICAgJGVsZW0uYmx1cigpO1xuICAgICAgICAgfSk7XG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgc3VibWVudSBpcyBoYXMgY2xvc2VkLlxuICAgICAqIEBldmVudCBEcmlsbGRvd24jaGlkZVxuICAgICAqL1xuICAgICRlbGVtLnRyaWdnZXIoJ2hpZGUuemYuZHJpbGxkb3duJywgWyRlbGVtXSk7XG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZXMgdGhyb3VnaCB0aGUgbmVzdGVkIG1lbnVzIHRvIGNhbGN1bGF0ZSB0aGUgbWluLWhlaWdodCwgYW5kIG1heC13aWR0aCBmb3IgdGhlIG1lbnUuXG4gICAqIFByZXZlbnRzIGNvbnRlbnQganVtcGluZy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZ2V0TWF4RGltcygpIHtcbiAgICB2YXIgbWF4ID0gMCwgcmVzdWx0ID0ge307XG4gICAgdGhpcy4kc3VibWVudXMuYWRkKHRoaXMuJGVsZW1lbnQpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciBudW1PZkVsZW1zID0gJCh0aGlzKS5jaGlsZHJlbignbGknKS5sZW5ndGg7XG4gICAgICBtYXggPSBudW1PZkVsZW1zID4gbWF4ID8gbnVtT2ZFbGVtcyA6IG1heDtcbiAgICB9KTtcblxuICAgIHJlc3VsdFsnbWluLWhlaWdodCddID0gYCR7bWF4ICogdGhpcy4kbWVudUl0ZW1zWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodH1weGA7XG4gICAgcmVzdWx0WydtYXgtd2lkdGgnXSA9IGAke3RoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGh9cHhgO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgRHJpbGxkb3duIE1lbnVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX2hpZGVBbGwoKTtcbiAgICBGb3VuZGF0aW9uLk5lc3QuQnVybih0aGlzLiRlbGVtZW50LCAnZHJpbGxkb3duJyk7XG4gICAgdGhpcy4kZWxlbWVudC51bndyYXAoKVxuICAgICAgICAgICAgICAgICAuZmluZCgnLmpzLWRyaWxsZG93bi1iYWNrLCAuaXMtc3VibWVudS1wYXJlbnQtaXRlbScpLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgIC5lbmQoKS5maW5kKCcuaXMtYWN0aXZlLCAuaXMtY2xvc2luZywgLmlzLWRyaWxsZG93bi1zdWJtZW51JykucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1jbG9zaW5nIGlzLWRyaWxsZG93bi1zdWJtZW51JylcbiAgICAgICAgICAgICAgICAgLmVuZCgpLmZpbmQoJ1tkYXRhLXN1Ym1lbnVdJykucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4gdGFiaW5kZXggcm9sZScpXG4gICAgICAgICAgICAgICAgIC5vZmYoJy56Zi5kcmlsbGRvd24nKS5lbmQoKS5vZmYoJ3pmLmRyaWxsZG93bicpO1xuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnYScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkbGluayA9ICQodGhpcyk7XG4gICAgICBpZigkbGluay5kYXRhKCdzYXZlZEhyZWYnKSl7XG4gICAgICAgICRsaW5rLmF0dHIoJ2hyZWYnLCAkbGluay5kYXRhKCdzYXZlZEhyZWYnKSkucmVtb3ZlRGF0YSgnc2F2ZWRIcmVmJyk7XG4gICAgICB9ZWxzZXsgcmV0dXJuOyB9XG4gICAgfSk7XG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9O1xufVxuXG5EcmlsbGRvd24uZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBNYXJrdXAgdXNlZCBmb3IgSlMgZ2VuZXJhdGVkIGJhY2sgYnV0dG9uLiBQcmVwZW5kZWQgdG8gc3VibWVudSBsaXN0cyBhbmQgZGVsZXRlZCBvbiBgZGVzdHJveWAgbWV0aG9kLCAnanMtZHJpbGxkb3duLWJhY2snIGNsYXNzIHJlcXVpcmVkLiBSZW1vdmUgdGhlIGJhY2tzbGFzaCAoYFxcYCkgaWYgY29weSBhbmQgcGFzdGluZy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnPFxcbGk+PFxcYT5CYWNrPFxcL2E+PFxcL2xpPidcbiAgICovXG4gIGJhY2tCdXR0b246ICc8bGkgY2xhc3M9XCJqcy1kcmlsbGRvd24tYmFja1wiPjxhPkJhY2s8L2E+PC9saT4nLFxuICAvKipcbiAgICogTWFya3VwIHVzZWQgdG8gd3JhcCBkcmlsbGRvd24gbWVudS4gVXNlIGEgY2xhc3MgbmFtZSBmb3IgaW5kZXBlbmRlbnQgc3R5bGluZzsgdGhlIEpTIGFwcGxpZWQgY2xhc3M6IGBpcy1kcmlsbGRvd25gIGlzIHJlcXVpcmVkLiBSZW1vdmUgdGhlIGJhY2tzbGFzaCAoYFxcYCkgaWYgY29weSBhbmQgcGFzdGluZy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnPFxcZGl2IGNsYXNzPVwiaXMtZHJpbGxkb3duXCI+PFxcL2Rpdj4nXG4gICAqL1xuICB3cmFwcGVyOiAnPGRpdj48L2Rpdj4nLFxuICAvKipcbiAgICogQWRkcyB0aGUgcGFyZW50IGxpbmsgdG8gdGhlIHN1Ym1lbnUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIHBhcmVudExpbms6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIG1lbnUgdG8gcmV0dXJuIHRvIHJvb3QgbGlzdCBvbiBib2R5IGNsaWNrLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IGZhbHNlXG4gIC8vIGhvbGRPcGVuOiBmYWxzZVxufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKERyaWxsZG93biwgJ0RyaWxsZG93bicpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogRHJvcGRvd24gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmRyb3Bkb3duXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmJveFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICovXG5cbmNsYXNzIERyb3Bkb3duIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSBkcm9wZG93bi5cbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBkcm9wZG93bi5cbiAgICogICAgICAgIE9iamVjdCBzaG91bGQgYmUgb2YgdGhlIGRyb3Bkb3duIHBhbmVsLCByYXRoZXIgdGhhbiBpdHMgYW5jaG9yLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIERyb3Bkb3duLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnRHJvcGRvd24nKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdEcm9wZG93bicsIHtcbiAgICAgICdFTlRFUic6ICdvcGVuJyxcbiAgICAgICdTUEFDRSc6ICdvcGVuJyxcbiAgICAgICdFU0NBUEUnOiAnY2xvc2UnLFxuICAgICAgJ1RBQic6ICd0YWJfZm9yd2FyZCcsXG4gICAgICAnU0hJRlRfVEFCJzogJ3RhYl9iYWNrd2FyZCdcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luIGJ5IHNldHRpbmcvY2hlY2tpbmcgb3B0aW9ucyBhbmQgYXR0cmlidXRlcywgYWRkaW5nIGhlbHBlciB2YXJpYWJsZXMsIGFuZCBzYXZpbmcgdGhlIGFuY2hvci5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgJGlkID0gdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpO1xuXG4gICAgdGhpcy4kYW5jaG9yID0gJChgW2RhdGEtdG9nZ2xlPVwiJHskaWR9XCJdYCkgfHwgJChgW2RhdGEtb3Blbj1cIiR7JGlkfVwiXWApO1xuICAgIHRoaXMuJGFuY2hvci5hdHRyKHtcbiAgICAgICdhcmlhLWNvbnRyb2xzJzogJGlkLFxuICAgICAgJ2RhdGEtaXMtZm9jdXMnOiBmYWxzZSxcbiAgICAgICdkYXRhLXlldGktYm94JzogJGlkLFxuICAgICAgJ2FyaWEtaGFzcG9wdXAnOiB0cnVlLFxuICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZVxuXG4gICAgfSk7XG5cbiAgICB0aGlzLm9wdGlvbnMucG9zaXRpb25DbGFzcyA9IHRoaXMuZ2V0UG9zaXRpb25DbGFzcygpO1xuICAgIHRoaXMuY291bnRlciA9IDQ7XG4gICAgdGhpcy51c2VkUG9zaXRpb25zID0gW107XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKHtcbiAgICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJyxcbiAgICAgICdkYXRhLXlldGktYm94JzogJGlkLFxuICAgICAgJ2RhdGEtcmVzaXplJzogJGlkLFxuICAgICAgJ2FyaWEtbGFiZWxsZWRieSc6IHRoaXMuJGFuY2hvclswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdkZC1hbmNob3InKVxuICAgIH0pO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0byBkZXRlcm1pbmUgY3VycmVudCBvcmllbnRhdGlvbiBvZiBkcm9wZG93biBwYW5lLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHJldHVybnMge1N0cmluZ30gcG9zaXRpb24gLSBzdHJpbmcgdmFsdWUgb2YgYSBwb3NpdGlvbiBjbGFzcy5cbiAgICovXG4gIGdldFBvc2l0aW9uQ2xhc3MoKSB7XG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUubWF0Y2goL1xcYih0b3B8bGVmdHxyaWdodClcXGIvZyk7XG4gICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gPyBwb3NpdGlvblswXSA6ICcnO1xuICAgIHJldHVybiBwb3NpdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGp1c3RzIHRoZSBkcm9wZG93biBwYW5lcyBvcmllbnRhdGlvbiBieSBhZGRpbmcvcmVtb3ZpbmcgcG9zaXRpb25pbmcgY2xhc3Nlcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwb3NpdGlvbiAtIHBvc2l0aW9uIGNsYXNzIHRvIHJlbW92ZS5cbiAgICovXG4gIF9yZXBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgdGhpcy51c2VkUG9zaXRpb25zLnB1c2gocG9zaXRpb24gPyBwb3NpdGlvbiA6ICdib3R0b20nKTtcbiAgICAvL2RlZmF1bHQsIHRyeSBzd2l0Y2hpbmcgdG8gb3Bwb3NpdGUgc2lkZVxuICAgIGlmKCFwb3NpdGlvbiAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ3RvcCcpIDwgMCkpe1xuICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygndG9wJyk7XG4gICAgfWVsc2UgaWYocG9zaXRpb24gPT09ICd0b3AnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignYm90dG9tJykgPCAwKSl7XG4gICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHBvc2l0aW9uKTtcbiAgICB9ZWxzZSBpZihwb3NpdGlvbiA9PT0gJ2xlZnQnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZigncmlnaHQnKSA8IDApKXtcbiAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MocG9zaXRpb24pXG4gICAgICAgICAgLmFkZENsYXNzKCdyaWdodCcpO1xuICAgIH1lbHNlIGlmKHBvc2l0aW9uID09PSAncmlnaHQnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignbGVmdCcpIDwgMCkpe1xuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhwb3NpdGlvbilcbiAgICAgICAgICAuYWRkQ2xhc3MoJ2xlZnQnKTtcbiAgICB9XG5cbiAgICAvL2lmIGRlZmF1bHQgY2hhbmdlIGRpZG4ndCB3b3JrLCB0cnkgYm90dG9tIG9yIGxlZnQgZmlyc3RcbiAgICBlbHNlIGlmKCFwb3NpdGlvbiAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ3RvcCcpID4gLTEpICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignbGVmdCcpIDwgMCkpe1xuICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnbGVmdCcpO1xuICAgIH1lbHNlIGlmKHBvc2l0aW9uID09PSAndG9wJyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2JvdHRvbScpID4gLTEpICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignbGVmdCcpIDwgMCkpe1xuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhwb3NpdGlvbilcbiAgICAgICAgICAuYWRkQ2xhc3MoJ2xlZnQnKTtcbiAgICB9ZWxzZSBpZihwb3NpdGlvbiA9PT0gJ2xlZnQnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZigncmlnaHQnKSA+IC0xKSAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2JvdHRvbScpIDwgMCkpe1xuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhwb3NpdGlvbik7XG4gICAgfWVsc2UgaWYocG9zaXRpb24gPT09ICdyaWdodCcgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdsZWZ0JykgPiAtMSkgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdib3R0b20nKSA8IDApKXtcbiAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MocG9zaXRpb24pO1xuICAgIH1cbiAgICAvL2lmIG5vdGhpbmcgY2xlYXJlZCwgc2V0IHRvIGJvdHRvbVxuICAgIGVsc2V7XG4gICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHBvc2l0aW9uKTtcbiAgICB9XG4gICAgdGhpcy5jbGFzc0NoYW5nZWQgPSB0cnVlO1xuICAgIHRoaXMuY291bnRlci0tO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIGFuZCBvcmllbnRhdGlvbiBvZiB0aGUgZHJvcGRvd24gcGFuZSwgY2hlY2tzIGZvciBjb2xsaXNpb25zLlxuICAgKiBSZWN1cnNpdmVseSBjYWxscyBpdHNlbGYgaWYgYSBjb2xsaXNpb24gaXMgZGV0ZWN0ZWQsIHdpdGggYSBuZXcgcG9zaXRpb24gY2xhc3MuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3NldFBvc2l0aW9uKCkge1xuICAgIGlmKHRoaXMuJGFuY2hvci5hdHRyKCdhcmlhLWV4cGFuZGVkJykgPT09ICdmYWxzZScpeyByZXR1cm4gZmFsc2U7IH1cbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uQ2xhc3MoKSxcbiAgICAgICAgJGVsZURpbXMgPSBGb3VuZGF0aW9uLkJveC5HZXREaW1lbnNpb25zKHRoaXMuJGVsZW1lbnQpLFxuICAgICAgICAkYW5jaG9yRGltcyA9IEZvdW5kYXRpb24uQm94LkdldERpbWVuc2lvbnModGhpcy4kYW5jaG9yKSxcbiAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICBkaXJlY3Rpb24gPSAocG9zaXRpb24gPT09ICdsZWZ0JyA/ICdsZWZ0JyA6ICgocG9zaXRpb24gPT09ICdyaWdodCcpID8gJ2xlZnQnIDogJ3RvcCcpKSxcbiAgICAgICAgcGFyYW0gPSAoZGlyZWN0aW9uID09PSAndG9wJykgPyAnaGVpZ2h0JyA6ICd3aWR0aCcsXG4gICAgICAgIG9mZnNldCA9IChwYXJhbSA9PT0gJ2hlaWdodCcpID8gdGhpcy5vcHRpb25zLnZPZmZzZXQgOiB0aGlzLm9wdGlvbnMuaE9mZnNldDtcblxuICAgIGlmKCgkZWxlRGltcy53aWR0aCA+PSAkZWxlRGltcy53aW5kb3dEaW1zLndpZHRoKSB8fCAoIXRoaXMuY291bnRlciAmJiAhRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSh0aGlzLiRlbGVtZW50KSkpe1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmZzZXQoRm91bmRhdGlvbi5Cb3guR2V0T2Zmc2V0cyh0aGlzLiRlbGVtZW50LCB0aGlzLiRhbmNob3IsICdjZW50ZXIgYm90dG9tJywgdGhpcy5vcHRpb25zLnZPZmZzZXQsIHRoaXMub3B0aW9ucy5oT2Zmc2V0LCB0cnVlKSkuY3NzKHtcbiAgICAgICAgJ3dpZHRoJzogJGVsZURpbXMud2luZG93RGltcy53aWR0aCAtICh0aGlzLm9wdGlvbnMuaE9mZnNldCAqIDIpLFxuICAgICAgICAnaGVpZ2h0JzogJ2F1dG8nXG4gICAgICB9KTtcbiAgICAgIHRoaXMuY2xhc3NDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50Lm9mZnNldChGb3VuZGF0aW9uLkJveC5HZXRPZmZzZXRzKHRoaXMuJGVsZW1lbnQsIHRoaXMuJGFuY2hvciwgcG9zaXRpb24sIHRoaXMub3B0aW9ucy52T2Zmc2V0LCB0aGlzLm9wdGlvbnMuaE9mZnNldCkpO1xuXG4gICAgd2hpbGUoIUZvdW5kYXRpb24uQm94LkltTm90VG91Y2hpbmdZb3UodGhpcy4kZWxlbWVudCkgJiYgdGhpcy5jb3VudGVyKXtcbiAgICAgIHRoaXMuX3JlcG9zaXRpb24ocG9zaXRpb24pO1xuICAgICAgdGhpcy5fc2V0UG9zaXRpb24oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIGVsZW1lbnQgdXRpbGl6aW5nIHRoZSB0cmlnZ2VycyB1dGlsaXR5IGxpYnJhcnkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuJGVsZW1lbnQub24oe1xuICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgJ2Nsb3NlLnpmLnRyaWdnZXInOiB0aGlzLmNsb3NlLmJpbmQodGhpcyksXG4gICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpLFxuICAgICAgJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInOiB0aGlzLl9zZXRQb3NpdGlvbi5iaW5kKHRoaXMpXG4gICAgfSk7XG5cbiAgICBpZih0aGlzLm9wdGlvbnMuaG92ZXIpe1xuICAgICAgdGhpcy4kYW5jaG9yLm9mZignbW91c2VlbnRlci56Zi5kcm9wZG93biBtb3VzZWxlYXZlLnpmLmRyb3Bkb3duJylcbiAgICAgICAgICAub24oJ21vdXNlZW50ZXIuemYuZHJvcGRvd24nLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KF90aGlzLnRpbWVvdXQpO1xuICAgICAgICAgICAgX3RoaXMudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgX3RoaXMub3BlbigpO1xuICAgICAgICAgICAgICBfdGhpcy4kYW5jaG9yLmRhdGEoJ2hvdmVyJywgdHJ1ZSk7XG4gICAgICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmhvdmVyRGVsYXkpO1xuICAgICAgICAgIH0pLm9uKCdtb3VzZWxlYXZlLnpmLmRyb3Bkb3duJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChfdGhpcy50aW1lb3V0KTtcbiAgICAgICAgICAgIF90aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIF90aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICAgIF90aGlzLiRhbmNob3IuZGF0YSgnaG92ZXInLCBmYWxzZSk7XG4gICAgICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmhvdmVyRGVsYXkpO1xuICAgICAgICAgIH0pO1xuICAgICAgaWYodGhpcy5vcHRpb25zLmhvdmVyUGFuZSl7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdtb3VzZWVudGVyLnpmLmRyb3Bkb3duIG1vdXNlbGVhdmUuemYuZHJvcGRvd24nKVxuICAgICAgICAgICAgLm9uKCdtb3VzZWVudGVyLnpmLmRyb3Bkb3duJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KF90aGlzLnRpbWVvdXQpO1xuICAgICAgICAgICAgfSkub24oJ21vdXNlbGVhdmUuemYuZHJvcGRvd24nLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoX3RoaXMudGltZW91dCk7XG4gICAgICAgICAgICAgIF90aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgX3RoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICBfdGhpcy4kYW5jaG9yLmRhdGEoJ2hvdmVyJywgZmFsc2UpO1xuICAgICAgICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmhvdmVyRGVsYXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuJGFuY2hvci5hZGQodGhpcy4kZWxlbWVudCkub24oJ2tleWRvd24uemYuZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XG5cbiAgICAgIHZhciAkdGFyZ2V0ID0gJCh0aGlzKSxcbiAgICAgICAgdmlzaWJsZUZvY3VzYWJsZUVsZW1lbnRzID0gRm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlKF90aGlzLiRlbGVtZW50KTtcblxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0Ryb3Bkb3duJywge1xuICAgICAgICB0YWJfZm9yd2FyZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKF90aGlzLiRlbGVtZW50LmZpbmQoJzpmb2N1cycpLmlzKHZpc2libGVGb2N1c2FibGVFbGVtZW50cy5lcSgtMSkpKSB7IC8vIGxlZnQgbW9kYWwgZG93bndhcmRzLCBzZXR0aW5nIGZvY3VzIHRvIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLnRyYXBGb2N1cykgeyAvLyBpZiBmb2N1cyBzaGFsbCBiZSB0cmFwcGVkXG4gICAgICAgICAgICAgIHZpc2libGVGb2N1c2FibGVFbGVtZW50cy5lcSgwKS5mb2N1cygpO1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBpZiBmb2N1cyBpcyBub3QgdHJhcHBlZCwgY2xvc2UgZHJvcGRvd24gb24gZm9jdXMgb3V0XG4gICAgICAgICAgICAgIF90aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0YWJfYmFja3dhcmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChfdGhpcy4kZWxlbWVudC5maW5kKCc6Zm9jdXMnKS5pcyh2aXNpYmxlRm9jdXNhYmxlRWxlbWVudHMuZXEoMCkpIHx8IF90aGlzLiRlbGVtZW50LmlzKCc6Zm9jdXMnKSkgeyAvLyBsZWZ0IG1vZGFsIHVwd2FyZHMsIHNldHRpbmcgZm9jdXMgdG8gbGFzdCBlbGVtZW50XG4gICAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy50cmFwRm9jdXMpIHsgLy8gaWYgZm9jdXMgc2hhbGwgYmUgdHJhcHBlZFxuICAgICAgICAgICAgICB2aXNpYmxlRm9jdXNhYmxlRWxlbWVudHMuZXEoLTEpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIGlmIGZvY3VzIGlzIG5vdCB0cmFwcGVkLCBjbG9zZSBkcm9wZG93biBvbiBmb2N1cyBvdXRcbiAgICAgICAgICAgICAgX3RoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICgkdGFyZ2V0LmlzKF90aGlzLiRhbmNob3IpKSB7XG4gICAgICAgICAgICBfdGhpcy5vcGVuKCk7XG4gICAgICAgICAgICBfdGhpcy4kZWxlbWVudC5hdHRyKCd0YWJpbmRleCcsIC0xKS5mb2N1cygpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLmNsb3NlKCk7XG4gICAgICAgICAgX3RoaXMuJGFuY2hvci5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGV2ZW50IGhhbmRsZXIgdG8gdGhlIGJvZHkgdG8gY2xvc2UgYW55IGRyb3Bkb3ducyBvbiBhIGNsaWNrLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRCb2R5SGFuZGxlcigpIHtcbiAgICAgdmFyICRib2R5ID0gJChkb2N1bWVudC5ib2R5KS5ub3QodGhpcy4kZWxlbWVudCksXG4gICAgICAgICBfdGhpcyA9IHRoaXM7XG4gICAgICRib2R5Lm9mZignY2xpY2suemYuZHJvcGRvd24nKVxuICAgICAgICAgIC5vbignY2xpY2suemYuZHJvcGRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGlmKF90aGlzLiRhbmNob3IuaXMoZS50YXJnZXQpIHx8IF90aGlzLiRhbmNob3IuZmluZChlLnRhcmdldCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKF90aGlzLiRlbGVtZW50LmZpbmQoZS50YXJnZXQpLmxlbmd0aCkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgJGJvZHkub2ZmKCdjbGljay56Zi5kcm9wZG93bicpO1xuICAgICAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSBkcm9wZG93biBwYW5lLCBhbmQgZmlyZXMgYSBidWJibGluZyBldmVudCB0byBjbG9zZSBvdGhlciBkcm9wZG93bnMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgRHJvcGRvd24jY2xvc2VtZVxuICAgKiBAZmlyZXMgRHJvcGRvd24jc2hvd1xuICAgKi9cbiAgb3BlbigpIHtcbiAgICAvLyB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIC8qKlxuICAgICAqIEZpcmVzIHRvIGNsb3NlIG90aGVyIG9wZW4gZHJvcGRvd25zXG4gICAgICogQGV2ZW50IERyb3Bkb3duI2Nsb3NlbWVcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Nsb3NlbWUuemYuZHJvcGRvd24nLCB0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJykpO1xuICAgIHRoaXMuJGFuY2hvci5hZGRDbGFzcygnaG92ZXInKVxuICAgICAgICAuYXR0cih7J2FyaWEtZXhwYW5kZWQnOiB0cnVlfSk7XG4gICAgLy8gdGhpcy4kZWxlbWVudC8qLnNob3coKSovO1xuICAgIHRoaXMuX3NldFBvc2l0aW9uKCk7XG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnaXMtb3BlbicpXG4gICAgICAgIC5hdHRyKHsnYXJpYS1oaWRkZW4nOiBmYWxzZX0pO1xuXG4gICAgaWYodGhpcy5vcHRpb25zLmF1dG9Gb2N1cyl7XG4gICAgICB2YXIgJGZvY3VzYWJsZSA9IEZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZSh0aGlzLiRlbGVtZW50KTtcbiAgICAgIGlmKCRmb2N1c2FibGUubGVuZ3RoKXtcbiAgICAgICAgJGZvY3VzYWJsZS5lcSgwKS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2speyB0aGlzLl9hZGRCb2R5SGFuZGxlcigpOyB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyBvbmNlIHRoZSBkcm9wZG93biBpcyB2aXNpYmxlLlxuICAgICAqIEBldmVudCBEcm9wZG93biNzaG93XG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzaG93LnpmLmRyb3Bkb3duJywgW3RoaXMuJGVsZW1lbnRdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIG9wZW4gZHJvcGRvd24gcGFuZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBmaXJlcyBEcm9wZG93biNoaWRlXG4gICAqL1xuICBjbG9zZSgpIHtcbiAgICBpZighdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpKXtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpXG4gICAgICAgIC5hdHRyKHsnYXJpYS1oaWRkZW4nOiB0cnVlfSk7XG5cbiAgICB0aGlzLiRhbmNob3IucmVtb3ZlQ2xhc3MoJ2hvdmVyJylcbiAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSk7XG5cbiAgICBpZih0aGlzLmNsYXNzQ2hhbmdlZCl7XG4gICAgICB2YXIgY3VyUG9zaXRpb25DbGFzcyA9IHRoaXMuZ2V0UG9zaXRpb25DbGFzcygpO1xuICAgICAgaWYoY3VyUG9zaXRpb25DbGFzcyl7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoY3VyUG9zaXRpb25DbGFzcyk7XG4gICAgICB9XG4gICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKHRoaXMub3B0aW9ucy5wb3NpdGlvbkNsYXNzKVxuICAgICAgICAgIC8qLmhpZGUoKSovLmNzcyh7aGVpZ2h0OiAnJywgd2lkdGg6ICcnfSk7XG4gICAgICB0aGlzLmNsYXNzQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5jb3VudGVyID0gNDtcbiAgICAgIHRoaXMudXNlZFBvc2l0aW9ucy5sZW5ndGggPSAwO1xuICAgIH1cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2hpZGUuemYuZHJvcGRvd24nLCBbdGhpcy4kZWxlbWVudF0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIGRyb3Bkb3duIHBhbmUncyB2aXNpYmlsaXR5LlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHRvZ2dsZSgpIHtcbiAgICBpZih0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykpe1xuICAgICAgaWYodGhpcy4kYW5jaG9yLmRhdGEoJ2hvdmVyJykpIHJldHVybjtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMub3BlbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgZHJvcGRvd24uXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXInKS5oaWRlKCk7XG4gICAgdGhpcy4kYW5jaG9yLm9mZignLnpmLmRyb3Bkb3duJyk7XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuRHJvcGRvd24uZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSB0byBkZWxheSBvcGVuaW5nIGEgc3VibWVudSBvbiBob3ZlciBldmVudC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAyNTBcbiAgICovXG4gIGhvdmVyRGVsYXk6IDI1MCxcbiAgLyoqXG4gICAqIEFsbG93IHN1Ym1lbnVzIHRvIG9wZW4gb24gaG92ZXIgZXZlbnRzXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGhvdmVyOiBmYWxzZSxcbiAgLyoqXG4gICAqIERvbid0IGNsb3NlIGRyb3Bkb3duIHdoZW4gaG92ZXJpbmcgb3ZlciBkcm9wZG93biBwYW5lXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgaG92ZXJQYW5lOiBmYWxzZSxcbiAgLyoqXG4gICAqIE51bWJlciBvZiBwaXhlbHMgYmV0d2VlbiB0aGUgZHJvcGRvd24gcGFuZSBhbmQgdGhlIHRyaWdnZXJpbmcgZWxlbWVudCBvbiBvcGVuLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDFcbiAgICovXG4gIHZPZmZzZXQ6IDEsXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgcGl4ZWxzIGJldHdlZW4gdGhlIGRyb3Bkb3duIHBhbmUgYW5kIHRoZSB0cmlnZ2VyaW5nIGVsZW1lbnQgb24gb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxXG4gICAqL1xuICBoT2Zmc2V0OiAxLFxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byBhZGp1c3Qgb3BlbiBwb3NpdGlvbi4gSlMgd2lsbCB0ZXN0IGFuZCBmaWxsIHRoaXMgaW4uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ3RvcCdcbiAgICovXG4gIHBvc2l0aW9uQ2xhc3M6ICcnLFxuICAvKipcbiAgICogQWxsb3cgdGhlIHBsdWdpbiB0byB0cmFwIGZvY3VzIHRvIHRoZSBkcm9wZG93biBwYW5lIGlmIG9wZW5lZCB3aXRoIGtleWJvYXJkIGNvbW1hbmRzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICB0cmFwRm9jdXM6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIHBsdWdpbiB0byBzZXQgZm9jdXMgdG8gdGhlIGZpcnN0IGZvY3VzYWJsZSBlbGVtZW50IHdpdGhpbiB0aGUgcGFuZSwgcmVnYXJkbGVzcyBvZiBtZXRob2Qgb2Ygb3BlbmluZy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBhdXRvRm9jdXM6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3dzIGEgY2xpY2sgb24gdGhlIGJvZHkgdG8gY2xvc2UgdGhlIGRyb3Bkb3duLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IGZhbHNlXG59XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihEcm9wZG93biwgJ0Ryb3Bkb3duJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBEcm9wZG93bk1lbnUgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmRyb3Bkb3duLW1lbnVcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuYm94XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm5lc3RcbiAqL1xuXG5jbGFzcyBEcm9wZG93bk1lbnUge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEcm9wZG93bk1lbnUuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgRHJvcGRvd25NZW51I2luaXRcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGRyb3Bkb3duIG1lbnUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgRHJvcGRvd25NZW51LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICBGb3VuZGF0aW9uLk5lc3QuRmVhdGhlcih0aGlzLiRlbGVtZW50LCAnZHJvcGRvd24nKTtcbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdEcm9wZG93bk1lbnUnKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdEcm9wZG93bk1lbnUnLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAndXAnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnZG93bicsXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cycsXG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4sIGFuZCBjYWxscyBfcHJlcGFyZU1lbnVcbiAgICogQHByaXZhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgc3VicyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKS5hZGRDbGFzcygnZmlyc3Qtc3ViJyk7XG5cbiAgICB0aGlzLiRtZW51SXRlbXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tyb2xlPVwibWVudWl0ZW1cIl0nKTtcbiAgICB0aGlzLiR0YWJzID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignW3JvbGU9XCJtZW51aXRlbVwiXScpO1xuICAgIHRoaXMuJHRhYnMuZmluZCgndWwuaXMtZHJvcGRvd24tc3VibWVudScpLmFkZENsYXNzKHRoaXMub3B0aW9ucy52ZXJ0aWNhbENsYXNzKTtcblxuICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKHRoaXMub3B0aW9ucy5yaWdodENsYXNzKSB8fCB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAncmlnaHQnIHx8IEZvdW5kYXRpb24ucnRsKCkpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPSAncmlnaHQnO1xuICAgICAgc3Vicy5hZGRDbGFzcygnb3BlbnMtbGVmdCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWJzLmFkZENsYXNzKCdvcGVucy1yaWdodCcpO1xuICAgIH1cbiAgICB0aGlzLmNoYW5nZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfTtcbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIGVsZW1lbnRzIHdpdGhpbiB0aGUgbWVudVxuICAgKiBAcHJpdmF0ZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgaGFzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgfHwgKHR5cGVvZiB3aW5kb3cub250b3VjaHN0YXJ0ICE9PSAndW5kZWZpbmVkJyksXG4gICAgICAgIHBhckNsYXNzID0gJ2lzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xpY2tPcGVuIHx8IGhhc1RvdWNoKSB7XG4gICAgICB0aGlzLiRtZW51SXRlbXMub24oJ2NsaWNrLnpmLmRyb3Bkb3dubWVudSB0b3VjaHN0YXJ0LnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRlbGVtID0gJChlLnRhcmdldCkucGFyZW50c1VudGlsKCd1bCcsIGAuJHtwYXJDbGFzc31gKSxcbiAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKSxcbiAgICAgICAgICAgIGhhc0NsaWNrZWQgPSAkZWxlbS5hdHRyKCdkYXRhLWlzLWNsaWNrJykgPT09ICd0cnVlJyxcbiAgICAgICAgICAgICRzdWIgPSAkZWxlbS5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKTtcblxuICAgICAgICBpZiAoaGFzU3ViKSB7XG4gICAgICAgICAgaWYgKGhhc0NsaWNrZWQpIHtcbiAgICAgICAgICAgIGlmICghX3RoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgfHwgKCFfdGhpcy5vcHRpb25zLmNsaWNrT3BlbiAmJiAhaGFzVG91Y2gpIHx8IChfdGhpcy5vcHRpb25zLmZvcmNlRm9sbG93ICYmIGhhc1RvdWNoKSkgeyByZXR1cm47IH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIF90aGlzLl9oaWRlKCRlbGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtLmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudScpKTtcbiAgICAgICAgICAgICRlbGVtLmFkZCgkZWxlbS5wYXJlbnRzVW50aWwoX3RoaXMuJGVsZW1lbnQsIGAuJHtwYXJDbGFzc31gKSkuYXR0cignZGF0YS1pcy1jbGljaycsIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHsgcmV0dXJuOyB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXNhYmxlSG92ZXIpIHtcbiAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignbW91c2VlbnRlci56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XG5cbiAgICAgICAgaWYgKGhhc1N1Yikge1xuICAgICAgICAgIGNsZWFyVGltZW91dChfdGhpcy5kZWxheSk7XG4gICAgICAgICAgX3RoaXMuZGVsYXkgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMuX3Nob3coJGVsZW0uY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51JykpO1xuICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuaG92ZXJEZWxheSk7XG4gICAgICAgIH1cbiAgICAgIH0pLm9uKCdtb3VzZWxlYXZlLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRlbGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKTtcbiAgICAgICAgaWYgKGhhc1N1YiAmJiBfdGhpcy5vcHRpb25zLmF1dG9jbG9zZSkge1xuICAgICAgICAgIGlmICgkZWxlbS5hdHRyKCdkYXRhLWlzLWNsaWNrJykgPT09ICd0cnVlJyAmJiBfdGhpcy5vcHRpb25zLmNsaWNrT3BlbikgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgICAgICAgIGNsZWFyVGltZW91dChfdGhpcy5kZWxheSk7XG4gICAgICAgICAgX3RoaXMuZGVsYXkgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW0pO1xuICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuY2xvc2luZ1RpbWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdrZXlkb3duLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciAkZWxlbWVudCA9ICQoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCAnW3JvbGU9XCJtZW51aXRlbVwiXScpLFxuICAgICAgICAgIGlzVGFiID0gX3RoaXMuJHRhYnMuaW5kZXgoJGVsZW1lbnQpID4gLTEsXG4gICAgICAgICAgJGVsZW1lbnRzID0gaXNUYWIgPyBfdGhpcy4kdGFicyA6ICRlbGVtZW50LnNpYmxpbmdzKCdsaScpLmFkZCgkZWxlbWVudCksXG4gICAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAgICRuZXh0RWxlbWVudDtcblxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoaS0xKTtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoaSsxKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgbmV4dFNpYmxpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCEkZWxlbWVudC5pcygnOmxhc3QtY2hpbGQnKSkgJG5leHRFbGVtZW50LmNoaWxkcmVuKCdhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgIH0sIHByZXZTaWJsaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICRwcmV2RWxlbWVudC5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICB9LCBvcGVuU3ViID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkc3ViID0gJGVsZW1lbnQuY2hpbGRyZW4oJ3VsLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKTtcbiAgICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICAgX3RoaXMuX3Nob3coJHN1Yik7XG4gICAgICAgICAgJGVsZW1lbnQuZmluZCgnbGkgPiBhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHsgcmV0dXJuOyB9XG4gICAgICB9LCBjbG9zZVN1YiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL2lmICgkZWxlbWVudC5pcygnOmZpcnN0LWNoaWxkJykpIHtcbiAgICAgICAgdmFyIGNsb3NlID0gJGVsZW1lbnQucGFyZW50KCd1bCcpLnBhcmVudCgnbGknKTtcbiAgICAgICAgICBjbG9zZS5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hpZGUoY2xvc2UpO1xuICAgICAgICAvL31cbiAgICAgIH07XG4gICAgICB2YXIgZnVuY3Rpb25zID0ge1xuICAgICAgICBvcGVuOiBvcGVuU3ViLFxuICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuX2hpZGUoX3RoaXMuJGVsZW1lbnQpO1xuICAgICAgICAgIF90aGlzLiRtZW51SXRlbXMuZmluZCgnYTpmaXJzdCcpLmZvY3VzKCk7IC8vIGZvY3VzIHRvIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChpc1RhYikge1xuICAgICAgICBpZiAoX3RoaXMudmVydGljYWwpIHsgLy8gdmVydGljYWwgbWVudVxuICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ2xlZnQnKSB7IC8vIGxlZnQgYWxpZ25lZFxuICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICB1cDogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgIG5leHQ6IG9wZW5TdWIsXG4gICAgICAgICAgICAgIHByZXZpb3VzOiBjbG9zZVN1YlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHsgLy8gcmlnaHQgYWxpZ25lZFxuICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICB1cDogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgIG5leHQ6IGNsb3NlU3ViLFxuICAgICAgICAgICAgICBwcmV2aW91czogb3BlblN1YlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyAvLyBob3Jpem9udGFsIG1lbnVcbiAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgIG5leHQ6IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgcHJldmlvdXM6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgZG93bjogb3BlblN1YixcbiAgICAgICAgICAgIHVwOiBjbG9zZVN1YlxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyBub3QgdGFicyAtPiBvbmUgc3ViXG4gICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ2xlZnQnKSB7IC8vIGxlZnQgYWxpZ25lZFxuICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgbmV4dDogb3BlblN1YixcbiAgICAgICAgICAgIHByZXZpb3VzOiBjbG9zZVN1YixcbiAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7IC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgIG5leHQ6IGNsb3NlU3ViLFxuICAgICAgICAgICAgcHJldmlvdXM6IG9wZW5TdWIsXG4gICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgIHVwOiBwcmV2U2libGluZ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnRHJvcGRvd25NZW51JywgZnVuY3Rpb25zKTtcblxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gZXZlbnQgaGFuZGxlciB0byB0aGUgYm9keSB0byBjbG9zZSBhbnkgZHJvcGRvd25zIG9uIGEgY2xpY2suXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2FkZEJvZHlIYW5kbGVyKCkge1xuICAgIHZhciAkYm9keSA9ICQoZG9jdW1lbnQuYm9keSksXG4gICAgICAgIF90aGlzID0gdGhpcztcbiAgICAkYm9keS5vZmYoJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScpXG4gICAgICAgICAub24oJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgdmFyICRsaW5rID0gX3RoaXMuJGVsZW1lbnQuZmluZChlLnRhcmdldCk7XG4gICAgICAgICAgIGlmICgkbGluay5sZW5ndGgpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICAgX3RoaXMuX2hpZGUoKTtcbiAgICAgICAgICAgJGJvZHkub2ZmKCdtb3VzZXVwLnpmLmRyb3Bkb3dubWVudSB0b3VjaGVuZC56Zi5kcm9wZG93bm1lbnUnKTtcbiAgICAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIGEgZHJvcGRvd24gcGFuZSwgYW5kIGNoZWNrcyBmb3IgY29sbGlzaW9ucyBmaXJzdC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICRzdWIgLSB1bCBlbGVtZW50IHRoYXQgaXMgYSBzdWJtZW51IHRvIHNob3dcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBmaXJlcyBEcm9wZG93bk1lbnUjc2hvd1xuICAgKi9cbiAgX3Nob3coJHN1Yikge1xuICAgIHZhciBpZHggPSB0aGlzLiR0YWJzLmluZGV4KHRoaXMuJHRhYnMuZmlsdGVyKGZ1bmN0aW9uKGksIGVsKSB7XG4gICAgICByZXR1cm4gJChlbCkuZmluZCgkc3ViKS5sZW5ndGggPiAwO1xuICAgIH0pKTtcbiAgICB2YXIgJHNpYnMgPSAkc3ViLnBhcmVudCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5zaWJsaW5ncygnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICB0aGlzLl9oaWRlKCRzaWJzLCBpZHgpO1xuICAgICRzdWIuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpLmFkZENsYXNzKCdqcy1kcm9wZG93bi1hY3RpdmUnKS5hdHRyKHsnYXJpYS1oaWRkZW4nOiBmYWxzZX0pXG4gICAgICAgIC5wYXJlbnQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpXG4gICAgICAgIC5hdHRyKHsnYXJpYS1leHBhbmRlZCc6IHRydWV9KTtcbiAgICB2YXIgY2xlYXIgPSBGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KCRzdWIsIG51bGwsIHRydWUpO1xuICAgIGlmICghY2xlYXIpIHtcbiAgICAgIHZhciBvbGRDbGFzcyA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdsZWZ0JyA/ICctcmlnaHQnIDogJy1sZWZ0JyxcbiAgICAgICAgICAkcGFyZW50TGkgPSAkc3ViLnBhcmVudCgnLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jyk7XG4gICAgICAkcGFyZW50TGkucmVtb3ZlQ2xhc3MoYG9wZW5zJHtvbGRDbGFzc31gKS5hZGRDbGFzcyhgb3BlbnMtJHt0aGlzLm9wdGlvbnMuYWxpZ25tZW50fWApO1xuICAgICAgY2xlYXIgPSBGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KCRzdWIsIG51bGwsIHRydWUpO1xuICAgICAgaWYgKCFjbGVhcikge1xuICAgICAgICAkcGFyZW50TGkucmVtb3ZlQ2xhc3MoYG9wZW5zLSR7dGhpcy5vcHRpb25zLmFsaWdubWVudH1gKS5hZGRDbGFzcygnb3BlbnMtaW5uZXInKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgICRzdWIuY3NzKCd2aXNpYmlsaXR5JywgJycpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKSB7IHRoaXMuX2FkZEJvZHlIYW5kbGVyKCk7IH1cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBuZXcgZHJvcGRvd24gcGFuZSBpcyB2aXNpYmxlLlxuICAgICAqIEBldmVudCBEcm9wZG93bk1lbnUjc2hvd1xuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2hvdy56Zi5kcm9wZG93bm1lbnUnLCBbJHN1Yl0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGVzIGEgc2luZ2xlLCBjdXJyZW50bHkgb3BlbiBkcm9wZG93biBwYW5lLCBpZiBwYXNzZWQgYSBwYXJhbWV0ZXIsIG90aGVyd2lzZSwgaGlkZXMgZXZlcnl0aGluZy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIGVsZW1lbnQgd2l0aCBhIHN1Ym1lbnUgdG8gaGlkZVxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gaW5kZXggb2YgdGhlICR0YWJzIGNvbGxlY3Rpb24gdG8gaGlkZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2hpZGUoJGVsZW0sIGlkeCkge1xuICAgIHZhciAkdG9DbG9zZTtcbiAgICBpZiAoJGVsZW0gJiYgJGVsZW0ubGVuZ3RoKSB7XG4gICAgICAkdG9DbG9zZSA9ICRlbGVtO1xuICAgIH0gZWxzZSBpZiAoaWR4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICR0b0Nsb3NlID0gdGhpcy4kdGFicy5ub3QoZnVuY3Rpb24oaSwgZWwpIHtcbiAgICAgICAgcmV0dXJuIGkgPT09IGlkeDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICR0b0Nsb3NlID0gdGhpcy4kZWxlbWVudDtcbiAgICB9XG4gICAgdmFyIHNvbWV0aGluZ1RvQ2xvc2UgPSAkdG9DbG9zZS5oYXNDbGFzcygnaXMtYWN0aXZlJykgfHwgJHRvQ2xvc2UuZmluZCgnLmlzLWFjdGl2ZScpLmxlbmd0aCA+IDA7XG5cbiAgICBpZiAoc29tZXRoaW5nVG9DbG9zZSkge1xuICAgICAgJHRvQ2xvc2UuZmluZCgnbGkuaXMtYWN0aXZlJykuYWRkKCR0b0Nsb3NlKS5hdHRyKHtcbiAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcbiAgICAgICAgJ2RhdGEtaXMtY2xpY2snOiBmYWxzZVxuICAgICAgfSkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgICAkdG9DbG9zZS5maW5kKCd1bC5qcy1kcm9wZG93bi1hY3RpdmUnKS5hdHRyKHtcbiAgICAgICAgJ2FyaWEtaGlkZGVuJzogdHJ1ZVxuICAgICAgfSkucmVtb3ZlQ2xhc3MoJ2pzLWRyb3Bkb3duLWFjdGl2ZScpO1xuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VkIHx8ICR0b0Nsb3NlLmZpbmQoJ29wZW5zLWlubmVyJykubGVuZ3RoKSB7XG4gICAgICAgIHZhciBvbGRDbGFzcyA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdsZWZ0JyA/ICdyaWdodCcgOiAnbGVmdCc7XG4gICAgICAgICR0b0Nsb3NlLmZpbmQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykuYWRkKCR0b0Nsb3NlKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhgb3BlbnMtaW5uZXIgb3BlbnMtJHt0aGlzLm9wdGlvbnMuYWxpZ25tZW50fWApXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKGBvcGVucy0ke29sZENsYXNzfWApO1xuICAgICAgICB0aGlzLmNoYW5nZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgb3BlbiBtZW51cyBhcmUgY2xvc2VkLlxuICAgICAgICogQGV2ZW50IERyb3Bkb3duTWVudSNoaWRlXG4gICAgICAgKi9cbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaGlkZS56Zi5kcm9wZG93bm1lbnUnLCBbJHRvQ2xvc2VdKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIHBsdWdpbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJG1lbnVJdGVtcy5vZmYoJy56Zi5kcm9wZG93bm1lbnUnKS5yZW1vdmVBdHRyKCdkYXRhLWlzLWNsaWNrJylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdpcy1yaWdodC1hcnJvdyBpcy1sZWZ0LWFycm93IGlzLWRvd24tYXJyb3cgb3BlbnMtcmlnaHQgb3BlbnMtbGVmdCBvcGVucy1pbm5lcicpO1xuICAgICQoZG9jdW1lbnQuYm9keSkub2ZmKCcuemYuZHJvcGRvd25tZW51Jyk7XG4gICAgRm91bmRhdGlvbi5OZXN0LkJ1cm4odGhpcy4kZWxlbWVudCwgJ2Ryb3Bkb3duJyk7XG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCBzZXR0aW5ncyBmb3IgcGx1Z2luXG4gKi9cbkRyb3Bkb3duTWVudS5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIERpc2FsbG93cyBob3ZlciBldmVudHMgZnJvbSBvcGVuaW5nIHN1Ym1lbnVzXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGRpc2FibGVIb3ZlcjogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvdyBhIHN1Ym1lbnUgdG8gYXV0b21hdGljYWxseSBjbG9zZSBvbiBhIG1vdXNlbGVhdmUgZXZlbnQsIGlmIG5vdCBjbGlja2VkIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgYXV0b2Nsb3NlOiB0cnVlLFxuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgdG8gZGVsYXkgb3BlbmluZyBhIHN1Ym1lbnUgb24gaG92ZXIgZXZlbnQuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgNTBcbiAgICovXG4gIGhvdmVyRGVsYXk6IDUwLFxuICAvKipcbiAgICogQWxsb3cgYSBzdWJtZW51IHRvIG9wZW4vcmVtYWluIG9wZW4gb24gcGFyZW50IGNsaWNrIGV2ZW50LiBBbGxvd3MgY3Vyc29yIHRvIG1vdmUgYXdheSBmcm9tIG1lbnUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgY2xpY2tPcGVuOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIHRvIGRlbGF5IGNsb3NpbmcgYSBzdWJtZW51IG9uIGEgbW91c2VsZWF2ZSBldmVudC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSA1MDBcbiAgICovXG5cbiAgY2xvc2luZ1RpbWU6IDUwMCxcbiAgLyoqXG4gICAqIFBvc2l0aW9uIG9mIHRoZSBtZW51IHJlbGF0aXZlIHRvIHdoYXQgZGlyZWN0aW9uIHRoZSBzdWJtZW51cyBzaG91bGQgb3Blbi4gSGFuZGxlZCBieSBKUy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnbGVmdCdcbiAgICovXG4gIGFsaWdubWVudDogJ2xlZnQnLFxuICAvKipcbiAgICogQWxsb3cgY2xpY2tzIG9uIHRoZSBib2R5IHRvIGNsb3NlIGFueSBvcGVuIHN1Ym1lbnVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHRydWVcbiAgICovXG4gIGNsb3NlT25DbGljazogdHJ1ZSxcbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdmVydGljYWwgb3JpZW50ZWQgbWVudXMsIEZvdW5kYXRpb24gZGVmYXVsdCBpcyBgdmVydGljYWxgLiBVcGRhdGUgdGhpcyBpZiB1c2luZyB5b3VyIG93biBjbGFzcy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAndmVydGljYWwnXG4gICAqL1xuICB2ZXJ0aWNhbENsYXNzOiAndmVydGljYWwnLFxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byByaWdodC1zaWRlIG9yaWVudGVkIG1lbnVzLCBGb3VuZGF0aW9uIGRlZmF1bHQgaXMgYGFsaWduLXJpZ2h0YC4gVXBkYXRlIHRoaXMgaWYgdXNpbmcgeW91ciBvd24gY2xhc3MuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2FsaWduLXJpZ2h0J1xuICAgKi9cbiAgcmlnaHRDbGFzczogJ2FsaWduLXJpZ2h0JyxcbiAgLyoqXG4gICAqIEJvb2xlYW4gdG8gZm9yY2Ugb3ZlcmlkZSB0aGUgY2xpY2tpbmcgb2YgbGlua3MgdG8gcGVyZm9ybSBkZWZhdWx0IGFjdGlvbiwgb24gc2Vjb25kIHRvdWNoIGV2ZW50IGZvciBtb2JpbGUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGZvcmNlRm9sbG93OiB0cnVlXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oRHJvcGRvd25NZW51LCAnRHJvcGRvd25NZW51Jyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBFcXVhbGl6ZXIgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmVxdWFsaXplclxuICovXG5cbmNsYXNzIEVxdWFsaXplciB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEVxdWFsaXplci5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBFcXVhbGl6ZXIjaW5pdFxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSB0cmlnZ2VyIHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKXtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgID0gJC5leHRlbmQoe30sIEVxdWFsaXplci5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnRXF1YWxpemVyJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIEVxdWFsaXplciBwbHVnaW4gYW5kIGNhbGxzIGZ1bmN0aW9ucyB0byBnZXQgZXF1YWxpemVyIGZ1bmN0aW9uaW5nIG9uIGxvYWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgZXFJZCA9IHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1lcXVhbGl6ZXInKSB8fCAnJztcbiAgICB2YXIgJHdhdGNoZWQgPSB0aGlzLiRlbGVtZW50LmZpbmQoYFtkYXRhLWVxdWFsaXplci13YXRjaD1cIiR7ZXFJZH1cIl1gKTtcblxuICAgIHRoaXMuJHdhdGNoZWQgPSAkd2F0Y2hlZC5sZW5ndGggPyAkd2F0Y2hlZCA6IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtZXF1YWxpemVyLXdhdGNoXScpO1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1yZXNpemUnLCAoZXFJZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdlcScpKSk7XG5cbiAgICB0aGlzLmhhc05lc3RlZCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtZXF1YWxpemVyXScpLmxlbmd0aCA+IDA7XG4gICAgdGhpcy5pc05lc3RlZCA9IHRoaXMuJGVsZW1lbnQucGFyZW50c1VudGlsKGRvY3VtZW50LmJvZHksICdbZGF0YS1lcXVhbGl6ZXJdJykubGVuZ3RoID4gMDtcbiAgICB0aGlzLmlzT24gPSBmYWxzZTtcblxuICAgIHZhciBpbWdzID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbWcnKTtcbiAgICB2YXIgdG9vU21hbGw7XG4gICAgaWYodGhpcy5vcHRpb25zLmVxdWFsaXplT24pe1xuICAgICAgdG9vU21hbGwgPSB0aGlzLl9jaGVja01RKCk7XG4gICAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX2NoZWNrTVEuYmluZCh0aGlzKSk7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9ldmVudHMoKTtcbiAgICB9XG4gICAgaWYoKHRvb1NtYWxsICE9PSB1bmRlZmluZWQgJiYgdG9vU21hbGwgPT09IGZhbHNlKSB8fCB0b29TbWFsbCA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIGlmKGltZ3MubGVuZ3RoKXtcbiAgICAgICAgRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZChpbWdzLCB0aGlzLl9yZWZsb3cuYmluZCh0aGlzKSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5fcmVmbG93KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzIGlmIHRoZSBicmVha3BvaW50IGlzIHRvbyBzbWFsbC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wYXVzZUV2ZW50cygpIHtcbiAgICB0aGlzLmlzT24gPSBmYWxzZTtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLmVxdWFsaXplciByZXNpemVtZS56Zi50cmlnZ2VyJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciBFcXVhbGl6ZXIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5fcGF1c2VFdmVudHMoKTtcbiAgICBpZih0aGlzLmhhc05lc3RlZCl7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdwb3N0ZXF1YWxpemVkLnpmLmVxdWFsaXplcicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBpZihlLnRhcmdldCAhPT0gX3RoaXMuJGVsZW1lbnRbMF0peyBfdGhpcy5fcmVmbG93KCk7IH1cbiAgICAgIH0pO1xuICAgIH1lbHNle1xuICAgICAgdGhpcy4kZWxlbWVudC5vbigncmVzaXplbWUuemYudHJpZ2dlcicsIHRoaXMuX3JlZmxvdy5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgdGhpcy5pc09uID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIGN1cnJlbnQgYnJlYWtwb2ludCB0byB0aGUgbWluaW11bSByZXF1aXJlZCBzaXplLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2NoZWNrTVEoKSB7XG4gICAgdmFyIHRvb1NtYWxsID0gIUZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KHRoaXMub3B0aW9ucy5lcXVhbGl6ZU9uKTtcbiAgICBpZih0b29TbWFsbCl7XG4gICAgICBpZih0aGlzLmlzT24pe1xuICAgICAgICB0aGlzLl9wYXVzZUV2ZW50cygpO1xuICAgICAgICB0aGlzLiR3YXRjaGVkLmNzcygnaGVpZ2h0JywgJ2F1dG8nKTtcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGlmKCF0aGlzLmlzT24pe1xuICAgICAgICB0aGlzLl9ldmVudHMoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvb1NtYWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbm9vcCB2ZXJzaW9uIGZvciB0aGUgcGx1Z2luXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfa2lsbHN3aXRjaCgpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgRXF1YWxpemVyIHVwb24gRE9NIGNoYW5nZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlZmxvdygpIHtcbiAgICBpZighdGhpcy5vcHRpb25zLmVxdWFsaXplT25TdGFjayl7XG4gICAgICBpZih0aGlzLl9pc1N0YWNrZWQoKSl7XG4gICAgICAgIHRoaXMuJHdhdGNoZWQuY3NzKCdoZWlnaHQnLCAnYXV0bycpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZXF1YWxpemVCeVJvdykge1xuICAgICAgdGhpcy5nZXRIZWlnaHRzQnlSb3codGhpcy5hcHBseUhlaWdodEJ5Um93LmJpbmQodGhpcykpO1xuICAgIH1lbHNle1xuICAgICAgdGhpcy5nZXRIZWlnaHRzKHRoaXMuYXBwbHlIZWlnaHQuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1hbnVhbGx5IGRldGVybWluZXMgaWYgdGhlIGZpcnN0IDIgZWxlbWVudHMgYXJlICpOT1QqIHN0YWNrZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaXNTdGFja2VkKCkge1xuICAgIHJldHVybiB0aGlzLiR3YXRjaGVkWzBdLm9mZnNldFRvcCAhPT0gdGhpcy4kd2F0Y2hlZFsxXS5vZmZzZXRUb3A7XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIG91dGVyIGhlaWdodHMgb2YgY2hpbGRyZW4gY29udGFpbmVkIHdpdGhpbiBhbiBFcXVhbGl6ZXIgcGFyZW50IGFuZCByZXR1cm5zIHRoZW0gaW4gYW4gYXJyYXlcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBBIG5vbi1vcHRpb25hbCBjYWxsYmFjayB0byByZXR1cm4gdGhlIGhlaWdodHMgYXJyYXkgdG8uXG4gICAqIEByZXR1cm5zIHtBcnJheX0gaGVpZ2h0cyAtIEFuIGFycmF5IG9mIGhlaWdodHMgb2YgY2hpbGRyZW4gd2l0aGluIEVxdWFsaXplciBjb250YWluZXJcbiAgICovXG4gIGdldEhlaWdodHMoY2IpIHtcbiAgICB2YXIgaGVpZ2h0cyA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMuJHdhdGNoZWQubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xuICAgICAgdGhpcy4kd2F0Y2hlZFtpXS5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG4gICAgICBoZWlnaHRzLnB1c2godGhpcy4kd2F0Y2hlZFtpXS5vZmZzZXRIZWlnaHQpO1xuICAgIH1cbiAgICBjYihoZWlnaHRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyB0aGUgb3V0ZXIgaGVpZ2h0cyBvZiBjaGlsZHJlbiBjb250YWluZWQgd2l0aGluIGFuIEVxdWFsaXplciBwYXJlbnQgYW5kIHJldHVybnMgdGhlbSBpbiBhbiBhcnJheVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIEEgbm9uLW9wdGlvbmFsIGNhbGxiYWNrIHRvIHJldHVybiB0aGUgaGVpZ2h0cyBhcnJheSB0by5cbiAgICogQHJldHVybnMge0FycmF5fSBncm91cHMgLSBBbiBhcnJheSBvZiBoZWlnaHRzIG9mIGNoaWxkcmVuIHdpdGhpbiBFcXVhbGl6ZXIgY29udGFpbmVyIGdyb3VwZWQgYnkgcm93IHdpdGggZWxlbWVudCxoZWlnaHQgYW5kIG1heCBhcyBsYXN0IGNoaWxkXG4gICAqL1xuICBnZXRIZWlnaHRzQnlSb3coY2IpIHtcbiAgICB2YXIgbGFzdEVsVG9wT2Zmc2V0ID0gdGhpcy4kd2F0Y2hlZC5maXJzdCgpLm9mZnNldCgpLnRvcCxcbiAgICAgICAgZ3JvdXBzID0gW10sXG4gICAgICAgIGdyb3VwID0gMDtcbiAgICAvL2dyb3VwIGJ5IFJvd1xuICAgIGdyb3Vwc1tncm91cF0gPSBbXTtcbiAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0aGlzLiR3YXRjaGVkLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcbiAgICAgIHRoaXMuJHdhdGNoZWRbaV0uc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuICAgICAgLy9tYXliZSBjb3VsZCB1c2UgdGhpcy4kd2F0Y2hlZFtpXS5vZmZzZXRUb3BcbiAgICAgIHZhciBlbE9mZnNldFRvcCA9ICQodGhpcy4kd2F0Y2hlZFtpXSkub2Zmc2V0KCkudG9wO1xuICAgICAgaWYgKGVsT2Zmc2V0VG9wIT1sYXN0RWxUb3BPZmZzZXQpIHtcbiAgICAgICAgZ3JvdXArKztcbiAgICAgICAgZ3JvdXBzW2dyb3VwXSA9IFtdO1xuICAgICAgICBsYXN0RWxUb3BPZmZzZXQ9ZWxPZmZzZXRUb3A7XG4gICAgICB9XG4gICAgICBncm91cHNbZ3JvdXBdLnB1c2goW3RoaXMuJHdhdGNoZWRbaV0sdGhpcy4kd2F0Y2hlZFtpXS5vZmZzZXRIZWlnaHRdKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBqID0gMCwgbG4gPSBncm91cHMubGVuZ3RoOyBqIDwgbG47IGorKykge1xuICAgICAgdmFyIGhlaWdodHMgPSAkKGdyb3Vwc1tqXSkubWFwKGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzWzFdOyB9KS5nZXQoKTtcbiAgICAgIHZhciBtYXggICAgICAgICA9IE1hdGgubWF4LmFwcGx5KG51bGwsIGhlaWdodHMpO1xuICAgICAgZ3JvdXBzW2pdLnB1c2gobWF4KTtcbiAgICB9XG4gICAgY2IoZ3JvdXBzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBDU1MgaGVpZ2h0IHByb3BlcnR5IG9mIGVhY2ggY2hpbGQgaW4gYW4gRXF1YWxpemVyIHBhcmVudCB0byBtYXRjaCB0aGUgdGFsbGVzdFxuICAgKiBAcGFyYW0ge2FycmF5fSBoZWlnaHRzIC0gQW4gYXJyYXkgb2YgaGVpZ2h0cyBvZiBjaGlsZHJlbiB3aXRoaW4gRXF1YWxpemVyIGNvbnRhaW5lclxuICAgKiBAZmlyZXMgRXF1YWxpemVyI3ByZWVxdWFsaXplZFxuICAgKiBAZmlyZXMgRXF1YWxpemVyI3Bvc3RlcXVhbGl6ZWRcbiAgICovXG4gIGFwcGx5SGVpZ2h0KGhlaWdodHMpIHtcbiAgICB2YXIgbWF4ID0gTWF0aC5tYXguYXBwbHkobnVsbCwgaGVpZ2h0cyk7XG4gICAgLyoqXG4gICAgICogRmlyZXMgYmVmb3JlIHRoZSBoZWlnaHRzIGFyZSBhcHBsaWVkXG4gICAgICogQGV2ZW50IEVxdWFsaXplciNwcmVlcXVhbGl6ZWRcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3ByZWVxdWFsaXplZC56Zi5lcXVhbGl6ZXInKTtcblxuICAgIHRoaXMuJHdhdGNoZWQuY3NzKCdoZWlnaHQnLCBtYXgpO1xuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgaGVpZ2h0cyBoYXZlIGJlZW4gYXBwbGllZFxuICAgICAqIEBldmVudCBFcXVhbGl6ZXIjcG9zdGVxdWFsaXplZFxuICAgICAqL1xuICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3Bvc3RlcXVhbGl6ZWQuemYuZXF1YWxpemVyJyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgQ1NTIGhlaWdodCBwcm9wZXJ0eSBvZiBlYWNoIGNoaWxkIGluIGFuIEVxdWFsaXplciBwYXJlbnQgdG8gbWF0Y2ggdGhlIHRhbGxlc3QgYnkgcm93XG4gICAqIEBwYXJhbSB7YXJyYXl9IGdyb3VwcyAtIEFuIGFycmF5IG9mIGhlaWdodHMgb2YgY2hpbGRyZW4gd2l0aGluIEVxdWFsaXplciBjb250YWluZXIgZ3JvdXBlZCBieSByb3cgd2l0aCBlbGVtZW50LGhlaWdodCBhbmQgbWF4IGFzIGxhc3QgY2hpbGRcbiAgICogQGZpcmVzIEVxdWFsaXplciNwcmVlcXVhbGl6ZWRcbiAgICogQGZpcmVzIEVxdWFsaXplciNwcmVlcXVhbGl6ZWRSb3dcbiAgICogQGZpcmVzIEVxdWFsaXplciNwb3N0ZXF1YWxpemVkUm93XG4gICAqIEBmaXJlcyBFcXVhbGl6ZXIjcG9zdGVxdWFsaXplZFxuICAgKi9cbiAgYXBwbHlIZWlnaHRCeVJvdyhncm91cHMpIHtcbiAgICAvKipcbiAgICAgKiBGaXJlcyBiZWZvcmUgdGhlIGhlaWdodHMgYXJlIGFwcGxpZWRcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3ByZWVxdWFsaXplZC56Zi5lcXVhbGl6ZXInKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZ3JvdXBzLmxlbmd0aDsgaSA8IGxlbiA7IGkrKykge1xuICAgICAgdmFyIGdyb3Vwc0lMZW5ndGggPSBncm91cHNbaV0ubGVuZ3RoLFxuICAgICAgICAgIG1heCA9IGdyb3Vwc1tpXVtncm91cHNJTGVuZ3RoIC0gMV07XG4gICAgICBpZiAoZ3JvdXBzSUxlbmd0aDw9Mikge1xuICAgICAgICAkKGdyb3Vwc1tpXVswXVswXSkuY3NzKHsnaGVpZ2h0JzonYXV0byd9KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAgKiBGaXJlcyBiZWZvcmUgdGhlIGhlaWdodHMgcGVyIHJvdyBhcmUgYXBwbGllZFxuICAgICAgICAqIEBldmVudCBFcXVhbGl6ZXIjcHJlZXF1YWxpemVkUm93XG4gICAgICAgICovXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3ByZWVxdWFsaXplZHJvdy56Zi5lcXVhbGl6ZXInKTtcbiAgICAgIGZvciAodmFyIGogPSAwLCBsZW5KID0gKGdyb3Vwc0lMZW5ndGgtMSk7IGogPCBsZW5KIDsgaisrKSB7XG4gICAgICAgICQoZ3JvdXBzW2ldW2pdWzBdKS5jc3MoeydoZWlnaHQnOm1heH0pO1xuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgICogRmlyZXMgd2hlbiB0aGUgaGVpZ2h0cyBwZXIgcm93IGhhdmUgYmVlbiBhcHBsaWVkXG4gICAgICAgICogQGV2ZW50IEVxdWFsaXplciNwb3N0ZXF1YWxpemVkUm93XG4gICAgICAgICovXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3Bvc3RlcXVhbGl6ZWRyb3cuemYuZXF1YWxpemVyJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIGhlaWdodHMgaGF2ZSBiZWVuIGFwcGxpZWRcbiAgICAgKi9cbiAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdwb3N0ZXF1YWxpemVkLnpmLmVxdWFsaXplcicpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIEVxdWFsaXplci5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX3BhdXNlRXZlbnRzKCk7XG4gICAgdGhpcy4kd2F0Y2hlZC5jc3MoJ2hlaWdodCcsICdhdXRvJyk7XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cbiAqL1xuRXF1YWxpemVyLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogRW5hYmxlIGhlaWdodCBlcXVhbGl6YXRpb24gd2hlbiBzdGFja2VkIG9uIHNtYWxsZXIgc2NyZWVucy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBlcXVhbGl6ZU9uU3RhY2s6IHRydWUsXG4gIC8qKlxuICAgKiBFbmFibGUgaGVpZ2h0IGVxdWFsaXphdGlvbiByb3cgYnkgcm93LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBlcXVhbGl6ZUJ5Um93OiBmYWxzZSxcbiAgLyoqXG4gICAqIFN0cmluZyByZXByZXNlbnRpbmcgdGhlIG1pbmltdW0gYnJlYWtwb2ludCBzaXplIHRoZSBwbHVnaW4gc2hvdWxkIGVxdWFsaXplIGhlaWdodHMgb24uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ21lZGl1bSdcbiAgICovXG4gIGVxdWFsaXplT246ICcnXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oRXF1YWxpemVyLCAnRXF1YWxpemVyJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBJbnRlcmNoYW5nZSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uaW50ZXJjaGFuZ2VcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyXG4gKi9cblxuY2xhc3MgSW50ZXJjaGFuZ2Uge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBJbnRlcmNoYW5nZS5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBJbnRlcmNoYW5nZSNpbml0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBhZGQgdGhlIHRyaWdnZXIgdG8uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgSW50ZXJjaGFuZ2UuZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMucnVsZXMgPSBbXTtcbiAgICB0aGlzLmN1cnJlbnRQYXRoID0gJyc7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdJbnRlcmNoYW5nZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBJbnRlcmNoYW5nZSBwbHVnaW4gYW5kIGNhbGxzIGZ1bmN0aW9ucyB0byBnZXQgaW50ZXJjaGFuZ2UgZnVuY3Rpb25pbmcgb24gbG9hZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLl9hZGRCcmVha3BvaW50cygpO1xuICAgIHRoaXMuX2dlbmVyYXRlUnVsZXMoKTtcbiAgICB0aGlzLl9yZWZsb3coKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIEludGVyY2hhbmdlLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYuaW50ZXJjaGFuZ2UnLCBGb3VuZGF0aW9uLnV0aWwudGhyb3R0bGUodGhpcy5fcmVmbG93LmJpbmQodGhpcyksIDUwKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgSW50ZXJjaGFuZ2UgdXBvbiBET00gY2hhbmdlXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlZmxvdygpIHtcbiAgICB2YXIgbWF0Y2g7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBydWxlLCBidXQgb25seSBzYXZlIHRoZSBsYXN0IG1hdGNoXG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnJ1bGVzKSB7XG4gICAgICB2YXIgcnVsZSA9IHRoaXMucnVsZXNbaV07XG5cbiAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShydWxlLnF1ZXJ5KS5tYXRjaGVzKSB7XG4gICAgICAgIG1hdGNoID0gcnVsZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIHRoaXMucmVwbGFjZShtYXRjaC5wYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgRm91bmRhdGlvbiBicmVha3BvaW50cyBhbmQgYWRkcyB0aGVtIHRvIHRoZSBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVMgb2JqZWN0LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRCcmVha3BvaW50cygpIHtcbiAgICBmb3IgKHZhciBpIGluIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5xdWVyaWVzKSB7XG4gICAgICB2YXIgcXVlcnkgPSBGb3VuZGF0aW9uLk1lZGlhUXVlcnkucXVlcmllc1tpXTtcbiAgICAgIEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFU1txdWVyeS5uYW1lXSA9IHF1ZXJ5LnZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIEludGVyY2hhbmdlIGVsZW1lbnQgZm9yIHRoZSBwcm92aWRlZCBtZWRpYSBxdWVyeSArIGNvbnRlbnQgcGFpcmluZ3NcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0aGF0IGlzIGFuIEludGVyY2hhbmdlIGluc3RhbmNlXG4gICAqIEByZXR1cm5zIHtBcnJheX0gc2NlbmFyaW9zIC0gQXJyYXkgb2Ygb2JqZWN0cyB0aGF0IGhhdmUgJ21xJyBhbmQgJ3BhdGgnIGtleXMgd2l0aCBjb3JyZXNwb25kaW5nIGtleXNcbiAgICovXG4gIF9nZW5lcmF0ZVJ1bGVzKGVsZW1lbnQpIHtcbiAgICB2YXIgcnVsZXNMaXN0ID0gW107XG4gICAgdmFyIHJ1bGVzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5ydWxlcykge1xuICAgICAgcnVsZXMgPSB0aGlzLm9wdGlvbnMucnVsZXM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ2ludGVyY2hhbmdlJykubWF0Y2goL1xcWy4qP1xcXS9nKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpIGluIHJ1bGVzKSB7XG4gICAgICB2YXIgcnVsZSA9IHJ1bGVzW2ldLnNsaWNlKDEsIC0xKS5zcGxpdCgnLCAnKTtcbiAgICAgIHZhciBwYXRoID0gcnVsZS5zbGljZSgwLCAtMSkuam9pbignJyk7XG4gICAgICB2YXIgcXVlcnkgPSBydWxlW3J1bGUubGVuZ3RoIC0gMV07XG5cbiAgICAgIGlmIChJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVNbcXVlcnldKSB7XG4gICAgICAgIHF1ZXJ5ID0gSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTW3F1ZXJ5XTtcbiAgICAgIH1cblxuICAgICAgcnVsZXNMaXN0LnB1c2goe1xuICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICBxdWVyeTogcXVlcnlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMucnVsZXMgPSBydWxlc0xpc3Q7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBgc3JjYCBwcm9wZXJ0eSBvZiBhbiBpbWFnZSwgb3IgY2hhbmdlIHRoZSBIVE1MIG9mIGEgY29udGFpbmVyLCB0byB0aGUgc3BlY2lmaWVkIHBhdGguXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAtIFBhdGggdG8gdGhlIGltYWdlIG9yIEhUTUwgcGFydGlhbC5cbiAgICogQGZpcmVzIEludGVyY2hhbmdlI3JlcGxhY2VkXG4gICAqL1xuICByZXBsYWNlKHBhdGgpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50UGF0aCA9PT0gcGF0aCkgcmV0dXJuO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgdHJpZ2dlciA9ICdyZXBsYWNlZC56Zi5pbnRlcmNoYW5nZSc7XG5cbiAgICAvLyBSZXBsYWNpbmcgaW1hZ2VzXG4gICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0ubm9kZU5hbWUgPT09ICdJTUcnKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3NyYycsIHBhdGgpLmxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLmN1cnJlbnRQYXRoID0gcGF0aDtcbiAgICAgIH0pXG4gICAgICAudHJpZ2dlcih0cmlnZ2VyKTtcbiAgICB9XG4gICAgLy8gUmVwbGFjaW5nIGJhY2tncm91bmQgaW1hZ2VzXG4gICAgZWxzZSBpZiAocGF0aC5tYXRjaCgvXFwuKGdpZnxqcGd8anBlZ3x0aWZmfHBuZykoWz8jXS4qKT8vaSkpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuY3NzKHsgJ2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcrcGF0aCsnKScgfSlcbiAgICAgICAgICAudHJpZ2dlcih0cmlnZ2VyKTtcbiAgICB9XG4gICAgLy8gUmVwbGFjaW5nIEhUTUxcbiAgICBlbHNlIHtcbiAgICAgICQuZ2V0KHBhdGgsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIF90aGlzLiRlbGVtZW50Lmh0bWwocmVzcG9uc2UpXG4gICAgICAgICAgICAgLnRyaWdnZXIodHJpZ2dlcik7XG4gICAgICAgICQocmVzcG9uc2UpLmZvdW5kYXRpb24oKTtcbiAgICAgICAgX3RoaXMuY3VycmVudFBhdGggPSBwYXRoO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiBjb250ZW50IGluIGFuIEludGVyY2hhbmdlIGVsZW1lbnQgaXMgZG9uZSBiZWluZyBsb2FkZWQuXG4gICAgICogQGV2ZW50IEludGVyY2hhbmdlI3JlcGxhY2VkXG4gICAgICovXG4gICAgLy8gdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdyZXBsYWNlZC56Zi5pbnRlcmNoYW5nZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGludGVyY2hhbmdlLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgLy9UT0RPIHRoaXMuXG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cbiAqL1xuSW50ZXJjaGFuZ2UuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBSdWxlcyB0byBiZSBhcHBsaWVkIHRvIEludGVyY2hhbmdlIGVsZW1lbnRzLiBTZXQgd2l0aCB0aGUgYGRhdGEtaW50ZXJjaGFuZ2VgIGFycmF5IG5vdGF0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqL1xuICBydWxlczogbnVsbFxufTtcblxuSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTID0ge1xuICAnbGFuZHNjYXBlJzogJ3NjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgJ3BvcnRyYWl0JzogJ3NjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICAncmV0aW5hJzogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwgb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCBvbmx5IHNjcmVlbiBhbmQgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIvMSksIG9ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksIG9ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksIG9ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDJkcHB4KSdcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihJbnRlcmNoYW5nZSwgJ0ludGVyY2hhbmdlJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBNYWdlbGxhbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ubWFnZWxsYW5cbiAqL1xuXG5jbGFzcyBNYWdlbGxhbiB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIE1hZ2VsbGFuLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIE1hZ2VsbGFuI2luaXRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGFkZCB0aGUgdHJpZ2dlciB0by5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyAgPSAkLmV4dGVuZCh7fSwgTWFnZWxsYW4uZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ01hZ2VsbGFuJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIE1hZ2VsbGFuIHBsdWdpbiBhbmQgY2FsbHMgZnVuY3Rpb25zIHRvIGdldCBlcXVhbGl6ZXIgZnVuY3Rpb25pbmcgb24gbG9hZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBpZCA9IHRoaXMuJGVsZW1lbnRbMF0uaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnbWFnZWxsYW4nKTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuJHRhcmdldHMgPSAkKCdbZGF0YS1tYWdlbGxhbi10YXJnZXRdJyk7XG4gICAgdGhpcy4kbGlua3MgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2EnKTtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoe1xuICAgICAgJ2RhdGEtcmVzaXplJzogaWQsXG4gICAgICAnZGF0YS1zY3JvbGwnOiBpZCxcbiAgICAgICdpZCc6IGlkXG4gICAgfSk7XG4gICAgdGhpcy4kYWN0aXZlID0gJCgpO1xuICAgIHRoaXMuc2Nyb2xsUG9zID0gcGFyc2VJbnQod2luZG93LnBhZ2VZT2Zmc2V0LCAxMCk7XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIGFuIGFycmF5IG9mIHBpeGVsIHZhbHVlcyB0aGF0IGFyZSB0aGUgZGVtYXJjYXRpb24gbGluZXMgYmV0d2VlbiBsb2NhdGlvbnMgb24gdGhlIHBhZ2UuXG4gICAqIENhbiBiZSBpbnZva2VkIGlmIG5ldyBlbGVtZW50cyBhcmUgYWRkZWQgb3IgdGhlIHNpemUgb2YgYSBsb2NhdGlvbiBjaGFuZ2VzLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGNhbGNQb2ludHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgYm9keSA9IGRvY3VtZW50LmJvZHksXG4gICAgICAgIGh0bWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgICB0aGlzLnBvaW50cyA9IFtdO1xuICAgIHRoaXMud2luSGVpZ2h0ID0gTWF0aC5yb3VuZChNYXRoLm1heCh3aW5kb3cuaW5uZXJIZWlnaHQsIGh0bWwuY2xpZW50SGVpZ2h0KSk7XG4gICAgdGhpcy5kb2NIZWlnaHQgPSBNYXRoLnJvdW5kKE1hdGgubWF4KGJvZHkuc2Nyb2xsSGVpZ2h0LCBib2R5Lm9mZnNldEhlaWdodCwgaHRtbC5jbGllbnRIZWlnaHQsIGh0bWwuc2Nyb2xsSGVpZ2h0LCBodG1sLm9mZnNldEhlaWdodCkpO1xuXG4gICAgdGhpcy4kdGFyZ2V0cy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJHRhciA9ICQodGhpcyksXG4gICAgICAgICAgcHQgPSBNYXRoLnJvdW5kKCR0YXIub2Zmc2V0KCkudG9wIC0gX3RoaXMub3B0aW9ucy50aHJlc2hvbGQpO1xuICAgICAgJHRhci50YXJnZXRQb2ludCA9IHB0O1xuICAgICAgX3RoaXMucG9pbnRzLnB1c2gocHQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgTWFnZWxsYW4uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgICRib2R5ID0gJCgnaHRtbCwgYm9keScpLFxuICAgICAgICBvcHRzID0ge1xuICAgICAgICAgIGR1cmF0aW9uOiBfdGhpcy5vcHRpb25zLmFuaW1hdGlvbkR1cmF0aW9uLFxuICAgICAgICAgIGVhc2luZzogICBfdGhpcy5vcHRpb25zLmFuaW1hdGlvbkVhc2luZ1xuICAgICAgICB9O1xuICAgICQod2luZG93KS5vbmUoJ2xvYWQnLCBmdW5jdGlvbigpe1xuICAgICAgaWYoX3RoaXMub3B0aW9ucy5kZWVwTGlua2luZyl7XG4gICAgICAgIGlmKGxvY2F0aW9uLmhhc2gpe1xuICAgICAgICAgIF90aGlzLnNjcm9sbFRvTG9jKGxvY2F0aW9uLmhhc2gpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBfdGhpcy5jYWxjUG9pbnRzKCk7XG4gICAgICBfdGhpcy5fdXBkYXRlQWN0aXZlKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRlbGVtZW50Lm9uKHtcbiAgICAgICdyZXNpemVtZS56Zi50cmlnZ2VyJzogdGhpcy5yZWZsb3cuYmluZCh0aGlzKSxcbiAgICAgICdzY3JvbGxtZS56Zi50cmlnZ2VyJzogdGhpcy5fdXBkYXRlQWN0aXZlLmJpbmQodGhpcylcbiAgICB9KS5vbignY2xpY2suemYubWFnZWxsYW4nLCAnYVtocmVmXj1cIiNcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGFycml2YWwgICA9IHRoaXMuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gICAgICAgIF90aGlzLnNjcm9sbFRvTG9jKGFycml2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRvIHNjcm9sbCB0byBhIGdpdmVuIGxvY2F0aW9uIG9uIHRoZSBwYWdlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbG9jIC0gYSBwcm9wZXJseSBmb3JtYXR0ZWQgalF1ZXJ5IGlkIHNlbGVjdG9yLiBFeGFtcGxlOiAnI2ZvbydcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBzY3JvbGxUb0xvYyhsb2MpIHtcbiAgICB2YXIgc2Nyb2xsUG9zID0gTWF0aC5yb3VuZCgkKGxvYykub2Zmc2V0KCkudG9wIC0gdGhpcy5vcHRpb25zLnRocmVzaG9sZCAvIDIgLSB0aGlzLm9wdGlvbnMuYmFyT2Zmc2V0KTtcblxuICAgICQoJ2h0bWwsIGJvZHknKS5zdG9wKHRydWUpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IHNjcm9sbFBvcyB9LCB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uRHVyYXRpb24sIHRoaXMub3B0aW9ucy5hbmltYXRpb25FYXNpbmcpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIG5lY2Vzc2FyeSBmdW5jdGlvbnMgdG8gdXBkYXRlIE1hZ2VsbGFuIHVwb24gRE9NIGNoYW5nZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHJlZmxvdygpIHtcbiAgICB0aGlzLmNhbGNQb2ludHMoKTtcbiAgICB0aGlzLl91cGRhdGVBY3RpdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSB2aXNpYmlsaXR5IG9mIGFuIGFjdGl2ZSBsb2NhdGlvbiBsaW5rLCBhbmQgdXBkYXRlcyB0aGUgdXJsIGhhc2ggZm9yIHRoZSBwYWdlLCBpZiBkZWVwTGlua2luZyBlbmFibGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIE1hZ2VsbGFuI3VwZGF0ZVxuICAgKi9cbiAgX3VwZGF0ZUFjdGl2ZSgvKmV2dCwgZWxlbSwgc2Nyb2xsUG9zKi8pIHtcbiAgICB2YXIgd2luUG9zID0gLypzY3JvbGxQb3MgfHwqLyBwYXJzZUludCh3aW5kb3cucGFnZVlPZmZzZXQsIDEwKSxcbiAgICAgICAgY3VySWR4O1xuXG4gICAgaWYod2luUG9zICsgdGhpcy53aW5IZWlnaHQgPT09IHRoaXMuZG9jSGVpZ2h0KXsgY3VySWR4ID0gdGhpcy5wb2ludHMubGVuZ3RoIC0gMTsgfVxuICAgIGVsc2UgaWYod2luUG9zIDwgdGhpcy5wb2ludHNbMF0peyBjdXJJZHggPSAwOyB9XG4gICAgZWxzZXtcbiAgICAgIHZhciBpc0Rvd24gPSB0aGlzLnNjcm9sbFBvcyA8IHdpblBvcyxcbiAgICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgY3VyVmlzaWJsZSA9IHRoaXMucG9pbnRzLmZpbHRlcihmdW5jdGlvbihwLCBpKXtcbiAgICAgICAgICAgIHJldHVybiBpc0Rvd24gPyBwIDw9IHdpblBvcyA6IHAgLSBfdGhpcy5vcHRpb25zLnRocmVzaG9sZCA8PSB3aW5Qb3M7Ly8mJiB3aW5Qb3MgPj0gX3RoaXMucG9pbnRzW2kgLTFdIC0gX3RoaXMub3B0aW9ucy50aHJlc2hvbGQ7XG4gICAgICAgICAgfSk7XG4gICAgICBjdXJJZHggPSBjdXJWaXNpYmxlLmxlbmd0aCA/IGN1clZpc2libGUubGVuZ3RoIC0gMSA6IDA7XG4gICAgfVxuXG4gICAgdGhpcy4kYWN0aXZlLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgdGhpcy4kYWN0aXZlID0gdGhpcy4kbGlua3MuZXEoY3VySWR4KS5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuXG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5raW5nKXtcbiAgICAgIHZhciBoYXNoID0gdGhpcy4kYWN0aXZlWzBdLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgaWYod2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKXtcbiAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIGhhc2gpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNjcm9sbFBvcyA9IHdpblBvcztcbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIG1hZ2VsbGFuIGlzIGZpbmlzaGVkIHVwZGF0aW5nIHRvIHRoZSBuZXcgYWN0aXZlIGVsZW1lbnQuXG4gICAgICogQGV2ZW50IE1hZ2VsbGFuI3VwZGF0ZVxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigndXBkYXRlLnpmLm1hZ2VsbGFuJywgW3RoaXMuJGFjdGl2ZV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIE1hZ2VsbGFuIGFuZCByZXNldHMgdGhlIHVybCBvZiB0aGUgd2luZG93LlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50cmlnZ2VyIC56Zi5tYWdlbGxhbicpXG4gICAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3N9YCkucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcblxuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGlua2luZyl7XG4gICAgICB2YXIgaGFzaCA9IHRoaXMuJGFjdGl2ZVswXS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoaGFzaCwgJycpO1xuICAgIH1cblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgc2V0dGluZ3MgZm9yIHBsdWdpblxuICovXG5NYWdlbGxhbi5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lLCBpbiBtcywgdGhlIGFuaW1hdGVkIHNjcm9sbGluZyBzaG91bGQgdGFrZSBiZXR3ZWVuIGxvY2F0aW9ucy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSA1MDBcbiAgICovXG4gIGFuaW1hdGlvbkR1cmF0aW9uOiA1MDAsXG4gIC8qKlxuICAgKiBBbmltYXRpb24gc3R5bGUgdG8gdXNlIHdoZW4gc2Nyb2xsaW5nIGJldHdlZW4gbG9jYXRpb25zLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdlYXNlLWluLW91dCdcbiAgICovXG4gIGFuaW1hdGlvbkVhc2luZzogJ2xpbmVhcicsXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgcGl4ZWxzIHRvIHVzZSBhcyBhIG1hcmtlciBmb3IgbG9jYXRpb24gY2hhbmdlcy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSA1MFxuICAgKi9cbiAgdGhyZXNob2xkOiA1MCxcbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGFjdGl2ZSBsb2NhdGlvbnMgbGluayBvbiB0aGUgbWFnZWxsYW4gY29udGFpbmVyLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdhY3RpdmUnXG4gICAqL1xuICBhY3RpdmVDbGFzczogJ2FjdGl2ZScsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHNjcmlwdCB0byBtYW5pcHVsYXRlIHRoZSB1cmwgb2YgdGhlIGN1cnJlbnQgcGFnZSwgYW5kIGlmIHN1cHBvcnRlZCwgYWx0ZXIgdGhlIGhpc3RvcnkuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgZGVlcExpbmtpbmc6IGZhbHNlLFxuICAvKipcbiAgICogTnVtYmVyIG9mIHBpeGVscyB0byBvZmZzZXQgdGhlIHNjcm9sbCBvZiB0aGUgcGFnZSBvbiBpdGVtIGNsaWNrIGlmIHVzaW5nIGEgc3RpY2t5IG5hdiBiYXIuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgMjVcbiAgICovXG4gIGJhck9mZnNldDogMFxufVxuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oTWFnZWxsYW4sICdNYWdlbGxhbicpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogT2ZmQ2FudmFzIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5vZmZjYW52YXNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAqL1xuXG5jbGFzcyBPZmZDYW52YXMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBvZmYtY2FudmFzIHdyYXBwZXIuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgT2ZmQ2FudmFzI2luaXRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGluaXRpYWxpemUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgT2ZmQ2FudmFzLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgdGhpcy4kbGFzdFRyaWdnZXIgPSAkKCk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdPZmZDYW52YXMnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGJ5IGFkZGluZyB0aGUgZXhpdCBvdmVybGF5IChpZiBuZWVkZWQpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBpZCA9IHRoaXMuJGVsZW1lbnQuYXR0cignaWQnKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgLy8gRmluZCB0cmlnZ2VycyB0aGF0IGFmZmVjdCB0aGlzIGVsZW1lbnQgYW5kIGFkZCBhcmlhLWV4cGFuZGVkIHRvIHRoZW1cbiAgICAkKGRvY3VtZW50KVxuICAgICAgLmZpbmQoJ1tkYXRhLW9wZW49XCInK2lkKydcIl0sIFtkYXRhLWNsb3NlPVwiJytpZCsnXCJdLCBbZGF0YS10b2dnbGU9XCInK2lkKydcIl0nKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKVxuICAgICAgLmF0dHIoJ2FyaWEtY29udHJvbHMnLCBpZCk7XG5cbiAgICAvLyBBZGQgYSBjbG9zZSB0cmlnZ2VyIG92ZXIgdGhlIGJvZHkgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2spIHtcbiAgICAgIGlmICgkKCcuanMtb2ZmLWNhbnZhcy1leGl0JykubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuJGV4aXRlciA9ICQoJy5qcy1vZmYtY2FudmFzLWV4aXQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBleGl0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZXhpdGVyLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnanMtb2ZmLWNhbnZhcy1leGl0Jyk7XG4gICAgICAgICQoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5hcHBlbmQoZXhpdGVyKTtcblxuICAgICAgICB0aGlzLiRleGl0ZXIgPSAkKGV4aXRlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgPSB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCB8fCBuZXcgUmVnRXhwKHRoaXMub3B0aW9ucy5yZXZlYWxDbGFzcywgJ2cnKS50ZXN0KHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCkge1xuICAgICAgdGhpcy5vcHRpb25zLnJldmVhbE9uID0gdGhpcy5vcHRpb25zLnJldmVhbE9uIHx8IHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lLm1hdGNoKC8ocmV2ZWFsLWZvci1tZWRpdW18cmV2ZWFsLWZvci1sYXJnZSkvZylbMF0uc3BsaXQoJy0nKVsyXTtcbiAgICAgIHRoaXMuX3NldE1RQ2hlY2tlcigpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSkge1xuICAgICAgdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID0gcGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSgkKCdbZGF0YS1vZmYtY2FudmFzLXdyYXBwZXJdJylbMF0pLnRyYW5zaXRpb25EdXJhdGlvbikgKiAxMDAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYW5kIHRoZSBleGl0IG92ZXJsYXkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpLm9uKHtcbiAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICdjbG9zZS56Zi50cmlnZ2VyJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpLFxuICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgICdrZXlkb3duLnpmLm9mZmNhbnZhcyc6IHRoaXMuX2hhbmRsZUtleWJvYXJkLmJpbmQodGhpcylcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrICYmIHRoaXMuJGV4aXRlci5sZW5ndGgpIHtcbiAgICAgIHRoaXMuJGV4aXRlci5vbih7J2NsaWNrLnpmLm9mZmNhbnZhcyc6IHRoaXMuY2xvc2UuYmluZCh0aGlzKX0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGV2ZW50IGxpc3RlbmVyIGZvciBlbGVtZW50cyB0aGF0IHdpbGwgcmV2ZWFsIGF0IGNlcnRhaW4gYnJlYWtwb2ludHMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0TVFDaGVja2VyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzLnJldmVhbChmYWxzZSk7XG4gICAgICB9XG4gICAgfSkub25lKCdsb2FkLnpmLm9mZmNhbnZhcycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSByZXZlYWxpbmcvaGlkaW5nIHRoZSBvZmYtY2FudmFzIGF0IGJyZWFrcG9pbnRzLCBub3QgdGhlIHNhbWUgYXMgb3Blbi5cbiAgICogQHBhcmFtIHtCb29sZWFufSBpc1JldmVhbGVkIC0gdHJ1ZSBpZiBlbGVtZW50IHNob3VsZCBiZSByZXZlYWxlZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICByZXZlYWwoaXNSZXZlYWxlZCkge1xuICAgIHZhciAkY2xvc2VyID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1jbG9zZV0nKTtcbiAgICBpZiAoaXNSZXZlYWxlZCkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdGhpcy5pc1JldmVhbGVkID0gdHJ1ZTtcbiAgICAgIC8vIGlmICghdGhpcy5vcHRpb25zLmZvcmNlVG9wKSB7XG4gICAgICAvLyAgIHZhciBzY3JvbGxQb3MgPSBwYXJzZUludCh3aW5kb3cucGFnZVlPZmZzZXQpO1xuICAgICAgLy8gICB0aGlzLiRlbGVtZW50WzBdLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMCwnICsgc2Nyb2xsUG9zICsgJ3B4KSc7XG4gICAgICAvLyB9XG4gICAgICAvLyBpZiAodGhpcy5vcHRpb25zLmlzU3RpY2t5KSB7IHRoaXMuX3N0aWNrKCk7IH1cbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdvcGVuLnpmLnRyaWdnZXIgdG9nZ2xlLnpmLnRyaWdnZXInKTtcbiAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkgeyAkY2xvc2VyLmhpZGUoKTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmlzUmV2ZWFsZWQgPSBmYWxzZTtcbiAgICAgIC8vIGlmICh0aGlzLm9wdGlvbnMuaXNTdGlja3kgfHwgIXRoaXMub3B0aW9ucy5mb3JjZVRvcCkge1xuICAgICAgLy8gICB0aGlzLiRlbGVtZW50WzBdLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xuICAgICAgLy8gICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuemYub2ZmY2FudmFzJyk7XG4gICAgICAvLyB9XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKHtcbiAgICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpXG4gICAgICB9KTtcbiAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkge1xuICAgICAgICAkY2xvc2VyLnNob3coKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjb3BlbmVkXG4gICAqL1xuICBvcGVuKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgJGJvZHkgPSAkKGRvY3VtZW50LmJvZHkpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvcCkge1xuICAgICAgJCgnYm9keScpLnNjcm9sbFRvcCgwKTtcbiAgICB9XG4gICAgLy8gd2luZG93LnBhZ2VZT2Zmc2V0ID0gMDtcblxuICAgIC8vIGlmICghdGhpcy5vcHRpb25zLmZvcmNlVG9wKSB7XG4gICAgLy8gICB2YXIgc2Nyb2xsUG9zID0gcGFyc2VJbnQod2luZG93LnBhZ2VZT2Zmc2V0KTtcbiAgICAvLyAgIHRoaXMuJGVsZW1lbnRbMF0uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwLCcgKyBzY3JvbGxQb3MgKyAncHgpJztcbiAgICAvLyAgIGlmICh0aGlzLiRleGl0ZXIubGVuZ3RoKSB7XG4gICAgLy8gICAgIHRoaXMuJGV4aXRlclswXS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDAsJyArIHNjcm9sbFBvcyArICdweCknO1xuICAgIC8vICAgfVxuICAgIC8vIH1cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbnMuXG4gICAgICogQGV2ZW50IE9mZkNhbnZhcyNvcGVuZWRcbiAgICAgKi9cbiAgICBGb3VuZGF0aW9uLk1vdmUodGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lLCB0aGlzLiRlbGVtZW50LCBmdW5jdGlvbigpIHtcbiAgICAgICQoJ1tkYXRhLW9mZi1jYW52YXMtd3JhcHBlcl0nKS5hZGRDbGFzcygnaXMtb2ZmLWNhbnZhcy1vcGVuIGlzLW9wZW4tJysgX3RoaXMub3B0aW9ucy5wb3NpdGlvbik7XG5cbiAgICAgIF90aGlzLiRlbGVtZW50XG4gICAgICAgIC5hZGRDbGFzcygnaXMtb3BlbicpXG5cbiAgICAgIC8vIGlmIChfdGhpcy5vcHRpb25zLmlzU3RpY2t5KSB7XG4gICAgICAvLyAgIF90aGlzLl9zdGljaygpO1xuICAgICAgLy8gfVxuICAgIH0pO1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKVxuICAgICAgICAudHJpZ2dlcignb3BlbmVkLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2spIHtcbiAgICAgIHRoaXMuJGV4aXRlci5hZGRDbGFzcygnaXMtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICB0aGlzLiRsYXN0VHJpZ2dlciA9IHRyaWdnZXIuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvRm9jdXMpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCh0aGlzLiRlbGVtZW50KSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLiRlbGVtZW50LmZpbmQoJ2EsIGJ1dHRvbicpLmVxKDApLmZvY3VzKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cykge1xuICAgICAgJCgnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLmF0dHIoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICB0aGlzLl90cmFwRm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJhcHMgZm9jdXMgd2l0aGluIHRoZSBvZmZjYW52YXMgb24gb3Blbi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF90cmFwRm9jdXMoKSB7XG4gICAgdmFyIGZvY3VzYWJsZSA9IEZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZSh0aGlzLiRlbGVtZW50KSxcbiAgICAgICAgZmlyc3QgPSBmb2N1c2FibGUuZXEoMCksXG4gICAgICAgIGxhc3QgPSBmb2N1c2FibGUuZXEoLTEpO1xuXG4gICAgZm9jdXNhYmxlLm9mZignLnpmLm9mZmNhbnZhcycpLm9uKCdrZXlkb3duLnpmLm9mZmNhbnZhcycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChlLndoaWNoID09PSA5IHx8IGUua2V5Y29kZSA9PT0gOSkge1xuICAgICAgICBpZiAoZS50YXJnZXQgPT09IGxhc3RbMF0gJiYgIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZmlyc3QuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZS50YXJnZXQgPT09IGZpcnN0WzBdICYmIGUuc2hpZnRLZXkpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgbGFzdC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIHRoZSBvZmZjYW52YXMgdG8gYXBwZWFyIHN0aWNreSB1dGlsaXppbmcgdHJhbnNsYXRlIHByb3BlcnRpZXMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICAvLyBPZmZDYW52YXMucHJvdG90eXBlLl9zdGljayA9IGZ1bmN0aW9uKCkge1xuICAvLyAgIHZhciBlbFN0eWxlID0gdGhpcy4kZWxlbWVudFswXS5zdHlsZTtcbiAgLy9cbiAgLy8gICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljaykge1xuICAvLyAgICAgdmFyIGV4aXRTdHlsZSA9IHRoaXMuJGV4aXRlclswXS5zdHlsZTtcbiAgLy8gICB9XG4gIC8vXG4gIC8vICAgJCh3aW5kb3cpLm9uKCdzY3JvbGwuemYub2ZmY2FudmFzJywgZnVuY3Rpb24oZSkge1xuICAvLyAgICAgY29uc29sZS5sb2coZSk7XG4gIC8vICAgICB2YXIgcGFnZVkgPSB3aW5kb3cucGFnZVlPZmZzZXQ7XG4gIC8vICAgICBlbFN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMCwnICsgcGFnZVkgKyAncHgpJztcbiAgLy8gICAgIGlmIChleGl0U3R5bGUgIT09IHVuZGVmaW5lZCkgeyBleGl0U3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwLCcgKyBwYWdlWSArICdweCknOyB9XG4gIC8vICAgfSk7XG4gIC8vICAgLy8gdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzdHVjay56Zi5vZmZjYW52YXMnKTtcbiAgLy8gfTtcbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgb2ZmLWNhbnZhcyBtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBvcHRpb25hbCBjYiB0byBmaXJlIGFmdGVyIGNsb3N1cmUuXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjY2xvc2VkXG4gICAqL1xuICBjbG9zZShjYikge1xuICAgIGlmICghdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpIHx8IHRoaXMuaXNSZXZlYWxlZCkgeyByZXR1cm47IH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAvLyAgRm91bmRhdGlvbi5Nb3ZlKHRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSwgdGhpcy4kZWxlbWVudCwgZnVuY3Rpb24oKSB7XG4gICAgJCgnW2RhdGEtb2ZmLWNhbnZhcy13cmFwcGVyXScpLnJlbW92ZUNsYXNzKGBpcy1vZmYtY2FudmFzLW9wZW4gaXMtb3Blbi0ke190aGlzLm9wdGlvbnMucG9zaXRpb259YCk7XG4gICAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgIC8vIEZvdW5kYXRpb24uX3JlZmxvdygpO1xuICAgIC8vIH0pO1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpXG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9mZi1jYW52YXMgbWVudSBvcGVucy5cbiAgICAgICAqIEBldmVudCBPZmZDYW52YXMjY2xvc2VkXG4gICAgICAgKi9cbiAgICAgICAgLnRyaWdnZXIoJ2Nsb3NlZC56Zi5vZmZjYW52YXMnKTtcbiAgICAvLyBpZiAoX3RoaXMub3B0aW9ucy5pc1N0aWNreSB8fCAhX3RoaXMub3B0aW9ucy5mb3JjZVRvcCkge1xuICAgIC8vICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgX3RoaXMuJGVsZW1lbnRbMF0uc3R5bGUudHJhbnNmb3JtID0gJyc7XG4gICAgLy8gICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC56Zi5vZmZjYW52YXMnKTtcbiAgICAvLyAgIH0sIHRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSk7XG4gICAgLy8gfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKSB7XG4gICAgICB0aGlzLiRleGl0ZXIucmVtb3ZlQ2xhc3MoJ2lzLXZpc2libGUnKTtcbiAgICB9XG5cbiAgICB0aGlzLiRsYXN0VHJpZ2dlci5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50cmFwRm9jdXMpIHtcbiAgICAgICQoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5yZW1vdmVBdHRyKCd0YWJpbmRleCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbiBvciBjbG9zZWQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBFdmVudCBvYmplY3QgcGFzc2VkIGZyb20gbGlzdGVuZXIuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSB0cmlnZ2VyIC0gZWxlbWVudCB0aGF0IHRyaWdnZXJlZCB0aGUgb2ZmLWNhbnZhcyB0byBvcGVuLlxuICAgKi9cbiAgdG9nZ2xlKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSkge1xuICAgICAgdGhpcy5jbG9zZShldmVudCwgdHJpZ2dlcik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5vcGVuKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBrZXlib2FyZCBpbnB1dCB3aGVuIGRldGVjdGVkLiBXaGVuIHRoZSBlc2NhcGUga2V5IGlzIHByZXNzZWQsIHRoZSBvZmYtY2FudmFzIG1lbnUgY2xvc2VzLCBhbmQgZm9jdXMgaXMgcmVzdG9yZWQgdG8gdGhlIGVsZW1lbnQgdGhhdCBvcGVuZWQgdGhlIG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2hhbmRsZUtleWJvYXJkKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LndoaWNoICE9PSAyNykgcmV0dXJuO1xuXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmNsb3NlKCk7XG4gICAgdGhpcy4kbGFzdFRyaWdnZXIuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgb2ZmY2FudmFzIHBsdWdpbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpO1xuICAgIHRoaXMuJGV4aXRlci5vZmYoJy56Zi5vZmZjYW52YXMnKTtcblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5PZmZDYW52YXMuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgdXNlciB0byBjbGljayBvdXRzaWRlIG9mIHRoZSBtZW51IHRvIGNsb3NlIGl0LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHRydWVcbiAgICovXG4gIGNsb3NlT25DbGljazogdHJ1ZSxcblxuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgaW4gbXMgdGhlIG9wZW4gYW5kIGNsb3NlIHRyYW5zaXRpb24gcmVxdWlyZXMuIElmIG5vbmUgc2VsZWN0ZWQsIHB1bGxzIGZyb20gYm9keSBzdHlsZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSA1MDBcbiAgICovXG4gIHRyYW5zaXRpb25UaW1lOiAwLFxuXG4gIC8qKlxuICAgKiBEaXJlY3Rpb24gdGhlIG9mZmNhbnZhcyBvcGVucyBmcm9tLiBEZXRlcm1pbmVzIGNsYXNzIGFwcGxpZWQgdG8gYm9keS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBsZWZ0XG4gICAqL1xuICBwb3NpdGlvbjogJ2xlZnQnLFxuXG4gIC8qKlxuICAgKiBGb3JjZSB0aGUgcGFnZSB0byBzY3JvbGwgdG8gdG9wIG9uIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgZm9yY2VUb3A6IHRydWUsXG5cbiAgLyoqXG4gICAqIEFsbG93IHRoZSBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4gZm9yIGNlcnRhaW4gYnJlYWtwb2ludHMuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGlzUmV2ZWFsZWQ6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBCcmVha3BvaW50IGF0IHdoaWNoIHRvIHJldmVhbC4gSlMgd2lsbCB1c2UgYSBSZWdFeHAgdG8gdGFyZ2V0IHN0YW5kYXJkIGNsYXNzZXMsIGlmIGNoYW5naW5nIGNsYXNzbmFtZXMsIHBhc3MgeW91ciBjbGFzcyB3aXRoIHRoZSBgcmV2ZWFsQ2xhc3NgIG9wdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSByZXZlYWwtZm9yLWxhcmdlXG4gICAqL1xuICByZXZlYWxPbjogbnVsbCxcblxuICAvKipcbiAgICogRm9yY2UgZm9jdXMgdG8gdGhlIG9mZmNhbnZhcyBvbiBvcGVuLiBJZiB0cnVlLCB3aWxsIGZvY3VzIHRoZSBvcGVuaW5nIHRyaWdnZXIgb24gY2xvc2UuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgYXV0b0ZvY3VzOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBDbGFzcyB1c2VkIHRvIGZvcmNlIGFuIG9mZmNhbnZhcyB0byByZW1haW4gb3Blbi4gRm91bmRhdGlvbiBkZWZhdWx0cyBmb3IgdGhpcyBhcmUgYHJldmVhbC1mb3ItbGFyZ2VgICYgYHJldmVhbC1mb3ItbWVkaXVtYC5cbiAgICogQG9wdGlvblxuICAgKiBUT0RPIGltcHJvdmUgdGhlIHJlZ2V4IHRlc3RpbmcgZm9yIHRoaXMuXG4gICAqIEBleGFtcGxlIHJldmVhbC1mb3ItbGFyZ2VcbiAgICovXG4gIHJldmVhbENsYXNzOiAncmV2ZWFsLWZvci0nLFxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBvcHRpb25hbCBmb2N1cyB0cmFwcGluZyB3aGVuIG9wZW5pbmcgYW4gb2ZmY2FudmFzLiBTZXRzIHRhYmluZGV4IG9mIFtkYXRhLW9mZi1jYW52YXMtY29udGVudF0gdG8gLTEgZm9yIGFjY2Vzc2liaWxpdHkgcHVycG9zZXMuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgdHJhcEZvY3VzOiBmYWxzZVxufVxuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oT2ZmQ2FudmFzLCAnT2ZmQ2FudmFzJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBPcmJpdCBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ub3JiaXRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXJcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudG91Y2hcbiAqL1xuXG5jbGFzcyBPcmJpdCB7XG4gIC8qKlxuICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gb3JiaXQgY2Fyb3VzZWwuXG4gICogQGNsYXNzXG4gICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhbiBPcmJpdCBDYXJvdXNlbC5cbiAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpe1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBPcmJpdC5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnT3JiaXQnKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdPcmJpdCcsIHtcbiAgICAgICdsdHInOiB7XG4gICAgICAgICdBUlJPV19SSUdIVCc6ICduZXh0JyxcbiAgICAgICAgJ0FSUk9XX0xFRlQnOiAncHJldmlvdXMnXG4gICAgICB9LFxuICAgICAgJ3J0bCc6IHtcbiAgICAgICAgJ0FSUk9XX0xFRlQnOiAnbmV4dCcsXG4gICAgICAgICdBUlJPV19SSUdIVCc6ICdwcmV2aW91cydcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4gYnkgY3JlYXRpbmcgalF1ZXJ5IGNvbGxlY3Rpb25zLCBzZXR0aW5nIGF0dHJpYnV0ZXMsIGFuZCBzdGFydGluZyB0aGUgYW5pbWF0aW9uLlxuICAqIEBmdW5jdGlvblxuICAqIEBwcml2YXRlXG4gICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuJHdyYXBwZXIgPSB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMub3B0aW9ucy5jb250YWluZXJDbGFzc31gKTtcbiAgICB0aGlzLiRzbGlkZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMub3B0aW9ucy5zbGlkZUNsYXNzfWApO1xuICAgIHZhciAkaW1hZ2VzID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbWcnKSxcbiAgICBpbml0QWN0aXZlID0gdGhpcy4kc2xpZGVzLmZpbHRlcignLmlzLWFjdGl2ZScpO1xuXG4gICAgaWYgKCFpbml0QWN0aXZlLmxlbmd0aCkge1xuICAgICAgdGhpcy4kc2xpZGVzLmVxKDApLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy51c2VNVUkpIHtcbiAgICAgIHRoaXMuJHNsaWRlcy5hZGRDbGFzcygnbm8tbW90aW9udWknKTtcbiAgICB9XG5cbiAgICBpZiAoJGltYWdlcy5sZW5ndGgpIHtcbiAgICAgIEZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQoJGltYWdlcywgdGhpcy5fcHJlcGFyZUZvck9yYml0LmJpbmQodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wcmVwYXJlRm9yT3JiaXQoKTsvL2hlaGVcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmJ1bGxldHMpIHtcbiAgICAgIHRoaXMuX2xvYWRCdWxsZXRzKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9QbGF5ICYmIHRoaXMuJHNsaWRlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLmdlb1N5bmMoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFjY2Vzc2libGUpIHsgLy8gYWxsb3cgd3JhcHBlciB0byBiZSBmb2N1c2FibGUgdG8gZW5hYmxlIGFycm93IG5hdmlnYXRpb25cbiAgICAgIHRoaXMuJHdyYXBwZXIuYXR0cigndGFiaW5kZXgnLCAwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBDcmVhdGVzIGEgalF1ZXJ5IGNvbGxlY3Rpb24gb2YgYnVsbGV0cywgaWYgdGhleSBhcmUgYmVpbmcgdXNlZC5cbiAgKiBAZnVuY3Rpb25cbiAgKiBAcHJpdmF0ZVxuICAqL1xuICBfbG9hZEJ1bGxldHMoKSB7XG4gICAgdGhpcy4kYnVsbGV0cyA9IHRoaXMuJGVsZW1lbnQuZmluZChgLiR7dGhpcy5vcHRpb25zLmJveE9mQnVsbGV0c31gKS5maW5kKCdidXR0b24nKTtcbiAgfVxuXG4gIC8qKlxuICAqIFNldHMgYSBgdGltZXJgIG9iamVjdCBvbiB0aGUgb3JiaXQsIGFuZCBzdGFydHMgdGhlIGNvdW50ZXIgZm9yIHRoZSBuZXh0IHNsaWRlLlxuICAqIEBmdW5jdGlvblxuICAqL1xuICBnZW9TeW5jKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy50aW1lciA9IG5ldyBGb3VuZGF0aW9uLlRpbWVyKFxuICAgICAgdGhpcy4kZWxlbWVudCxcbiAgICAgIHtcbiAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy50aW1lckRlbGF5LFxuICAgICAgICBpbmZpbml0ZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB0aGlzLnRpbWVyLnN0YXJ0KCk7XG4gIH1cblxuICAvKipcbiAgKiBTZXRzIHdyYXBwZXIgYW5kIHNsaWRlIGhlaWdodHMgZm9yIHRoZSBvcmJpdC5cbiAgKiBAZnVuY3Rpb25cbiAgKiBAcHJpdmF0ZVxuICAqL1xuICBfcHJlcGFyZUZvck9yYml0KCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5fc2V0V3JhcHBlckhlaWdodChmdW5jdGlvbihtYXgpe1xuICAgICAgX3RoaXMuX3NldFNsaWRlSGVpZ2h0KG1heCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgKiBDYWx1bGF0ZXMgdGhlIGhlaWdodCBvZiBlYWNoIHNsaWRlIGluIHRoZSBjb2xsZWN0aW9uLCBhbmQgdXNlcyB0aGUgdGFsbGVzdCBvbmUgZm9yIHRoZSB3cmFwcGVyIGhlaWdodC5cbiAgKiBAZnVuY3Rpb25cbiAgKiBAcHJpdmF0ZVxuICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gYSBjYWxsYmFjayBmdW5jdGlvbiB0byBmaXJlIHdoZW4gY29tcGxldGUuXG4gICovXG4gIF9zZXRXcmFwcGVySGVpZ2h0KGNiKSB7Ly9yZXdyaXRlIHRoaXMgdG8gYGZvcmAgbG9vcFxuICAgIHZhciBtYXggPSAwLCB0ZW1wLCBjb3VudGVyID0gMDtcblxuICAgIHRoaXMuJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdGVtcCA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgJCh0aGlzKS5hdHRyKCdkYXRhLXNsaWRlJywgY291bnRlcik7XG5cbiAgICAgIGlmIChjb3VudGVyKSB7Ly9pZiBub3QgdGhlIGZpcnN0IHNsaWRlLCBzZXQgY3NzIHBvc2l0aW9uIGFuZCBkaXNwbGF5IHByb3BlcnR5XG4gICAgICAgICQodGhpcykuY3NzKHsncG9zaXRpb24nOiAncmVsYXRpdmUnLCAnZGlzcGxheSc6ICdub25lJ30pO1xuICAgICAgfVxuICAgICAgbWF4ID0gdGVtcCA+IG1heCA/IHRlbXAgOiBtYXg7XG4gICAgICBjb3VudGVyKys7XG4gICAgfSk7XG5cbiAgICBpZiAoY291bnRlciA9PT0gdGhpcy4kc2xpZGVzLmxlbmd0aCkge1xuICAgICAgdGhpcy4kd3JhcHBlci5jc3MoeydoZWlnaHQnOiBtYXh9KTsgLy9vbmx5IGNoYW5nZSB0aGUgd3JhcHBlciBoZWlnaHQgcHJvcGVydHkgb25jZS5cbiAgICAgIGNiKG1heCk7IC8vZmlyZSBjYWxsYmFjayB3aXRoIG1heCBoZWlnaHQgZGltZW5zaW9uLlxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAqIFNldHMgdGhlIG1heC1oZWlnaHQgb2YgZWFjaCBzbGlkZS5cbiAgKiBAZnVuY3Rpb25cbiAgKiBAcHJpdmF0ZVxuICAqL1xuICBfc2V0U2xpZGVIZWlnaHQoaGVpZ2h0KSB7XG4gICAgdGhpcy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLmNzcygnbWF4LWhlaWdodCcsIGhlaWdodCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byBiYXNpY2FsbHkgZXZlcnl0aGluZyB3aXRoaW4gdGhlIGVsZW1lbnQuXG4gICogQGZ1bmN0aW9uXG4gICogQHByaXZhdGVcbiAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAvLyoqTm93IHVzaW5nIGN1c3RvbSBldmVudCAtIHRoYW5rcyB0bzoqKlxuICAgIC8vKiogICAgICBZb2hhaSBBcmFyYXQgb2YgVG9yb250byAgICAgICoqXG4gICAgLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICBpZiAodGhpcy4kc2xpZGVzLmxlbmd0aCA+IDEpIHtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zd2lwZSkge1xuICAgICAgICB0aGlzLiRzbGlkZXMub2ZmKCdzd2lwZWxlZnQuemYub3JiaXQgc3dpcGVyaWdodC56Zi5vcmJpdCcpXG4gICAgICAgIC5vbignc3dpcGVsZWZ0LnpmLm9yYml0JywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIF90aGlzLmNoYW5nZVNsaWRlKHRydWUpO1xuICAgICAgICB9KS5vbignc3dpcGVyaWdodC56Zi5vcmJpdCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZShmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUGxheSkge1xuICAgICAgICB0aGlzLiRzbGlkZXMub24oJ2NsaWNrLnpmLm9yYml0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuJGVsZW1lbnQuZGF0YSgnY2xpY2tlZE9uJywgX3RoaXMuJGVsZW1lbnQuZGF0YSgnY2xpY2tlZE9uJykgPyBmYWxzZSA6IHRydWUpO1xuICAgICAgICAgIF90aGlzLnRpbWVyW190aGlzLiRlbGVtZW50LmRhdGEoJ2NsaWNrZWRPbicpID8gJ3BhdXNlJyA6ICdzdGFydCddKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGF1c2VPbkhvdmVyKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vbignbW91c2VlbnRlci56Zi5vcmJpdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMudGltZXIucGF1c2UoKTtcbiAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZS56Zi5vcmJpdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFfdGhpcy4kZWxlbWVudC5kYXRhKCdjbGlja2VkT24nKSkge1xuICAgICAgICAgICAgICBfdGhpcy50aW1lci5zdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMubmF2QnV0dG9ucykge1xuICAgICAgICB2YXIgJGNvbnRyb2xzID0gdGhpcy4kZWxlbWVudC5maW5kKGAuJHt0aGlzLm9wdGlvbnMubmV4dENsYXNzfSwgLiR7dGhpcy5vcHRpb25zLnByZXZDbGFzc31gKTtcbiAgICAgICAgJGNvbnRyb2xzLmF0dHIoJ3RhYmluZGV4JywgMClcbiAgICAgICAgLy9hbHNvIG5lZWQgdG8gaGFuZGxlIGVudGVyL3JldHVybiBhbmQgc3BhY2ViYXIga2V5IHByZXNzZXNcbiAgICAgICAgLm9uKCdjbGljay56Zi5vcmJpdCB0b3VjaGVuZC56Zi5vcmJpdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUoJCh0aGlzKS5oYXNDbGFzcyhfdGhpcy5vcHRpb25zLm5leHRDbGFzcykpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5idWxsZXRzKSB7XG4gICAgICAgIHRoaXMuJGJ1bGxldHMub24oJ2NsaWNrLnpmLm9yYml0IHRvdWNoZW5kLnpmLm9yYml0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKC9pcy1hY3RpdmUvZy50ZXN0KHRoaXMuY2xhc3NOYW1lKSkgeyByZXR1cm4gZmFsc2U7IH0vL2lmIHRoaXMgaXMgYWN0aXZlLCBraWNrIG91dCBvZiBmdW5jdGlvbi5cbiAgICAgICAgICB2YXIgaWR4ID0gJCh0aGlzKS5kYXRhKCdzbGlkZScpLFxuICAgICAgICAgIGx0ciA9IGlkeCA+IF90aGlzLiRzbGlkZXMuZmlsdGVyKCcuaXMtYWN0aXZlJykuZGF0YSgnc2xpZGUnKSxcbiAgICAgICAgICAkc2xpZGUgPSBfdGhpcy4kc2xpZGVzLmVxKGlkeCk7XG5cbiAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZShsdHIsICRzbGlkZSwgaWR4KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJHdyYXBwZXIuYWRkKHRoaXMuJGJ1bGxldHMpLm9uKCdrZXlkb3duLnpmLm9yYml0JywgZnVuY3Rpb24oZSkge1xuICAgICAgICAvLyBoYW5kbGUga2V5Ym9hcmQgZXZlbnQgd2l0aCBrZXlib2FyZCB1dGlsXG4gICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdPcmJpdCcsIHtcbiAgICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLmNoYW5nZVNsaWRlKHRydWUpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUoZmFsc2UpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7IC8vIGlmIGJ1bGxldCBpcyBmb2N1c2VkLCBtYWtlIHN1cmUgZm9jdXMgbW92ZXNcbiAgICAgICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyhfdGhpcy4kYnVsbGV0cykpIHtcbiAgICAgICAgICAgICAgX3RoaXMuJGJ1bGxldHMuZmlsdGVyKCcuaXMtYWN0aXZlJykuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogQ2hhbmdlcyB0aGUgY3VycmVudCBzbGlkZSB0byBhIG5ldyBvbmUuXG4gICogQGZ1bmN0aW9uXG4gICogQHBhcmFtIHtCb29sZWFufSBpc0xUUiAtIGZsYWcgaWYgdGhlIHNsaWRlIHNob3VsZCBtb3ZlIGxlZnQgdG8gcmlnaHQuXG4gICogQHBhcmFtIHtqUXVlcnl9IGNob3NlblNsaWRlIC0gdGhlIGpRdWVyeSBlbGVtZW50IG9mIHRoZSBzbGlkZSB0byBzaG93IG5leHQsIGlmIG9uZSBpcyBzZWxlY3RlZC5cbiAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gdGhlIGluZGV4IG9mIHRoZSBuZXcgc2xpZGUgaW4gaXRzIGNvbGxlY3Rpb24sIGlmIG9uZSBjaG9zZW4uXG4gICogQGZpcmVzIE9yYml0I3NsaWRlY2hhbmdlXG4gICovXG4gIGNoYW5nZVNsaWRlKGlzTFRSLCBjaG9zZW5TbGlkZSwgaWR4KSB7XG4gICAgdmFyICRjdXJTbGlkZSA9IHRoaXMuJHNsaWRlcy5maWx0ZXIoJy5pcy1hY3RpdmUnKS5lcSgwKTtcblxuICAgIGlmICgvbXVpL2cudGVzdCgkY3VyU2xpZGVbMF0uY2xhc3NOYW1lKSkgeyByZXR1cm4gZmFsc2U7IH0gLy9pZiB0aGUgc2xpZGUgaXMgY3VycmVudGx5IGFuaW1hdGluZywga2ljayBvdXQgb2YgdGhlIGZ1bmN0aW9uXG5cbiAgICB2YXIgJGZpcnN0U2xpZGUgPSB0aGlzLiRzbGlkZXMuZmlyc3QoKSxcbiAgICAkbGFzdFNsaWRlID0gdGhpcy4kc2xpZGVzLmxhc3QoKSxcbiAgICBkaXJJbiA9IGlzTFRSID8gJ1JpZ2h0JyA6ICdMZWZ0JyxcbiAgICBkaXJPdXQgPSBpc0xUUiA/ICdMZWZ0JyA6ICdSaWdodCcsXG4gICAgX3RoaXMgPSB0aGlzLFxuICAgICRuZXdTbGlkZTtcblxuICAgIGlmICghY2hvc2VuU2xpZGUpIHsgLy9tb3N0IG9mIHRoZSB0aW1lLCB0aGlzIHdpbGwgYmUgYXV0byBwbGF5ZWQgb3IgY2xpY2tlZCBmcm9tIHRoZSBuYXZCdXR0b25zLlxuICAgICAgJG5ld1NsaWRlID0gaXNMVFIgPyAvL2lmIHdyYXBwaW5nIGVuYWJsZWQsIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBhIGBuZXh0YCBvciBgcHJldmAgc2libGluZywgaWYgbm90LCBzZWxlY3QgdGhlIGZpcnN0IG9yIGxhc3Qgc2xpZGUgdG8gZmlsbCBpbi4gaWYgd3JhcHBpbmcgbm90IGVuYWJsZWQsIGF0dGVtcHQgdG8gc2VsZWN0IGBuZXh0YCBvciBgcHJldmAsIGlmIHRoZXJlJ3Mgbm90aGluZyB0aGVyZSwgdGhlIGZ1bmN0aW9uIHdpbGwga2ljayBvdXQgb24gbmV4dCBzdGVwLiBDUkFaWSBORVNURUQgVEVSTkFSSUVTISEhISFcbiAgICAgICh0aGlzLm9wdGlvbnMuaW5maW5pdGVXcmFwID8gJGN1clNsaWRlLm5leHQoYC4ke3RoaXMub3B0aW9ucy5zbGlkZUNsYXNzfWApLmxlbmd0aCA/ICRjdXJTbGlkZS5uZXh0KGAuJHt0aGlzLm9wdGlvbnMuc2xpZGVDbGFzc31gKSA6ICRmaXJzdFNsaWRlIDogJGN1clNsaWRlLm5leHQoYC4ke3RoaXMub3B0aW9ucy5zbGlkZUNsYXNzfWApKS8vcGljayBuZXh0IHNsaWRlIGlmIG1vdmluZyBsZWZ0IHRvIHJpZ2h0XG4gICAgICA6XG4gICAgICAodGhpcy5vcHRpb25zLmluZmluaXRlV3JhcCA/ICRjdXJTbGlkZS5wcmV2KGAuJHt0aGlzLm9wdGlvbnMuc2xpZGVDbGFzc31gKS5sZW5ndGggPyAkY3VyU2xpZGUucHJldihgLiR7dGhpcy5vcHRpb25zLnNsaWRlQ2xhc3N9YCkgOiAkbGFzdFNsaWRlIDogJGN1clNsaWRlLnByZXYoYC4ke3RoaXMub3B0aW9ucy5zbGlkZUNsYXNzfWApKTsvL3BpY2sgcHJldiBzbGlkZSBpZiBtb3ZpbmcgcmlnaHQgdG8gbGVmdFxuICAgIH0gZWxzZSB7XG4gICAgICAkbmV3U2xpZGUgPSBjaG9zZW5TbGlkZTtcbiAgICB9XG5cbiAgICBpZiAoJG5ld1NsaWRlLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5idWxsZXRzKSB7XG4gICAgICAgIGlkeCA9IGlkeCB8fCB0aGlzLiRzbGlkZXMuaW5kZXgoJG5ld1NsaWRlKTsgLy9ncmFiIGluZGV4IHRvIHVwZGF0ZSBidWxsZXRzXG4gICAgICAgIHRoaXMuX3VwZGF0ZUJ1bGxldHMoaWR4KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy51c2VNVUkpIHtcbiAgICAgICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZUluKFxuICAgICAgICAgICRuZXdTbGlkZS5hZGRDbGFzcygnaXMtYWN0aXZlJykuY3NzKHsncG9zaXRpb24nOiAnYWJzb2x1dGUnLCAndG9wJzogMH0pLFxuICAgICAgICAgIHRoaXMub3B0aW9uc1tgYW5pbUluRnJvbSR7ZGlySW59YF0sXG4gICAgICAgICAgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICRuZXdTbGlkZS5jc3Moeydwb3NpdGlvbic6ICdyZWxhdGl2ZScsICdkaXNwbGF5JzogJ2Jsb2NrJ30pXG4gICAgICAgICAgICAuYXR0cignYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuICAgICAgICB9KTtcblxuICAgICAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KFxuICAgICAgICAgICRjdXJTbGlkZS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyksXG4gICAgICAgICAgdGhpcy5vcHRpb25zW2BhbmltT3V0VG8ke2Rpck91dH1gXSxcbiAgICAgICAgICBmdW5jdGlvbigpe1xuICAgICAgICAgICAgJGN1clNsaWRlLnJlbW92ZUF0dHIoJ2FyaWEtbGl2ZScpO1xuICAgICAgICAgICAgaWYoX3RoaXMub3B0aW9ucy5hdXRvUGxheSAmJiAhX3RoaXMudGltZXIuaXNQYXVzZWQpe1xuICAgICAgICAgICAgICBfdGhpcy50aW1lci5yZXN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2RvIHN0dWZmP1xuICAgICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJGN1clNsaWRlLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtaW4nKS5yZW1vdmVBdHRyKCdhcmlhLWxpdmUnKS5oaWRlKCk7XG4gICAgICAgICRuZXdTbGlkZS5hZGRDbGFzcygnaXMtYWN0aXZlIGlzLWluJykuYXR0cignYXJpYS1saXZlJywgJ3BvbGl0ZScpLnNob3coKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUGxheSAmJiAhdGhpcy50aW1lci5pc1BhdXNlZCkge1xuICAgICAgICAgIHRoaXMudGltZXIucmVzdGFydCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgLyoqXG4gICAgKiBUcmlnZ2VycyB3aGVuIHRoZSBzbGlkZSBoYXMgZmluaXNoZWQgYW5pbWF0aW5nIGluLlxuICAgICogQGV2ZW50IE9yYml0I3NsaWRlY2hhbmdlXG4gICAgKi9cbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2xpZGVjaGFuZ2UuemYub3JiaXQnLCBbJG5ld1NsaWRlXSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogVXBkYXRlcyB0aGUgYWN0aXZlIHN0YXRlIG9mIHRoZSBidWxsZXRzLCBpZiBkaXNwbGF5ZWQuXG4gICogQGZ1bmN0aW9uXG4gICogQHByaXZhdGVcbiAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50IHNsaWRlLlxuICAqL1xuICBfdXBkYXRlQnVsbGV0cyhpZHgpIHtcbiAgICB2YXIgJG9sZEJ1bGxldCA9IHRoaXMuJGVsZW1lbnQuZmluZChgLiR7dGhpcy5vcHRpb25zLmJveE9mQnVsbGV0c31gKVxuICAgIC5maW5kKCcuaXMtYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpLmJsdXIoKSxcbiAgICBzcGFuID0gJG9sZEJ1bGxldC5maW5kKCdzcGFuOmxhc3QnKS5kZXRhY2goKSxcbiAgICAkbmV3QnVsbGV0ID0gdGhpcy4kYnVsbGV0cy5lcShpZHgpLmFkZENsYXNzKCdpcy1hY3RpdmUnKS5hcHBlbmQoc3Bhbik7XG4gIH1cblxuICAvKipcbiAgKiBEZXN0cm95cyB0aGUgY2Fyb3VzZWwgYW5kIGhpZGVzIHRoZSBlbGVtZW50LlxuICAqIEBmdW5jdGlvblxuICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYub3JiaXQnKS5maW5kKCcqJykub2ZmKCcuemYub3JiaXQnKS5lbmQoKS5oaWRlKCk7XG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbk9yYml0LmRlZmF1bHRzID0ge1xuICAvKipcbiAgKiBUZWxscyB0aGUgSlMgdG8gbG9vayBmb3IgYW5kIGxvYWRCdWxsZXRzLlxuICAqIEBvcHRpb25cbiAgKiBAZXhhbXBsZSB0cnVlXG4gICovXG4gIGJ1bGxldHM6IHRydWUsXG4gIC8qKlxuICAqIFRlbGxzIHRoZSBKUyB0byBhcHBseSBldmVudCBsaXN0ZW5lcnMgdG8gbmF2IGJ1dHRvbnNcbiAgKiBAb3B0aW9uXG4gICogQGV4YW1wbGUgdHJ1ZVxuICAqL1xuICBuYXZCdXR0b25zOiB0cnVlLFxuICAvKipcbiAgKiBtb3Rpb24tdWkgYW5pbWF0aW9uIGNsYXNzIHRvIGFwcGx5XG4gICogQG9wdGlvblxuICAqIEBleGFtcGxlICdzbGlkZS1pbi1yaWdodCdcbiAgKi9cbiAgYW5pbUluRnJvbVJpZ2h0OiAnc2xpZGUtaW4tcmlnaHQnLFxuICAvKipcbiAgKiBtb3Rpb24tdWkgYW5pbWF0aW9uIGNsYXNzIHRvIGFwcGx5XG4gICogQG9wdGlvblxuICAqIEBleGFtcGxlICdzbGlkZS1vdXQtcmlnaHQnXG4gICovXG4gIGFuaW1PdXRUb1JpZ2h0OiAnc2xpZGUtb3V0LXJpZ2h0JyxcbiAgLyoqXG4gICogbW90aW9uLXVpIGFuaW1hdGlvbiBjbGFzcyB0byBhcHBseVxuICAqIEBvcHRpb25cbiAgKiBAZXhhbXBsZSAnc2xpZGUtaW4tbGVmdCdcbiAgKlxuICAqL1xuICBhbmltSW5Gcm9tTGVmdDogJ3NsaWRlLWluLWxlZnQnLFxuICAvKipcbiAgKiBtb3Rpb24tdWkgYW5pbWF0aW9uIGNsYXNzIHRvIGFwcGx5XG4gICogQG9wdGlvblxuICAqIEBleGFtcGxlICdzbGlkZS1vdXQtbGVmdCdcbiAgKi9cbiAgYW5pbU91dFRvTGVmdDogJ3NsaWRlLW91dC1sZWZ0JyxcbiAgLyoqXG4gICogQWxsb3dzIE9yYml0IHRvIGF1dG9tYXRpY2FsbHkgYW5pbWF0ZSBvbiBwYWdlIGxvYWQuXG4gICogQG9wdGlvblxuICAqIEBleGFtcGxlIHRydWVcbiAgKi9cbiAgYXV0b1BsYXk6IHRydWUsXG4gIC8qKlxuICAqIEFtb3VudCBvZiB0aW1lLCBpbiBtcywgYmV0d2VlbiBzbGlkZSB0cmFuc2l0aW9uc1xuICAqIEBvcHRpb25cbiAgKiBAZXhhbXBsZSA1MDAwXG4gICovXG4gIHRpbWVyRGVsYXk6IDUwMDAsXG4gIC8qKlxuICAqIEFsbG93cyBPcmJpdCB0byBpbmZpbml0ZWx5IGxvb3AgdGhyb3VnaCB0aGUgc2xpZGVzXG4gICogQG9wdGlvblxuICAqIEBleGFtcGxlIHRydWVcbiAgKi9cbiAgaW5maW5pdGVXcmFwOiB0cnVlLFxuICAvKipcbiAgKiBBbGxvd3MgdGhlIE9yYml0IHNsaWRlcyB0byBiaW5kIHRvIHN3aXBlIGV2ZW50cyBmb3IgbW9iaWxlLCByZXF1aXJlcyBhbiBhZGRpdGlvbmFsIHV0aWwgbGlicmFyeVxuICAqIEBvcHRpb25cbiAgKiBAZXhhbXBsZSB0cnVlXG4gICovXG4gIHN3aXBlOiB0cnVlLFxuICAvKipcbiAgKiBBbGxvd3MgdGhlIHRpbWluZyBmdW5jdGlvbiB0byBwYXVzZSBhbmltYXRpb24gb24gaG92ZXIuXG4gICogQG9wdGlvblxuICAqIEBleGFtcGxlIHRydWVcbiAgKi9cbiAgcGF1c2VPbkhvdmVyOiB0cnVlLFxuICAvKipcbiAgKiBBbGxvd3MgT3JiaXQgdG8gYmluZCBrZXlib2FyZCBldmVudHMgdG8gdGhlIHNsaWRlciwgdG8gYW5pbWF0ZSBmcmFtZXMgd2l0aCBhcnJvdyBrZXlzXG4gICogQG9wdGlvblxuICAqIEBleGFtcGxlIHRydWVcbiAgKi9cbiAgYWNjZXNzaWJsZTogdHJ1ZSxcbiAgLyoqXG4gICogQ2xhc3MgYXBwbGllZCB0byB0aGUgY29udGFpbmVyIG9mIE9yYml0XG4gICogQG9wdGlvblxuICAqIEBleGFtcGxlICdvcmJpdC1jb250YWluZXInXG4gICovXG4gIGNvbnRhaW5lckNsYXNzOiAnb3JiaXQtY29udGFpbmVyJyxcbiAgLyoqXG4gICogQ2xhc3MgYXBwbGllZCB0byBpbmRpdmlkdWFsIHNsaWRlcy5cbiAgKiBAb3B0aW9uXG4gICogQGV4YW1wbGUgJ29yYml0LXNsaWRlJ1xuICAqL1xuICBzbGlkZUNsYXNzOiAnb3JiaXQtc2xpZGUnLFxuICAvKipcbiAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBidWxsZXQgY29udGFpbmVyLiBZb3UncmUgd2VsY29tZS5cbiAgKiBAb3B0aW9uXG4gICogQGV4YW1wbGUgJ29yYml0LWJ1bGxldHMnXG4gICovXG4gIGJveE9mQnVsbGV0czogJ29yYml0LWJ1bGxldHMnLFxuICAvKipcbiAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBgbmV4dGAgbmF2aWdhdGlvbiBidXR0b24uXG4gICogQG9wdGlvblxuICAqIEBleGFtcGxlICdvcmJpdC1uZXh0J1xuICAqL1xuICBuZXh0Q2xhc3M6ICdvcmJpdC1uZXh0JyxcbiAgLyoqXG4gICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYHByZXZpb3VzYCBuYXZpZ2F0aW9uIGJ1dHRvbi5cbiAgKiBAb3B0aW9uXG4gICogQGV4YW1wbGUgJ29yYml0LXByZXZpb3VzJ1xuICAqL1xuICBwcmV2Q2xhc3M6ICdvcmJpdC1wcmV2aW91cycsXG4gIC8qKlxuICAqIEJvb2xlYW4gdG8gZmxhZyB0aGUganMgdG8gdXNlIG1vdGlvbiB1aSBjbGFzc2VzIG9yIG5vdC4gRGVmYXVsdCB0byB0cnVlIGZvciBiYWNrd2FyZHMgY29tcGF0YWJpbGl0eS5cbiAgKiBAb3B0aW9uXG4gICogQGV4YW1wbGUgdHJ1ZVxuICAqL1xuICB1c2VNVUk6IHRydWVcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihPcmJpdCwgJ09yYml0Jyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBSZXNwb25zaXZlTWVudSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnVcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5hY2NvcmRpb25NZW51XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmRyaWxsZG93blxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5kcm9wZG93bi1tZW51XG4gKi9cblxuY2xhc3MgUmVzcG9uc2l2ZU1lbnUge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIHJlc3BvbnNpdmUgbWVudS5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBSZXNwb25zaXZlTWVudSNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBkcm9wZG93biBtZW51LlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgdGhpcy5ydWxlcyA9IHRoaXMuJGVsZW1lbnQuZGF0YSgncmVzcG9uc2l2ZS1tZW51Jyk7XG4gICAgdGhpcy5jdXJyZW50TXEgPSBudWxsO1xuICAgIHRoaXMuY3VycmVudFBsdWdpbiA9IG51bGw7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdSZXNwb25zaXZlTWVudScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBNZW51IGJ5IHBhcnNpbmcgdGhlIGNsYXNzZXMgZnJvbSB0aGUgJ2RhdGEtUmVzcG9uc2l2ZU1lbnUnIGF0dHJpYnV0ZSBvbiB0aGUgZWxlbWVudC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgcnVsZXNUcmVlID0ge307XG5cbiAgICAvLyBQYXJzZSBydWxlcyBmcm9tIFwiY2xhc3Nlc1wiIGluIGRhdGEgYXR0cmlidXRlXG4gICAgdmFyIHJ1bGVzID0gdGhpcy5ydWxlcy5zcGxpdCgnICcpO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGV2ZXJ5IHJ1bGUgZm91bmRcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcnVsZSA9IHJ1bGVzW2ldLnNwbGl0KCctJyk7XG4gICAgICB2YXIgcnVsZVNpemUgPSBydWxlLmxlbmd0aCA+IDEgPyBydWxlWzBdIDogJ3NtYWxsJztcbiAgICAgIHZhciBydWxlUGx1Z2luID0gcnVsZS5sZW5ndGggPiAxID8gcnVsZVsxXSA6IHJ1bGVbMF07XG5cbiAgICAgIGlmIChNZW51UGx1Z2luc1tydWxlUGx1Z2luXSAhPT0gbnVsbCkge1xuICAgICAgICBydWxlc1RyZWVbcnVsZVNpemVdID0gTWVudVBsdWdpbnNbcnVsZVBsdWdpbl07XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ydWxlcyA9IHJ1bGVzVHJlZTtcblxuICAgIGlmICghJC5pc0VtcHR5T2JqZWN0KHJ1bGVzVHJlZSkpIHtcbiAgICAgIHRoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgdGhlIE1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbigpIHtcbiAgICAgIF90aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgIH0pO1xuICAgIC8vICQod2luZG93KS5vbigncmVzaXplLnpmLlJlc3BvbnNpdmVNZW51JywgZnVuY3Rpb24oKSB7XG4gICAgLy8gICBfdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcbiAgICAvLyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIGN1cnJlbnQgc2NyZWVuIHdpZHRoIGFnYWluc3QgYXZhaWxhYmxlIG1lZGlhIHF1ZXJpZXMuIElmIHRoZSBtZWRpYSBxdWVyeSBoYXMgY2hhbmdlZCwgYW5kIHRoZSBwbHVnaW4gbmVlZGVkIGhhcyBjaGFuZ2VkLCB0aGUgcGx1Z2lucyB3aWxsIHN3YXAgb3V0LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9jaGVja01lZGlhUXVlcmllcygpIHtcbiAgICB2YXIgbWF0Y2hlZE1xLCBfdGhpcyA9IHRoaXM7XG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcnVsZSBhbmQgZmluZCB0aGUgbGFzdCBtYXRjaGluZyBydWxlXG4gICAgJC5lYWNoKHRoaXMucnVsZXMsIGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KGtleSkpIHtcbiAgICAgICAgbWF0Y2hlZE1xID0ga2V5O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gTm8gbWF0Y2g/IE5vIGRpY2VcbiAgICBpZiAoIW1hdGNoZWRNcSkgcmV0dXJuO1xuXG4gICAgLy8gUGx1Z2luIGFscmVhZHkgaW5pdGlhbGl6ZWQ/IFdlIGdvb2RcbiAgICBpZiAodGhpcy5jdXJyZW50UGx1Z2luIGluc3RhbmNlb2YgdGhpcy5ydWxlc1ttYXRjaGVkTXFdLnBsdWdpbikgcmV0dXJuO1xuXG4gICAgLy8gUmVtb3ZlIGV4aXN0aW5nIHBsdWdpbi1zcGVjaWZpYyBDU1MgY2xhc3Nlc1xuICAgICQuZWFjaChNZW51UGx1Z2lucywgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3ModmFsdWUuY3NzQ2xhc3MpO1xuICAgIH0pO1xuXG4gICAgLy8gQWRkIHRoZSBDU1MgY2xhc3MgZm9yIHRoZSBuZXcgcGx1Z2luXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLnJ1bGVzW21hdGNoZWRNcV0uY3NzQ2xhc3MpO1xuXG4gICAgLy8gQ3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBuZXcgcGx1Z2luXG4gICAgaWYgKHRoaXMuY3VycmVudFBsdWdpbikgdGhpcy5jdXJyZW50UGx1Z2luLmRlc3Ryb3koKTtcbiAgICB0aGlzLmN1cnJlbnRQbHVnaW4gPSBuZXcgdGhpcy5ydWxlc1ttYXRjaGVkTXFdLnBsdWdpbih0aGlzLiRlbGVtZW50LCB7fSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGluc3RhbmNlIG9mIHRoZSBjdXJyZW50IHBsdWdpbiBvbiB0aGlzIGVsZW1lbnQsIGFzIHdlbGwgYXMgdGhlIHdpbmRvdyByZXNpemUgaGFuZGxlciB0aGF0IHN3aXRjaGVzIHRoZSBwbHVnaW5zIG91dC5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY3VycmVudFBsdWdpbi5kZXN0cm95KCk7XG4gICAgJCh3aW5kb3cpLm9mZignLnpmLlJlc3BvbnNpdmVNZW51Jyk7XG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cblJlc3BvbnNpdmVNZW51LmRlZmF1bHRzID0ge307XG5cbi8vIFRoZSBwbHVnaW4gbWF0Y2hlcyB0aGUgcGx1Z2luIGNsYXNzZXMgd2l0aCB0aGVzZSBwbHVnaW4gaW5zdGFuY2VzLlxudmFyIE1lbnVQbHVnaW5zID0ge1xuICBkcm9wZG93bjoge1xuICAgIGNzc0NsYXNzOiAnZHJvcGRvd24nLFxuICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snZHJvcGRvd24tbWVudSddIHx8IG51bGxcbiAgfSxcbiBkcmlsbGRvd246IHtcbiAgICBjc3NDbGFzczogJ2RyaWxsZG93bicsXG4gICAgcGx1Z2luOiBGb3VuZGF0aW9uLl9wbHVnaW5zWydkcmlsbGRvd24nXSB8fCBudWxsXG4gIH0sXG4gIGFjY29yZGlvbjoge1xuICAgIGNzc0NsYXNzOiAnYWNjb3JkaW9uLW1lbnUnLFxuICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snYWNjb3JkaW9uLW1lbnUnXSB8fCBudWxsXG4gIH1cbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihSZXNwb25zaXZlTWVudSwgJ1Jlc3BvbnNpdmVNZW51Jyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBSZXNwb25zaXZlVG9nZ2xlIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5yZXNwb25zaXZlVG9nZ2xlXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqL1xuXG5jbGFzcyBSZXNwb25zaXZlVG9nZ2xlIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgVGFiIEJhci5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBSZXNwb25zaXZlVG9nZ2xlI2luaXRcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGF0dGFjaCB0YWIgYmFyIGZ1bmN0aW9uYWxpdHkgdG8uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgUmVzcG9uc2l2ZVRvZ2dsZS5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnUmVzcG9uc2l2ZVRvZ2dsZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSB0YWIgYmFyIGJ5IGZpbmRpbmcgdGhlIHRhcmdldCBlbGVtZW50LCB0b2dnbGluZyBlbGVtZW50LCBhbmQgcnVubmluZyB1cGRhdGUoKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgdGFyZ2V0SUQgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ3Jlc3BvbnNpdmUtdG9nZ2xlJyk7XG4gICAgaWYgKCF0YXJnZXRJRCkge1xuICAgICAgY29uc29sZS5lcnJvcignWW91ciB0YWIgYmFyIG5lZWRzIGFuIElEIG9mIGEgTWVudSBhcyB0aGUgdmFsdWUgb2YgZGF0YS10YWItYmFyLicpO1xuICAgIH1cblxuICAgIHRoaXMuJHRhcmdldE1lbnUgPSAkKGAjJHt0YXJnZXRJRH1gKTtcbiAgICB0aGlzLiR0b2dnbGVyID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS10b2dnbGVdJyk7XG5cbiAgICB0aGlzLl91cGRhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIG5lY2Vzc2FyeSBldmVudCBoYW5kbGVycyBmb3IgdGhlIHRhYiBiYXIgdG8gd29yay5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3VwZGF0ZS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuJHRvZ2dsZXIub24oJ2NsaWNrLnpmLnJlc3BvbnNpdmVUb2dnbGUnLCB0aGlzLnRvZ2dsZU1lbnUuYmluZCh0aGlzKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5IHRvIGRldGVybWluZSBpZiB0aGUgdGFiIGJhciBzaG91bGQgYmUgdmlzaWJsZSBvciBoaWRkZW4uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3VwZGF0ZSgpIHtcbiAgICAvLyBNb2JpbGVcbiAgICBpZiAoIUZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KHRoaXMub3B0aW9ucy5oaWRlRm9yKSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5zaG93KCk7XG4gICAgICB0aGlzLiR0YXJnZXRNZW51LmhpZGUoKTtcbiAgICB9XG5cbiAgICAvLyBEZXNrdG9wXG4gICAgZWxzZSB7XG4gICAgICB0aGlzLiRlbGVtZW50LmhpZGUoKTtcbiAgICAgIHRoaXMuJHRhcmdldE1lbnUuc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBlbGVtZW50IGF0dGFjaGVkIHRvIHRoZSB0YWIgYmFyLiBUaGUgdG9nZ2xlIG9ubHkgaGFwcGVucyBpZiB0aGUgc2NyZWVuIGlzIHNtYWxsIGVub3VnaCB0byBhbGxvdyBpdC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBmaXJlcyBSZXNwb25zaXZlVG9nZ2xlI3RvZ2dsZWRcbiAgICovXG4gIHRvZ2dsZU1lbnUoKSB7XG4gICAgaWYgKCFGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCh0aGlzLm9wdGlvbnMuaGlkZUZvcikpIHtcbiAgICAgIHRoaXMuJHRhcmdldE1lbnUudG9nZ2xlKDApO1xuXG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIGVsZW1lbnQgYXR0YWNoZWQgdG8gdGhlIHRhYiBiYXIgdG9nZ2xlcy5cbiAgICAgICAqIEBldmVudCBSZXNwb25zaXZlVG9nZ2xlI3RvZ2dsZWRcbiAgICAgICAqL1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCd0b2dnbGVkLnpmLnJlc3BvbnNpdmVUb2dnbGUnKTtcbiAgICB9XG4gIH07XG5cbiAgZGVzdHJveSgpIHtcbiAgICAvL1RPRE8gdGhpcy4uLlxuICB9XG59XG5cblJlc3BvbnNpdmVUb2dnbGUuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBUaGUgYnJlYWtwb2ludCBhZnRlciB3aGljaCB0aGUgbWVudSBpcyBhbHdheXMgc2hvd24sIGFuZCB0aGUgdGFiIGJhciBpcyBoaWRkZW4uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ21lZGl1bSdcbiAgICovXG4gIGhpZGVGb3I6ICdtZWRpdW0nXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oUmVzcG9uc2l2ZVRvZ2dsZSwgJ1Jlc3BvbnNpdmVUb2dnbGUnKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFJldmVhbCBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ucmV2ZWFsXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmJveFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvbiBpZiB1c2luZyBhbmltYXRpb25zXG4gKi9cblxuY2xhc3MgUmV2ZWFsIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgUmV2ZWFsLlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBmb3IgdGhlIG1vZGFsLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIG9wdGlvbmFsIHBhcmFtZXRlcnMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFJldmVhbC5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1JldmVhbCcpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ1JldmVhbCcsIHtcbiAgICAgICdFTlRFUic6ICdvcGVuJyxcbiAgICAgICdTUEFDRSc6ICdvcGVuJyxcbiAgICAgICdFU0NBUEUnOiAnY2xvc2UnLFxuICAgICAgJ1RBQic6ICd0YWJfZm9yd2FyZCcsXG4gICAgICAnU0hJRlRfVEFCJzogJ3RhYl9iYWNrd2FyZCdcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbW9kYWwgYnkgYWRkaW5nIHRoZSBvdmVybGF5IGFuZCBjbG9zZSBidXR0b25zLCAoaWYgc2VsZWN0ZWQpLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy5pZCA9IHRoaXMuJGVsZW1lbnQuYXR0cignaWQnKTtcbiAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5jYWNoZWQgPSB7bXE6IEZvdW5kYXRpb24uTWVkaWFRdWVyeS5jdXJyZW50fTtcbiAgICB0aGlzLmlzaU9TID0gaVBob25lU25pZmYoKTtcblxuICAgIGlmKHRoaXMuaXNpT1MpeyB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdpcy1pb3MnKTsgfVxuXG4gICAgdGhpcy4kYW5jaG9yID0gJChgW2RhdGEtb3Blbj1cIiR7dGhpcy5pZH1cIl1gKS5sZW5ndGggPyAkKGBbZGF0YS1vcGVuPVwiJHt0aGlzLmlkfVwiXWApIDogJChgW2RhdGEtdG9nZ2xlPVwiJHt0aGlzLmlkfVwiXWApO1xuXG4gICAgaWYgKHRoaXMuJGFuY2hvci5sZW5ndGgpIHtcbiAgICAgIHZhciBhbmNob3JJZCA9IHRoaXMuJGFuY2hvclswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdyZXZlYWwnKTtcblxuICAgICAgdGhpcy4kYW5jaG9yLmF0dHIoe1xuICAgICAgICAnYXJpYS1jb250cm9scyc6IHRoaXMuaWQsXG4gICAgICAgICdpZCc6IGFuY2hvcklkLFxuICAgICAgICAnYXJpYS1oYXNwb3B1cCc6IHRydWUsXG4gICAgICAgICd0YWJpbmRleCc6IDBcbiAgICAgIH0pO1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKHsnYXJpYS1sYWJlbGxlZGJ5JzogYW5jaG9ySWR9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmZ1bGxTY3JlZW4gfHwgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZnVsbCcpKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZnVsbFNjcmVlbiA9IHRydWU7XG4gICAgICB0aGlzLm9wdGlvbnMub3ZlcmxheSA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJsYXkgJiYgIXRoaXMuJG92ZXJsYXkpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkgPSB0aGlzLl9tYWtlT3ZlcmxheSh0aGlzLmlkKTtcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoe1xuICAgICAgICAncm9sZSc6ICdkaWFsb2cnLFxuICAgICAgICAnYXJpYS1oaWRkZW4nOiB0cnVlLFxuICAgICAgICAnZGF0YS15ZXRpLWJveCc6IHRoaXMuaWQsXG4gICAgICAgICdkYXRhLXJlc2l6ZSc6IHRoaXMuaWRcbiAgICB9KTtcblxuICAgIGlmKHRoaXMuJG92ZXJsYXkpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuZGV0YWNoKCkuYXBwZW5kVG8odGhpcy4kb3ZlcmxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuZGV0YWNoKCkuYXBwZW5kVG8oJCgnYm9keScpKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ3dpdGhvdXQtb3ZlcmxheScpO1xuICAgIH1cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rICYmIHdpbmRvdy5sb2NhdGlvbi5oYXNoID09PSAoIGAjJHt0aGlzLmlkfWApKSB7XG4gICAgICAkKHdpbmRvdykub25lKCdsb2FkLnpmLnJldmVhbCcsIHRoaXMub3Blbi5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvdmVybGF5IGRpdiB0byBkaXNwbGF5IGJlaGluZCB0aGUgbW9kYWwuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfbWFrZU92ZXJsYXkoaWQpIHtcbiAgICB2YXIgJG92ZXJsYXkgPSAkKCc8ZGl2PjwvZGl2PicpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygncmV2ZWFsLW92ZXJsYXknKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cih7J3RhYmluZGV4JzogLTEsICdhcmlhLWhpZGRlbic6IHRydWV9KVxuICAgICAgICAgICAgICAgICAgICAuYXBwZW5kVG8oJ2JvZHknKTtcbiAgICByZXR1cm4gJG92ZXJsYXk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBwb3NpdGlvbiBvZiBtb2RhbFxuICAgKiBUT0RPOiAgRmlndXJlIG91dCBpZiB3ZSBhY3R1YWxseSBuZWVkIHRvIGNhY2hlIHRoZXNlIHZhbHVlcyBvciBpZiBpdCBkb2Vzbid0IG1hdHRlclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3VwZGF0ZVBvc2l0aW9uKCkge1xuICAgIHZhciB3aWR0aCA9IHRoaXMuJGVsZW1lbnQub3V0ZXJXaWR0aCgpO1xuICAgIHZhciBvdXRlcldpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuJGVsZW1lbnQub3V0ZXJIZWlnaHQoKTtcbiAgICB2YXIgb3V0ZXJIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgdmFyIGxlZnQgPSBwYXJzZUludCgob3V0ZXJXaWR0aCAtIHdpZHRoKSAvIDIsIDEwKTtcbiAgICB2YXIgdG9wO1xuICAgIGlmIChoZWlnaHQgPiBvdXRlckhlaWdodCkge1xuICAgICAgdG9wID0gcGFyc2VJbnQoTWF0aC5taW4oMTAwLCBvdXRlckhlaWdodCAvIDEwKSwgMTApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3AgPSBwYXJzZUludCgob3V0ZXJIZWlnaHQgLSBoZWlnaHQpIC8gNCwgMTApO1xuICAgIH1cbiAgICB0aGlzLiRlbGVtZW50LmNzcyh7dG9wOiB0b3AgKyAncHgnfSk7XG4gICAgLy8gb25seSB3b3JyeSBhYm91dCBsZWZ0IGlmIHdlIGRvbid0IGhhdmUgYW4gb3ZlcmxheSwgb3RoZXJ3aXNlIHdlJ3JlIHBlcmZlY3RseSBpbiB0aGUgbWlkZGxlXG4gICAgaWYoIXRoaXMuJG92ZXJsYXkpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuY3NzKHtsZWZ0OiBsZWZ0ICsgJ3B4J30pO1xuICAgIH1cblxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIHRoZSBtb2RhbC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnQub24oe1xuICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgJ2Nsb3NlLnpmLnRyaWdnZXInOiB0aGlzLmNsb3NlLmJpbmQodGhpcyksXG4gICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpLFxuICAgICAgJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInOiBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuX3VwZGF0ZVBvc2l0aW9uKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy4kYW5jaG9yLmxlbmd0aCkge1xuICAgICAgdGhpcy4kYW5jaG9yLm9uKCdrZXlkb3duLnpmLnJldmVhbCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDEzIHx8IGUud2hpY2ggPT09IDMyKSB7XG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgX3RoaXMub3BlbigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayAmJiB0aGlzLm9wdGlvbnMub3ZlcmxheSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5vZmYoJy56Zi5yZXZlYWwnKS5vbignY2xpY2suemYucmV2ZWFsJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQgPT09IF90aGlzLiRlbGVtZW50WzBdIHx8ICQuY29udGFpbnMoX3RoaXMuJGVsZW1lbnRbMF0sIGUudGFyZ2V0KSkgeyByZXR1cm47IH1cbiAgICAgICAgX3RoaXMuY2xvc2UoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub24oYHBvcHN0YXRlLnpmLnJldmVhbDoke3RoaXMuaWR9YCwgdGhpcy5faGFuZGxlU3RhdGUuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgbW9kYWwgbWV0aG9kcyBvbiBiYWNrL2ZvcndhcmQgYnV0dG9uIGNsaWNrcyBvciBhbnkgb3RoZXIgZXZlbnQgdGhhdCB0cmlnZ2VycyBwb3BzdGF0ZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9oYW5kbGVTdGF0ZShlKSB7XG4gICAgaWYod2luZG93LmxvY2F0aW9uLmhhc2ggPT09ICggJyMnICsgdGhpcy5pZCkgJiYgIXRoaXMuaXNBY3RpdmUpeyB0aGlzLm9wZW4oKTsgfVxuICAgIGVsc2V7IHRoaXMuY2xvc2UoKTsgfVxuICB9XG5cblxuICAvKipcbiAgICogT3BlbnMgdGhlIG1vZGFsIGNvbnRyb2xsZWQgYnkgYHRoaXMuJGFuY2hvcmAsIGFuZCBjbG9zZXMgYWxsIG90aGVycyBieSBkZWZhdWx0LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIFJldmVhbCNjbG9zZW1lXG4gICAqIEBmaXJlcyBSZXZlYWwjb3BlblxuICAgKi9cbiAgb3BlbigpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB2YXIgaGFzaCA9IGAjJHt0aGlzLmlkfWA7XG5cbiAgICAgIGlmICh3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpIHtcbiAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIGhhc2gpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlO1xuXG4gICAgLy8gTWFrZSBlbGVtZW50cyBpbnZpc2libGUsIGJ1dCByZW1vdmUgZGlzcGxheTogbm9uZSBzbyB3ZSBjYW4gZ2V0IHNpemUgYW5kIHBvc2l0aW9uaW5nXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAuY3NzKHsgJ3Zpc2liaWxpdHknOiAnaGlkZGVuJyB9KVxuICAgICAgICAuc2hvdygpXG4gICAgICAgIC5zY3JvbGxUb3AoMCk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5vdmVybGF5KSB7XG4gICAgICB0aGlzLiRvdmVybGF5LmNzcyh7J3Zpc2liaWxpdHknOiAnaGlkZGVuJ30pLnNob3coKTtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbigpO1xuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLmhpZGUoKVxuICAgICAgLmNzcyh7ICd2aXNpYmlsaXR5JzogJycgfSk7XG5cbiAgICBpZih0aGlzLiRvdmVybGF5KSB7XG4gICAgICB0aGlzLiRvdmVybGF5LmNzcyh7J3Zpc2liaWxpdHknOiAnJ30pLmhpZGUoKTtcbiAgICB9XG5cblxuICAgIGlmICghdGhpcy5vcHRpb25zLm11bHRpcGxlT3BlbmVkKSB7XG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgbW9kYWwgb3BlbnMuXG4gICAgICAgKiBDbG9zZXMgYW55IG90aGVyIG1vZGFscyB0aGF0IGFyZSBjdXJyZW50bHkgb3BlblxuICAgICAgICogQGV2ZW50IFJldmVhbCNjbG9zZW1lXG4gICAgICAgKi9cbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2xvc2VtZS56Zi5yZXZlYWwnLCB0aGlzLmlkKTtcbiAgICB9XG5cbiAgICAvLyBNb3Rpb24gVUkgbWV0aG9kIG9mIHJldmVhbFxuICAgIGlmICh0aGlzLm9wdGlvbnMuYW5pbWF0aW9uSW4pIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMub3ZlcmxheSkge1xuICAgICAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlSW4odGhpcy4kb3ZlcmxheSwgJ2ZhZGUtaW4nKTtcbiAgICAgIH1cbiAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVJbih0aGlzLiRlbGVtZW50LCB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uSW4sIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmZvY3VzYWJsZUVsZW1lbnRzID0gRm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGpRdWVyeSBtZXRob2Qgb2YgcmV2ZWFsXG4gICAgZWxzZSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJsYXkpIHtcbiAgICAgICAgdGhpcy4kb3ZlcmxheS5zaG93KDApO1xuICAgICAgfVxuICAgICAgdGhpcy4kZWxlbWVudC5zaG93KHRoaXMub3B0aW9ucy5zaG93RGVsYXkpO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBhY2Nlc3NpYmlsaXR5XG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLmF0dHIoe1xuICAgICAgICAnYXJpYS1oaWRkZW4nOiBmYWxzZSxcbiAgICAgICAgJ3RhYmluZGV4JzogLTFcbiAgICAgIH0pXG4gICAgICAuZm9jdXMoKTtcblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIG1vZGFsIGhhcyBzdWNjZXNzZnVsbHkgb3BlbmVkLlxuICAgICAqIEBldmVudCBSZXZlYWwjb3BlblxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignb3Blbi56Zi5yZXZlYWwnKTtcblxuICAgIGlmICh0aGlzLmlzaU9TKSB7XG4gICAgICB2YXIgc2Nyb2xsUG9zID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgICAgJCgnaHRtbCwgYm9keScpLmFkZENsYXNzKCdpcy1yZXZlYWwtb3BlbicpLnNjcm9sbFRvcChzY3JvbGxQb3MpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKTtcbiAgICB9XG5cbiAgICAkKCdib2R5JylcbiAgICAgIC5hZGRDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKVxuICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgKHRoaXMub3B0aW9ucy5vdmVybGF5IHx8IHRoaXMub3B0aW9ucy5mdWxsU2NyZWVuKSA/IHRydWUgOiBmYWxzZSk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX2V4dHJhSGFuZGxlcnMoKTtcbiAgICB9LCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV4dHJhIGV2ZW50IGhhbmRsZXJzIGZvciB0aGUgYm9keSBhbmQgd2luZG93IGlmIG5lY2Vzc2FyeS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9leHRyYUhhbmRsZXJzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5mb2N1c2FibGVFbGVtZW50cyA9IEZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZSh0aGlzLiRlbGVtZW50KTtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLm92ZXJsYXkgJiYgdGhpcy5vcHRpb25zLmNsb3NlT25DbGljayAmJiAhdGhpcy5vcHRpb25zLmZ1bGxTY3JlZW4pIHtcbiAgICAgICQoJ2JvZHknKS5vbignY2xpY2suemYucmV2ZWFsJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQgPT09IF90aGlzLiRlbGVtZW50WzBdIHx8ICQuY29udGFpbnMoX3RoaXMuJGVsZW1lbnRbMF0sIGUudGFyZ2V0KSkgeyByZXR1cm47IH1cbiAgICAgICAgX3RoaXMuY2xvc2UoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkVzYykge1xuICAgICAgJCh3aW5kb3cpLm9uKCdrZXlkb3duLnpmLnJldmVhbCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ1JldmVhbCcsIHtcbiAgICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy5jbG9zZU9uRXNjKSB7XG4gICAgICAgICAgICAgIF90aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICAgIF90aGlzLiRhbmNob3IuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoX3RoaXMuZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoID09PSAwKSB7IC8vIG5vIGZvY3VzYWJsZSBlbGVtZW50cyBpbnNpZGUgdGhlIG1vZGFsIGF0IGFsbCwgcHJldmVudCB0YWJiaW5nIGluIGdlbmVyYWxcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGxvY2sgZm9jdXMgd2l0aGluIG1vZGFsIHdoaWxlIHRhYmJpbmdcbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdrZXlkb3duLnpmLnJldmVhbCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciAkdGFyZ2V0ID0gJCh0aGlzKTtcbiAgICAgIC8vIGhhbmRsZSBrZXlib2FyZCBldmVudCB3aXRoIGtleWJvYXJkIHV0aWxcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdSZXZlYWwnLCB7XG4gICAgICAgIHRhYl9mb3J3YXJkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoX3RoaXMuJGVsZW1lbnQuZmluZCgnOmZvY3VzJykuaXMoX3RoaXMuZm9jdXNhYmxlRWxlbWVudHMuZXEoLTEpKSkgeyAvLyBsZWZ0IG1vZGFsIGRvd253YXJkcywgc2V0dGluZyBmb2N1cyB0byBmaXJzdCBlbGVtZW50XG4gICAgICAgICAgICBfdGhpcy5mb2N1c2FibGVFbGVtZW50cy5lcSgwKS5mb2N1cygpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdGFiX2JhY2t3YXJkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoX3RoaXMuJGVsZW1lbnQuZmluZCgnOmZvY3VzJykuaXMoX3RoaXMuZm9jdXNhYmxlRWxlbWVudHMuZXEoMCkpIHx8IF90aGlzLiRlbGVtZW50LmlzKCc6Zm9jdXMnKSkgeyAvLyBsZWZ0IG1vZGFsIHVwd2FyZHMsIHNldHRpbmcgZm9jdXMgdG8gbGFzdCBlbGVtZW50XG4gICAgICAgICAgICBfdGhpcy5mb2N1c2FibGVFbGVtZW50cy5lcSgtMSkuZm9jdXMoKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChfdGhpcy4kZWxlbWVudC5maW5kKCc6Zm9jdXMnKS5pcyhfdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1jbG9zZV0nKSkpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IC8vIHNldCBmb2N1cyBiYWNrIHRvIGFuY2hvciBpZiBjbG9zZSBidXR0b24gaGFzIGJlZW4gYWN0aXZhdGVkXG4gICAgICAgICAgICAgIF90aGlzLiRhbmNob3IuZm9jdXMoKTtcbiAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoJHRhcmdldC5pcyhfdGhpcy5mb2N1c2FibGVFbGVtZW50cykpIHsgLy8gZG9udCd0IHRyaWdnZXIgaWYgYWN1YWwgZWxlbWVudCBoYXMgZm9jdXMgKGkuZS4gaW5wdXRzLCBsaW5rcywgLi4uKVxuICAgICAgICAgICAgX3RoaXMub3BlbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmNsb3NlT25Fc2MpIHtcbiAgICAgICAgICAgIF90aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICBfdGhpcy4kYW5jaG9yLmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIG1vZGFsLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIFJldmVhbCNjbG9zZWRcbiAgICovXG4gIGNsb3NlKCkge1xuICAgIGlmICghdGhpcy5pc0FjdGl2ZSB8fCAhdGhpcy4kZWxlbWVudC5pcygnOnZpc2libGUnKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLy8gTW90aW9uIFVJIG1ldGhvZCBvZiBoaWRpbmdcbiAgICBpZiAodGhpcy5vcHRpb25zLmFuaW1hdGlvbk91dCkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5vdmVybGF5KSB7XG4gICAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQodGhpcy4kb3ZlcmxheSwgJ2ZhZGUtb3V0JywgZmluaXNoVXApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGZpbmlzaFVwKCk7XG4gICAgICB9XG5cbiAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQodGhpcy4kZWxlbWVudCwgdGhpcy5vcHRpb25zLmFuaW1hdGlvbk91dCk7XG4gICAgfVxuICAgIC8vIGpRdWVyeSBtZXRob2Qgb2YgaGlkaW5nXG4gICAgZWxzZSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJsYXkpIHtcbiAgICAgICAgdGhpcy4kb3ZlcmxheS5oaWRlKDAsIGZpbmlzaFVwKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBmaW5pc2hVcCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRlbGVtZW50LmhpZGUodGhpcy5vcHRpb25zLmhpZGVEZWxheSk7XG4gICAgfVxuXG4gICAgLy8gQ29uZGl0aW9uYWxzIHRvIHJlbW92ZSBleHRyYSBldmVudCBsaXN0ZW5lcnMgYWRkZWQgb24gb3BlblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkVzYykge1xuICAgICAgJCh3aW5kb3cpLm9mZigna2V5ZG93bi56Zi5yZXZlYWwnKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5vdmVybGF5ICYmIHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2spIHtcbiAgICAgICQoJ2JvZHknKS5vZmYoJ2NsaWNrLnpmLnJldmVhbCcpO1xuICAgIH1cblxuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdrZXlkb3duLnpmLnJldmVhbCcpO1xuXG4gICAgZnVuY3Rpb24gZmluaXNoVXAoKSB7XG4gICAgICBpZiAoX3RoaXMuaXNpT1MpIHtcbiAgICAgICAgJCgnaHRtbCwgYm9keScpLnJlbW92ZUNsYXNzKCdpcy1yZXZlYWwtb3BlbicpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKTtcbiAgICAgIH1cblxuICAgICAgJCgnYm9keScpLmF0dHIoe1xuICAgICAgICAnYXJpYS1oaWRkZW4nOiBmYWxzZSxcbiAgICAgICAgJ3RhYmluZGV4JzogJydcbiAgICAgIH0pO1xuXG4gICAgICBfdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuXG4gICAgICAvKipcbiAgICAgICogRmlyZXMgd2hlbiB0aGUgbW9kYWwgaXMgZG9uZSBjbG9zaW5nLlxuICAgICAgKiBAZXZlbnQgUmV2ZWFsI2Nsb3NlZFxuICAgICAgKi9cbiAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Nsb3NlZC56Zi5yZXZlYWwnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqIFJlc2V0cyB0aGUgbW9kYWwgY29udGVudFxuICAgICogVGhpcyBwcmV2ZW50cyBhIHJ1bm5pbmcgdmlkZW8gdG8ga2VlcCBnb2luZyBpbiB0aGUgYmFja2dyb3VuZFxuICAgICovXG4gICAgaWYgKHRoaXMub3B0aW9ucy5yZXNldE9uQ2xvc2UpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuaHRtbCh0aGlzLiRlbGVtZW50Lmh0bWwoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICBpZiAoX3RoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgIGlmICh3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUpIHtcbiAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShcIlwiLCBkb2N1bWVudC50aXRsZSwgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgICAgICB9IGVsc2Uge1xuICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnJztcbiAgICAgICB9XG4gICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBvcGVuL2Nsb3NlZCBzdGF0ZSBvZiBhIG1vZGFsLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5pc0FjdGl2ZSkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wZW4oKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGEgbW9kYWwuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJsYXkpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkuaGlkZSgpLm9mZigpLnJlbW92ZSgpO1xuICAgIH1cbiAgICB0aGlzLiRlbGVtZW50LmhpZGUoKS5vZmYoKTtcbiAgICB0aGlzLiRhbmNob3Iub2ZmKCcuemYnKTtcbiAgICAkKHdpbmRvdykub2ZmKGAuemYucmV2ZWFsOiR7dGhpcy5pZH1gKTtcblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfTtcbn1cblxuUmV2ZWFsLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogTW90aW9uLVVJIGNsYXNzIHRvIHVzZSBmb3IgYW5pbWF0ZWQgZWxlbWVudHMuIElmIG5vbmUgdXNlZCwgZGVmYXVsdHMgdG8gc2ltcGxlIHNob3cvaGlkZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnc2xpZGUtaW4tbGVmdCdcbiAgICovXG4gIGFuaW1hdGlvbkluOiAnJyxcbiAgLyoqXG4gICAqIE1vdGlvbi1VSSBjbGFzcyB0byB1c2UgZm9yIGFuaW1hdGVkIGVsZW1lbnRzLiBJZiBub25lIHVzZWQsIGRlZmF1bHRzIHRvIHNpbXBsZSBzaG93L2hpZGUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ3NsaWRlLW91dC1yaWdodCdcbiAgICovXG4gIGFuaW1hdGlvbk91dDogJycsXG4gIC8qKlxuICAgKiBUaW1lLCBpbiBtcywgdG8gZGVsYXkgdGhlIG9wZW5pbmcgb2YgYSBtb2RhbCBhZnRlciBhIGNsaWNrIGlmIG5vIGFuaW1hdGlvbiB1c2VkLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDEwXG4gICAqL1xuICBzaG93RGVsYXk6IDAsXG4gIC8qKlxuICAgKiBUaW1lLCBpbiBtcywgdG8gZGVsYXkgdGhlIGNsb3Npbmcgb2YgYSBtb2RhbCBhZnRlciBhIGNsaWNrIGlmIG5vIGFuaW1hdGlvbiB1c2VkLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDEwXG4gICAqL1xuICBoaWRlRGVsYXk6IDAsXG4gIC8qKlxuICAgKiBBbGxvd3MgYSBjbGljayBvbiB0aGUgYm9keS9vdmVybGF5IHRvIGNsb3NlIHRoZSBtb2RhbC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IHRydWUsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIG1vZGFsIHRvIGNsb3NlIGlmIHRoZSB1c2VyIHByZXNzZXMgdGhlIGBFU0NBUEVgIGtleS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBjbG9zZU9uRXNjOiB0cnVlLFxuICAvKipcbiAgICogSWYgdHJ1ZSwgYWxsb3dzIG11bHRpcGxlIG1vZGFscyB0byBiZSBkaXNwbGF5ZWQgYXQgb25jZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgbXVsdGlwbGVPcGVuZWQ6IGZhbHNlLFxuICAvKipcbiAgICogRGlzdGFuY2UsIGluIHBpeGVscywgdGhlIG1vZGFsIHNob3VsZCBwdXNoIGRvd24gZnJvbSB0aGUgdG9wIG9mIHRoZSBzY3JlZW4uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgMTAwXG4gICAqL1xuICB2T2Zmc2V0OiAxMDAsXG4gIC8qKlxuICAgKiBEaXN0YW5jZSwgaW4gcGl4ZWxzLCB0aGUgbW9kYWwgc2hvdWxkIHB1c2ggaW4gZnJvbSB0aGUgc2lkZSBvZiB0aGUgc2NyZWVuLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDBcbiAgICovXG4gIGhPZmZzZXQ6IDAsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIG1vZGFsIHRvIGJlIGZ1bGxzY3JlZW4sIGNvbXBsZXRlbHkgYmxvY2tpbmcgb3V0IHRoZSByZXN0IG9mIHRoZSB2aWV3LiBKUyBjaGVja3MgZm9yIHRoaXMgYXMgd2VsbC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgZnVsbFNjcmVlbjogZmFsc2UsXG4gIC8qKlxuICAgKiBQZXJjZW50YWdlIG9mIHNjcmVlbiBoZWlnaHQgdGhlIG1vZGFsIHNob3VsZCBwdXNoIHVwIGZyb20gdGhlIGJvdHRvbSBvZiB0aGUgdmlldy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxMFxuICAgKi9cbiAgYnRtT2Zmc2V0UGN0OiAxMCxcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgbW9kYWwgdG8gZ2VuZXJhdGUgYW4gb3ZlcmxheSBkaXYsIHdoaWNoIHdpbGwgY292ZXIgdGhlIHZpZXcgd2hlbiBtb2RhbCBvcGVucy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBvdmVybGF5OiB0cnVlLFxuICAvKipcbiAgICogQWxsb3dzIHRoZSBtb2RhbCB0byByZW1vdmUgYW5kIHJlaW5qZWN0IG1hcmt1cCBvbiBjbG9zZS4gU2hvdWxkIGJlIHRydWUgaWYgdXNpbmcgdmlkZW8gZWxlbWVudHMgdy9vIHVzaW5nIHByb3ZpZGVyJ3MgYXBpLCBvdGhlcndpc2UsIHZpZGVvcyB3aWxsIGNvbnRpbnVlIHRvIHBsYXkgaW4gdGhlIGJhY2tncm91bmQuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIHJlc2V0T25DbG9zZTogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIG1vZGFsIHRvIGFsdGVyIHRoZSB1cmwgb24gb3Blbi9jbG9zZSwgYW5kIGFsbG93cyB0aGUgdXNlIG9mIHRoZSBgYmFja2AgYnV0dG9uIHRvIGNsb3NlIG1vZGFscy4gQUxTTywgYWxsb3dzIGEgbW9kYWwgdG8gYXV0by1tYW5pYWNhbGx5IG9wZW4gb24gcGFnZSBsb2FkIElGIHRoZSBoYXNoID09PSB0aGUgbW9kYWwncyB1c2VyLXNldCBpZC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgZGVlcExpbms6IGZhbHNlXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oUmV2ZWFsLCAnUmV2ZWFsJyk7XG5cbmZ1bmN0aW9uIGlQaG9uZVNuaWZmKCkge1xuICByZXR1cm4gL2lQKGFkfGhvbmV8b2QpLipPUy8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCk7XG59XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBTbGlkZXIgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnNsaWRlclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudG91Y2hcbiAqL1xuXG5jbGFzcyBTbGlkZXIge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIGRyaWxsZG93biBtZW51LlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhbiBhY2NvcmRpb24gbWVudS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBTbGlkZXIuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1NsaWRlcicpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ1NsaWRlcicsIHtcbiAgICAgICdsdHInOiB7XG4gICAgICAgICdBUlJPV19SSUdIVCc6ICdpbmNyZWFzZScsXG4gICAgICAgICdBUlJPV19VUCc6ICdpbmNyZWFzZScsXG4gICAgICAgICdBUlJPV19ET1dOJzogJ2RlY3JlYXNlJyxcbiAgICAgICAgJ0FSUk9XX0xFRlQnOiAnZGVjcmVhc2UnLFxuICAgICAgICAnU0hJRlRfQVJST1dfUklHSFQnOiAnaW5jcmVhc2VfZmFzdCcsXG4gICAgICAgICdTSElGVF9BUlJPV19VUCc6ICdpbmNyZWFzZV9mYXN0JyxcbiAgICAgICAgJ1NISUZUX0FSUk9XX0RPV04nOiAnZGVjcmVhc2VfZmFzdCcsXG4gICAgICAgICdTSElGVF9BUlJPV19MRUZUJzogJ2RlY3JlYXNlX2Zhc3QnXG4gICAgICB9LFxuICAgICAgJ3J0bCc6IHtcbiAgICAgICAgJ0FSUk9XX0xFRlQnOiAnaW5jcmVhc2UnLFxuICAgICAgICAnQVJST1dfUklHSFQnOiAnZGVjcmVhc2UnLFxuICAgICAgICAnU0hJRlRfQVJST1dfTEVGVCc6ICdpbmNyZWFzZV9mYXN0JyxcbiAgICAgICAgJ1NISUZUX0FSUk9XX1JJR0hUJzogJ2RlY3JlYXNlX2Zhc3QnXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlsaXplcyB0aGUgcGx1Z2luIGJ5IHJlYWRpbmcvc2V0dGluZyBhdHRyaWJ1dGVzLCBjcmVhdGluZyBjb2xsZWN0aW9ucyBhbmQgc2V0dGluZyB0aGUgaW5pdGlhbCBwb3NpdGlvbiBvZiB0aGUgaGFuZGxlKHMpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuaW5wdXRzID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbnB1dCcpO1xuICAgIHRoaXMuaGFuZGxlcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtc2xpZGVyLWhhbmRsZV0nKTtcblxuICAgIHRoaXMuJGhhbmRsZSA9IHRoaXMuaGFuZGxlcy5lcSgwKTtcbiAgICB0aGlzLiRpbnB1dCA9IHRoaXMuaW5wdXRzLmxlbmd0aCA/IHRoaXMuaW5wdXRzLmVxKDApIDogJChgIyR7dGhpcy4kaGFuZGxlLmF0dHIoJ2FyaWEtY29udHJvbHMnKX1gKTtcbiAgICB0aGlzLiRmaWxsID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1zbGlkZXItZmlsbF0nKS5jc3ModGhpcy5vcHRpb25zLnZlcnRpY2FsID8gJ2hlaWdodCcgOiAnd2lkdGgnLCAwKTtcblxuICAgIHZhciBpc0RibCA9IGZhbHNlLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kaXNhYmxlZCB8fCB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKHRoaXMub3B0aW9ucy5kaXNhYmxlZENsYXNzKSkge1xuICAgICAgdGhpcy5vcHRpb25zLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmRpc2FibGVkQ2xhc3MpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaW5wdXRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5pbnB1dHMgPSAkKCkuYWRkKHRoaXMuJGlucHV0KTtcbiAgICAgIHRoaXMub3B0aW9ucy5iaW5kaW5nID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5fc2V0SW5pdEF0dHIoMCk7XG4gICAgdGhpcy5fZXZlbnRzKHRoaXMuJGhhbmRsZSk7XG5cbiAgICBpZiAodGhpcy5oYW5kbGVzWzFdKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZG91YmxlU2lkZWQgPSB0cnVlO1xuICAgICAgdGhpcy4kaGFuZGxlMiA9IHRoaXMuaGFuZGxlcy5lcSgxKTtcbiAgICAgIHRoaXMuJGlucHV0MiA9IHRoaXMuaW5wdXRzLmxlbmd0aCA+IDEgPyB0aGlzLmlucHV0cy5lcSgxKSA6ICQoYCMke3RoaXMuJGhhbmRsZTIuYXR0cignYXJpYS1jb250cm9scycpfWApO1xuXG4gICAgICBpZiAoIXRoaXMuaW5wdXRzWzFdKSB7XG4gICAgICAgIHRoaXMuaW5wdXRzID0gdGhpcy5pbnB1dHMuYWRkKHRoaXMuJGlucHV0Mik7XG4gICAgICB9XG4gICAgICBpc0RibCA9IHRydWU7XG5cbiAgICAgIHRoaXMuX3NldEhhbmRsZVBvcyh0aGlzLiRoYW5kbGUsIHRoaXMub3B0aW9ucy5pbml0aWFsU3RhcnQsIHRydWUsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIF90aGlzLl9zZXRIYW5kbGVQb3MoX3RoaXMuJGhhbmRsZTIsIF90aGlzLm9wdGlvbnMuaW5pdGlhbEVuZCwgdHJ1ZSk7XG4gICAgICB9KTtcbiAgICAgIC8vIHRoaXMuJGhhbmRsZS50cmlnZ2VySGFuZGxlcignY2xpY2suemYuc2xpZGVyJyk7XG4gICAgICB0aGlzLl9zZXRJbml0QXR0cigxKTtcbiAgICAgIHRoaXMuX2V2ZW50cyh0aGlzLiRoYW5kbGUyKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzRGJsKSB7XG4gICAgICB0aGlzLl9zZXRIYW5kbGVQb3ModGhpcy4kaGFuZGxlLCB0aGlzLm9wdGlvbnMuaW5pdGlhbFN0YXJ0LCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIHNlbGVjdGVkIGhhbmRsZSBhbmQgZmlsbCBiYXIuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGhuZGwgLSB0aGUgc2VsZWN0ZWQgaGFuZGxlIHRvIG1vdmUuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsb2NhdGlvbiAtIGZsb2F0aW5nIHBvaW50IGJldHdlZW4gdGhlIHN0YXJ0IGFuZCBlbmQgdmFsdWVzIG9mIHRoZSBzbGlkZXIgYmFyLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGZpcmUgb24gY29tcGxldGlvbi5cbiAgICogQGZpcmVzIFNsaWRlciNtb3ZlZFxuICAgKi9cbiAgX3NldEhhbmRsZVBvcygkaG5kbCwgbG9jYXRpb24sIG5vSW52ZXJ0LCBjYikge1xuICAvL21pZ2h0IG5lZWQgdG8gYWx0ZXIgdGhhdCBzbGlnaHRseSBmb3IgYmFycyB0aGF0IHdpbGwgaGF2ZSBvZGQgbnVtYmVyIHNlbGVjdGlvbnMuXG4gICAgbG9jYXRpb24gPSBwYXJzZUZsb2F0KGxvY2F0aW9uKTsvL29uIGlucHV0IGNoYW5nZSBldmVudHMsIGNvbnZlcnQgc3RyaW5nIHRvIG51bWJlci4uLmdydW1ibGUuXG5cbiAgICAvLyBwcmV2ZW50IHNsaWRlciBmcm9tIHJ1bm5pbmcgb3V0IG9mIGJvdW5kcywgaWYgdmFsdWUgZXhjZWVkcyB0aGUgbGltaXRzIHNldCB0aHJvdWdoIG9wdGlvbnMsIG92ZXJyaWRlIHRoZSB2YWx1ZSB0byBtaW4vbWF4XG4gICAgaWYgKGxvY2F0aW9uIDwgdGhpcy5vcHRpb25zLnN0YXJ0KSB7IGxvY2F0aW9uID0gdGhpcy5vcHRpb25zLnN0YXJ0OyB9XG4gICAgZWxzZSBpZiAobG9jYXRpb24gPiB0aGlzLm9wdGlvbnMuZW5kKSB7IGxvY2F0aW9uID0gdGhpcy5vcHRpb25zLmVuZDsgfVxuXG4gICAgdmFyIGlzRGJsID0gdGhpcy5vcHRpb25zLmRvdWJsZVNpZGVkO1xuXG4gICAgaWYgKGlzRGJsKSB7IC8vdGhpcyBibG9jayBpcyB0byBwcmV2ZW50IDIgaGFuZGxlcyBmcm9tIGNyb3NzaW5nIGVhY2hvdGhlci4gQ291bGQvc2hvdWxkIGJlIGltcHJvdmVkLlxuICAgICAgaWYgKHRoaXMuaGFuZGxlcy5pbmRleCgkaG5kbCkgPT09IDApIHtcbiAgICAgICAgdmFyIGgyVmFsID0gcGFyc2VGbG9hdCh0aGlzLiRoYW5kbGUyLmF0dHIoJ2FyaWEtdmFsdWVub3cnKSk7XG4gICAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gPj0gaDJWYWwgPyBoMlZhbCAtIHRoaXMub3B0aW9ucy5zdGVwIDogbG9jYXRpb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaDFWYWwgPSBwYXJzZUZsb2F0KHRoaXMuJGhhbmRsZS5hdHRyKCdhcmlhLXZhbHVlbm93JykpO1xuICAgICAgICBsb2NhdGlvbiA9IGxvY2F0aW9uIDw9IGgxVmFsID8gaDFWYWwgKyB0aGlzLm9wdGlvbnMuc3RlcCA6IGxvY2F0aW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vdGhpcyBpcyBmb3Igc2luZ2xlLWhhbmRsZWQgdmVydGljYWwgc2xpZGVycywgaXQgYWRqdXN0cyB0aGUgdmFsdWUgdG8gYWNjb3VudCBmb3IgdGhlIHNsaWRlciBiZWluZyBcInVwc2lkZS1kb3duXCJcbiAgICAvL2ZvciBjbGljayBhbmQgZHJhZyBldmVudHMsIGl0J3Mgd2VpcmQgZHVlIHRvIHRoZSBzY2FsZSgtMSwgMSkgY3NzIHByb3BlcnR5XG4gICAgaWYgKHRoaXMub3B0aW9ucy52ZXJ0aWNhbCAmJiAhbm9JbnZlcnQpIHtcbiAgICAgIGxvY2F0aW9uID0gdGhpcy5vcHRpb25zLmVuZCAtIGxvY2F0aW9uO1xuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgIHZlcnQgPSB0aGlzLm9wdGlvbnMudmVydGljYWwsXG4gICAgICAgIGhPclcgPSB2ZXJ0ID8gJ2hlaWdodCcgOiAnd2lkdGgnLFxuICAgICAgICBsT3JUID0gdmVydCA/ICd0b3AnIDogJ2xlZnQnLFxuICAgICAgICBoYW5kbGVEaW0gPSAkaG5kbFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVtoT3JXXSxcbiAgICAgICAgZWxlbURpbSA9IHRoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClbaE9yV10sXG4gICAgICAgIC8vcGVyY2VudGFnZSBvZiBiYXIgbWluL21heCB2YWx1ZSBiYXNlZCBvbiBjbGljayBvciBkcmFnIHBvaW50XG4gICAgICAgIHBjdE9mQmFyID0gcGVyY2VudChsb2NhdGlvbiwgdGhpcy5vcHRpb25zLmVuZCkudG9GaXhlZCgyKSxcbiAgICAgICAgLy9udW1iZXIgb2YgYWN0dWFsIHBpeGVscyB0byBzaGlmdCB0aGUgaGFuZGxlLCBiYXNlZCBvbiB0aGUgcGVyY2VudGFnZSBvYnRhaW5lZCBhYm92ZVxuICAgICAgICBweFRvTW92ZSA9IChlbGVtRGltIC0gaGFuZGxlRGltKSAqIHBjdE9mQmFyLFxuICAgICAgICAvL3BlcmNlbnRhZ2Ugb2YgYmFyIHRvIHNoaWZ0IHRoZSBoYW5kbGVcbiAgICAgICAgbW92ZW1lbnQgPSAocGVyY2VudChweFRvTW92ZSwgZWxlbURpbSkgKiAxMDApLnRvRml4ZWQodGhpcy5vcHRpb25zLmRlY2ltYWwpO1xuICAgICAgICAvL2ZpeGluZyB0aGUgZGVjaW1hbCB2YWx1ZSBmb3IgdGhlIGxvY2F0aW9uIG51bWJlciwgaXMgcGFzc2VkIHRvIG90aGVyIG1ldGhvZHMgYXMgYSBmaXhlZCBmbG9hdGluZy1wb2ludCB2YWx1ZVxuICAgICAgICBsb2NhdGlvbiA9IHBhcnNlRmxvYXQobG9jYXRpb24udG9GaXhlZCh0aGlzLm9wdGlvbnMuZGVjaW1hbCkpO1xuICAgICAgICAvLyBkZWNsYXJlIGVtcHR5IG9iamVjdCBmb3IgY3NzIGFkanVzdG1lbnRzLCBvbmx5IHVzZWQgd2l0aCAyIGhhbmRsZWQtc2xpZGVyc1xuICAgIHZhciBjc3MgPSB7fTtcblxuICAgIHRoaXMuX3NldFZhbHVlcygkaG5kbCwgbG9jYXRpb24pO1xuXG4gICAgLy8gVE9ETyB1cGRhdGUgdG8gY2FsY3VsYXRlIGJhc2VkIG9uIHZhbHVlcyBzZXQgdG8gcmVzcGVjdGl2ZSBpbnB1dHM/P1xuICAgIGlmIChpc0RibCkge1xuICAgICAgdmFyIGlzTGVmdEhuZGwgPSB0aGlzLmhhbmRsZXMuaW5kZXgoJGhuZGwpID09PSAwLFxuICAgICAgICAgIC8vZW1wdHkgdmFyaWFibGUsIHdpbGwgYmUgdXNlZCBmb3IgbWluLWhlaWdodC93aWR0aCBmb3IgZmlsbCBiYXJcbiAgICAgICAgICBkaW0sXG4gICAgICAgICAgLy9wZXJjZW50YWdlIHcvaCBvZiB0aGUgaGFuZGxlIGNvbXBhcmVkIHRvIHRoZSBzbGlkZXIgYmFyXG4gICAgICAgICAgaGFuZGxlUGN0ID0gIH5+KHBlcmNlbnQoaGFuZGxlRGltLCBlbGVtRGltKSAqIDEwMCk7XG4gICAgICAvL2lmIGxlZnQgaGFuZGxlLCB0aGUgbWF0aCBpcyBzbGlnaHRseSBkaWZmZXJlbnQgdGhhbiBpZiBpdCdzIHRoZSByaWdodCBoYW5kbGUsIGFuZCB0aGUgbGVmdC90b3AgcHJvcGVydHkgbmVlZHMgdG8gYmUgY2hhbmdlZCBmb3IgdGhlIGZpbGwgYmFyXG4gICAgICBpZiAoaXNMZWZ0SG5kbCkge1xuICAgICAgICAvL2xlZnQgb3IgdG9wIHBlcmNlbnRhZ2UgdmFsdWUgdG8gYXBwbHkgdG8gdGhlIGZpbGwgYmFyLlxuICAgICAgICBjc3NbbE9yVF0gPSBgJHttb3ZlbWVudH0lYDtcbiAgICAgICAgLy9jYWxjdWxhdGUgdGhlIG5ldyBtaW4taGVpZ2h0L3dpZHRoIGZvciB0aGUgZmlsbCBiYXIuXG4gICAgICAgIGRpbSA9IHBhcnNlRmxvYXQodGhpcy4kaGFuZGxlMlswXS5zdHlsZVtsT3JUXSkgLSBtb3ZlbWVudCArIGhhbmRsZVBjdDtcbiAgICAgICAgLy90aGlzIGNhbGxiYWNrIGlzIG5lY2Vzc2FyeSB0byBwcmV2ZW50IGVycm9ycyBhbmQgYWxsb3cgdGhlIHByb3BlciBwbGFjZW1lbnQgYW5kIGluaXRpYWxpemF0aW9uIG9mIGEgMi1oYW5kbGVkIHNsaWRlclxuICAgICAgICAvL3BsdXMsIGl0IG1lYW5zIHdlIGRvbid0IGNhcmUgaWYgJ2RpbScgaXNOYU4gb24gaW5pdCwgaXQgd29uJ3QgYmUgaW4gdGhlIGZ1dHVyZS5cbiAgICAgICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgeyBjYigpOyB9Ly90aGlzIGlzIG9ubHkgbmVlZGVkIGZvciB0aGUgaW5pdGlhbGl6YXRpb24gb2YgMiBoYW5kbGVkIHNsaWRlcnNcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vanVzdCBjYWNoaW5nIHRoZSB2YWx1ZSBvZiB0aGUgbGVmdC9ib3R0b20gaGFuZGxlJ3MgbGVmdC90b3AgcHJvcGVydHlcbiAgICAgICAgdmFyIGhhbmRsZVBvcyA9IHBhcnNlRmxvYXQodGhpcy4kaGFuZGxlWzBdLnN0eWxlW2xPclRdKTtcbiAgICAgICAgLy9jYWxjdWxhdGUgdGhlIG5ldyBtaW4taGVpZ2h0L3dpZHRoIGZvciB0aGUgZmlsbCBiYXIuIFVzZSBpc05hTiB0byBwcmV2ZW50IGZhbHNlIHBvc2l0aXZlcyBmb3IgbnVtYmVycyA8PSAwXG4gICAgICAgIC8vYmFzZWQgb24gdGhlIHBlcmNlbnRhZ2Ugb2YgbW92ZW1lbnQgb2YgdGhlIGhhbmRsZSBiZWluZyBtYW5pcHVsYXRlZCwgbGVzcyB0aGUgb3Bwb3NpbmcgaGFuZGxlJ3MgbGVmdC90b3AgcG9zaXRpb24sIHBsdXMgdGhlIHBlcmNlbnRhZ2Ugdy9oIG9mIHRoZSBoYW5kbGUgaXRzZWxmXG4gICAgICAgIGRpbSA9IG1vdmVtZW50IC0gKGlzTmFOKGhhbmRsZVBvcykgPyB0aGlzLm9wdGlvbnMuaW5pdGlhbFN0YXJ0LygodGhpcy5vcHRpb25zLmVuZC10aGlzLm9wdGlvbnMuc3RhcnQpLzEwMCkgOiBoYW5kbGVQb3MpICsgaGFuZGxlUGN0O1xuICAgICAgfVxuICAgICAgLy8gYXNzaWduIHRoZSBtaW4taGVpZ2h0L3dpZHRoIHRvIG91ciBjc3Mgb2JqZWN0XG4gICAgICBjc3NbYG1pbi0ke2hPcld9YF0gPSBgJHtkaW19JWA7XG4gICAgfVxuXG4gICAgdGhpcy4kZWxlbWVudC5vbmUoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIGhhbmRsZSBpcyBkb25lIG1vdmluZy5cbiAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IFNsaWRlciNtb3ZlZFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcignbW92ZWQuemYuc2xpZGVyJywgWyRobmRsXSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAvL2JlY2F1c2Ugd2UgZG9uJ3Qga25vdyBleGFjdGx5IGhvdyB0aGUgaGFuZGxlIHdpbGwgYmUgbW92ZWQsIGNoZWNrIHRoZSBhbW91bnQgb2YgdGltZSBpdCBzaG91bGQgdGFrZSB0byBtb3ZlLlxuICAgIHZhciBtb3ZlVGltZSA9IHRoaXMuJGVsZW1lbnQuZGF0YSgnZHJhZ2dpbmcnKSA/IDEwMDAvNjAgOiB0aGlzLm9wdGlvbnMubW92ZVRpbWU7XG5cbiAgICBGb3VuZGF0aW9uLk1vdmUobW92ZVRpbWUsICRobmRsLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vYWRqdXN0aW5nIHRoZSBsZWZ0L3RvcCBwcm9wZXJ0eSBvZiB0aGUgaGFuZGxlLCBiYXNlZCBvbiB0aGUgcGVyY2VudGFnZSBjYWxjdWxhdGVkIGFib3ZlXG4gICAgICAkaG5kbC5jc3MobE9yVCwgYCR7bW92ZW1lbnR9JWApO1xuXG4gICAgICBpZiAoIV90aGlzLm9wdGlvbnMuZG91YmxlU2lkZWQpIHtcbiAgICAgICAgLy9pZiBzaW5nbGUtaGFuZGxlZCwgYSBzaW1wbGUgbWV0aG9kIHRvIGV4cGFuZCB0aGUgZmlsbCBiYXJcbiAgICAgICAgX3RoaXMuJGZpbGwuY3NzKGhPclcsIGAke3BjdE9mQmFyICogMTAwfSVgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vb3RoZXJ3aXNlLCB1c2UgdGhlIGNzcyBvYmplY3Qgd2UgY3JlYXRlZCBhYm92ZVxuICAgICAgICBfdGhpcy4kZmlsbC5jc3MoY3NzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbml0aWFsIGF0dHJpYnV0ZSBmb3IgdGhlIHNsaWRlciBlbGVtZW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIGluZGV4IG9mIHRoZSBjdXJyZW50IGhhbmRsZS9pbnB1dCB0byB1c2UuXG4gICAqL1xuICBfc2V0SW5pdEF0dHIoaWR4KSB7XG4gICAgdmFyIGlkID0gdGhpcy5pbnB1dHMuZXEoaWR4KS5hdHRyKCdpZCcpIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ3NsaWRlcicpO1xuICAgIHRoaXMuaW5wdXRzLmVxKGlkeCkuYXR0cih7XG4gICAgICAnaWQnOiBpZCxcbiAgICAgICdtYXgnOiB0aGlzLm9wdGlvbnMuZW5kLFxuICAgICAgJ21pbic6IHRoaXMub3B0aW9ucy5zdGFydCxcbiAgICAgICdzdGVwJzogdGhpcy5vcHRpb25zLnN0ZXBcbiAgICB9KTtcbiAgICB0aGlzLmhhbmRsZXMuZXEoaWR4KS5hdHRyKHtcbiAgICAgICdyb2xlJzogJ3NsaWRlcicsXG4gICAgICAnYXJpYS1jb250cm9scyc6IGlkLFxuICAgICAgJ2FyaWEtdmFsdWVtYXgnOiB0aGlzLm9wdGlvbnMuZW5kLFxuICAgICAgJ2FyaWEtdmFsdWVtaW4nOiB0aGlzLm9wdGlvbnMuc3RhcnQsXG4gICAgICAnYXJpYS12YWx1ZW5vdyc6IGlkeCA9PT0gMCA/IHRoaXMub3B0aW9ucy5pbml0aWFsU3RhcnQgOiB0aGlzLm9wdGlvbnMuaW5pdGlhbEVuZCxcbiAgICAgICdhcmlhLW9yaWVudGF0aW9uJzogdGhpcy5vcHRpb25zLnZlcnRpY2FsID8gJ3ZlcnRpY2FsJyA6ICdob3Jpem9udGFsJyxcbiAgICAgICd0YWJpbmRleCc6IDBcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbnB1dCBhbmQgYGFyaWEtdmFsdWVub3dgIHZhbHVlcyBmb3IgdGhlIHNsaWRlciBlbGVtZW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRoYW5kbGUgLSB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGhhbmRsZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbCAtIGZsb2F0aW5nIHBvaW50IG9mIHRoZSBuZXcgdmFsdWUuXG4gICAqL1xuICBfc2V0VmFsdWVzKCRoYW5kbGUsIHZhbCkge1xuICAgIHZhciBpZHggPSB0aGlzLm9wdGlvbnMuZG91YmxlU2lkZWQgPyB0aGlzLmhhbmRsZXMuaW5kZXgoJGhhbmRsZSkgOiAwO1xuICAgIHRoaXMuaW5wdXRzLmVxKGlkeCkudmFsKHZhbCk7XG4gICAgJGhhbmRsZS5hdHRyKCdhcmlhLXZhbHVlbm93JywgdmFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGV2ZW50cyBvbiB0aGUgc2xpZGVyIGVsZW1lbnQuXG4gICAqIENhbGN1bGF0ZXMgdGhlIG5ldyBsb2NhdGlvbiBvZiB0aGUgY3VycmVudCBoYW5kbGUuXG4gICAqIElmIHRoZXJlIGFyZSB0d28gaGFuZGxlcyBhbmQgdGhlIGJhciB3YXMgY2xpY2tlZCwgaXQgZGV0ZXJtaW5lcyB3aGljaCBoYW5kbGUgdG8gbW92ZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlIC0gdGhlIGBldmVudGAgb2JqZWN0IHBhc3NlZCBmcm9tIHRoZSBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICRoYW5kbGUgLSB0aGUgY3VycmVudCBoYW5kbGUgdG8gY2FsY3VsYXRlIGZvciwgaWYgc2VsZWN0ZWQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWwgLSBmbG9hdGluZyBwb2ludCBudW1iZXIgZm9yIHRoZSBuZXcgdmFsdWUgb2YgdGhlIHNsaWRlci5cbiAgICogVE9ETyBjbGVhbiB0aGlzIHVwLCB0aGVyZSdzIGEgbG90IG9mIHJlcGVhdGVkIGNvZGUgYmV0d2VlbiB0aGlzIGFuZCB0aGUgX3NldEhhbmRsZVBvcyBmbi5cbiAgICovXG4gIF9oYW5kbGVFdmVudChlLCAkaGFuZGxlLCB2YWwpIHtcbiAgICB2YXIgdmFsdWUsIGhhc1ZhbDtcbiAgICBpZiAoIXZhbCkgey8vY2xpY2sgb3IgZHJhZyBldmVudHNcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgdmVydGljYWwgPSB0aGlzLm9wdGlvbnMudmVydGljYWwsXG4gICAgICAgICAgcGFyYW0gPSB2ZXJ0aWNhbCA/ICdoZWlnaHQnIDogJ3dpZHRoJyxcbiAgICAgICAgICBkaXJlY3Rpb24gPSB2ZXJ0aWNhbCA/ICd0b3AnIDogJ2xlZnQnLFxuICAgICAgICAgIHBhZ2VYWSA9IHZlcnRpY2FsID8gZS5wYWdlWSA6IGUucGFnZVgsXG4gICAgICAgICAgaGFsZk9mSGFuZGxlID0gdGhpcy4kaGFuZGxlWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpW3BhcmFtXSAvIDIsXG4gICAgICAgICAgYmFyRGltID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVtwYXJhbV0sXG4gICAgICAgICAgYmFyT2Zmc2V0ID0gKHRoaXMuJGVsZW1lbnQub2Zmc2V0KClbZGlyZWN0aW9uXSAtICBwYWdlWFkpLFxuICAgICAgICAgIC8vaWYgdGhlIGN1cnNvciBwb3NpdGlvbiBpcyBsZXNzIHRoYW4gb3IgZ3JlYXRlciB0aGFuIHRoZSBlbGVtZW50cyBib3VuZGluZyBjb29yZGluYXRlcywgc2V0IGNvb3JkaW5hdGVzIHdpdGhpbiB0aG9zZSBib3VuZHNcbiAgICAgICAgICBiYXJYWSA9IGJhck9mZnNldCA+IDAgPyAtaGFsZk9mSGFuZGxlIDogKGJhck9mZnNldCAtIGhhbGZPZkhhbmRsZSkgPCAtYmFyRGltID8gYmFyRGltIDogTWF0aC5hYnMoYmFyT2Zmc2V0KSxcbiAgICAgICAgICBvZmZzZXRQY3QgPSBwZXJjZW50KGJhclhZLCBiYXJEaW0pO1xuICAgICAgdmFsdWUgPSAodGhpcy5vcHRpb25zLmVuZCAtIHRoaXMub3B0aW9ucy5zdGFydCkgKiBvZmZzZXRQY3Q7XG5cbiAgICAgIC8vIHR1cm4gZXZlcnl0aGluZyBhcm91bmQgZm9yIFJUTCwgeWF5IG1hdGghXG4gICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSAmJiAhdGhpcy5vcHRpb25zLnZlcnRpY2FsKSB7dmFsdWUgPSB0aGlzLm9wdGlvbnMuZW5kIC0gdmFsdWU7fVxuXG4gICAgICB2YWx1ZSA9IF90aGlzLl9hZGp1c3RWYWx1ZShudWxsLCB2YWx1ZSk7XG4gICAgICAvL2Jvb2xlYW4gZmxhZyBmb3IgdGhlIHNldEhhbmRsZVBvcyBmbiwgc3BlY2lmaWNhbGx5IGZvciB2ZXJ0aWNhbCBzbGlkZXJzXG4gICAgICBoYXNWYWwgPSBmYWxzZTtcblxuICAgICAgaWYgKCEkaGFuZGxlKSB7Ly9maWd1cmUgb3V0IHdoaWNoIGhhbmRsZSBpdCBpcywgcGFzcyBpdCB0byB0aGUgbmV4dCBmdW5jdGlvbi5cbiAgICAgICAgdmFyIGZpcnN0SG5kbFBvcyA9IGFic1Bvc2l0aW9uKHRoaXMuJGhhbmRsZSwgZGlyZWN0aW9uLCBiYXJYWSwgcGFyYW0pLFxuICAgICAgICAgICAgc2VjbmRIbmRsUG9zID0gYWJzUG9zaXRpb24odGhpcy4kaGFuZGxlMiwgZGlyZWN0aW9uLCBiYXJYWSwgcGFyYW0pO1xuICAgICAgICAgICAgJGhhbmRsZSA9IGZpcnN0SG5kbFBvcyA8PSBzZWNuZEhuZGxQb3MgPyB0aGlzLiRoYW5kbGUgOiB0aGlzLiRoYW5kbGUyO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHsvL2NoYW5nZSBldmVudCBvbiBpbnB1dFxuICAgICAgdmFsdWUgPSB0aGlzLl9hZGp1c3RWYWx1ZShudWxsLCB2YWwpO1xuICAgICAgaGFzVmFsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXRIYW5kbGVQb3MoJGhhbmRsZSwgdmFsdWUsIGhhc1ZhbCk7XG4gIH1cblxuICAvKipcbiAgICogQWRqdXN0ZXMgdmFsdWUgZm9yIGhhbmRsZSBpbiByZWdhcmQgdG8gc3RlcCB2YWx1ZS4gcmV0dXJucyBhZGp1c3RlZCB2YWx1ZVxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRoYW5kbGUgLSB0aGUgc2VsZWN0ZWQgaGFuZGxlLlxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWUgLSB2YWx1ZSB0byBhZGp1c3QuIHVzZWQgaWYgJGhhbmRsZSBpcyBmYWxzeVxuICAgKi9cbiAgX2FkanVzdFZhbHVlKCRoYW5kbGUsIHZhbHVlKSB7XG4gICAgdmFyIHZhbCxcbiAgICAgIHN0ZXAgPSB0aGlzLm9wdGlvbnMuc3RlcCxcbiAgICAgIGRpdiA9IHBhcnNlRmxvYXQoc3RlcC8yKSxcbiAgICAgIGxlZnQsIHByZXZfdmFsLCBuZXh0X3ZhbDtcbiAgICBpZiAoISEkaGFuZGxlKSB7XG4gICAgICB2YWwgPSBwYXJzZUZsb2F0KCRoYW5kbGUuYXR0cignYXJpYS12YWx1ZW5vdycpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YWwgPSB2YWx1ZTtcbiAgICB9XG4gICAgbGVmdCA9IHZhbCAlIHN0ZXA7XG4gICAgcHJldl92YWwgPSB2YWwgLSBsZWZ0O1xuICAgIG5leHRfdmFsID0gcHJldl92YWwgKyBzdGVwO1xuICAgIGlmIChsZWZ0ID09PSAwKSB7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICB2YWwgPSB2YWwgPj0gcHJldl92YWwgKyBkaXYgPyBuZXh0X3ZhbCA6IHByZXZfdmFsO1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIHNsaWRlciBlbGVtZW50cy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkaGFuZGxlIC0gdGhlIGN1cnJlbnQgaGFuZGxlIHRvIGFwcGx5IGxpc3RlbmVycyB0by5cbiAgICovXG4gIF9ldmVudHMoJGhhbmRsZSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZGlzYWJsZWQpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICBjdXJIYW5kbGUsXG4gICAgICAgIHRpbWVyO1xuXG4gICAgICB0aGlzLmlucHV0cy5vZmYoJ2NoYW5nZS56Zi5zbGlkZXInKS5vbignY2hhbmdlLnpmLnNsaWRlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGlkeCA9IF90aGlzLmlucHV0cy5pbmRleCgkKHRoaXMpKTtcbiAgICAgICAgX3RoaXMuX2hhbmRsZUV2ZW50KGUsIF90aGlzLmhhbmRsZXMuZXEoaWR4KSwgJCh0aGlzKS52YWwoKSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5jbGlja1NlbGVjdCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignY2xpY2suemYuc2xpZGVyJykub24oJ2NsaWNrLnpmLnNsaWRlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBpZiAoX3RoaXMuJGVsZW1lbnQuZGF0YSgnZHJhZ2dpbmcnKSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgICAgICAgIGlmICghJChlLnRhcmdldCkuaXMoJ1tkYXRhLXNsaWRlci1oYW5kbGVdJykpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmRvdWJsZVNpZGVkKSB7XG4gICAgICAgICAgICAgIF90aGlzLl9oYW5kbGVFdmVudChlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIF90aGlzLl9oYW5kbGVFdmVudChlLCBfdGhpcy4kaGFuZGxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnZ2FibGUpIHtcbiAgICAgIHRoaXMuaGFuZGxlcy5hZGRUb3VjaCgpO1xuXG4gICAgICB2YXIgJGJvZHkgPSAkKCdib2R5Jyk7XG4gICAgICAkaGFuZGxlXG4gICAgICAgIC5vZmYoJ21vdXNlZG93bi56Zi5zbGlkZXInKVxuICAgICAgICAub24oJ21vdXNlZG93bi56Zi5zbGlkZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgJGhhbmRsZS5hZGRDbGFzcygnaXMtZHJhZ2dpbmcnKTtcbiAgICAgICAgICBfdGhpcy4kZmlsbC5hZGRDbGFzcygnaXMtZHJhZ2dpbmcnKTsvL1xuICAgICAgICAgIF90aGlzLiRlbGVtZW50LmRhdGEoJ2RyYWdnaW5nJywgdHJ1ZSk7XG5cbiAgICAgICAgICBjdXJIYW5kbGUgPSAkKGUuY3VycmVudFRhcmdldCk7XG5cbiAgICAgICAgICAkYm9keS5vbignbW91c2Vtb3ZlLnpmLnNsaWRlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgX3RoaXMuX2hhbmRsZUV2ZW50KGUsIGN1ckhhbmRsZSk7XG5cbiAgICAgICAgICB9KS5vbignbW91c2V1cC56Zi5zbGlkZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBfdGhpcy5faGFuZGxlRXZlbnQoZSwgY3VySGFuZGxlKTtcblxuICAgICAgICAgICAgJGhhbmRsZS5yZW1vdmVDbGFzcygnaXMtZHJhZ2dpbmcnKTtcbiAgICAgICAgICAgIF90aGlzLiRmaWxsLnJlbW92ZUNsYXNzKCdpcy1kcmFnZ2luZycpO1xuICAgICAgICAgICAgX3RoaXMuJGVsZW1lbnQuZGF0YSgnZHJhZ2dpbmcnLCBmYWxzZSk7XG5cbiAgICAgICAgICAgICRib2R5Lm9mZignbW91c2Vtb3ZlLnpmLnNsaWRlciBtb3VzZXVwLnpmLnNsaWRlcicpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJGhhbmRsZS5vZmYoJ2tleWRvd24uemYuc2xpZGVyJykub24oJ2tleWRvd24uemYuc2xpZGVyJywgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIF8kaGFuZGxlID0gJCh0aGlzKSxcbiAgICAgICAgICBpZHggPSBfdGhpcy5vcHRpb25zLmRvdWJsZVNpZGVkID8gX3RoaXMuaGFuZGxlcy5pbmRleChfJGhhbmRsZSkgOiAwLFxuICAgICAgICAgIG9sZFZhbHVlID0gcGFyc2VGbG9hdChfdGhpcy5pbnB1dHMuZXEoaWR4KS52YWwoKSksXG4gICAgICAgICAgbmV3VmFsdWU7XG5cbiAgICAgIC8vIGhhbmRsZSBrZXlib2FyZCBldmVudCB3aXRoIGtleWJvYXJkIHV0aWxcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdTbGlkZXInLCB7XG4gICAgICAgIGRlY3JlYXNlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBuZXdWYWx1ZSA9IG9sZFZhbHVlIC0gX3RoaXMub3B0aW9ucy5zdGVwO1xuICAgICAgICB9LFxuICAgICAgICBpbmNyZWFzZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbmV3VmFsdWUgPSBvbGRWYWx1ZSArIF90aGlzLm9wdGlvbnMuc3RlcDtcbiAgICAgICAgfSxcbiAgICAgICAgZGVjcmVhc2VfZmFzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbmV3VmFsdWUgPSBvbGRWYWx1ZSAtIF90aGlzLm9wdGlvbnMuc3RlcCAqIDEwO1xuICAgICAgICB9LFxuICAgICAgICBpbmNyZWFzZV9mYXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBuZXdWYWx1ZSA9IG9sZFZhbHVlICsgX3RoaXMub3B0aW9ucy5zdGVwICogMTA7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkgeyAvLyBvbmx5IHNldCBoYW5kbGUgcG9zIHdoZW4gZXZlbnQgd2FzIGhhbmRsZWQgc3BlY2lhbGx5XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIF90aGlzLl9zZXRIYW5kbGVQb3MoXyRoYW5kbGUsIG5ld1ZhbHVlLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvKmlmIChuZXdWYWx1ZSkgeyAvLyBpZiBwcmVzc2VkIGtleSBoYXMgc3BlY2lhbCBmdW5jdGlvbiwgdXBkYXRlIHZhbHVlXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3RoaXMuX3NldEhhbmRsZVBvcyhfJGhhbmRsZSwgbmV3VmFsdWUpO1xuICAgICAgfSovXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIHNsaWRlciBwbHVnaW4uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuaGFuZGxlcy5vZmYoJy56Zi5zbGlkZXInKTtcbiAgICB0aGlzLmlucHV0cy5vZmYoJy56Zi5zbGlkZXInKTtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnNsaWRlcicpO1xuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cblNsaWRlci5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIE1pbmltdW0gdmFsdWUgZm9yIHRoZSBzbGlkZXIgc2NhbGUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgMFxuICAgKi9cbiAgc3RhcnQ6IDAsXG4gIC8qKlxuICAgKiBNYXhpbXVtIHZhbHVlIGZvciB0aGUgc2xpZGVyIHNjYWxlLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDEwMFxuICAgKi9cbiAgZW5kOiAxMDAsXG4gIC8qKlxuICAgKiBNaW5pbXVtIHZhbHVlIGNoYW5nZSBwZXIgY2hhbmdlIGV2ZW50LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDFcbiAgICovXG4gIHN0ZXA6IDEsXG4gIC8qKlxuICAgKiBWYWx1ZSBhdCB3aGljaCB0aGUgaGFuZGxlL2lucHV0ICoobGVmdCBoYW5kbGUvZmlyc3QgaW5wdXQpKiBzaG91bGQgYmUgc2V0IHRvIG9uIGluaXRpYWxpemF0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDBcbiAgICovXG4gIGluaXRpYWxTdGFydDogMCxcbiAgLyoqXG4gICAqIFZhbHVlIGF0IHdoaWNoIHRoZSByaWdodCBoYW5kbGUvc2Vjb25kIGlucHV0IHNob3VsZCBiZSBzZXQgdG8gb24gaW5pdGlhbGl6YXRpb24uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgMTAwXG4gICAqL1xuICBpbml0aWFsRW5kOiAxMDAsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIGlucHV0IHRvIGJlIGxvY2F0ZWQgb3V0c2lkZSB0aGUgY29udGFpbmVyIGFuZCB2aXNpYmxlLiBTZXQgdG8gYnkgdGhlIEpTXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGJpbmRpbmc6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3dzIHRoZSB1c2VyIHRvIGNsaWNrL3RhcCBvbiB0aGUgc2xpZGVyIGJhciB0byBzZWxlY3QgYSB2YWx1ZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBjbGlja1NlbGVjdDogdHJ1ZSxcbiAgLyoqXG4gICAqIFNldCB0byB0cnVlIGFuZCB1c2UgdGhlIGB2ZXJ0aWNhbGAgY2xhc3MgdG8gY2hhbmdlIGFsaWdubWVudCB0byB2ZXJ0aWNhbC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgdmVydGljYWw6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3dzIHRoZSB1c2VyIHRvIGRyYWcgdGhlIHNsaWRlciBoYW5kbGUocykgdG8gc2VsZWN0IGEgdmFsdWUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgZHJhZ2dhYmxlOiB0cnVlLFxuICAvKipcbiAgICogRGlzYWJsZXMgdGhlIHNsaWRlciBhbmQgcHJldmVudHMgZXZlbnQgbGlzdGVuZXJzIGZyb20gYmVpbmcgYXBwbGllZC4gRG91YmxlIGNoZWNrZWQgYnkgSlMgd2l0aCBgZGlzYWJsZWRDbGFzc2AuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGRpc2FibGVkOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgdXNlIG9mIHR3byBoYW5kbGVzLiBEb3VibGUgY2hlY2tlZCBieSB0aGUgSlMuIENoYW5nZXMgc29tZSBsb2dpYyBoYW5kbGluZy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgZG91YmxlU2lkZWQ6IGZhbHNlLFxuICAvKipcbiAgICogUG90ZW50aWFsIGZ1dHVyZSBmZWF0dXJlLlxuICAgKi9cbiAgLy8gc3RlcHM6IDEwMCxcbiAgLyoqXG4gICAqIE51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyB0aGUgcGx1Z2luIHNob3VsZCBnbyB0byBmb3IgZmxvYXRpbmcgcG9pbnQgcHJlY2lzaW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDJcbiAgICovXG4gIGRlY2ltYWw6IDIsXG4gIC8qKlxuICAgKiBUaW1lIGRlbGF5IGZvciBkcmFnZ2VkIGVsZW1lbnRzLlxuICAgKi9cbiAgLy8gZHJhZ0RlbGF5OiAwLFxuICAvKipcbiAgICogVGltZSwgaW4gbXMsIHRvIGFuaW1hdGUgdGhlIG1vdmVtZW50IG9mIGEgc2xpZGVyIGhhbmRsZSBpZiB1c2VyIGNsaWNrcy90YXBzIG9uIHRoZSBiYXIuIE5lZWRzIHRvIGJlIG1hbnVhbGx5IHNldCBpZiB1cGRhdGluZyB0aGUgdHJhbnNpdGlvbiB0aW1lIGluIHRoZSBTYXNzIHNldHRpbmdzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDIwMFxuICAgKi9cbiAgbW92ZVRpbWU6IDIwMCwvL3VwZGF0ZSB0aGlzIGlmIGNoYW5naW5nIHRoZSB0cmFuc2l0aW9uIHRpbWUgaW4gdGhlIHNhc3NcbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gZGlzYWJsZWQgc2xpZGVycy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnZGlzYWJsZWQnXG4gICAqL1xuICBkaXNhYmxlZENsYXNzOiAnZGlzYWJsZWQnLFxuICAvKipcbiAgICogV2lsbCBpbnZlcnQgdGhlIGRlZmF1bHQgbGF5b3V0IGZvciBhIHZlcnRpY2FsPHNwYW4gZGF0YS10b29sdGlwIHRpdGxlPVwid2hvIHdvdWxkIGRvIHRoaXM/Pz9cIj4gPC9zcGFuPnNsaWRlci5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgaW52ZXJ0VmVydGljYWw6IGZhbHNlXG59O1xuXG5mdW5jdGlvbiBwZXJjZW50KGZyYWMsIG51bSkge1xuICByZXR1cm4gKGZyYWMgLyBudW0pO1xufVxuZnVuY3Rpb24gYWJzUG9zaXRpb24oJGhhbmRsZSwgZGlyLCBjbGlja1BvcywgcGFyYW0pIHtcbiAgcmV0dXJuIE1hdGguYWJzKCgkaGFuZGxlLnBvc2l0aW9uKClbZGlyXSArICgkaGFuZGxlW3BhcmFtXSgpIC8gMikpIC0gY2xpY2tQb3MpO1xufVxuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oU2xpZGVyLCAnU2xpZGVyJyk7XG5cbn0oalF1ZXJ5KTtcblxuLy8qKioqKioqKip0aGlzIGlzIGluIGNhc2Ugd2UgZ28gdG8gc3RhdGljLCBhYnNvbHV0ZSBwb3NpdGlvbnMgaW5zdGVhZCBvZiBkeW5hbWljIHBvc2l0aW9uaW5nKioqKioqKipcbi8vIHRoaXMuc2V0U3RlcHMoZnVuY3Rpb24oKSB7XG4vLyAgIF90aGlzLl9ldmVudHMoKTtcbi8vICAgdmFyIGluaXRTdGFydCA9IF90aGlzLm9wdGlvbnMucG9zaXRpb25zW190aGlzLm9wdGlvbnMuaW5pdGlhbFN0YXJ0IC0gMV0gfHwgbnVsbDtcbi8vICAgdmFyIGluaXRFbmQgPSBfdGhpcy5vcHRpb25zLmluaXRpYWxFbmQgPyBfdGhpcy5vcHRpb25zLnBvc2l0aW9uW190aGlzLm9wdGlvbnMuaW5pdGlhbEVuZCAtIDFdIDogbnVsbDtcbi8vICAgaWYgKGluaXRTdGFydCB8fCBpbml0RW5kKSB7XG4vLyAgICAgX3RoaXMuX2hhbmRsZUV2ZW50KGluaXRTdGFydCwgaW5pdEVuZCk7XG4vLyAgIH1cbi8vIH0pO1xuXG4vLyoqKioqKioqKioqdGhlIG90aGVyIHBhcnQgb2YgYWJzb2x1dGUgcG9zaXRpb25zKioqKioqKioqKioqKlxuLy8gU2xpZGVyLnByb3RvdHlwZS5zZXRTdGVwcyA9IGZ1bmN0aW9uKGNiKSB7XG4vLyAgIHZhciBwb3NDaGFuZ2UgPSB0aGlzLiRlbGVtZW50Lm91dGVyV2lkdGgoKSAvIHRoaXMub3B0aW9ucy5zdGVwcztcbi8vICAgdmFyIGNvdW50ZXIgPSAwXG4vLyAgIHdoaWxlKGNvdW50ZXIgPCB0aGlzLm9wdGlvbnMuc3RlcHMpIHtcbi8vICAgICBpZiAoY291bnRlcikge1xuLy8gICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9ucy5wdXNoKHRoaXMub3B0aW9ucy5wb3NpdGlvbnNbY291bnRlciAtIDFdICsgcG9zQ2hhbmdlKTtcbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9ucy5wdXNoKHBvc0NoYW5nZSk7XG4vLyAgICAgfVxuLy8gICAgIGNvdW50ZXIrKztcbi8vICAgfVxuLy8gICBjYigpO1xuLy8gfTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBTdGlja3kgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnN0aWNreVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKi9cblxuY2xhc3MgU3RpY2t5IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSBzdGlja3kgdGhpbmcuXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBzdGlja3kuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gb3B0aW9ucyBvYmplY3QgcGFzc2VkIHdoZW4gY3JlYXRpbmcgdGhlIGVsZW1lbnQgcHJvZ3JhbW1hdGljYWxseS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgU3RpY2t5LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdTdGlja3knKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgc3RpY2t5IGVsZW1lbnQgYnkgYWRkaW5nIGNsYXNzZXMsIGdldHRpbmcvc2V0dGluZyBkaW1lbnNpb25zLCBicmVha3BvaW50cyBhbmQgYXR0cmlidXRlc1xuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciAkcGFyZW50ID0gdGhpcy4kZWxlbWVudC5wYXJlbnQoJ1tkYXRhLXN0aWNreS1jb250YWluZXJdJyksXG4gICAgICAgIGlkID0gdGhpcy4kZWxlbWVudFswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdzdGlja3knKSxcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKCEkcGFyZW50Lmxlbmd0aCkge1xuICAgICAgdGhpcy53YXNXcmFwcGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyID0gJHBhcmVudC5sZW5ndGggPyAkcGFyZW50IDogJCh0aGlzLm9wdGlvbnMuY29udGFpbmVyKS53cmFwSW5uZXIodGhpcy4kZWxlbWVudCk7XG4gICAgdGhpcy4kY29udGFpbmVyLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jb250YWluZXJDbGFzcyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKHRoaXMub3B0aW9ucy5zdGlja3lDbGFzcylcbiAgICAgICAgICAgICAgICAgLmF0dHIoeydkYXRhLXJlc2l6ZSc6IGlkfSk7XG5cbiAgICB0aGlzLnNjcm9sbENvdW50ID0gdGhpcy5vcHRpb25zLmNoZWNrRXZlcnk7XG4gICAgdGhpcy5pc1N0dWNrID0gZmFsc2U7XG4gICAgJCh3aW5kb3cpLm9uZSgnbG9hZC56Zi5zdGlja3knLCBmdW5jdGlvbigpe1xuICAgICAgaWYoX3RoaXMub3B0aW9ucy5hbmNob3IgIT09ICcnKXtcbiAgICAgICAgX3RoaXMuJGFuY2hvciA9ICQoJyMnICsgX3RoaXMub3B0aW9ucy5hbmNob3IpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIF90aGlzLl9wYXJzZVBvaW50cygpO1xuICAgICAgfVxuXG4gICAgICBfdGhpcy5fc2V0U2l6ZXMoZnVuY3Rpb24oKXtcbiAgICAgICAgX3RoaXMuX2NhbGMoZmFsc2UpO1xuICAgICAgfSk7XG4gICAgICBfdGhpcy5fZXZlbnRzKGlkLnNwbGl0KCctJykucmV2ZXJzZSgpLmpvaW4oJy0nKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSWYgdXNpbmcgbXVsdGlwbGUgZWxlbWVudHMgYXMgYW5jaG9ycywgY2FsY3VsYXRlcyB0aGUgdG9wIGFuZCBib3R0b20gcGl4ZWwgdmFsdWVzIHRoZSBzdGlja3kgdGhpbmcgc2hvdWxkIHN0aWNrIGFuZCB1bnN0aWNrIG9uLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wYXJzZVBvaW50cygpIHtcbiAgICB2YXIgdG9wID0gdGhpcy5vcHRpb25zLnRvcEFuY2hvcixcbiAgICAgICAgYnRtID0gdGhpcy5vcHRpb25zLmJ0bUFuY2hvcixcbiAgICAgICAgcHRzID0gW3RvcCwgYnRtXSxcbiAgICAgICAgYnJlYWtzID0ge307XG4gICAgaWYgKHRvcCAmJiBidG0pIHtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHB0cy5sZW5ndGg7IGkgPCBsZW4gJiYgcHRzW2ldOyBpKyspIHtcbiAgICAgICAgdmFyIHB0O1xuICAgICAgICBpZiAodHlwZW9mIHB0c1tpXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBwdCA9IHB0c1tpXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgcGxhY2UgPSBwdHNbaV0uc3BsaXQoJzonKSxcbiAgICAgICAgICAgICAgYW5jaG9yID0gJChgIyR7cGxhY2VbMF19YCk7XG5cbiAgICAgICAgICBwdCA9IGFuY2hvci5vZmZzZXQoKS50b3A7XG4gICAgICAgICAgaWYgKHBsYWNlWzFdICYmIHBsYWNlWzFdLnRvTG93ZXJDYXNlKCkgPT09ICdib3R0b20nKSB7XG4gICAgICAgICAgICBwdCArPSBhbmNob3JbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVha3NbaV0gPSBwdDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWtzID0gezA6IDEsIDE6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHR9O1xuICAgIH1cblxuICAgIHRoaXMucG9pbnRzID0gYnJlYWtzO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciB0aGUgc2Nyb2xsaW5nIGVsZW1lbnQuXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIHBzdWVkby1yYW5kb20gaWQgZm9yIHVuaXF1ZSBzY3JvbGwgZXZlbnQgbGlzdGVuZXIuXG4gICAqL1xuICBfZXZlbnRzKGlkKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgc2Nyb2xsTGlzdGVuZXIgPSB0aGlzLnNjcm9sbExpc3RlbmVyID0gYHNjcm9sbC56Zi4ke2lkfWA7XG4gICAgaWYgKHRoaXMuaXNPbikgeyByZXR1cm47IH1cbiAgICBpZiAodGhpcy5jYW5TdGljaykge1xuICAgICAgdGhpcy5pc09uID0gdHJ1ZTtcbiAgICAgICQod2luZG93KS5vZmYoc2Nyb2xsTGlzdGVuZXIpXG4gICAgICAgICAgICAgICAub24oc2Nyb2xsTGlzdGVuZXIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgaWYgKF90aGlzLnNjcm9sbENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgX3RoaXMuc2Nyb2xsQ291bnQgPSBfdGhpcy5vcHRpb25zLmNoZWNrRXZlcnk7XG4gICAgICAgICAgICAgICAgICAgX3RoaXMuX3NldFNpemVzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2NhbGMoZmFsc2UsIHdpbmRvdy5wYWdlWU9mZnNldCk7XG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgX3RoaXMuc2Nyb2xsQ291bnQtLTtcbiAgICAgICAgICAgICAgICAgICBfdGhpcy5fY2FsYyhmYWxzZSwgd2luZG93LnBhZ2VZT2Zmc2V0KTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50Lm9mZigncmVzaXplbWUuemYudHJpZ2dlcicpXG4gICAgICAgICAgICAgICAgIC5vbigncmVzaXplbWUuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUsIGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICBfdGhpcy5fc2V0U2l6ZXMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9jYWxjKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLmNhblN0aWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5pc09uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fZXZlbnRzKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoX3RoaXMuaXNPbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9wYXVzZUxpc3RlbmVycyhzY3JvbGxMaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlcnMgZm9yIHNjcm9sbCBhbmQgY2hhbmdlIGV2ZW50cyBvbiBhbmNob3IuXG4gICAqIEBmaXJlcyBTdGlja3kjcGF1c2VcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNjcm9sbExpc3RlbmVyIC0gdW5pcXVlLCBuYW1lc3BhY2VkIHNjcm9sbCBsaXN0ZW5lciBhdHRhY2hlZCB0byBgd2luZG93YFxuICAgKi9cbiAgX3BhdXNlTGlzdGVuZXJzKHNjcm9sbExpc3RlbmVyKSB7XG4gICAgdGhpcy5pc09uID0gZmFsc2U7XG4gICAgJCh3aW5kb3cpLm9mZihzY3JvbGxMaXN0ZW5lcik7XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaXMgcGF1c2VkIGR1ZSB0byByZXNpemUgZXZlbnQgc2hyaW5raW5nIHRoZSB2aWV3LlxuICAgICAqIEBldmVudCBTdGlja3kjcGF1c2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3BhdXNlLnpmLnN0aWNreScpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbiBldmVyeSBgc2Nyb2xsYCBldmVudCBhbmQgb24gYF9pbml0YFxuICAgKiBmaXJlcyBmdW5jdGlvbnMgYmFzZWQgb24gYm9vbGVhbnMgYW5kIGNhY2hlZCB2YWx1ZXNcbiAgICogQHBhcmFtIHtCb29sZWFufSBjaGVja1NpemVzIC0gdHJ1ZSBpZiBwbHVnaW4gc2hvdWxkIHJlY2FsY3VsYXRlIHNpemVzIGFuZCBicmVha3BvaW50cy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNjcm9sbCAtIGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uIHBhc3NlZCBmcm9tIHNjcm9sbCBldmVudCBjYiBmdW5jdGlvbi4gSWYgbm90IHBhc3NlZCwgZGVmYXVsdHMgdG8gYHdpbmRvdy5wYWdlWU9mZnNldGAuXG4gICAqL1xuICBfY2FsYyhjaGVja1NpemVzLCBzY3JvbGwpIHtcbiAgICBpZiAoY2hlY2tTaXplcykgeyB0aGlzLl9zZXRTaXplcygpOyB9XG5cbiAgICBpZiAoIXRoaXMuY2FuU3RpY2spIHtcbiAgICAgIGlmICh0aGlzLmlzU3R1Y2spIHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlU3RpY2t5KHRydWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghc2Nyb2xsKSB7IHNjcm9sbCA9IHdpbmRvdy5wYWdlWU9mZnNldDsgfVxuXG4gICAgaWYgKHNjcm9sbCA+PSB0aGlzLnRvcFBvaW50KSB7XG4gICAgICBpZiAoc2Nyb2xsIDw9IHRoaXMuYm90dG9tUG9pbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzU3R1Y2spIHtcbiAgICAgICAgICB0aGlzLl9zZXRTdGlja3koKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTdHVjaykge1xuICAgICAgICAgIHRoaXMuX3JlbW92ZVN0aWNreShmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuaXNTdHVjaykge1xuICAgICAgICB0aGlzLl9yZW1vdmVTdGlja3kodHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhdXNlcyB0aGUgJGVsZW1lbnQgdG8gYmVjb21lIHN0dWNrLlxuICAgKiBBZGRzIGBwb3NpdGlvbjogZml4ZWQ7YCwgYW5kIGhlbHBlciBjbGFzc2VzLlxuICAgKiBAZmlyZXMgU3RpY2t5I3N0dWNrdG9cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0U3RpY2t5KCkge1xuICAgIHZhciBzdGlja1RvID0gdGhpcy5vcHRpb25zLnN0aWNrVG8sXG4gICAgICAgIG1yZ24gPSBzdGlja1RvID09PSAndG9wJyA/ICdtYXJnaW5Ub3AnIDogJ21hcmdpbkJvdHRvbScsXG4gICAgICAgIG5vdFN0dWNrVG8gPSBzdGlja1RvID09PSAndG9wJyA/ICdib3R0b20nIDogJ3RvcCcsXG4gICAgICAgIGNzcyA9IHt9O1xuXG4gICAgY3NzW21yZ25dID0gYCR7dGhpcy5vcHRpb25zW21yZ25dfWVtYDtcbiAgICBjc3Nbc3RpY2tUb10gPSAwO1xuICAgIGNzc1tub3RTdHVja1RvXSA9ICdhdXRvJztcbiAgICBjc3NbJ2xlZnQnXSA9IHRoaXMuJGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0ICsgcGFyc2VJbnQod2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy4kY29udGFpbmVyWzBdKVtcInBhZGRpbmctbGVmdFwiXSwgMTApO1xuICAgIHRoaXMuaXNTdHVjayA9IHRydWU7XG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhgaXMtYW5jaG9yZWQgaXMtYXQtJHtub3RTdHVja1RvfWApXG4gICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhgaXMtc3R1Y2sgaXMtYXQtJHtzdGlja1RvfWApXG4gICAgICAgICAgICAgICAgIC5jc3MoY3NzKVxuICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgJGVsZW1lbnQgaGFzIGJlY29tZSBgcG9zaXRpb246IGZpeGVkO2BcbiAgICAgICAgICAgICAgICAgICogTmFtZXNwYWNlZCB0byBgdG9wYCBvciBgYm90dG9tYCwgZS5nLiBgc3RpY2t5LnpmLnN0dWNrdG86dG9wYFxuICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgU3RpY2t5I3N0dWNrdG9cbiAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgIC50cmlnZ2VyKGBzdGlja3kuemYuc3R1Y2t0bzoke3N0aWNrVG99YCk7XG4gIH1cblxuICAvKipcbiAgICogQ2F1c2VzIHRoZSAkZWxlbWVudCB0byBiZWNvbWUgdW5zdHVjay5cbiAgICogUmVtb3ZlcyBgcG9zaXRpb246IGZpeGVkO2AsIGFuZCBoZWxwZXIgY2xhc3Nlcy5cbiAgICogQWRkcyBvdGhlciBoZWxwZXIgY2xhc3Nlcy5cbiAgICogQHBhcmFtIHtCb29sZWFufSBpc1RvcCAtIHRlbGxzIHRoZSBmdW5jdGlvbiBpZiB0aGUgJGVsZW1lbnQgc2hvdWxkIGFuY2hvciB0byB0aGUgdG9wIG9yIGJvdHRvbSBvZiBpdHMgJGFuY2hvciBlbGVtZW50LlxuICAgKiBAZmlyZXMgU3RpY2t5I3Vuc3R1Y2tmcm9tXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcmVtb3ZlU3RpY2t5KGlzVG9wKSB7XG4gICAgdmFyIHN0aWNrVG8gPSB0aGlzLm9wdGlvbnMuc3RpY2tUbyxcbiAgICAgICAgc3RpY2tUb1RvcCA9IHN0aWNrVG8gPT09ICd0b3AnLFxuICAgICAgICBjc3MgPSB7fSxcbiAgICAgICAgYW5jaG9yUHQgPSAodGhpcy5wb2ludHMgPyB0aGlzLnBvaW50c1sxXSAtIHRoaXMucG9pbnRzWzBdIDogdGhpcy5hbmNob3JIZWlnaHQpIC0gdGhpcy5lbGVtSGVpZ2h0LFxuICAgICAgICBtcmduID0gc3RpY2tUb1RvcCA/ICdtYXJnaW5Ub3AnIDogJ21hcmdpbkJvdHRvbScsXG4gICAgICAgIG5vdFN0dWNrVG8gPSBzdGlja1RvVG9wID8gJ2JvdHRvbScgOiAndG9wJyxcbiAgICAgICAgdG9wT3JCb3R0b20gPSBpc1RvcCA/ICd0b3AnIDogJ2JvdHRvbSc7XG5cbiAgICBjc3NbbXJnbl0gPSAwO1xuXG4gICAgaWYgKChpc1RvcCAmJiAhc3RpY2tUb1RvcCkgfHwgKHN0aWNrVG9Ub3AgJiYgIWlzVG9wKSkge1xuICAgICAgY3NzW3N0aWNrVG9dID0gYW5jaG9yUHQ7XG4gICAgICBjc3Nbbm90U3R1Y2tUb10gPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBjc3Nbc3RpY2tUb10gPSAwO1xuICAgICAgY3NzW25vdFN0dWNrVG9dID0gYW5jaG9yUHQ7XG4gICAgfVxuXG4gICAgY3NzWydsZWZ0J10gPSAnJztcbiAgICB0aGlzLmlzU3R1Y2sgPSBmYWxzZTtcbiAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKGBpcy1zdHVjayBpcy1hdC0ke3N0aWNrVG99YClcbiAgICAgICAgICAgICAgICAgLmFkZENsYXNzKGBpcy1hbmNob3JlZCBpcy1hdC0ke3RvcE9yQm90dG9tfWApXG4gICAgICAgICAgICAgICAgIC5jc3MoY3NzKVxuICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgJGVsZW1lbnQgaGFzIGJlY29tZSBhbmNob3JlZC5cbiAgICAgICAgICAgICAgICAgICogTmFtZXNwYWNlZCB0byBgdG9wYCBvciBgYm90dG9tYCwgZS5nLiBgc3RpY2t5LnpmLnVuc3R1Y2tmcm9tOmJvdHRvbWBcbiAgICAgICAgICAgICAgICAgICogQGV2ZW50IFN0aWNreSN1bnN0dWNrZnJvbVxuICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgLnRyaWdnZXIoYHN0aWNreS56Zi51bnN0dWNrZnJvbToke3RvcE9yQm90dG9tfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlICRlbGVtZW50IGFuZCAkY29udGFpbmVyIHNpemVzIGZvciBwbHVnaW4uXG4gICAqIENhbGxzIGBfc2V0QnJlYWtQb2ludHNgLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIG9wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGZpcmUgb24gY29tcGxldGlvbiBvZiBgX3NldEJyZWFrUG9pbnRzYC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRTaXplcyhjYikge1xuICAgIHRoaXMuY2FuU3RpY2sgPSBGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCh0aGlzLm9wdGlvbnMuc3RpY2t5T24pO1xuICAgIGlmICghdGhpcy5jYW5TdGljaykgeyBjYigpOyB9XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgbmV3RWxlbVdpZHRoID0gdGhpcy4kY29udGFpbmVyWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoLFxuICAgICAgICBjb21wID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy4kY29udGFpbmVyWzBdKSxcbiAgICAgICAgcGRuZyA9IHBhcnNlSW50KGNvbXBbJ3BhZGRpbmctcmlnaHQnXSwgMTApO1xuXG4gICAgaWYgKHRoaXMuJGFuY2hvciAmJiB0aGlzLiRhbmNob3IubGVuZ3RoKSB7XG4gICAgICB0aGlzLmFuY2hvckhlaWdodCA9IHRoaXMuJGFuY2hvclswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BhcnNlUG9pbnRzKCk7XG4gICAgfVxuXG4gICAgdGhpcy4kZWxlbWVudC5jc3Moe1xuICAgICAgJ21heC13aWR0aCc6IGAke25ld0VsZW1XaWR0aCAtIHBkbmd9cHhgXG4gICAgfSk7XG5cbiAgICB2YXIgbmV3Q29udGFpbmVySGVpZ2h0ID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgfHwgdGhpcy5jb250YWluZXJIZWlnaHQ7XG4gICAgdGhpcy5jb250YWluZXJIZWlnaHQgPSBuZXdDb250YWluZXJIZWlnaHQ7XG4gICAgdGhpcy4kY29udGFpbmVyLmNzcyh7XG4gICAgICBoZWlnaHQ6IG5ld0NvbnRhaW5lckhlaWdodFxuICAgIH0pO1xuICAgIHRoaXMuZWxlbUhlaWdodCA9IG5ld0NvbnRhaW5lckhlaWdodDtcblxuICBcdGlmICh0aGlzLmlzU3R1Y2spIHtcbiAgXHRcdHRoaXMuJGVsZW1lbnQuY3NzKHtcImxlZnRcIjp0aGlzLiRjb250YWluZXIub2Zmc2V0KCkubGVmdCArIHBhcnNlSW50KGNvbXBbJ3BhZGRpbmctbGVmdCddLCAxMCl9KTtcbiAgXHR9XG5cbiAgICB0aGlzLl9zZXRCcmVha1BvaW50cyhuZXdDb250YWluZXJIZWlnaHQsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGNiKSB7IGNiKCk7IH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB1cHBlciBhbmQgbG93ZXIgYnJlYWtwb2ludHMgZm9yIHRoZSBlbGVtZW50IHRvIGJlY29tZSBzdGlja3kvdW5zdGlja3kuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBlbGVtSGVpZ2h0IC0gcHggdmFsdWUgZm9yIHN0aWNreS4kZWxlbWVudCBoZWlnaHQsIGNhbGN1bGF0ZWQgYnkgYF9zZXRTaXplc2AuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGNvbXBsZXRpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0QnJlYWtQb2ludHMoZWxlbUhlaWdodCwgY2IpIHtcbiAgICBpZiAoIXRoaXMuY2FuU3RpY2spIHtcbiAgICAgIGlmIChjYikgeyBjYigpOyB9XG4gICAgICBlbHNlIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgfVxuICAgIHZhciBtVG9wID0gZW1DYWxjKHRoaXMub3B0aW9ucy5tYXJnaW5Ub3ApLFxuICAgICAgICBtQnRtID0gZW1DYWxjKHRoaXMub3B0aW9ucy5tYXJnaW5Cb3R0b20pLFxuICAgICAgICB0b3BQb2ludCA9IHRoaXMucG9pbnRzID8gdGhpcy5wb2ludHNbMF0gOiB0aGlzLiRhbmNob3Iub2Zmc2V0KCkudG9wLFxuICAgICAgICBib3R0b21Qb2ludCA9IHRoaXMucG9pbnRzID8gdGhpcy5wb2ludHNbMV0gOiB0b3BQb2ludCArIHRoaXMuYW5jaG9ySGVpZ2h0LFxuICAgICAgICAvLyB0b3BQb2ludCA9IHRoaXMuJGFuY2hvci5vZmZzZXQoKS50b3AgfHwgdGhpcy5wb2ludHNbMF0sXG4gICAgICAgIC8vIGJvdHRvbVBvaW50ID0gdG9wUG9pbnQgKyB0aGlzLmFuY2hvckhlaWdodCB8fCB0aGlzLnBvaW50c1sxXSxcbiAgICAgICAgd2luSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5zdGlja1RvID09PSAndG9wJykge1xuICAgICAgdG9wUG9pbnQgLT0gbVRvcDtcbiAgICAgIGJvdHRvbVBvaW50IC09IChlbGVtSGVpZ2h0ICsgbVRvcCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuc3RpY2tUbyA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIHRvcFBvaW50IC09ICh3aW5IZWlnaHQgLSAoZWxlbUhlaWdodCArIG1CdG0pKTtcbiAgICAgIGJvdHRvbVBvaW50IC09ICh3aW5IZWlnaHQgLSBtQnRtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy90aGlzIHdvdWxkIGJlIHRoZSBzdGlja1RvOiBib3RoIG9wdGlvbi4uLiB0cmlja3lcbiAgICB9XG5cbiAgICB0aGlzLnRvcFBvaW50ID0gdG9wUG9pbnQ7XG4gICAgdGhpcy5ib3R0b21Qb2ludCA9IGJvdHRvbVBvaW50O1xuXG4gICAgaWYgKGNiKSB7IGNiKCk7IH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgY3VycmVudCBzdGlja3kgZWxlbWVudC5cbiAgICogUmVzZXRzIHRoZSBlbGVtZW50IHRvIHRoZSB0b3AgcG9zaXRpb24gZmlyc3QuXG4gICAqIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzLCBKUy1hZGRlZCBjc3MgcHJvcGVydGllcyBhbmQgY2xhc3NlcywgYW5kIHVud3JhcHMgdGhlICRlbGVtZW50IGlmIHRoZSBKUyBhZGRlZCB0aGUgJGNvbnRhaW5lci5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX3JlbW92ZVN0aWNreSh0cnVlKTtcblxuICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLnN0aWNreUNsYXNzfSBpcy1hbmNob3JlZCBpcy1hdC10b3BgKVxuICAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcnLFxuICAgICAgICAgICAgICAgICAgIHRvcDogJycsXG4gICAgICAgICAgICAgICAgICAgYm90dG9tOiAnJyxcbiAgICAgICAgICAgICAgICAgICAnbWF4LXdpZHRoJzogJydcbiAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgLm9mZigncmVzaXplbWUuemYudHJpZ2dlcicpO1xuXG4gICAgdGhpcy4kYW5jaG9yLm9mZignY2hhbmdlLnpmLnN0aWNreScpO1xuICAgICQod2luZG93KS5vZmYodGhpcy5zY3JvbGxMaXN0ZW5lcik7XG5cbiAgICBpZiAodGhpcy53YXNXcmFwcGVkKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnVud3JhcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNvbnRhaW5lckNsYXNzKVxuICAgICAgICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJydcbiAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuU3RpY2t5LmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQ3VzdG9taXphYmxlIGNvbnRhaW5lciB0ZW1wbGF0ZS4gQWRkIHlvdXIgb3duIGNsYXNzZXMgZm9yIHN0eWxpbmcgYW5kIHNpemluZy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnJmx0O2RpdiBkYXRhLXN0aWNreS1jb250YWluZXIgY2xhc3M9XCJzbWFsbC02IGNvbHVtbnNcIiZndDsmbHQ7L2RpdiZndDsnXG4gICAqL1xuICBjb250YWluZXI6ICc8ZGl2IGRhdGEtc3RpY2t5LWNvbnRhaW5lcj48L2Rpdj4nLFxuICAvKipcbiAgICogTG9jYXRpb24gaW4gdGhlIHZpZXcgdGhlIGVsZW1lbnQgc3RpY2tzIHRvLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICd0b3AnXG4gICAqL1xuICBzdGlja1RvOiAndG9wJyxcbiAgLyoqXG4gICAqIElmIGFuY2hvcmVkIHRvIGEgc2luZ2xlIGVsZW1lbnQsIHRoZSBpZCBvZiB0aGF0IGVsZW1lbnQuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2V4YW1wbGVJZCdcbiAgICovXG4gIGFuY2hvcjogJycsXG4gIC8qKlxuICAgKiBJZiB1c2luZyBtb3JlIHRoYW4gb25lIGVsZW1lbnQgYXMgYW5jaG9yIHBvaW50cywgdGhlIGlkIG9mIHRoZSB0b3AgYW5jaG9yLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdleGFtcGxlSWQ6dG9wJ1xuICAgKi9cbiAgdG9wQW5jaG9yOiAnJyxcbiAgLyoqXG4gICAqIElmIHVzaW5nIG1vcmUgdGhhbiBvbmUgZWxlbWVudCBhcyBhbmNob3IgcG9pbnRzLCB0aGUgaWQgb2YgdGhlIGJvdHRvbSBhbmNob3IuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2V4YW1wbGVJZDpib3R0b20nXG4gICAqL1xuICBidG1BbmNob3I6ICcnLFxuICAvKipcbiAgICogTWFyZ2luLCBpbiBgZW1gJ3MgdG8gYXBwbHkgdG8gdGhlIHRvcCBvZiB0aGUgZWxlbWVudCB3aGVuIGl0IGJlY29tZXMgc3RpY2t5LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDFcbiAgICovXG4gIG1hcmdpblRvcDogMSxcbiAgLyoqXG4gICAqIE1hcmdpbiwgaW4gYGVtYCdzIHRvIGFwcGx5IHRvIHRoZSBib3R0b20gb2YgdGhlIGVsZW1lbnQgd2hlbiBpdCBiZWNvbWVzIHN0aWNreS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxXG4gICAqL1xuICBtYXJnaW5Cb3R0b206IDEsXG4gIC8qKlxuICAgKiBCcmVha3BvaW50IHN0cmluZyB0aGF0IGlzIHRoZSBtaW5pbXVtIHNjcmVlbiBzaXplIGFuIGVsZW1lbnQgc2hvdWxkIGJlY29tZSBzdGlja3kuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ21lZGl1bSdcbiAgICovXG4gIHN0aWNreU9uOiAnbWVkaXVtJyxcbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gc3RpY2t5IGVsZW1lbnQsIGFuZCByZW1vdmVkIG9uIGRlc3RydWN0aW9uLiBGb3VuZGF0aW9uIGRlZmF1bHRzIHRvIGBzdGlja3lgLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdzdGlja3knXG4gICAqL1xuICBzdGlja3lDbGFzczogJ3N0aWNreScsXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHN0aWNreSBjb250YWluZXIuIEZvdW5kYXRpb24gZGVmYXVsdHMgdG8gYHN0aWNreS1jb250YWluZXJgLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdzdGlja3ktY29udGFpbmVyJ1xuICAgKi9cbiAgY29udGFpbmVyQ2xhc3M6ICdzdGlja3ktY29udGFpbmVyJyxcbiAgLyoqXG4gICAqIE51bWJlciBvZiBzY3JvbGwgZXZlbnRzIGJldHdlZW4gdGhlIHBsdWdpbidzIHJlY2FsY3VsYXRpbmcgc3RpY2t5IHBvaW50cy4gU2V0dGluZyBpdCB0byBgMGAgd2lsbCBjYXVzZSBpdCB0byByZWNhbGMgZXZlcnkgc2Nyb2xsIGV2ZW50LCBzZXR0aW5nIGl0IHRvIGAtMWAgd2lsbCBwcmV2ZW50IHJlY2FsYyBvbiBzY3JvbGwuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgNTBcbiAgICovXG4gIGNoZWNrRXZlcnk6IC0xXG59O1xuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjYWxjdWxhdGUgZW0gdmFsdWVzXG4gKiBAcGFyYW0gTnVtYmVyIHtlbX0gLSBudW1iZXIgb2YgZW0ncyB0byBjYWxjdWxhdGUgaW50byBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gZW1DYWxjKGVtKSB7XG4gIHJldHVybiBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5LCBudWxsKS5mb250U2l6ZSwgMTApICogZW07XG59XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihTdGlja3ksICdTdGlja3knKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFRhYnMgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnRhYnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlciBpZiB0YWJzIGNvbnRhaW4gaW1hZ2VzXG4gKi9cblxuY2xhc3MgVGFicyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRhYnMuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgVGFicyNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gdGFicy5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBUYWJzLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnVGFicycpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ1RhYnMnLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnbmV4dCcsXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cydcbiAgICAgIC8vICdUQUInOiAnbmV4dCcsXG4gICAgICAvLyAnU0hJRlRfVEFCJzogJ3ByZXZpb3VzJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSB0YWJzIGJ5IHNob3dpbmcgYW5kIGZvY3VzaW5nIChpZiBhdXRvRm9jdXM9dHJ1ZSkgdGhlIHByZXNldCBhY3RpdmUgdGFiLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJHRhYlRpdGxlcyA9IHRoaXMuJGVsZW1lbnQuZmluZChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKTtcbiAgICB0aGlzLiR0YWJDb250ZW50ID0gJChgW2RhdGEtdGFicy1jb250ZW50PVwiJHt0aGlzLiRlbGVtZW50WzBdLmlkfVwiXWApO1xuXG4gICAgdGhpcy4kdGFiVGl0bGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgJGxpbmsgPSAkZWxlbS5maW5kKCdhJyksXG4gICAgICAgICAgaXNBY3RpdmUgPSAkZWxlbS5oYXNDbGFzcygnaXMtYWN0aXZlJyksXG4gICAgICAgICAgaGFzaCA9ICRsaW5rWzBdLmhhc2guc2xpY2UoMSksXG4gICAgICAgICAgbGlua0lkID0gJGxpbmtbMF0uaWQgPyAkbGlua1swXS5pZCA6IGAke2hhc2h9LWxhYmVsYCxcbiAgICAgICAgICAkdGFiQ29udGVudCA9ICQoYCMke2hhc2h9YCk7XG5cbiAgICAgICRlbGVtLmF0dHIoeydyb2xlJzogJ3ByZXNlbnRhdGlvbid9KTtcblxuICAgICAgJGxpbmsuYXR0cih7XG4gICAgICAgICdyb2xlJzogJ3RhYicsXG4gICAgICAgICdhcmlhLWNvbnRyb2xzJzogaGFzaCxcbiAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBpc0FjdGl2ZSxcbiAgICAgICAgJ2lkJzogbGlua0lkXG4gICAgICB9KTtcblxuICAgICAgJHRhYkNvbnRlbnQuYXR0cih7XG4gICAgICAgICdyb2xlJzogJ3RhYnBhbmVsJyxcbiAgICAgICAgJ2FyaWEtaGlkZGVuJzogIWlzQWN0aXZlLFxuICAgICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkXG4gICAgICB9KTtcblxuICAgICAgaWYoaXNBY3RpdmUgJiYgX3RoaXMub3B0aW9ucy5hdXRvRm9jdXMpe1xuICAgICAgICAkbGluay5mb2N1cygpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYodGhpcy5vcHRpb25zLm1hdGNoSGVpZ2h0KSB7XG4gICAgICB2YXIgJGltYWdlcyA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZCgnaW1nJyk7XG5cbiAgICAgIGlmICgkaW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICBGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkKCRpbWFnZXMsIHRoaXMuX3NldEhlaWdodC5iaW5kKHRoaXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NldEhlaWdodCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2V2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdGhpcy5fYWRkS2V5SGFuZGxlcigpO1xuICAgIHRoaXMuX2FkZENsaWNrSGFuZGxlcigpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5tYXRjaEhlaWdodCkge1xuICAgICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCB0aGlzLl9zZXRIZWlnaHQuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgY2xpY2sgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRDbGlja0hhbmRsZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vZmYoJ2NsaWNrLnpmLnRhYnMnKVxuICAgICAgLm9uKCdjbGljay56Zi50YWJzJywgYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCwgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJCh0aGlzKSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGtleWJvYXJkIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWRkS2V5SGFuZGxlcigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciAkZmlyc3RUYWIgPSBfdGhpcy4kZWxlbWVudC5maW5kKCdsaTpmaXJzdC1vZi10eXBlJyk7XG4gICAgdmFyICRsYXN0VGFiID0gX3RoaXMuJGVsZW1lbnQuZmluZCgnbGk6bGFzdC1vZi10eXBlJyk7XG5cbiAgICB0aGlzLiR0YWJUaXRsZXMub2ZmKCdrZXlkb3duLnpmLnRhYnMnKS5vbigna2V5ZG93bi56Zi50YWJzJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZiAoZS53aGljaCA9PT0gOSkgcmV0dXJuO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgJGVsZW1lbnRzID0gJGVsZW1lbnQucGFyZW50KCd1bCcpLmNoaWxkcmVuKCdsaScpLFxuICAgICAgICAkcHJldkVsZW1lbnQsXG4gICAgICAgICRuZXh0RWxlbWVudDtcblxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcbiAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy53cmFwT25LZXlzKSB7XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSBpID09PSAwID8gJGVsZW1lbnRzLmxhc3QoKSA6ICRlbGVtZW50cy5lcShpLTEpO1xuICAgICAgICAgICAgJG5leHRFbGVtZW50ID0gaSA9PT0gJGVsZW1lbnRzLmxlbmd0aCAtMSA/ICRlbGVtZW50cy5maXJzdCgpIDogJGVsZW1lbnRzLmVxKGkrMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50cy5lcShNYXRoLm1heCgwLCBpLTEpKTtcbiAgICAgICAgICAgICRuZXh0RWxlbWVudCA9ICRlbGVtZW50cy5lcShNYXRoLm1pbihpKzEsICRlbGVtZW50cy5sZW5ndGgtMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBoYW5kbGUga2V5Ym9hcmQgZXZlbnQgd2l0aCBrZXlib2FyZCB1dGlsXG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnVGFicycsIHtcbiAgICAgICAgb3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJGVsZW1lbnQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKS5mb2N1cygpO1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJGVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJHByZXZFbGVtZW50LmZpbmQoJ1tyb2xlPVwidGFiXCJdJykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRwcmV2RWxlbWVudCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRuZXh0RWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkbmV4dEVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgdGFiIGAkdGFyZ2V0Q29udGVudGAgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIG9wZW4uXG4gICAqIEBmaXJlcyBUYWJzI2NoYW5nZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9oYW5kbGVUYWJDaGFuZ2UoJHRhcmdldCkge1xuICAgIHZhciAkdGFiTGluayA9ICR0YXJnZXQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKSxcbiAgICAgICAgaGFzaCA9ICR0YWJMaW5rWzBdLmhhc2gsXG4gICAgICAgICR0YXJnZXRDb250ZW50ID0gdGhpcy4kdGFiQ29udGVudC5maW5kKGhhc2gpLFxuICAgICAgICAkb2xkVGFiID0gdGhpcy4kZWxlbWVudC5cbiAgICAgICAgICBmaW5kKGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfS5pcy1hY3RpdmVgKVxuICAgICAgICAgIC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJylcbiAgICAgICAgICAuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKVxuICAgICAgICAgIC5hdHRyKHsgJ2FyaWEtc2VsZWN0ZWQnOiAnZmFsc2UnIH0pO1xuXG4gICAgJChgIyR7JG9sZFRhYi5hdHRyKCdhcmlhLWNvbnRyb2xzJyl9YClcbiAgICAgIC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJylcbiAgICAgIC5hdHRyKHsgJ2FyaWEtaGlkZGVuJzogJ3RydWUnIH0pO1xuXG4gICAgJHRhcmdldC5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAkdGFiTGluay5hdHRyKHsnYXJpYS1zZWxlY3RlZCc6ICd0cnVlJ30pO1xuXG4gICAgJHRhcmdldENvbnRlbnRcbiAgICAgIC5hZGRDbGFzcygnaXMtYWN0aXZlJylcbiAgICAgIC5hdHRyKHsnYXJpYS1oaWRkZW4nOiAnZmFsc2UnfSk7XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIHN1Y2Nlc3NmdWxseSBjaGFuZ2VkIHRhYnMuXG4gICAgICogQGV2ZW50IFRhYnMjY2hhbmdlXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjaGFuZ2UuemYudGFicycsIFskdGFyZ2V0XSk7XG4gIH1cblxuICAvKipcbiAgICogUHVibGljIG1ldGhvZCBmb3Igc2VsZWN0aW5nIGEgY29udGVudCBwYW5lIHRvIGRpc3BsYXkuXG4gICAqIEBwYXJhbSB7alF1ZXJ5IHwgU3RyaW5nfSBlbGVtIC0galF1ZXJ5IG9iamVjdCBvciBzdHJpbmcgb2YgdGhlIGlkIG9mIHRoZSBwYW5lIHRvIGRpc3BsYXkuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgc2VsZWN0VGFiKGVsZW0pIHtcbiAgICB2YXIgaWRTdHI7XG5cbiAgICBpZiAodHlwZW9mIGVsZW0gPT09ICdvYmplY3QnKSB7XG4gICAgICBpZFN0ciA9IGVsZW1bMF0uaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkU3RyID0gZWxlbTtcbiAgICB9XG5cbiAgICBpZiAoaWRTdHIuaW5kZXhPZignIycpIDwgMCkge1xuICAgICAgaWRTdHIgPSBgIyR7aWRTdHJ9YDtcbiAgICB9XG5cbiAgICB2YXIgJHRhcmdldCA9IHRoaXMuJHRhYlRpdGxlcy5maW5kKGBbaHJlZj1cIiR7aWRTdHJ9XCJdYCkucGFyZW50KGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWApO1xuXG4gICAgdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCR0YXJnZXQpO1xuICB9O1xuICAvKipcbiAgICogU2V0cyB0aGUgaGVpZ2h0IG9mIGVhY2ggcGFuZWwgdG8gdGhlIGhlaWdodCBvZiB0aGUgdGFsbGVzdCBwYW5lbC5cbiAgICogSWYgZW5hYmxlZCBpbiBvcHRpb25zLCBnZXRzIGNhbGxlZCBvbiBtZWRpYSBxdWVyeSBjaGFuZ2UuXG4gICAqIElmIGxvYWRpbmcgY29udGVudCB2aWEgZXh0ZXJuYWwgc291cmNlLCBjYW4gYmUgY2FsbGVkIGRpcmVjdGx5IG9yIHdpdGggX3JlZmxvdy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0SGVpZ2h0KCkge1xuICAgIHZhciBtYXggPSAwO1xuICAgIHRoaXMuJHRhYkNvbnRlbnRcbiAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMucGFuZWxDbGFzc31gKVxuICAgICAgLmNzcygnaGVpZ2h0JywgJycpXG4gICAgICAuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBhbmVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGlzQWN0aXZlID0gcGFuZWwuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgICAgICBwYW5lbC5jc3Moeyd2aXNpYmlsaXR5JzogJ2hpZGRlbicsICdkaXNwbGF5JzogJ2Jsb2NrJ30pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRlbXAgPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcblxuICAgICAgICBpZiAoIWlzQWN0aXZlKSB7XG4gICAgICAgICAgcGFuZWwuY3NzKHtcbiAgICAgICAgICAgICd2aXNpYmlsaXR5JzogJycsXG4gICAgICAgICAgICAnZGlzcGxheSc6ICcnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBtYXggPSB0ZW1wID4gbWF4ID8gdGVtcCA6IG1heDtcbiAgICAgIH0pXG4gICAgICAuY3NzKCdoZWlnaHQnLCBgJHttYXh9cHhgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBhbiB0YWJzLlxuICAgKiBAZmlyZXMgVGFicyNkZXN0cm95ZWRcbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLmZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YClcbiAgICAgIC5vZmYoJy56Zi50YWJzJykuaGlkZSgpLmVuZCgpXG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLnBhbmVsQ2xhc3N9YClcbiAgICAgIC5oaWRlKCk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLm1hdGNoSGVpZ2h0KSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknKTtcbiAgICB9XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuVGFicy5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgd2luZG93IHRvIHNjcm9sbCB0byBjb250ZW50IG9mIGFjdGl2ZSBwYW5lIG9uIGxvYWQgaWYgc2V0IHRvIHRydWUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGF1dG9Gb2N1czogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFsbG93cyBrZXlib2FyZCBpbnB1dCB0byAnd3JhcCcgYXJvdW5kIHRoZSB0YWIgbGlua3MuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgd3JhcE9uS2V5czogdHJ1ZSxcblxuICAvKipcbiAgICogQWxsb3dzIHRoZSB0YWIgY29udGVudCBwYW5lcyB0byBtYXRjaCBoZWlnaHRzIGlmIHNldCB0byB0cnVlLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBtYXRjaEhlaWdodDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gYGxpYCdzIGluIHRhYiBsaW5rIGxpc3QuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ3RhYnMtdGl0bGUnXG4gICAqL1xuICBsaW5rQ2xhc3M6ICd0YWJzLXRpdGxlJyxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgY29udGVudCBjb250YWluZXJzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICd0YWJzLXBhbmVsJ1xuICAgKi9cbiAgcGFuZWxDbGFzczogJ3RhYnMtcGFuZWwnXG59O1xuXG5mdW5jdGlvbiBjaGVja0NsYXNzKCRlbGVtKXtcbiAgcmV0dXJuICRlbGVtLmhhc0NsYXNzKCdpcy1hY3RpdmUnKTtcbn1cblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKFRhYnMsICdUYWJzJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBUb2dnbGVyIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi50b2dnbGVyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICovXG5cbmNsYXNzIFRvZ2dsZXIge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBUb2dnbGVyLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIFRvZ2dsZXIjaW5pdFxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSB0cmlnZ2VyIHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFRvZ2dsZXIuZGVmYXVsdHMsIGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICB0aGlzLmNsYXNzTmFtZSA9ICcnO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnVG9nZ2xlcicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBUb2dnbGVyIHBsdWdpbiBieSBwYXJzaW5nIHRoZSB0b2dnbGUgY2xhc3MgZnJvbSBkYXRhLXRvZ2dsZXIsIG9yIGFuaW1hdGlvbiBjbGFzc2VzIGZyb20gZGF0YS1hbmltYXRlLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBpbnB1dDtcbiAgICAvLyBQYXJzZSBhbmltYXRpb24gY2xhc3NlcyBpZiB0aGV5IHdlcmUgc2V0XG4gICAgaWYgKHRoaXMub3B0aW9ucy5hbmltYXRlKSB7XG4gICAgICBpbnB1dCA9IHRoaXMub3B0aW9ucy5hbmltYXRlLnNwbGl0KCcgJyk7XG5cbiAgICAgIHRoaXMuYW5pbWF0aW9uSW4gPSBpbnB1dFswXTtcbiAgICAgIHRoaXMuYW5pbWF0aW9uT3V0ID0gaW5wdXRbMV0gfHwgbnVsbDtcbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlLCBwYXJzZSB0b2dnbGUgY2xhc3NcbiAgICBlbHNlIHtcbiAgICAgIGlucHV0ID0gdGhpcy4kZWxlbWVudC5kYXRhKCd0b2dnbGVyJyk7XG4gICAgICAvLyBBbGxvdyBmb3IgYSAuIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZ1xuICAgICAgdGhpcy5jbGFzc05hbWUgPSBpbnB1dFswXSA9PT0gJy4nID8gaW5wdXQuc2xpY2UoMSkgOiBpbnB1dDtcbiAgICB9XG5cbiAgICAvLyBBZGQgQVJJQSBhdHRyaWJ1dGVzIHRvIHRyaWdnZXJzXG4gICAgdmFyIGlkID0gdGhpcy4kZWxlbWVudFswXS5pZDtcbiAgICAkKGBbZGF0YS1vcGVuPVwiJHtpZH1cIl0sIFtkYXRhLWNsb3NlPVwiJHtpZH1cIl0sIFtkYXRhLXRvZ2dsZT1cIiR7aWR9XCJdYClcbiAgICAgIC5hdHRyKCdhcmlhLWNvbnRyb2xzJywgaWQpO1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgaGlkZGVuLCBhZGQgYXJpYS1oaWRkZW5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0aGlzLiRlbGVtZW50LmlzKCc6aGlkZGVuJykgPyBmYWxzZSA6IHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgdGhlIHRvZ2dsZSB0cmlnZ2VyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJ3RvZ2dsZS56Zi50cmlnZ2VyJykub24oJ3RvZ2dsZS56Zi50cmlnZ2VyJywgdGhpcy50b2dnbGUuYmluZCh0aGlzKSk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgdGFyZ2V0IGNsYXNzIG9uIHRoZSB0YXJnZXQgZWxlbWVudC4gQW4gZXZlbnQgaXMgZmlyZWQgZnJvbSB0aGUgb3JpZ2luYWwgdHJpZ2dlciBkZXBlbmRpbmcgb24gaWYgdGhlIHJlc3VsdGFudCBzdGF0ZSB3YXMgXCJvblwiIG9yIFwib2ZmXCIuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgVG9nZ2xlciNvblxuICAgKiBAZmlyZXMgVG9nZ2xlciNvZmZcbiAgICovXG4gIHRvZ2dsZSgpIHtcbiAgICB0aGlzWyB0aGlzLm9wdGlvbnMuYW5pbWF0ZSA/ICdfdG9nZ2xlQW5pbWF0ZScgOiAnX3RvZ2dsZUNsYXNzJ10oKTtcbiAgfVxuXG4gIF90b2dnbGVDbGFzcygpIHtcbiAgICB0aGlzLiRlbGVtZW50LnRvZ2dsZUNsYXNzKHRoaXMuY2xhc3NOYW1lKTtcblxuICAgIHZhciBpc09uID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcyh0aGlzLmNsYXNzTmFtZSk7XG4gICAgaWYgKGlzT24pIHtcbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgaWYgdGhlIHRhcmdldCBlbGVtZW50IGhhcyB0aGUgY2xhc3MgYWZ0ZXIgYSB0b2dnbGUuXG4gICAgICAgKiBAZXZlbnQgVG9nZ2xlciNvblxuICAgICAgICovXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ29uLnpmLnRvZ2dsZXInKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIGlmIHRoZSB0YXJnZXQgZWxlbWVudCBkb2VzIG5vdCBoYXZlIHRoZSBjbGFzcyBhZnRlciBhIHRvZ2dsZS5cbiAgICAgICAqIEBldmVudCBUb2dnbGVyI29mZlxuICAgICAgICovXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ29mZi56Zi50b2dnbGVyJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlQVJJQShpc09uKTtcbiAgfVxuXG4gIF90b2dnbGVBbmltYXRlKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy4kZWxlbWVudC5pcygnOmhpZGRlbicpKSB7XG4gICAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlSW4odGhpcy4kZWxlbWVudCwgdGhpcy5hbmltYXRpb25JbiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMudHJpZ2dlcignb24uemYudG9nZ2xlcicpO1xuICAgICAgICBfdGhpcy5fdXBkYXRlQVJJQSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQodGhpcy4kZWxlbWVudCwgdGhpcy5hbmltYXRpb25PdXQsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnRyaWdnZXIoJ29mZi56Zi50b2dnbGVyJyk7XG4gICAgICAgIF90aGlzLl91cGRhdGVBUklBKGZhbHNlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVBUklBKGlzT24pIHtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBpc09uID8gdHJ1ZSA6IGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgaW5zdGFuY2Ugb2YgVG9nZ2xlciBvbiB0aGUgZWxlbWVudC5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudG9nZ2xlcicpO1xuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5Ub2dnbGVyLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogVGVsbHMgdGhlIHBsdWdpbiBpZiB0aGUgZWxlbWVudCBzaG91bGQgYW5pbWF0ZWQgd2hlbiB0b2dnbGVkLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBhbmltYXRlOiBmYWxzZVxufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKFRvZ2dsZXIsICdUb2dnbGVyJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBUb29sdGlwIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi50b29sdGlwXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmJveFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICovXG5cbmNsYXNzIFRvb2x0aXAge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIFRvb2x0aXAuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgVG9vbHRpcCNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBhdHRhY2ggYSB0b29sdGlwIHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIG9iamVjdCB0byBleHRlbmQgdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgVG9vbHRpcC5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuaXNDbGljayA9IGZhbHNlO1xuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1Rvb2x0aXAnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgdG9vbHRpcCBieSBzZXR0aW5nIHRoZSBjcmVhdGluZyB0aGUgdGlwIGVsZW1lbnQsIGFkZGluZyBpdCdzIHRleHQsIHNldHRpbmcgcHJpdmF0ZSB2YXJpYWJsZXMgYW5kIHNldHRpbmcgYXR0cmlidXRlcyBvbiB0aGUgYW5jaG9yLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIGVsZW1JZCA9IHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1kZXNjcmliZWRieScpIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ3Rvb2x0aXAnKTtcblxuICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbkNsYXNzID0gdGhpcy5fZ2V0UG9zaXRpb25DbGFzcyh0aGlzLiRlbGVtZW50KTtcbiAgICB0aGlzLm9wdGlvbnMudGlwVGV4dCA9IHRoaXMub3B0aW9ucy50aXBUZXh0IHx8IHRoaXMuJGVsZW1lbnQuYXR0cigndGl0bGUnKTtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGhpcy5vcHRpb25zLnRlbXBsYXRlID8gJCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpIDogdGhpcy5fYnVpbGRUZW1wbGF0ZShlbGVtSWQpO1xuXG4gICAgdGhpcy50ZW1wbGF0ZS5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KVxuICAgICAgICAudGV4dCh0aGlzLm9wdGlvbnMudGlwVGV4dClcbiAgICAgICAgLmhpZGUoKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cih7XG4gICAgICAndGl0bGUnOiAnJyxcbiAgICAgICdhcmlhLWRlc2NyaWJlZGJ5JzogZWxlbUlkLFxuICAgICAgJ2RhdGEteWV0aS1ib3gnOiBlbGVtSWQsXG4gICAgICAnZGF0YS10b2dnbGUnOiBlbGVtSWQsXG4gICAgICAnZGF0YS1yZXNpemUnOiBlbGVtSWRcbiAgICB9KS5hZGRDbGFzcyh0aGlzLnRyaWdnZXJDbGFzcyk7XG5cbiAgICAvL2hlbHBlciB2YXJpYWJsZXMgdG8gdHJhY2sgbW92ZW1lbnQgb24gY29sbGlzaW9uc1xuICAgIHRoaXMudXNlZFBvc2l0aW9ucyA9IFtdO1xuICAgIHRoaXMuY291bnRlciA9IDQ7XG4gICAgdGhpcy5jbGFzc0NoYW5nZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX2V2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdyYWJzIHRoZSBjdXJyZW50IHBvc2l0aW9uaW5nIGNsYXNzLCBpZiBwcmVzZW50LCBhbmQgcmV0dXJucyB0aGUgdmFsdWUgb3IgYW4gZW1wdHkgc3RyaW5nLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2dldFBvc2l0aW9uQ2xhc3MoZWxlbWVudCkge1xuICAgIGlmICghZWxlbWVudCkgeyByZXR1cm4gJyc7IH1cbiAgICAvLyB2YXIgcG9zaXRpb24gPSBlbGVtZW50LmF0dHIoJ2NsYXNzJykubWF0Y2goL3RvcHxsZWZ0fHJpZ2h0L2cpO1xuICAgIHZhciBwb3NpdGlvbiA9IGVsZW1lbnRbMF0uY2xhc3NOYW1lLm1hdGNoKC9cXGIodG9wfGxlZnR8cmlnaHQpXFxiL2cpO1xuICAgICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uID8gcG9zaXRpb25bMF0gOiAnJztcbiAgICByZXR1cm4gcG9zaXRpb247XG4gIH07XG4gIC8qKlxuICAgKiBidWlsZHMgdGhlIHRvb2x0aXAgZWxlbWVudCwgYWRkcyBhdHRyaWJ1dGVzLCBhbmQgcmV0dXJucyB0aGUgdGVtcGxhdGUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYnVpbGRUZW1wbGF0ZShpZCkge1xuICAgIHZhciB0ZW1wbGF0ZUNsYXNzZXMgPSAoYCR7dGhpcy5vcHRpb25zLnRvb2x0aXBDbGFzc30gJHt0aGlzLm9wdGlvbnMucG9zaXRpb25DbGFzc30gJHt0aGlzLm9wdGlvbnMudGVtcGxhdGVDbGFzc2VzfWApLnRyaW0oKTtcbiAgICB2YXIgJHRlbXBsYXRlID0gICQoJzxkaXY+PC9kaXY+JykuYWRkQ2xhc3ModGVtcGxhdGVDbGFzc2VzKS5hdHRyKHtcbiAgICAgICdyb2xlJzogJ3Rvb2x0aXAnLFxuICAgICAgJ2FyaWEtaGlkZGVuJzogdHJ1ZSxcbiAgICAgICdkYXRhLWlzLWFjdGl2ZSc6IGZhbHNlLFxuICAgICAgJ2RhdGEtaXMtZm9jdXMnOiBmYWxzZSxcbiAgICAgICdpZCc6IGlkXG4gICAgfSk7XG4gICAgcmV0dXJuICR0ZW1wbGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGlmIGEgY29sbGlzaW9uIGV2ZW50IGlzIGRldGVjdGVkLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcG9zaXRpb24gLSBwb3NpdGlvbmluZyBjbGFzcyB0byB0cnlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9yZXBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgdGhpcy51c2VkUG9zaXRpb25zLnB1c2gocG9zaXRpb24gPyBwb3NpdGlvbiA6ICdib3R0b20nKTtcblxuICAgIC8vZGVmYXVsdCwgdHJ5IHN3aXRjaGluZyB0byBvcHBvc2l0ZSBzaWRlXG4gICAgaWYgKCFwb3NpdGlvbiAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ3RvcCcpIDwgMCkpIHtcbiAgICAgIHRoaXMudGVtcGxhdGUuYWRkQ2xhc3MoJ3RvcCcpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICd0b3AnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignYm90dG9tJykgPCAwKSkge1xuICAgICAgdGhpcy50ZW1wbGF0ZS5yZW1vdmVDbGFzcyhwb3NpdGlvbik7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ2xlZnQnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZigncmlnaHQnKSA8IDApKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlLnJlbW92ZUNsYXNzKHBvc2l0aW9uKVxuICAgICAgICAgIC5hZGRDbGFzcygncmlnaHQnKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAncmlnaHQnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignbGVmdCcpIDwgMCkpIHtcbiAgICAgIHRoaXMudGVtcGxhdGUucmVtb3ZlQ2xhc3MocG9zaXRpb24pXG4gICAgICAgICAgLmFkZENsYXNzKCdsZWZ0Jyk7XG4gICAgfVxuXG4gICAgLy9pZiBkZWZhdWx0IGNoYW5nZSBkaWRuJ3Qgd29yaywgdHJ5IGJvdHRvbSBvciBsZWZ0IGZpcnN0XG4gICAgZWxzZSBpZiAoIXBvc2l0aW9uICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZigndG9wJykgPiAtMSkgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdsZWZ0JykgPCAwKSkge1xuICAgICAgdGhpcy50ZW1wbGF0ZS5hZGRDbGFzcygnbGVmdCcpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICd0b3AnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignYm90dG9tJykgPiAtMSkgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdsZWZ0JykgPCAwKSkge1xuICAgICAgdGhpcy50ZW1wbGF0ZS5yZW1vdmVDbGFzcyhwb3NpdGlvbilcbiAgICAgICAgICAuYWRkQ2xhc3MoJ2xlZnQnKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAnbGVmdCcgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdyaWdodCcpID4gLTEpICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignYm90dG9tJykgPCAwKSkge1xuICAgICAgdGhpcy50ZW1wbGF0ZS5yZW1vdmVDbGFzcyhwb3NpdGlvbik7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2xlZnQnKSA+IC0xKSAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2JvdHRvbScpIDwgMCkpIHtcbiAgICAgIHRoaXMudGVtcGxhdGUucmVtb3ZlQ2xhc3MocG9zaXRpb24pO1xuICAgIH1cbiAgICAvL2lmIG5vdGhpbmcgY2xlYXJlZCwgc2V0IHRvIGJvdHRvbVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy50ZW1wbGF0ZS5yZW1vdmVDbGFzcyhwb3NpdGlvbik7XG4gICAgfVxuICAgIHRoaXMuY2xhc3NDaGFuZ2VkID0gdHJ1ZTtcbiAgICB0aGlzLmNvdW50ZXItLTtcbiAgfVxuXG4gIC8qKlxuICAgKiBzZXRzIHRoZSBwb3NpdGlvbiBjbGFzcyBvZiBhbiBlbGVtZW50IGFuZCByZWN1cnNpdmVseSBjYWxscyBpdHNlbGYgdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgcG9zc2libGUgcG9zaXRpb25zIHRvIGF0dGVtcHQsIG9yIHRoZSB0b29sdGlwIGVsZW1lbnQgaXMgbm8gbG9uZ2VyIGNvbGxpZGluZy5cbiAgICogaWYgdGhlIHRvb2x0aXAgaXMgbGFyZ2VyIHRoYW4gdGhlIHNjcmVlbiB3aWR0aCwgZGVmYXVsdCB0byBmdWxsIHdpZHRoIC0gYW55IHVzZXIgc2VsZWN0ZWQgbWFyZ2luXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0UG9zaXRpb24oKSB7XG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5fZ2V0UG9zaXRpb25DbGFzcyh0aGlzLnRlbXBsYXRlKSxcbiAgICAgICAgJHRpcERpbXMgPSBGb3VuZGF0aW9uLkJveC5HZXREaW1lbnNpb25zKHRoaXMudGVtcGxhdGUpLFxuICAgICAgICAkYW5jaG9yRGltcyA9IEZvdW5kYXRpb24uQm94LkdldERpbWVuc2lvbnModGhpcy4kZWxlbWVudCksXG4gICAgICAgIGRpcmVjdGlvbiA9IChwb3NpdGlvbiA9PT0gJ2xlZnQnID8gJ2xlZnQnIDogKChwb3NpdGlvbiA9PT0gJ3JpZ2h0JykgPyAnbGVmdCcgOiAndG9wJykpLFxuICAgICAgICBwYXJhbSA9IChkaXJlY3Rpb24gPT09ICd0b3AnKSA/ICdoZWlnaHQnIDogJ3dpZHRoJyxcbiAgICAgICAgb2Zmc2V0ID0gKHBhcmFtID09PSAnaGVpZ2h0JykgPyB0aGlzLm9wdGlvbnMudk9mZnNldCA6IHRoaXMub3B0aW9ucy5oT2Zmc2V0LFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoKCR0aXBEaW1zLndpZHRoID49ICR0aXBEaW1zLndpbmRvd0RpbXMud2lkdGgpIHx8ICghdGhpcy5jb3VudGVyICYmICFGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KHRoaXMudGVtcGxhdGUpKSkge1xuICAgICAgdGhpcy50ZW1wbGF0ZS5vZmZzZXQoRm91bmRhdGlvbi5Cb3guR2V0T2Zmc2V0cyh0aGlzLnRlbXBsYXRlLCB0aGlzLiRlbGVtZW50LCAnY2VudGVyIGJvdHRvbScsIHRoaXMub3B0aW9ucy52T2Zmc2V0LCB0aGlzLm9wdGlvbnMuaE9mZnNldCwgdHJ1ZSkpLmNzcyh7XG4gICAgICAvLyB0aGlzLiRlbGVtZW50Lm9mZnNldChGb3VuZGF0aW9uLkdldE9mZnNldHModGhpcy50ZW1wbGF0ZSwgdGhpcy4kZWxlbWVudCwgJ2NlbnRlciBib3R0b20nLCB0aGlzLm9wdGlvbnMudk9mZnNldCwgdGhpcy5vcHRpb25zLmhPZmZzZXQsIHRydWUpKS5jc3Moe1xuICAgICAgICAnd2lkdGgnOiAkYW5jaG9yRGltcy53aW5kb3dEaW1zLndpZHRoIC0gKHRoaXMub3B0aW9ucy5oT2Zmc2V0ICogMiksXG4gICAgICAgICdoZWlnaHQnOiAnYXV0bydcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMudGVtcGxhdGUub2Zmc2V0KEZvdW5kYXRpb24uQm94LkdldE9mZnNldHModGhpcy50ZW1wbGF0ZSwgdGhpcy4kZWxlbWVudCwnY2VudGVyICcgKyAocG9zaXRpb24gfHwgJ2JvdHRvbScpLCB0aGlzLm9wdGlvbnMudk9mZnNldCwgdGhpcy5vcHRpb25zLmhPZmZzZXQpKTtcblxuICAgIHdoaWxlKCFGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KHRoaXMudGVtcGxhdGUpICYmIHRoaXMuY291bnRlcikge1xuICAgICAgdGhpcy5fcmVwb3NpdGlvbihwb3NpdGlvbik7XG4gICAgICB0aGlzLl9zZXRQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiByZXZlYWxzIHRoZSB0b29sdGlwLCBhbmQgZmlyZXMgYW4gZXZlbnQgdG8gY2xvc2UgYW55IG90aGVyIG9wZW4gdG9vbHRpcHMgb24gdGhlIHBhZ2VcbiAgICogQGZpcmVzIFRvb2x0aXAjY2xvc2VtZVxuICAgKiBAZmlyZXMgVG9vbHRpcCNzaG93XG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgc2hvdygpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnNob3dPbiAhPT0gJ2FsbCcgJiYgIUZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KHRoaXMub3B0aW9ucy5zaG93T24pKSB7XG4gICAgICAvLyBjb25zb2xlLmVycm9yKCdUaGUgc2NyZWVuIGlzIHRvbyBzbWFsbCB0byBkaXNwbGF5IHRoaXMgdG9vbHRpcCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy50ZW1wbGF0ZS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJykuc2hvdygpO1xuICAgIHRoaXMuX3NldFBvc2l0aW9uKCk7XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB0byBjbG9zZSBhbGwgb3RoZXIgb3BlbiB0b29sdGlwcyBvbiB0aGUgcGFnZVxuICAgICAqIEBldmVudCBDbG9zZW1lI3Rvb2x0aXBcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Nsb3NlbWUuemYudG9vbHRpcCcsIHRoaXMudGVtcGxhdGUuYXR0cignaWQnKSk7XG5cblxuICAgIHRoaXMudGVtcGxhdGUuYXR0cih7XG4gICAgICAnZGF0YS1pcy1hY3RpdmUnOiB0cnVlLFxuICAgICAgJ2FyaWEtaGlkZGVuJzogZmFsc2VcbiAgICB9KTtcbiAgICBfdGhpcy5pc0FjdGl2ZSA9IHRydWU7XG4gICAgLy8gY29uc29sZS5sb2codGhpcy50ZW1wbGF0ZSk7XG4gICAgdGhpcy50ZW1wbGF0ZS5zdG9wKCkuaGlkZSgpLmNzcygndmlzaWJpbGl0eScsICcnKS5mYWRlSW4odGhpcy5vcHRpb25zLmZhZGVJbkR1cmF0aW9uLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vbWF5YmUgZG8gc3R1ZmY/XG4gICAgfSk7XG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgdG9vbHRpcCBpcyBzaG93blxuICAgICAqIEBldmVudCBUb29sdGlwI3Nob3dcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3Nob3cuemYudG9vbHRpcCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGVzIHRoZSBjdXJyZW50IHRvb2x0aXAsIGFuZCByZXNldHMgdGhlIHBvc2l0aW9uaW5nIGNsYXNzIGlmIGl0IHdhcyBjaGFuZ2VkIGR1ZSB0byBjb2xsaXNpb25cbiAgICogQGZpcmVzIFRvb2x0aXAjaGlkZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGhpZGUoKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ2hpZGluZycsIHRoaXMuJGVsZW1lbnQuZGF0YSgneWV0aS1ib3gnKSk7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLnRlbXBsYXRlLnN0b3AoKS5hdHRyKHtcbiAgICAgICdhcmlhLWhpZGRlbic6IHRydWUsXG4gICAgICAnZGF0YS1pcy1hY3RpdmUnOiBmYWxzZVxuICAgIH0pLmZhZGVPdXQodGhpcy5vcHRpb25zLmZhZGVPdXREdXJhdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgX3RoaXMuaXNDbGljayA9IGZhbHNlO1xuICAgICAgaWYgKF90aGlzLmNsYXNzQ2hhbmdlZCkge1xuICAgICAgICBfdGhpcy50ZW1wbGF0ZVxuICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhfdGhpcy5fZ2V0UG9zaXRpb25DbGFzcyhfdGhpcy50ZW1wbGF0ZSkpXG4gICAgICAgICAgICAgLmFkZENsYXNzKF90aGlzLm9wdGlvbnMucG9zaXRpb25DbGFzcyk7XG5cbiAgICAgICBfdGhpcy51c2VkUG9zaXRpb25zID0gW107XG4gICAgICAgX3RoaXMuY291bnRlciA9IDQ7XG4gICAgICAgX3RoaXMuY2xhc3NDaGFuZ2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gICAgLyoqXG4gICAgICogZmlyZXMgd2hlbiB0aGUgdG9vbHRpcCBpcyBoaWRkZW5cbiAgICAgKiBAZXZlbnQgVG9vbHRpcCNoaWRlXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdoaWRlLnpmLnRvb2x0aXAnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBhZGRzIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIHRvb2x0aXAgYW5kIGl0cyBhbmNob3JcbiAgICogVE9ETyBjb21iaW5lIHNvbWUgb2YgdGhlIGxpc3RlbmVycyBsaWtlIGZvY3VzIGFuZCBtb3VzZWVudGVyLCBldGMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyICR0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XG4gICAgdmFyIGlzRm9jdXMgPSBmYWxzZTtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLmRpc2FibGVIb3Zlcikge1xuXG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAub24oJ21vdXNlZW50ZXIuemYudG9vbHRpcCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKCFfdGhpcy5pc0FjdGl2ZSkge1xuICAgICAgICAgIF90aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMuc2hvdygpO1xuICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuaG92ZXJEZWxheSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNlbGVhdmUuemYudG9vbHRpcCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KF90aGlzLnRpbWVvdXQpO1xuICAgICAgICBpZiAoIWlzRm9jdXMgfHwgKCFfdGhpcy5pc0NsaWNrICYmIF90aGlzLm9wdGlvbnMuY2xpY2tPcGVuKSkge1xuICAgICAgICAgIF90aGlzLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbGlja09wZW4pIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNlZG93bi56Zi50b29sdGlwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICBpZiAoX3RoaXMuaXNDbGljaykge1xuICAgICAgICAgIF90aGlzLmhpZGUoKTtcbiAgICAgICAgICAvLyBfdGhpcy5pc0NsaWNrID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3RoaXMuaXNDbGljayA9IHRydWU7XG4gICAgICAgICAgaWYgKChfdGhpcy5vcHRpb25zLmRpc2FibGVIb3ZlciB8fCAhX3RoaXMuJGVsZW1lbnQuYXR0cigndGFiaW5kZXgnKSkgJiYgIV90aGlzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICBfdGhpcy5zaG93KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXNhYmxlRm9yVG91Y2gpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vbigndGFwLnpmLnRvb2x0aXAgdG91Y2hlbmQuemYudG9vbHRpcCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RoaXMuaXNBY3RpdmUgPyBfdGhpcy5oaWRlKCkgOiBfdGhpcy5zaG93KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50Lm9uKHtcbiAgICAgIC8vICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcyksXG4gICAgICAvLyAnY2xvc2UuemYudHJpZ2dlcic6IHRoaXMuaGlkZS5iaW5kKHRoaXMpXG4gICAgICAnY2xvc2UuemYudHJpZ2dlcic6IHRoaXMuaGlkZS5iaW5kKHRoaXMpXG4gICAgfSk7XG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAub24oJ2ZvY3VzLnpmLnRvb2x0aXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlzRm9jdXMgPSB0cnVlO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhfdGhpcy5pc0NsaWNrKTtcbiAgICAgICAgaWYgKF90aGlzLmlzQ2xpY2spIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gJCh3aW5kb3cpXG4gICAgICAgICAgX3RoaXMuc2hvdygpO1xuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAub24oJ2ZvY3Vzb3V0LnpmLnRvb2x0aXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlzRm9jdXMgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMuaXNDbGljayA9IGZhbHNlO1xuICAgICAgICBfdGhpcy5oaWRlKCk7XG4gICAgICB9KVxuXG4gICAgICAub24oJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKF90aGlzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgX3RoaXMuX3NldFBvc2l0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGFkZHMgYSB0b2dnbGUgbWV0aG9kLCBpbiBhZGRpdGlvbiB0byB0aGUgc3RhdGljIHNob3coKSAmIGhpZGUoKSBmdW5jdGlvbnNcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMuaXNBY3RpdmUpIHtcbiAgICAgIHRoaXMuaGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNob3coKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgdG9vbHRpcCwgcmVtb3ZlcyB0ZW1wbGF0ZSBlbGVtZW50IGZyb20gdGhlIHZpZXcuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3RpdGxlJywgdGhpcy50ZW1wbGF0ZS50ZXh0KCkpXG4gICAgICAgICAgICAgICAgIC5vZmYoJy56Zi50cmlnZ2VyIC56Zi50b290aXAnKVxuICAgICAgICAgICAgICAgIC8vICAucmVtb3ZlQ2xhc3MoJ2hhcy10aXAnKVxuICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignYXJpYS1kZXNjcmliZWRieScpXG4gICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXlldGktYm94JylcbiAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtdG9nZ2xlJylcbiAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtcmVzaXplJyk7XG5cbiAgICB0aGlzLnRlbXBsYXRlLnJlbW92ZSgpO1xuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cblRvb2x0aXAuZGVmYXVsdHMgPSB7XG4gIGRpc2FibGVGb3JUb3VjaDogZmFsc2UsXG4gIC8qKlxuICAgKiBUaW1lLCBpbiBtcywgYmVmb3JlIGEgdG9vbHRpcCBzaG91bGQgb3BlbiBvbiBob3Zlci5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAyMDBcbiAgICovXG4gIGhvdmVyRGVsYXk6IDIwMCxcbiAgLyoqXG4gICAqIFRpbWUsIGluIG1zLCBhIHRvb2x0aXAgc2hvdWxkIHRha2UgdG8gZmFkZSBpbnRvIHZpZXcuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgMTUwXG4gICAqL1xuICBmYWRlSW5EdXJhdGlvbjogMTUwLFxuICAvKipcbiAgICogVGltZSwgaW4gbXMsIGEgdG9vbHRpcCBzaG91bGQgdGFrZSB0byBmYWRlIG91dCBvZiB2aWV3LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDE1MFxuICAgKi9cbiAgZmFkZU91dER1cmF0aW9uOiAxNTAsXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBob3ZlciBldmVudHMgZnJvbSBvcGVuaW5nIHRoZSB0b29sdGlwIGlmIHNldCB0byB0cnVlXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGRpc2FibGVIb3ZlcjogZmFsc2UsXG4gIC8qKlxuICAgKiBPcHRpb25hbCBhZGR0aW9uYWwgY2xhc3NlcyB0byBhcHBseSB0byB0aGUgdG9vbHRpcCB0ZW1wbGF0ZSBvbiBpbml0LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdteS1jb29sLXRpcC1jbGFzcydcbiAgICovXG4gIHRlbXBsYXRlQ2xhc3NlczogJycsXG4gIC8qKlxuICAgKiBOb24tb3B0aW9uYWwgY2xhc3MgYWRkZWQgdG8gdG9vbHRpcCB0ZW1wbGF0ZXMuIEZvdW5kYXRpb24gZGVmYXVsdCBpcyAndG9vbHRpcCcuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ3Rvb2x0aXAnXG4gICAqL1xuICB0b29sdGlwQ2xhc3M6ICd0b29sdGlwJyxcbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIHRvb2x0aXAgYW5jaG9yIGVsZW1lbnQuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2hhcy10aXAnXG4gICAqL1xuICB0cmlnZ2VyQ2xhc3M6ICdoYXMtdGlwJyxcbiAgLyoqXG4gICAqIE1pbmltdW0gYnJlYWtwb2ludCBzaXplIGF0IHdoaWNoIHRvIG9wZW4gdGhlIHRvb2x0aXAuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ3NtYWxsJ1xuICAgKi9cbiAgc2hvd09uOiAnc21hbGwnLFxuICAvKipcbiAgICogQ3VzdG9tIHRlbXBsYXRlIHRvIGJlIHVzZWQgdG8gZ2VuZXJhdGUgbWFya3VwIGZvciB0b29sdGlwLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICcmbHQ7ZGl2IGNsYXNzPVwidG9vbHRpcFwiJmd0OyZsdDsvZGl2Jmd0OydcbiAgICovXG4gIHRlbXBsYXRlOiAnJyxcbiAgLyoqXG4gICAqIFRleHQgZGlzcGxheWVkIGluIHRoZSB0b29sdGlwIHRlbXBsYXRlIG9uIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ1NvbWUgY29vbCBzcGFjZSBmYWN0IGhlcmUuJ1xuICAgKi9cbiAgdGlwVGV4dDogJycsXG4gIHRvdWNoQ2xvc2VUZXh0OiAnVGFwIHRvIGNsb3NlLicsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHRvb2x0aXAgdG8gcmVtYWluIG9wZW4gaWYgdHJpZ2dlcmVkIHdpdGggYSBjbGljayBvciB0b3VjaCBldmVudC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBjbGlja09wZW46IHRydWUsXG4gIC8qKlxuICAgKiBBZGRpdGlvbmFsIHBvc2l0aW9uaW5nIGNsYXNzZXMsIHNldCBieSB0aGUgSlNcbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAndG9wJ1xuICAgKi9cbiAgcG9zaXRpb25DbGFzczogJycsXG4gIC8qKlxuICAgKiBEaXN0YW5jZSwgaW4gcGl4ZWxzLCB0aGUgdGVtcGxhdGUgc2hvdWxkIHB1c2ggYXdheSBmcm9tIHRoZSBhbmNob3Igb24gdGhlIFkgYXhpcy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxMFxuICAgKi9cbiAgdk9mZnNldDogMTAsXG4gIC8qKlxuICAgKiBEaXN0YW5jZSwgaW4gcGl4ZWxzLCB0aGUgdGVtcGxhdGUgc2hvdWxkIHB1c2ggYXdheSBmcm9tIHRoZSBhbmNob3Igb24gdGhlIFggYXhpcywgaWYgYWxpZ25lZCB0byBhIHNpZGUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgMTJcbiAgICovXG4gIGhPZmZzZXQ6IDEyXG59O1xuXG4vKipcbiAqIFRPRE8gdXRpbGl6ZSByZXNpemUgZXZlbnQgdHJpZ2dlclxuICovXG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihUb29sdGlwLCAnVG9vbHRpcCcpO1xuXG59KGpRdWVyeSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
