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
  RuleProvider.call(this, eventBus);
  this._ocbpmnConnectionIntent = ocbpmnConnectionIntent;
  this._eventBus = eventBus;
  this._commandStack = commandStack;
  this._elementRegistry = elementRegistry;
}

inherits(ocbpmnRules, RuleProvider);

ocbpmnRules.$inject = [ 'eventBus', 'ocbpmnConnectionIntent', 'commandStack', 'elementRegistry' ];


ocbpmnRules.prototype.init = function() {
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
    'commandStack.connection.create.postExecuted',
    'commandStack.connection.delete.preExecute',
    'commandStack.connection.delete.postExecuted',
    'commandStack.connection.reconnectStart.preExecute',
    'commandStack.connection.reconnectStart.postExecuted',
    'commandStack.connection.reconnectEnd.preExecute',
    'commandStack.connection.reconnectEnd.postExecuted'
  ], function(event) {
    console.log('OCBPMN RULES: Event received:', event.type, event);
  });
/*
  this._eventBus.on('commandStack.connection.create.postExecuted', function(event) {
    console.log('OCBPMN RULES: commandStack.connection.create.postExecuted', event);
    // Only clear intent if it's not a reconnection
    if (!event.context.reconnect) { //not set apparently, so always clearing intent
        console.log('  Clearing connection intent after creation... event.context.reconnect=FALSE');
      self._ocbpmnConnectionIntent.clearIntent();
    }
  });

  this._eventBus.on('commandStack.connection.delete.preExecute', function(event) {
    console.log('OCBPMN RULES: commandStack.connection.delete.preExecute', event);
    const connection = event.context.connection;

    // If this is an ocbpmn:connection, store its type before deletion
    if (connection.type === 'ocbpmn:connection' || connection.businessObject.type === 'ocbpmn:connection') {
      console.log('OCBPMN RULES: Storing original ocbpmn:connection type before deletion');
      // Store the type in the command stack context
      if (!self._commandStack.context) {
        self._commandStack.context = {};
      }
      self._commandStack.context.originalConnectionType = 'ocbpmn:connection';
      self._commandStack.context.originalConnectionId = connection.id;
      console.log('OCBPMN RULES: Stored connection details:', {
        id: connection.id,
        type: connection.type,
        businessObjectType: connection.businessObject.type
      });
    }
  });
*/
  this._eventBus.on('connect.cancel', function(event) {
    console.log('OCBPMN RULES: connect.cancel', event);
    self._ocbpmnConnectionIntent.clearIntent();
  });

  /*
  // connection.reconnectStart and connection.reconnectEnd not showing up in console, so commented out
  // Add handler for reconnection
  this._eventBus.on('connection.reconnectStart', function(event) {
    console.log("OCBPMN RULES: connection.reconnectStart called with event: ", event); //does not show up in console
    const connection = event.context.connection;
    if (connection.type === 'ocbpmn:connection') {
      self._ocbpmnConnectionIntent.setIntent('ocbpmn:connection');
      // Mark this as a reconnection operation
      event.context.reconnect = true;
    }
  });

  this._eventBus.on('connection.reconnectEnd', function(event) {
    console.log("OCBPMN RULES: connection.reconnectEnd called with event: ", event); //does not show up in console
    const connection = event.context.connection;
    if (connection.type === 'ocbpmn:connection') {
      self._ocbpmnConnectionIntent.setIntent('ocbpmn:connection');
      // Mark this as a reconnection operation
      event.context.reconnect = true;
    }
  });

   */

  /*
    // Add handler for connect cleanup to clear the intent
  // context.reconnect not set in connection.reconnectStart and connection.reconnectEnd, so commented out
  this._eventBus.on('connect.cleanup', function(event) {
    console.log('OCBPMN RULES: connect.cleanup', event);
    // Only clear intent if it's not a reconnection
    if (!event.context.reconnect) {
        console.log('  Clearing connection intent... event.context.reconnect=FALSE'); //shows up... flag set in connect.start and it never occurs
      self._ocbpmnConnectionIntent.clearIntent();
    }
  });

   */

  // Add handler for connect start to capture the original connection type // NOT CONNECTION??? Shows source??? //not needed?
  /*
  this._eventBus.on('connect.start', function(event) {
    console.log('OCBPMN RULES: connect.start', event);
    const element = event.context.start;
    if (element) {
      console.log('OCBPMN RULES: connect.start element details:', element);

      // If we're starting from an ocbpmn:connection, store its type in the command stack context
      if (element.type === 'ocbpmn:connection' || (element.businessObject && element.businessObject.type === 'ocbpmn:connection')) {
        console.log('OCBPMN RULES: Storing original ocbpmn:connection type in command stack');
        // Ensure command stack context exists
        if (!self._commandStack.context) {
          self._commandStack.context = {};
        }
        // Store the type in the command stack context
        self._commandStack.context.originalConnectionType = 'ocbpmn:connection';
      }
    }
  });

   */

  /*
  // Add handler for connection deletion to capture the original type
  this._eventBus.on('commandStack.connection.delete.preExecute', function(event) {
    console.log('OCBPMN RULES: commandStack.connection.delete.preExecute', event);
    const connection = event.context.connection;

    // If this is an ocbpmn:connection, store its type before deletion
    if (connection.type === 'ocbpmn:connection' || connection.businessObject.type === 'ocbpmn:connection') {
      console.log('OCBPMN RULES: Storing original ocbpmn:connection type before deletion');
      // Store the type in the command stack context
      if (!self._commandStack.context) {
        self._commandStack.context = {};
      }
      self._commandStack.context.originalConnectionType = 'ocbpmn:connection';
      self._commandStack.context.originalConnectionId = connection.id;
      console.log('OCBPMN RULES: Stored connection details:', connection, self._commandStack.context.originalConnectionType, self._commandStack.context.originalConnectionId); // correct connection
    }
  });

   */
  /*
  // Add handler for reconnection start to use the stored type
  this._eventBus.on('commandStack.connection.reconnect.preExecute', function(event) {
    console.log('OCBPMN RULES: commandStack.connection.reconnect.preExecute', event);
    const connection = event.context.connection;
    console.log('OCBPMN RULES: preExecute connection details:', {
      id: connection.id,
      type: connection.type,
      businessObjectType: connection.businessObject.type,
      source: connection.source ? connection.source.id : null,
      target: connection.target ? connection.target.id : null,
      storedType: self._commandStack.context ? self._commandStack.context.originalConnectionType : null,
      storedId: self._commandStack.context ? self._commandStack.context.originalConnectionId : null
    });

    // Use the stored type from command stack context
    if (self._commandStack.context && self._commandStack.context.originalConnectionType === 'ocbpmn:connection') {
      console.log('OCBPMN RULES: Using stored ocbpmn:connection type for reconnection');
      event.context.originalType = 'ocbpmn:connection';
    }
  });

   */

