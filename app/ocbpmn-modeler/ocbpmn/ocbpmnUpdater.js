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


  // Listen for connection creation
  eventBus.on('commandStack.connection.create.preExecute', function(e) {
    console.log("OCBPMN UPDATER: commandStack.connection.create.preExecute event fired", e);
    if (e.defaultPrevented) return;
    const connection = e.context.connection;
    if (isocbpmn(connection)) {
      updateRelatedConnections(connection, e);
    }
  });

  // Listen for connection deletion
  eventBus.on('commandStack.connection.delete.preExecute', function(e) {
    console.log("OCBPMN UPDATER: commandStack.connection.delete.preExecute event fired", e);
    if (e.defaultPrevented) return;
    const connection = e.context.connection;
    if (isocbpmn(connection)) {
      console.log("OCBPMN UPDATER: Processing deletion of ocbpmn:connection", connection);
    }
  });

  // Listen for connection updates
  eventBus.on('commandStack.connection.updateWaypoints.preExecute', function(e) {
    console.log("OCBPMN UPDATER: commandStack.connection.updateWaypoints.preExecute event fired", e);
    if (e.defaultPrevented) return;
    const connection = e.context.connection;
    if (isocbpmn(connection)) {
      updateRelatedConnections(connection, e);
    }
  });

  // Listen for connection reconnection
  eventBus.on('commandStack.connection.reconnect.preExecute', function(e) {
    console.log("OCBPMN UPDATER: commandStack.connection.reconnect.preExecute event fired", e);
    if (e.defaultPrevented) return;
    const connection = e.context.connection;
    if (isocbpmn(connection)) {
      updateRelatedConnections(connection, e);
    }
  });

  // Listen for shape move (to update connections when source/target moves)
  eventBus.on('commandStack.shape.move.preExecute', function(e) {
    console.log("OCBPMN UPDATER: commandStack.shape.move.preExecute event fired", e);
    if (e.defaultPrevented) return;
    const shape = e.context.shape;
    if (shape) {
      // Find all connections connected to this shape
      const connectedConnections = elementRegistry.filter(e =>
        e.type === 'ocbpmn:connection' &&
        (e.source === shape || e.target === shape)
      );

      // Update each connection
      connectedConnections.forEach(conn => {
        updateRelatedConnections(conn, e);
      });
    }
  });

  // Make updateRelatedConnections accessible
  this.updateRelatedConnections = updateRelatedConnections;

  function updateocbpmnElement(e) {
    console.log('OCPMN UPDATER: updateocbpmnElement called', e);
    var context = e.context,
        shape = context.shape,
        businessObject = shape && shape.businessObject;

    if (!shape || !businessObject || !isocbpmn(shape)) {
      console.log('OCBPMN UPDATER: Skipping updateocbpmnElement - invalid shape or businessObject');
      return;
    }

    var parent = shape.parent;

    var ocbpmnElements = bpmnjs._ocbpmnElements;

    // make sure element is added / removed from bpmnjs.ocbpmnElements
    if (!parent) {
        console.log('OCBPMN UPDATER: Removing ocbpmn element from bpmnjs.ocbpmnElements: case !parent');
      collectionRemove(ocbpmnElements, businessObject);
    } else {
        console.log('OCBPMN UPDATER: Adding ocbpmn element to bpmnjs.ocbpmnElements: case with parent');
      collectionAdd(ocbpmnElements, businessObject);
    }

    // save ocbpmn element position
    assign(businessObject, pick(shape, [ 'x', 'y' ]));
  }

  // Helper function to update all related connections
  function updateRelatedConnections(connection, event) {
    // Check if event was prevented
    if (event && event.defaultPrevented) {
      console.log("OCBPMN UPDATER: Event was prevented, skipping updateRelatedConnections");
      return;
    }

    console.log("OCBPMN UPDATER: updateRelatedConnections called for connection:", connection);
    //const source = connection.source;
    //const target = connection.target;
    //when reconnect.. delete event called... source and target null. needed for all deletion or can i edit this ?
    const source = connection.source || elementRegistry.get(connection.businessObject.source);
    const target = connection.target || elementRegistry.get(connection.businessObject.target);
    console.log("OCBPMN UPDATER target:", target, "source:", source);

    if (!source || !target) return;

    // Get all connections between the same source and target
    const allConnections = elementRegistry.filter(e =>
      e.type === 'ocbpmn:connection' &&
      e.source && e.target &&
      e.source.id === source.id &&
      e.target.id === target.id
    ).sort((a, b) => (a.id || '').localeCompare(b.id || ''));

    console.log("OCBPMN UPDATER all related arcs array allConnections:", allConnections);
    console.log("connection names:", allConnections.map(c => c.businessObject.name));

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

      // First, collect all valid names
      const validNames = allConnections
        .map(c => {
          const name = c.businessObject.name || '';
          console.log(`Connection ${c.id} name:`, name);
          return name;
        })
        .filter(name => name && name.trim() !== '');

      console.log("Valid names collected:", validNames);

      // Update all connections with new waypoints and labels
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
          // First connection gets combined label as visualLabel only
          const finalCombinedLabel = validNames.join('x');
          console.log("First connection combined label:", finalCombinedLabel);

          // Set visualLabel to combined label
          connBusinessObject.visualLabel = finalCombinedLabel;

          // Force a complete redraw of the connection
          eventBus.fire('element.changed', { element: conn });
          eventBus.fire('element.updateLabel', { element: conn });
          eventBus.fire('element.updateVisuals', { element: conn });
        } else {
          // For stacked connections, set visualLabel to empty string to prevent name from showing
          connBusinessObject.visualLabel = '';

          // Force a complete redraw of the connection
          eventBus.fire('element.changed', { element: conn });
          eventBus.fire('element.updateLabel', { element: conn });
          eventBus.fire('element.updateVisuals', { element: conn });
        }
        console.log("OCBPMN UPDATER: elment after redraw", conn);
      });
    }
    else if (allConnections.length === 1) {
      // Single connection - don't set visualLabel so name will be shown
      const businessObject = allConnections[0].businessObject;
      businessObject.visualLabel = undefined;

      // Force a complete redraw of the connection
      eventBus.fire('element.changed', { element: allConnections[0] });
      eventBus.fire('element.updateLabel', { element: allConnections[0] });
      eventBus.fire('element.updateVisuals', { element: allConnections[0] });
      console.log("OCBPMN UPDATER: elment after redraw", allConnections[0]);
    }
  }

  this.updateocbpmnConnection = function(e) {
    // Check if event was prevented
    if (e.defaultPrevented) {
      console.log("OCBPMN UPDATER: Event was prevented, skipping updateocbpmnConnection");
      return;
    }

    console.log('OCBPMN UPDATER: updateocbpmnConnection called', e);
    var context = e.context,
        connection = context.connection,
        source = connection.source,
        target = connection.target,
        businessObject = connection.businessObject;

    var parent = connection.parent;

    var ocbpmnElements = bpmnjs._ocbpmnElements;

    // make sure element is added / removed from bpmnjs.ocbpmnElements
    if (!parent) {
        console.log('OCBPMN UPDATER: Removing ocbpmn connection from bpmnjs.ocbpmnElements: case !parent');
      collectionRemove(ocbpmnElements, businessObject);
    } else {
        console.log('OCBPMN UPDATER: Adding ocbpmn connection to bpmnjs.ocbpmnElements: case with parent');
      collectionAdd(ocbpmnElements, businessObject);
    }

    // Store original label when it's first set
    if (businessObject.name && !businessObject.originalLabel) {
      businessObject.originalLabel = businessObject.name;
    }

    // Update all related connections
    //updateRelatedConnections(connection); //bo not accessible here, so moved to the end

    if (source && target) {
      assign(businessObject, {
        source: source.id,
        target: target.id
      });
    }

    // Update all related connections
    updateRelatedConnections(connection, e);

    // update connection color if source is ocbpmn:startobject and has customColors
    if (source && source.type === 'ocbpmn:startobject' && source.businessObject.customColors) {
      assign(businessObject, {
        customColors: source.businessObject.customColors
      });

      // Fire event to trigger immediate color update
      eventBus.fire('element.changed', { element: connection });
    }
  };

  this.executed([
    'shape.create',
    'shape.move',
    'shape.delete',
    'connection.create',
    'connection.delete',
    'connection.reconnect'
  ], function(e) {
    if (e.defaultPrevented) {
      console.log("OCBPMN UPDATER: Command event was prevented, skipping execution");
      return;
    }
    ifocbpmnElement(updateocbpmnElement)(e);
  });

  this.reverted([
    'shape.create',
    'shape.move',
    'shape.delete'
  ], ifocbpmnElement(updateocbpmnElement));

  this.executed([
    'connection.create',
    //'connection.reconnectStart',
    //'connection.reconnectEnd',
    'connection.reconnect',
    'connection.updateWaypoints',
    'connection.delete',
    'connection.layout',
    'connection.move'
  ], ifocbpmnElement(this.updateocbpmnConnection.bind(this)));

  this.executed(['connection.create', 'connection.delete'], function(e) {
    console.log("DEBUG: executed event für", e.command, e);
  });

  this.reverted([
    'connection.create',
    //'connection.reconnectStart',
    //'connection.reconnectEnd',
    'connection.reconnect',
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
    if (!event || !event.context) {
      console.log('OCBPMN UPDATER: Skipping ifocbpmnElement - invalid event or context');
      return;
    }

    var context = event.context,
        element = context.shape || context.connection;

    if (!element) {
      console.log('OCBPMN UPDATER: Skipping ifocbpmnElement - no shape or connection in context');
      return;
    }

    if (isocbpmn(element)) {
      fn(event);
    }
  };
}