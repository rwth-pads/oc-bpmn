/* eslint-disable */
import {
  assign,
  reduce
} from 'min-dash';

import inherits from 'inherits-browser';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import {isAny} from "bpmn-js/lib/features/modeling/util/ModelingUtil";
import SelectedObjectTypeService from "../../SelectedObjectTypeService";

var HIGH_PRIORITY = 1500;
var HIGHEST_PRIORITY = 2000;  // Higher than BPMN's default priority


function isocbpmn(element) {
  return element && /^ocbpmn:/.test(element.type);
}

/**
 * Specific rules for ocbpmn elements
 */
export default function ocbpmnRules(eventBus, ocbpmnConnectionIntent, commandStack, elementRegistry, modeling, connect) {
  console.log('OCBPMN RULES: Initializing ocbpmnRules');
  RuleProvider.call(this, eventBus);
  this._ocbpmnConnectionIntent = ocbpmnConnectionIntent;
  this._eventBus = eventBus;
  this._commandStack = commandStack;
  this._elementRegistry = elementRegistry;
  this._modeling = modeling;
  this._connect = connect;
  console.log('OCBPMN RULES: ocbpmnRules initialized with eventBus:', eventBus);
}

inherits(ocbpmnRules, RuleProvider);

ocbpmnRules.$inject = [ 'eventBus', 'ocbpmnConnectionIntent', 'commandStack', 'elementRegistry', 'modeling', 'connect' ];


