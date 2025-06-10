/* eslint-disable */
import {
  reduce
} from 'min-dash';

import inherits from 'inherits-browser';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import {isAny} from "bpmn-js/lib/features/modeling/util/ModelingUtil";

var HIGH_PRIORITY = 1500;


function isocbpmn(element) {
  return element && /^ocbpmn:/.test(element.type);
}

/**
 * Specific rules for ocbpmn elements
 */
export default function ocbpmnRules(eventBus, ocbpmnConnectionIntent, commandStack, elementRegistry) {
  console.log('OCBPMN RULES: Initializing ocbpmnRules');
  RuleProvider.call(this, eventBus);
  this._ocbpmnConnectionIntent = ocbpmnConnectionIntent;
  this._eventBus = eventBus;
  this._commandStack = commandStack;
  this._elementRegistry = elementRegistry;
  console.log('OCBPMN RULES: ocbpmnRules initialized with eventBus:', eventBus);
}

inherits(ocbpmnRules, RuleProvider);

ocbpmnRules.$inject = [ 'eventBus', 'ocbpmnConnectionIntent', 'commandStack', 'elementRegistry' ];


ocbpmnRules.prototype.init = function() {
  console.log('OCBPMN RULES: init() called');
  var self = this;

  // Log all connection-related events for debugging
  this._eventBus.on([
    'connection.reconnect',
    'connection.create',
    'connection.delete',
    'connect.start',
    'connect.end',
    'connect.cancel',
    'connect.cleanup',
    'commandStack.connection.create.preExecute',
    'commandStack.connection.create.postExecuted'
  ], function(event) {
    console.log('OCBPMN RULES: Event received:', event.type, event);
  });

  this._eventBus.on('connect.cancel', function(event) {
    console.log('OCBPMN RULES: connect.cancel', event);
    self._ocbpmnConnectionIntent.clearIntent();
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
      //console.log('OCBPMN RULES: baseCanConnect create', { intent, source: source.type, target: target.type });

      if (intent === 'ocbpmn:connection') {
        //console.log('OCBPMN RULES: Handling ocbpmn:connection creation');

        if ((source.type === 'ocbpmn:startobject' || source.type === 'ocbpmn:intermediateobject' ||
                source.type === 'bpmn:Task' || source.type === 'bpmn:ExclusiveGateway' || source.type === 'bpmn:ParallelGateway'
                || source.type === 'bpmn:IntermediateThrowEvent') &&
            (target.type === 'ocbpmn:intermediateobject' || target.type === 'ocbpmn:endobject' ||
                target.type === 'bpmn:Task' || target.type === 'bpmn:ExclusiveGateway' || target.type === 'bpmn:ParallelGateway'
                || target.type === 'bpmn:IntermediateThrowEvent')) {
          console.log('OCBPMN RULES: baseCanConnect create', { intent, source: source.type, target: target.type });
          return { type: 'ocbpmn:connection' };
        }
        return false;
      }
      if (!isocbpmn(source) && !isocbpmn(target)) {
        console.log('OCBPMN RULES: baseCanConnect create - neither source nor target is ocbpmn. intent is:', intent);
        return undefined;
      }
      if (isocbpmn(source) || isocbpmn(target)) {
        console.log(("OCBPMN RULES: baseCanConnect create - either source or target is ocbpmn BUT intent is:", intent));
        return false;
      }
      return false;
    }
    else if (eventType === 'reconnect') {
      const connection = connectionOrContext;
      if (connection.type === 'ocbpmn:connection' || connection.businessObject.type === 'ocbpmn:connection') {
        //console.log('OCBPMN RULES: Handling ocbpmn:connection reconnection for connection', connection);
        if ((source.type === 'ocbpmn:startobject' || source.type === 'ocbpmn:intermediateobject' ||
                source.type === 'bpmn:Task' || source.type === 'bpmn:ExclusiveGateway' || source.type === 'bpmn:IntermediateThrowEvent') &&
            (target.type === 'ocbpmn:intermediateobject' || target.type === 'ocbpmn:endobject' ||
                target.type === 'bpmn:Task' || target.type === 'bpmn:ExclusiveGateway' || target.type === 'bpmn:IntermediateThrowEvent')) {
            self._ocbpmnConnectionIntent.setIntent('ocbpmn:connection');
            connection.originalType = 'ocbpmn:connection'; // Store the original type for reconnection
            console.log('OCBPMN RULES: baseCanConnect Reconnecting ocbpmn:connection',connection);
            console.log("   (baseCanConnect) intent:", self._ocbpmnConnectionIntent.getIntent());


          return { type: 'ocbpmn:connection' };
        }
        return false;
      }
      if (!isocbpmn(source) && !isocbpmn(target)) {
        console.log('OCBPMN RULES: baseCanConnect reconnect - neither source nor target is ocbpmn. intent is:', self._ocbpmnConnectionIntent.getIntent());
        return undefined;
      }
      if (isocbpmn(source) || isocbpmn(target)) {
        console.log("OCBPMN RULES: baseCanConnect reconnect - either source or target is ocbpmn BUT intent is:", self._ocbpmnConnectionIntent.getIntent());
        return false;
      }

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
    console.log('OCBPMN RULES: addRule connection.create rule called', context);
    const source = context.source;
    const target = context.target;
    return baseCanConnect(source, target, context, 'create');
  });

  // Add connection.delete rule with higher priority
  this.addRule('connection.delete', 2000, function(context) {
    console.log("OCBPMN RULES: addRule connection.delete rule called", context);

    const connection = context.connection;
    if (!connection) {
      console.log("OCBPMN RULES: No connection in context, allowing deletion");
      return true;
    }

    const intent = self._ocbpmnConnectionIntent.getIntent();
    const isOcbpmnConnection = connection.type === 'ocbpmn:connection' ||
        (connection.businessObject && connection.businessObject.type === 'ocbpmn:connection') ||
        intent === 'ocbpmn:connection';

    console.log("OCBPMN RULES: connection.delete check:", {
      isOcbpmnConnection,
      connectionType: connection.type,
      businessObjectType: connection.businessObject ? connection.businessObject.type : null,
      intent
    });

    // If this is an ocbpmn:connection or has ocbpmn:connection business object, prevent deletion
    if (isOcbpmnConnection) {
      console.log('OCBPMN RULES: Preventing deletion of ocbpmn:connection');
      // Store the connection in the command stack context to prevent deletion
      if (!self._commandStack.context) {
        self._commandStack.context = {};
      }
      self._commandStack.context.preventDeletion = true;
      return false;
    }

    // Allow deletion for other cases
    console.log('OCBPMN RULES: Allowing deletion of non-ocbpmn connection');
    return true;
  });


  this.addRule('connection.reconnect', HIGH_PRIORITY, function(context) {
    console.log("OCBPMN RULES: addRule connection.reconnect rule called in context:", context);
    const connection = context.connection;
    const source = context.source;
    const target = context.target;
    console.log("   connection details:", connection, "source:", source, "target:", target);
    return baseCanConnect(source, target, connection, 'reconnect');
  });

  this.addRule('connection.remove', HIGH_PRIORITY, function(context) {
    console.log("OCBPMN RULES: addRule connection.remove rule called in context:", context);
  });

  this.addRule("connection.updateWaypoints", HIGH_PRIORITY, function(context) {
    console.log("OCBPMN RULES: addRule connection.updateWaypoints rule called in context:", context);
  });

  this.addRule('shape.delete', HIGH_PRIORITY, function(context) {
    console.log("OCBPMN RULES: addRule shape.delete rule called in context:", context);
  });

  // Add direct connection.delete event handler
  this._eventBus.on('connection.delete', function(event) {
    console.log('OCBPMN RULES: connection.delete event handler called:', event);
    const connection = event.context.connection;
    if (connection && connection.type === 'ocbpmn:connection') {
      console.log('OCBPMN RULES: Preventing direct deletion of ocbpmn:connection');
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

  // Add handler for element registry updates
  this._eventBus.on('elementRegistry.update', function(event) {
    console.log('OCBPMN RULES: elementRegistry.update event:', event);
    const element = event.element;
    if (element && element.type === 'ocbpmn:connection') {
      console.log('OCBPMN RULES: Preventing element registry update for ocbpmn:connection');
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

};
