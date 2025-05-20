/* eslint-disable */
import {
  reduce
} from 'min-dash';

import inherits from 'inherits-browser';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

var HIGH_PRIORITY = 1500;


function isocbpmn(element) {
  return element && /^ocbpmn:/.test(element.type);
}

/**
 * Specific rules for ocbpmn elements
 */
export default function ocbpmnRules(eventBus, ocbpmnConnectionIntent, commandStack) {
  RuleProvider.call(this, eventBus);
  this._ocbpmnConnectionIntent = ocbpmnConnectionIntent;
  this._eventBus = eventBus;
}

inherits(ocbpmnRules, RuleProvider);

ocbpmnRules.$inject = [ 'eventBus', 'ocbpmnConnectionIntent', 'commandStack' ];


ocbpmnRules.prototype.init = function() {
  var self = this;

  this._eventBus.on('commandStack.connection.create.postExecuted', function(event) {
    console.log('OCBPMN RULES: commandStack.connection.create.postExecuted - Clearing Intent');
    self._ocbpmnConnectionIntent.clearIntent();
  });

  this._eventBus.on('connect.cancel', function(event) {
    console.log('OCBPMN RULES: connect.cancel - Clearing Intent');
    self._ocbpmnConnectionIntent.clearIntent();
  });
  this._eventBus.on('connect.cleanup', function(event) {
    console.log('OCBPMN RULES: connect.cleanup - Clearing Intent if not already cleared by postExecute');
    if (self._ocbpmnConnectionIntent.getIntent()) {
        // Decided to comment this out to rely primarily on postExecuted and cancel.
        // Clearing too aggressively might lead to the original problem.
    }
  });

  /**
   * Can shape be created on target container?
   */
  function canCreate(shape, target) {
    if (!isocbpmn(shape)) {
      return;
    }
    return is(target, 'bpmn:Process') || is(target, 'bpmn:Participant') || is(target, 'bpmn:Collaboration');
  }

  /**
   * Shared connection logic.
   * @param {djs.model.Shape} source
   * @param {djs.model.Shape} target
   * @param {Object} [connectionOrContext] - For 'connection.create', this is `context.hints`.
   *                                     For 'connection.reconnect', this is the `connection` object.
   * @param {string} [eventType] - 'create' or 'reconnect' to differentiate context of hintsOrConnection.
   */
  function baseCanConnect(source, target, connectionOrContext, eventType) {
    var intent = null;
    if (eventType === 'create') {
      intent = self._ocbpmnConnectionIntent.getIntent();

      console.log('OCBPMN RULES: Create Event - baseCanConnect');
      console.log('  Intent from Service:', intent);
      console.log('  Source Type:', source.type);
      console.log('  Target Type:', target.type);

      if (intent === 'ocbpmn:connection') {
        console.log('  Attempting OCBPMN Connection Create via Service Intent');
        if ((source.type === 'ocbpmn:startobject' || source.type === 'ocbpmn:intermediateobject' || source.type === 'bpmn:Task' || source.type === 'bpmn:Gateway') &&
            (target.type === 'ocbpmn:intermediateobject' || target.type === 'ocbpmn:endobject' || target.type === 'bpmn:Task' || target.type === 'bpmn:Gateway')) {
          return { type: 'ocbpmn:connection' };
        }
        return false;
      }
      if (!isocbpmn(source) && !isocbpmn(target)) {
        return undefined;
      }
      if (isocbpmn(source) || isocbpmn(target)) {
        return false;
      }
      return false;

    } else if (eventType === 'reconnect') {
      const connection = connectionOrContext;
      if (connection.type === 'ocbpmn:connection') {
        if ((source.type === 'ocbpmn:startobject' || source.type === 'ocbpmn:intermediateobject' || source.type === 'bpmn:Task' || source.type === 'bpmn:Gateway') &&
            (target.type === 'ocbpmn:startobject' || target.type === 'ocbpmn:intermediateobject' || target.type === 'ocbpmn:endobject' ||  target.type === 'bpmn:Task' || target.type === 'bpmn:Gateway')) {
          return { type: 'ocbpmn:connection' };
        }
        return false;
      }
      if (!isocbpmn(source) && !isocbpmn(target)) {
         return undefined;
      }
      if (isocbpmn(source) || isocbpmn(target)) {
        return false;
      }
      return false;
    }
    return false;
  }

  this.addRule('elements.move', HIGH_PRIORITY, function(context) {
    var target = context.target,
        shapes = context.shapes;
    var allowed = reduce(shapes, function(result, s) {
      if (isocbpmn(s)) {
        return true;
      }
      return canCreate(s, target);
    }, undefined);
    return allowed;
  });

  this.addRule('shape.create', HIGH_PRIORITY, function(context) {
    var target = context.target,
        shape = context.shape;
    return canCreate(shape, target);
  });

  // this.addRule('shape.resize', HIGH_PRIORITY, function(context) {
  // var shape = context.shape;

  // if (isocbpmn(shape)) {
  // Allow resize if the shape is a 'hexagon'
  // if (shape.type === 'ocbpmn:hexagon') {
  //   return true;
  // }

  // Cannot resize other ocbpmn elements
  // return false;
  // }
  // });

  this.addRule('connection.create', HIGH_PRIORITY, function(context) {
    var source = context.source,
        target = context.target;
    return baseCanConnect(source, target, context, 'create');
  });

  this.addRule('connection.reconnectStart', HIGH_PRIORITY, function(context) {
    var connection = context.connection,
        source = context.hover || context.source,
        target = connection.target;
    return baseCanConnect(source, target, connection, 'reconnect');
  });

  this.addRule('connection.reconnectEnd', HIGH_PRIORITY, function(context) {
    var connection = context.connection,
        source = connection.source,
        target = context.hover || context.target;
    return baseCanConnect(source, target, connection, 'reconnect');
  });

};
