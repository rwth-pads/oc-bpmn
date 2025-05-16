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
export default function ocbpmnRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(ocbpmnRules, RuleProvider);

ocbpmnRules.$inject = [ 'eventBus' ];


ocbpmnRules.prototype.init = function() {

  /**
   * Can shape be created on target container?
   */
  function canCreate(shape, target) {

    // only judge about ocbpmn elements
    if (!isocbpmn(shape)) {
      return;
    }

    // allow creation on processes
    return is(target, 'bpmn:Process') || is(target, 'bpmn:Participant') || is(target, 'bpmn:Collaboration');
  }

  /**
 * Can source and target be connected?
 */
function canConnect(source, target, connection) {
  // If a connection type is explicitly provided (from context pad), use that
  // if (connection && connection.type) {
   // return { type: connection.type };
  // }

    // connection type provided by context pad
    if (connection && connection.type) {
      return { type: connection.type };
    }

    // For ocbpmn:connection icon in context pad
    if (source.type === 'ocbpmn:oval' || source.type === 'bpmn:Task') {
      if (target.type === 'ocbpmn:oval' || target.type.startsWith('bpmn:') && target.type.endsWith('Event') || target.type === 'bpmn:Task') {
        return { type: 'ocbpmn:connection' };
      }
    }

    // For regular BPMN connections, let BPMN rules handle it
    if (!isocbpmn(source) && !isocbpmn(target)) {
      return;
    }

  // allow connection from 'ocbpmn:join' to 'bpmn:Task', 'ocbpmn:hexagon', or 'bpmn:Event'
  if (source.type === 'ocbpmn:join') {
    if (target.type === 'bpmn:Task' || target.type === 'ocbpmn:hexagon' || target.type.startsWith('bpmn:')
        && target.type.endsWith('Event')) {
     return { type: 'bpmn:SequenceFlow' };
    }
  }

  // allow connection from 'bpmn:Event' to 'ocbpmn:join'
  if (source.type.startsWith('bpmn:') && source.type.endsWith('Event')) {
    if (target.type === 'ocbpmn:join') {
      return { type: 'bpmn:SequenceFlow' };
    }
  }

  // disallow all other connections
  return false;
}

  this.addRule('elements.move', HIGH_PRIORITY, function(context) {
    var target = context.target,
        shapes = context.shapes;

    var allowed = reduce(shapes, function(result, s) {
      // allow moving custom shapes
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

    return canConnect(source, target);
  });



  this.addRule('connection.reconnectStart', HIGH_PRIORITY, function(context) {
    var connection = context.connection,
        source = context.hover || context.source,
        target = connection.target;

    return canConnect(source, target, connection);
  });

  this.addRule('connection.reconnectEnd', HIGH_PRIORITY, function(context) {
    var connection = context.connection,
        source = connection.source,
        target = context.hover || context.target;

    return canConnect(source, target, connection);
  });

};