ocbpmnRules.prototype.init = function() {
  console.log('init this:', this);
  console.log('init this._elementRegistry:', this._elementRegistry);
  var elementRegistry = this._elementRegistry;
  var self = this;
  
  console.log('ocbpmnRules.init: this:', this, 'var elementRegistry:', elementRegistry);
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
    'commandStack.connection.reconnect.canExecute',
    'commandStack.connection.reconnect.preExecute',
    'commandStack.connection.reconnect.postExecuted'
  ], function(event) {
    console.log('OCBPMN RULES: Event received:', event.type, event);
  });

  this._eventBus.on('connect.cancel', function(event) {
    //console.log('OCBPMN RULES: connect.cancel', event);
    self._ocbpmnConnectionIntent.clearIntent();
  });
  
  this._eventBus.on('connect.end', function(event) {
    console.log('OCBPMN RULES: connect.end... clearining intent', event);
    self._ocbpmnConnectionIntent.clearIntent();
  });
  
  this._eventBus.on('commandStack.connection.reconnect.canExecute', function(event) {
    console.log("OCBPMN RULES: commandStack.connection.reconnect.canExecute event", event);
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
  function canConnect(source, target, connectionOrContext, eventType) {
    // TODO: handle stacking of ocbpmn connections of the same obj type
    
    if (eventType === 'reconnect') {
      // For reconnect, preserve the original connection type through the business object
      const connectionType = connectionOrContext.businessObject ? connectionOrContext.businessObject.type : connectionOrContext.type;
      console.log('OCBPMN RULES: canConnect reconnect - determined connection type:', connectionType);

      if (connectionType === 'ocbpmn:connection') {
        // Only check if the new source/target combination is valid
        if ((source.type === 'ocbpmn:startobject' || source.type === 'ocbpmn:intermediateobject' ||
                source.type === 'bpmn:Task' || source.type === 'bpmn:ExclusiveGateway' || source.type === 'bpmn:ParallelGateway'
                || source.type === 'bpmn:IntermediateThrowEvent') &&
            (target.type === 'ocbpmn:startobject' || target.type === 'ocbpmn:intermediateobject' || target.type === 'ocbpmn:endobject' ||
                target.type === 'bpmn:Task' || target.type === 'bpmn:ExclusiveGateway' || target.type === 'bpmn:ParallelGateway'
                || target.type === 'bpmn:IntermediateThrowEvent')) {
          // Return the original connection type
          console.log('OCBPMN RULES: canConnect reconnect - valid ocbpmn connection');
          return { type: 'ocbpmn:connection' };
        }
        return false;
      }
    }
    
    if (eventType === 'create') {
      const intent = self._ocbpmnConnectionIntent.getIntent();
      console.log('OCBPMN RULES: canConnect create', { intent, source: source.type, target: target.type });

      if (intent === 'ocbpmn:connection') {
        if ((source.type === 'ocbpmn:startobject' || source.type === 'ocbpmn:intermediateobject' ||
                source.type === 'bpmn:Task' || source.type === 'bpmn:ExclusiveGateway' || source.type === 'bpmn:ParallelGateway'
                || source.type === 'bpmn:IntermediateThrowEvent') &&
            (target.type === 'ocbpmn:startobject' || target.type === 'ocbpmn:intermediateobject' || target.type === 'ocbpmn:endobject' ||
                target.type === 'bpmn:Task' || target.type === 'bpmn:ExclusiveGateway' || target.type === 'bpmn:ParallelGateway'
                || target.type === 'bpmn:IntermediateThrowEvent')) {
          if (source.type === 'ocbpmn:startobject' && SelectedObjectTypeService.getSelected()){
            // If we start a new object flow, clear the selected object type
            SelectedObjectTypeService.clear();
          }
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
    return canConnect(source, target, context, 'create');
  });

  /*
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
  
   */
  
  this.addRule('connection.reconnect', HIGHEST_PRIORITY, function(context) {
    console.log("OCBPMN RULES: connection.reconnect rule called", context);
    console.log('connection.reconnect rule: elementRegistry:', elementRegistry);
    const connection = context.connection;
    const source = context.source;
    const target = context.target;
    
    if (!connection || (elementRegistry && !elementRegistry.get(connection.id))) {
      //connection was deleted, skip update
      return;
    }
    
    const canCon = canConnect(source, target, connection, 'reconnect');
    
    if (canCon) {
      
        // Save connection type intent (ocbpmn:connection) to the intent service
        self._ocbpmnConnectionIntent.setIntent('ocbpmn:connection');
        
        // Delete hints from reconnected connection (hints about parallel sequence flows)
        if (connection.businessObject.hints) {
          delete connection.businessObject.hints;
        }
        
        //self._ocbpmnConnectionIntent.setIntent('ocbpmn:reconnect');
        // Save the connection's object type/visuals
        if (connection.businessObject && connection.businessObject.name || connection.businessObject.customColors) {
          if (SelectedObjectTypeService.getSelected()) {
            SelectedObjectTypeService.clear();
          }
          SelectedObjectTypeService.setSelected({
            name: connection.businessObject.name,
            customColors: connection.businessObject.customColors,
            originalLabel: connection.businessObject.originalLabel,
            visualLabel: connection.businessObject.visualLabel
          });
        }
        return canCon; // Simply return the ocbpmn connection type if source or target is ocbpmn
      
    } else {
      console.log("OCBPMN RULES: canConnect returned false for reconnect, preventing reconnection");
      // If canConnect returns false, a BPMN connection is reconnected and we return undefined to allow default behavior
      self._ocbpmnConnectionIntent.clearIntent();
      return undefined;
    }
    
    /*

    if (connection.type === 'ocbpmn:connection' ||
        (connection.businessObject && connection.businessObject.type === 'ocbpmn:connection')) {
      console.log("OCBPMN RULES: Handling ocbpmn connection reconnection context", context);
      
      // Check if source is valid
      if (source && (source.type === 'ocbpmn:startobject' || source.type === 'ocbpmn:intermediateobject' ||
          source.type === 'bpmn:Task' || source.type === 'bpmn:ExclusiveGateway' || source.type === 'bpmn:ParallelGateway'
          || source.type === 'bpmn:IntermediateThrowEvent')) {
        //console.log("OCBPMN RULES: Valid source for reconnection", source);
        return { type: 'ocbpmn:connection' };
      }
      
      // Check if target is valid
      if (target && (target.type === 'ocbpmn:intermediateobject' || target.type === 'ocbpmn:endobject' ||
          target.type === 'bpmn:Task' || target.type === 'bpmn:ExclusiveGateway' || target.type === 'bpmn:ParallelGateway'
          || target.type === 'bpmn:IntermediateThrowEvent')) {
        console.log("OCBPMN RULES: Valid target for reconnection", target);
        return { type: 'ocbpmn:connection' };
      }
      
      // If we get here, neither source nor target is valid
      console.log("OCBPMN RULES: Invalid source/target for reconnection, preventing", {source, target});
      return false;
    }
    
     */
  });
  
  /*
  this.addRule('connection.reconnectEnd', HIGHEST_PRIORITY, function(context) {
    console.log("OCBPMN RULES: addRule connection.reconnectEnd rule called in context:", context);
    
    const connection = context.connection;
    
    // Check if this is an ocbpmn connection
    const isOcbpmnConnection = connection.type === 'ocbpmn:connection' ||
                             (connection.businessObject && connection.businessObject.type === 'ocbpmn:connection') ||
                             (context.originalType === 'ocbpmn:connection');
    
    if (isOcbpmnConnection) {
      // Force the connection type to be ocbpmn:connection
      connection.type = 'ocbpmn:connection';
      if (connection.businessObject) {
        connection.businessObject.type = 'ocbpmn:connection';
      }
      
      // Trigger a redraw of the connection
      self._eventBus.fire('element.changed', { element: connection });
      
      return {
        type: 'ocbpmn:connection',
        businessObject: connection.businessObject
      };
    }
    
    return undefined;
  });
  
   */
  
};