/*
  // Add handler for reconnection end to restore the type
  this._eventBus.on('commandStack.connection.reconnect.postExecuted', function(event) {
    console.log('OCBPMN RULES: commandStack.connection.reconnect.postExecuted', event);
    const connection = event.context.connection;
    const storedId = self._commandStack.context ? self._commandStack.context.originalConnectionId : null;
    console.log('OCBPMN RULES: postExecuted connection details:', {
      id: connection.id,
      type: connection.type,
      businessObjectType: connection.businessObject.type,
      originalType: event.context.originalType,
      storedType: self._commandStack.context ? self._commandStack.context.originalConnectionType : null,
      storedId: self._commandStack.context ? self._commandStack.context.originalConnectionId : null
    });
    console.log("   recnnected connection pre restoration:", connection, storedId);

    // If this was an ocbpmn:connection, restore its type
    if (event.context.originalType === 'ocbpmn:connection' ||
        (self._commandStack.context && self._commandStack.context.originalConnectionType === 'ocbpmn:connection')) {
      console.log('OCBPMN RULES: Restoring ocbpmn:connection type after reconnection');
      // Update both the visual element and business object types
      connection.type = 'ocbpmn:connection';
      connection.businessObject.type = 'ocbpmn:connection';
      connection.businessObject.id = storedId || connection.id; // Restore the original ID if available
      console.log('OCBPMN RULES: After restoration context and connection details:', event.context,{
        id: connection.id,
        type: connection.type,
        businessObjectType: connection.businessObject.type,
        source: connection.source ? connection.source.id : null,
        target: connection.target ? connection.target.id : null
      });
      // Force a redraw
      self._eventBus.fire('element.changed', { element: connection });
      console.log("  after restoration and redraw: connection:", connection); // has di with sequenceflow type etc... businessobject $type: bpmn:SequenceFlow. type: 'ocbpmn:connection' ???
      // Clear the stored type
      if (self._commandStack.context) {
        delete self._commandStack.context.originalConnectionType;
        delete self._commandStack.context.originalConnectionId;
      }
    }
  }); */
  /*

  // Add handler for connect end to clear the stored type if needed
  this._eventBus.on('connect.end', function(event) {
    console.log('OCBPMN RULES: connect.end', event);
    const element = event.context.start;
    if (element) {
      console.log('OCBPMN RULES: connect.end element details:', element); // element is the source of the connection
    }
    // Clear the stored type if we're not in a reconnection
    if (!event.context.reconnect && self._commandStack.context) {
      delete self._commandStack.context.originalConnectionType;
      delete self._commandStack.context.originalConnectionId;
    }
  });

   */



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
      console.log('OCBPMN RULES: baseCanConnect create', { intent, source: source.type, target: target.type });

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
            console.log('OCBPMN RULES: baseCanConnect Reconnecting ocbpmn:connection between source and target', source, target);
            self._ocbpmnConnectionIntent.setIntent('ocbpmn:connection');
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
    console.log('OCBPMN RULES: connection.create rule called', context);
    const source = context.source;
    const target = context.target;
    return baseCanConnect(source, target, context, 'create');
  });

  this.addRule('connection.reconnect', HIGH_PRIORITY, function(context) {
    console.log("OCBPMN RULES: connection.reconnect rule called in context:", context);
    const connection = context.connection;
    const source = context.source;
    const target = context.target;
    console.log("   connection details:", connection, "source:", source, "target:", target);
    return baseCanConnect(source, target, connection, 'reconnect');
  });

  this.addRule('connection.delete', HIGH_PRIORITY, function(context) {
    console.log("OCBPMN RULES: connection.delete rule called", context);
    const connection = context.connection;
    const intent = self._ocbpmnConnectionIntent.getIntent();

    // If this is an ocbpmn:connection or has ocbpmn:connection business object, prevent deletion
    if (connection.type === 'ocbpmn:connection' ||
        (connection.businessObject && connection.businessObject.type === 'ocbpmn:connection') ||
        intent === 'ocbpmn:connection') {
      console.log('OCBPMN RULES: Preventing deletion of ocbpmn:connection');
      return false;
    }

    // Allow deletion for other cases
    return true;
  });

  /* //delete.preExecute
  // Add handler for command stack deletion
  this._eventBus.on('commandStack.connection.delete.preExecute', function(event) {
    console.log('OCBPMN RULES: commandStack.connection.delete.preExecute', event);
    const connection = event.context.connection;
    const intent = self._ocbpmnConnectionIntent.getIntent();

    // If this is an ocbpmn:connection or has ocbpmn:connection business object, prevent deletion
    if (connection.type === 'ocbpmn:connection' ||
        (connection.businessObject && connection.businessObject.type === 'ocbpmn:connection') ||
        intent === 'ocbpmn:connection') {
      console.log('OCBPMN RULES: Preventing command stack deletion of ocbpmn:connection');
      event.preventDefault();
      return false;
    }
  });

   */

  /* //delete.executed
  // Add handler for command stack deletion executed
  this._eventBus.on('commandStack.connection.delete.executed', function(event) {
    console.log('OCBPMN RULES: commandStack.connection.delete.executed', event);
    const connection = event.context.connection;
    const intent = self._ocbpmnConnectionIntent.getIntent();

    // If this is an ocbpmn:connection or has ocbpmn:connection business object, prevent the updater from processing
    if (connection.type === 'ocbpmn:connection' ||
        (connection.businessObject && connection.businessObject.type === 'ocbpmn:connection') ||
        intent === 'ocbpmn:connection') {
      console.log('OCBPMN RULES: Preventing command stack deletion execution of ocbpmn:connection');
      event.preventDefault();
      return false;
    }
  });

   */

  /* old
  addRule connection.reconnectStart and connection.reconnectEnd not showing up in console, so commented out

  this.addRule('connection.reconnectStart', HIGH_PRIORITY, function(context) {
    console.log('OCBPMN RULES: connection.reconnectStart rule called', context); //does not show up in console
    const connection = context.connection;
    const source = context.hover || context.source;
    const target = connection.target;

    // If this is an ocbpmn:connection, ensure we preserve its type
    if (connection.type === 'ocbpmn:connection' || connection.businessObject.type === 'ocbpmn:connection') {
      console.log('OCBPMN RULES: Preserving ocbpmn:connection type during reconnect start');
      self._ocbpmnConnectionIntent.setIntent('ocbpmn:connection');
      return true;
    }

    return baseCanConnect(source, target, connection, 'reconnect');
  });

  this.addRule('connection.reconnectEnd', HIGH_PRIORITY, function(context) {
    console.log('OCBPMN RULES: connection.reconnectEnd rule called', context); //does not show up in console
    const connection = context.connection;
    const source = connection.source;
    const target = context.hover || context.target;

    // If this is an ocbpmn:connection, ensure we preserve its type
    if (connection.type === 'ocbpmn:connection' || connection.businessObject.type === 'ocbpmn:connection') {
      console.log('OCBPMN RULES: Preserving ocbpmn:connection type during reconnect end');
      self._ocbpmnConnectionIntent.setIntent('ocbpmn:connection');
      return true;
    }

    return baseCanConnect(source, target, connection, 'reconnect');
  });

   */

  /* old
  // Add handler for connection creation during reconnection
  this._eventBus.on('commandStack.connection.create.preExecute', function(event) {
    console.log('OCBPMN RULES: commandStack.connection.create.preExecute', event);
    const context = event.context;
    const connection = context.connection;
    console.log("  commandStack.connection.create-preExecute context, connection.type, connection.businessObject.type:", context, connection.type, connection.businessObject.type);
    //has 2 types ??? returns connection array, bpmn:SequenceFlow and undefined even though in connnection array it has businessObject.type ocbpmn:connection
    console.log("  connection.businessObject.type:", connection.businessObject.type);

    // Check if this is a reconnection by looking at the source
    if (connection.type === 'ocbpmn:connection' || connection.businessObject.type === 'ocbpmn:connection') {
      console.log('OCBPMN RULES: Detected reconnection from ocbpmn:connection'); //shows up only for creation. when reconnect it is already SequenceFlow
      // Store the original connection type
      context.originalType = 'ocbpmn:connection';
      // Prevent the creation of a new sequence flow
      event.preventDefault();
      console.log('OCBPMN RULES: Detected reconnection from ocbpmn:connection. Preventing creation of new sequence flow. In context:', context);
      return;
    }
  });

   */
  /*
old
  // Add handler for connection deletion during reconnection
  this._eventBus.on('commandStack.connection.delete.preExecute', function(event) {
    console.log('OCBPMN RULES: commandStack.connection.delete.preExecute', event);
    const connection = event.context.connection;

    // If this is an ocbpmn:connection, prevent its deletion
    if (connection.type === 'ocbpmn:connection' || connection.businessObject.type === 'ocbpmn:connection') {
      console.log('OCBPMN RULES: Preventing deletion of ocbpmn:connection during reconnection');
      event.preventDefault();
    }
  });

   */

  /* //connection.createpreExecute
  // Prevent sequence flow creation when reconnecting between BPMN tasks with existing ocbpmn:connection
  this._eventBus.on('commandStack.connection.create.preExecute', function(event) {
    console.log('OCBPMN RULES: commandStack.connection.create.preExecute rule called in context:', event.context);
    const context = event.context;
    const connection = context.connection;
    const source = context.source;
    const target = context.target;
    console.log("   connection.type:", connection.type, "source:", source, "target:", target);

    // If this is a sequence flow being created during reconnection
    if (connection.type === 'bpmn:SequenceFlow' &&
        source && target &&
        !isocbpmn(source) && !isocbpmn(target)) {

      // Check if there's an existing ocbpmn:connection between these elements
      const existingOcbpmnConnection = self._elementRegistry.find(e =>
        e.type === 'ocbpmn:connection' &&
        e.source && e.target &&
        e.source.id === source.id &&
        e.target.id === target.id
      );
      console.log("   existingOcbpmnConnection:", existingOcbpmnConnection);

      if (existingOcbpmnConnection) {
        const cancelable = event.cancelable; // Check if the event is cancelable = undefined??
        console.log('OCBPMN RULES: Preventing sequence flow creation between BPMN tasks with existing ocbpmn:connection');
        console.log("event cancelable?", cancelable, "event.preventDefault:", event.preventDefault);
        event.preventDefault();
        return false;
      }
    }
  });

   */

};
