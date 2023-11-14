import Modeler from 'bpmn-js/lib/Modeler';

import {
  assign,
  isArray
} from 'min-dash';

import inherits from 'inherits-browser';

import ocbpmnModule from './ocbpmn';


export default function ocbpmnModeler(options) {
  Modeler.call(this, options);

  this._ocbpmnElements = [];
}

inherits(ocbpmnModeler, Modeler);

ocbpmnModeler.prototype._modules = [].concat(
  ocbpmnModeler.prototype._modules,
  [
    ocbpmnModule
  ]
);

/**
 * Add a single ocbpmn element to the underlying diagram
 *
 * @param {Object} ocbpmnElement
 */
ocbpmnModeler.prototype._addocbpmnShape = function(ocbpmnElement) {

  this._ocbpmnElements.push(ocbpmnElement);

  var canvas = this.get('canvas'),
      elementFactory = this.get('elementFactory');

  var ocbpmnAttrs = assign({ businessObject: ocbpmnElement }, ocbpmnElement);

  var ocbpmnShape = elementFactory.create('shape', ocbpmnAttrs);

  return canvas.addShape(ocbpmnShape);

};

ocbpmnModeler.prototype._addocbpmnConnection = function(ocbpmnElement) {

  this._ocbpmnElements.push(ocbpmnElement);

  var canvas = this.get('canvas'),
      elementFactory = this.get('elementFactory'),
      elementRegistry = this.get('elementRegistry');

  var ocbpmnAttrs = assign({ businessObject: ocbpmnElement }, ocbpmnElement);

  var connection = elementFactory.create('connection', assign(ocbpmnAttrs, {
    source: elementRegistry.get(ocbpmnElement.source),
    target: elementRegistry.get(ocbpmnElement.target)
  }),
  elementRegistry.get(ocbpmnElement.source).parent);

  return canvas.addConnection(connection);

};

/**
 * Add a number of ocbpmn elements and connections to the underlying diagram.
 *
 * @param {Array<Object>} ocbpmnElements
 */
ocbpmnModeler.prototype.addocbpmnElements = function(ocbpmnElements) {

  if (!isArray(ocbpmnElements)) {
    throw new Error('argument must be an array');
  }

  var shapes = [],
      connections = [];

  ocbpmnElements.forEach(function(ocbpmnElement) {
    if (isocbpmnConnection(ocbpmnElement)) {
      connections.push(ocbpmnElement);
    } else {
      shapes.push(ocbpmnElement);
    }
  });

  // add shapes before connections so that connections
  // can already rely on the shapes being part of the diagram
  shapes.forEach(this._addocbpmnShape, this);

  connections.forEach(this._addocbpmnConnection, this);
};

/**
 * Get ocbpmn elements with their current status.
 *
 * @return {Array<Object>} ocbpmn elements on the diagram
 */
ocbpmnModeler.prototype.getocbpmnElements = function() {
  return this._ocbpmnElements;
};


function isocbpmnConnection(element) {
  return element.type === 'ocbpmn:connection';
}
