import {
  assign
} from 'min-dash';

import inherits from 'inherits-browser';

import BpmnElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';
import {
  DEFAULT_LABEL_SIZE
} from 'bpmn-js/lib/util/LabelUtil';


/**
 * A ocbpmn factory that knows how to create BPMN _and_ ocbpmn elements.
 */
export default function ocbpmnElementFactory(bpmnFactory, moddle) {
  BpmnElementFactory.call(this, bpmnFactory, moddle);

  var self = this;

  /**
   * Create a diagram-js element with the given type (any of shape, connection, label).
   *
   * @param  {String} elementType
   * @param  {Object} attrs
   *
   * @return {djs.model.Base}
   */
  this.create = function(elementType, attrs) {
    var type = attrs.type;

    if (elementType === 'label') {
      return self._baseCreate(elementType, assign({ type: 'label' }, DEFAULT_LABEL_SIZE, attrs));
    }

    // add type to businessObject if ocbpmn
    if (/^ocbpmn:/.test(type)) {
      if (!attrs.businessObject) {
        attrs.businessObject = {
          type: type
        };

        if (attrs.id) {
          assign(attrs.businessObject, {
            id: attrs.id
          });
        }
      }

      // add width and height if shape
      if (!/:connection$/.test(type)) {
        assign(attrs, self._getocbpmnElementSize(type));
      }


      // we mimic the ModdleElement API to allow interoperability with
      // other components, i.e. the Modeler and Properties Panel

      if (!('$model' in attrs.businessObject)) {
        Object.defineProperty(attrs.businessObject, '$model', {
          value: moddle
        });
      }

      if (!('$instanceOf' in attrs.businessObject)) {

        // ensures we can use ModelUtil#is for type checks
        Object.defineProperty(attrs.businessObject, '$instanceOf', {
          value: function(type) {
            return this.type === type;
          }
        });
      }

      if (!('get' in attrs.businessObject)) {
        Object.defineProperty(attrs.businessObject, 'get', {
          value: function(key) {
            return this[key];
          }
        });
      }

      if (!('set' in attrs.businessObject)) {
        Object.defineProperty(attrs.businessObject, 'set', {
          value: function(key, value) {
            return this[key] = value;
          }
        });
      }

      // END minic ModdleElement API

      return self._baseCreate(elementType, attrs);
    }

    return this.createElement(elementType, attrs);
  };
}

inherits(ocbpmnElementFactory, BpmnElementFactory);

ocbpmnElementFactory.$inject = [
  'bpmnFactory',
  'moddle'
];


/**
 * Returns the default size of ocbpmn shapes.
 *
 * The following example shows an interface on how
 * to setup the ocbpmn shapes's dimensions.
 *
 * @example
 *
 * var shapes = {
 *   triangle: { width: 40, height: 40 },
 *   rectangle: { width: 100, height: 20 }
 * };
 *
 * return shapes[type];
 *
 *
 * @param {String} type
 *
 * @return {Dimensions} a {width, height} object representing the size of the element
 */
ocbpmnElementFactory.prototype._getocbpmnElementSize = function(type) {
  var shapes = {
    __default: { width: 100, height: 80 },
    'ocbpmn:triangle': { width: 40, height: 40 },
    'ocbpmn:circle': { width: 140, height: 140 },
    'ocbpmn:hexagon': { width: 26*1.5, height: 30*1.5 },
    'ocbpmn:join': { width: 34, height: 42 },
  };

  return shapes[type] || shapes.__default;
};
