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
  function canConnect(source, target) {

    // only judge about ocbpmn elements
    if (!isocbpmn(source) && !isocbpmn(target)) {
      return;
    }

    // allow connection from 'ocbpmn:hexagon' to 'ocbpmn:join' (and 'bpmn:event' for test purposes)
if (source.type === 'ocbpmn:hexagon') {
  if (target.type === 'ocbpmn:join' || target.type.startsWith('bpmn:') && target.type.endsWith('Event')) {
    return { type: 'bpmn:SequenceFlow' };
  } else {
    return false;
  }
}

// use return { type: 'ocbpmn:connection' }; for custom connection

// allow connection from 'ocbpmn:join' to 'bpmn:Task'
if (source.type === 'ocbpmn:join') {
  if (target.type === 'bpmn:Task') {
    return { type: 'bpmn:SequenceFlow' };
  } else {
    return false;
  }
}

// disallow all other connections
return false;
  }

  this.addRule('elements.move', HIGH_PRIORITY, function(context) {

    var target = context.target,
        shapes = context.shapes;

    var type;

    // do not allow mixed movements of ocbpmn / BPMN shapes
    // if any shape cannot be moved, the group cannot be moved, too
    var allowed = reduce(shapes, function(result, s) {
      if (type === undefined) {
        type = isocbpmn(s);
      }

      if (type !== isocbpmn(s) || result === false) {
        return false;
      }
      
      // allow moving custom shapes
    if (isocbpmn(s)) {
      return true;
    }

      return canCreate(s, target);
    }, undefined);

    // reject, if we have at least one
    // ocbpmn element that cannot be moved
    return allowed;
  });

  this.addRule('shape.create', HIGH_PRIORITY, function(context) {
    var target = context.target,
        shape = context.shape;

    return canCreate(shape, target);
  });

  this.addRule('shape.resize', HIGH_PRIORITY, function(context) {
    var shape = context.shape;
  
    if (isocbpmn(shape)) {
      // Allow resize if the shape is a 'join'
      if (shape.type === 'ocbpmn:join') {
        return true;
      }
  
      // Cannot resize other ocbpmn elements
      return false;
    }
  });

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
