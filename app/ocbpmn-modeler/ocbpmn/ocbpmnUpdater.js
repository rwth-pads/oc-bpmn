import inherits from 'inherits-browser';

import {
  pick,
  assign
} from 'min-dash';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';


/**
 * A handler responsible for updating the ocbpmn element's businessObject
 * once changes on the diagram happen.
 */
export default function ocbpmnUpdater(eventBus, modeling, bpmnjs, elementRegistry, canvas) {

  CommandInterceptor.call(this, eventBus);
  this._elementRegistry = elementRegistry;
  this._eventBus = eventBus;

  function updateocbpmnElement(e) {
    console.log("OCPMN UPDATER: updateocbpmnElement called", e);
    var context = e.context,
        shape = context.shape,
        businessObject = shape.businessObject;

    if (!isocbpmn(shape)) {
      return;
    }

    var parent = shape.parent;

    var ocbpmnElements = bpmnjs._ocbpmnElements;

    // make sure element is added / removed from bpmnjs.ocbpmnElements
    if (!parent) {
      collectionRemove(ocbpmnElements, businessObject);
    } else {
      collectionAdd(ocbpmnElements, businessObject);
    }

    // save ocbpmn element position
    assign(businessObject, pick(shape, [ 'x', 'y' ]));
  }

  // Helper function to update all related connections
  function updateRelatedConnections(connection) {
    const source = connection.source;
    const target = connection.target;

    if (!source || !target) return;

    const allConnections = elementRegistry.filter(e =>
      e.type === 'ocbpmn:connection' &&
      e.source && e.target &&
      e.source.id === source.id &&
      e.target.id === target.id
    ).sort((a, b) => (a.id || '').localeCompare(b.id || ''));

    if (allConnections.length > 1) {
      const Y_AXIS_STACK_OFFSET = 10;
      const baseWaypoints = allConnections[0].waypoints;

      // Store original labels if not already stored
      allConnections.forEach((conn, index) => {
        const connBusinessObject = conn.businessObject;
        if (!connBusinessObject.originalLabel && connBusinessObject.name) {
          connBusinessObject.originalLabel = connBusinessObject.name;
        }
      });

      allConnections.forEach((conn, index) => {
        const yOffset = index * Y_AXIS_STACK_OFFSET;
        const offsetWaypoints = baseWaypoints.map(wp => ({
          x: wp.x,
          y: wp.y + yOffset
        }));

        // Update both the connection element and its business object
        const connBusinessObject = conn.businessObject;
        conn.waypoints = offsetWaypoints;
        assign(connBusinessObject, {
          waypoints: offsetWaypoints
        });

        // Handle labels
        if (index === 0) {

          // Combine original labels for visualization
          const combinedLabel = allConnections
            .map(c => c.businessObject.originalLabel || '')
            .filter(name => name)
            .join('x');

          // Store the combined label separately from the original
          connBusinessObject.visualLabel = combinedLabel;
          // Keep the original label
          connBusinessObject.name = connBusinessObject.originalLabel;
        } else {

          // Keep original label but don't show it
          connBusinessObject.name = connBusinessObject.originalLabel;
          connBusinessObject.visualLabel = ' '; // Empty visual label for stacked connections
        }

        // Fire events to trigger immediate updates
        eventBus.fire('element.changed', { element: conn });
        eventBus.fire('element.labelChanged', { element: conn });
      });
    } else {

      // Single connection - restore original label if it exists
      const businessObject = connection.businessObject;
      if (businessObject.originalLabel) {
        businessObject.name = businessObject.originalLabel;
        businessObject.visualLabel = '';
      }
    }
  }

  this.updateocbpmnConnection = function(e) {
    console.log("OCBPMN UPDATER: updateocbpmnConnection called", e);
    var context = e.context,
        connection = context.connection,
        source = connection.source,
        target = connection.target,
        businessObject = connection.businessObject;

    var parent = connection.parent;

    var ocbpmnElements = bpmnjs._ocbpmnElements;

    // make sure element is added / removed from bpmnjs.ocbpmnElements
    if (!parent) {
      collectionRemove(ocbpmnElements, businessObject);
    } else {
      collectionAdd(ocbpmnElements, businessObject);
    }

    // Store original label when it's first set
    if (businessObject.name && !businessObject.originalLabel) {
      businessObject.originalLabel = businessObject.name;
    }

    // Update all related connections
    updateRelatedConnections(connection);

    if (source && target) {
      assign(businessObject, {
        source: source.id,
        target: target.id
      });
    }

    // update connection color if source is ocbpmn:startobject and has customColors
    if (source && source.type === 'ocbpmn:startobject' && source.businessObject.customColors) {
      assign(businessObject, {
        customColors: source.businessObject.customColors
      });

      // Fire event to trigger immediate color update
      eventBus.fire('element.changed', { element: connection });
    }
  };

  // Listen for connection creation
  eventBus.on('connection.create', function(e) {
    const connection = e.context.connection;
    if (isocbpmn(connection)) {
      updateRelatedConnections(connection);
    }
  });

  // Listen for connection updates
  eventBus.on('connection.updateWaypoints', function(e) {
    const connection = e.context.connection;
    if (isocbpmn(connection)) {
      updateRelatedConnections(connection);
    }
  });

  // Listen for connection reconnection
  eventBus.on([ 'connection.reconnectStart', 'connection.reconnectEnd' ], function(e) {
    const connection = e.context.connection;
    if (isocbpmn(connection)) {
      updateRelatedConnections(connection);
    }
  });

  // Listen for shape move (to update connections when source/target moves)
  eventBus.on('shape.move.end', function(e) {
    const shape = e.context.shape;
    if (shape) {
      // Find all connections connected to this shape
      const connectedConnections = elementRegistry.filter(e =>
        e.type === 'ocbpmn:connection' &&
        (e.source === shape || e.target === shape)
      );

      // Update each connection
      connectedConnections.forEach(conn => {
        updateRelatedConnections(conn);
      });
    }
  });

  this.executed([
    'shape.create',
    'shape.move',
    'shape.delete'
  ], ifocbpmnElement(updateocbpmnElement));

  this.reverted([
    'shape.create',
    'shape.move',
    'shape.delete'
  ], ifocbpmnElement(updateocbpmnElement));

  this.executed([
    'connection.create',
    'connection.reconnectStart',
    'connection.reconnectEnd',
    'connection.updateWaypoints',
    'connection.delete',
    'connection.layout',
    'connection.move'
  ], ifocbpmnElement(this.updateocbpmnConnection.bind(this)));

  this.reverted([
    'connection.create',
    'connection.reconnectStart',
    'connection.reconnectEnd',
    'connection.updateWaypoints',
    'connection.delete',
    'connection.layout',
    'connection.move'
  ], ifocbpmnElement(this.updateocbpmnConnection.bind(this)));


  /**
   * When morphing a Process into a Collaboration or vice-versa,
   * make sure that the existing ocbpmn elements get their parents updated.
   */
  function updateocbpmnElementsRoot(event) {
    var context = event.context,
        oldRoot = context.oldRoot,
        newRoot = context.newRoot,
        children = oldRoot.children;

    var ocbpmnChildren = children.filter(isocbpmn);

    if (ocbpmnChildren.length) {
      modeling.moveElements(ocbpmnChildren, { x: 0, y: 0 }, newRoot);
    }
  }

  this.postExecute('canvas.updateRoot', updateocbpmnElementsRoot);
}

inherits(ocbpmnUpdater, CommandInterceptor);

ocbpmnUpdater.$inject = [ 'eventBus', 'modeling', 'bpmnjs', 'elementRegistry', 'canvas' ];


// helpers ///////////////////////////////////

function copyWaypoints(connection) {
  return connection.waypoints.map(function(p) {
    return { x: p.x, y: p.y };
  });
}

function isocbpmn(element) {
  return element && /ocbpmn:/.test(element.type);
}

function ifocbpmnElement(fn) {
  return function(event) {
    var context = event.context,
        element = context.shape || context.connection;

    if (isocbpmn(element)) {
      fn(event);
    }
  };
}