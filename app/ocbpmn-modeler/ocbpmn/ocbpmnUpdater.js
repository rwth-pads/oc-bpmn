import inherits from 'inherits-browser';

import {
  pick,
  assign, forEach
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
      updateStackedConnections(connection, e);
    }
  });

  // Listen for connection deletion
  eventBus.on('commandStack.connection.delete.preExecute', function(e) {
    console.log("OCBPMN UPDATER: commandStack.connection.delete.preExecute event fired", e);
    const connection = e.context.connection;
    if (isocbpmn(connection)) {
      console.log("  storing originalType in context for ocbpmn connection:", connection);
      e.context.originalType = 'ocbpmn:connection';
    }
  });

  // Listen for connection updates
  eventBus.on('commandStack.connection.updateWaypoints.preExecute', function(e) {
    console.log("OCBPMN UPDATER: commandStack.connection.updateWaypoints.preExecute event fired", e);
    if (e.defaultPrevented) return;
    const connection = e.context.connection;
    if (isocbpmn(connection)) {
      updateStackedConnections(connection, e);
    }
  });

  // Listen for connection reconnection
  eventBus.on('commandStack.connection.reconnect.preExecute', function(e) {
    console.log("OCBPMN UPDATER: commandStack.connection.reconnect.preExecute event fired", e);
    if (e.defaultPrevented) return;
    const connection = e.context.connection;
    console.log("OCBPMN UPDATER: connection being reconnected:", connection);

    // Store the original connection type in the context if it's an ocbpmn connection
    if (isocbpmn(connection)) {
      e.context.originalType = 'ocbpmn:connection';
      console.log("  storing originalType in context:", e.context);
      updateStackedConnections(connection, e);
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
        updateStackedConnections(conn, e);
      });
    }
  });

  // Make updateStackedConnections accessible
  this.updateStackedConnections = updateStackedConnections;

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
        //console.log('OCBPMN UPDATER: Removing ocbpmn element from bpmnjs.ocbpmnElements: case !parent');
      collectionRemove(ocbpmnElements, businessObject);
    } else {
        //console.log('OCBPMN UPDATER: Adding ocbpmn element to bpmnjs.ocbpmnElements: case with parent');
      collectionAdd(ocbpmnElements, businessObject);
    }

    // save ocbpmn element position
    assign(businessObject, pick(shape, [ 'x', 'y' ]));
    
    if (businessObject.type === 'ocbpmn:endobject'){
    
    }
  }

  // Helper function to update all connections with same source and target
  function updateStackedConnections(connection, event) {
    // Check if event was prevented
    if (event && event.defaultPrevented) {
      console.log("OCBPMN UPDATER: Event was prevented, skipping updateStackedConnections");
      return;
    }

    console.log("OCBPMN UPDATER: updateStackedConnections called for connection:", connection);
    //const source = connection.source;
    //const target = connection.target;
    //when reconnect.. delete event called... source and target null. needed for all deletion or can i edit this ?
    const source = connection.source || elementRegistry.get(connection.businessObject.source);
    const target = connection.target || elementRegistry.get(connection.businessObject.target);
    //console.log("OCBPMN UPDATER target:", target, "source:", source);

    if (!source || !target) return;

    // Get all connections between the same source and target
    const allConnections = elementRegistry.filter(e =>
      e.type === 'ocbpmn:connection' &&
      e.source && e.target &&
      e.source.id === source.id &&
      e.target.id === target.id
    ).sort((a, b) => (a.id || '').localeCompare(b.id || ''));

    console.log("OCBPMN UPDATER all related arcs array allConnections:", allConnections);
    //console.log("connection names:", allConnections.map(c => c.businessObject.name));

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

      //console.log("Valid names collected:", validNames);

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
      // Single connection - don't set visualLabel so name will be shown... unless it's a start/endobject connection then we want to hide the name
      if (allConnections[0].target.type !== 'ocbpmn:endobject' && allConnections[0].source.type !== 'ocbpmn:startobject') {
        const businessObject = allConnections[0].businessObject;
        businessObject.visualLabel = undefined;
        
        // Force a complete redraw of the connection
        eventBus.fire('element.changed', {element: allConnections[0]});
        eventBus.fire('element.updateLabel', {element: allConnections[0]});
        eventBus.fire('element.updateVisuals', {element: allConnections[0]});
        console.log("OCBPMN UPDATER: elment after redraw", allConnections[0]);
      }
    }
  }
  
  // Update related connections colors based on the source connection
  function updateRelatedConnections(connection, event) {
    console.log("OCBPMN UPDATER: updateRelatedConnections called for event:", event, "connection:", connection);
    // All previous connections on the same path (connection.source is the target of the previous connections)
    const allPrevConnections = elementRegistry.filter(e =>
        e.type === 'ocbpmn:connection' &&
        e.source && e.target &&
        e.target?.id === connection.source?.id
        );
    console.log("allPrevConnections:", allPrevConnections, "of connection", connection);
    
    // Update new connections (without a set name) with customColors of startobject or related previous connections
    if (!connection.businessObject.name) {
      // If multiple previous ocbpmn connections exist, the last one will set the color (good? idk)
      allPrevConnections.forEach(conn => {
        if (conn.businessObject.customColors) {
          console.log("OCBPMN UPDATER: Updating connection color for:", conn.id);
          // Update the connection's businessObject with the customColors from the source
          assign(connection.businessObject, {
            customColors: conn.businessObject.customColors
          });
          if (connection.target.type === 'ocbpmn:endobject') {
            assign(connection.target.businessObject, {
              customColors: conn.businessObject.customColors
            });
          }
          
          // Fire event to trigger immediate color update
          eventBus.fire('element.changed', {element: connection});
        }
        if (conn.source.type === 'ocbpmn:startobject' && conn.source.businessObject.name) {
          // Update the connection's businessObject with the name from the source
          assign(connection.businessObject, {
            name: conn.source.businessObject.name
          });
          
          // Fire event to trigger immediate label update
          eventBus.fire('element.changed', {element: connection});
        } else if (conn.businessObject.name) {
          // If the source is not a startobject, use the previous connection's name for intermediate connections
          assign(connection.businessObject, {
            name: conn.businessObject.name
          });
          console.log("OCBPMN UPDATER: ENDARC Updating connection name for:", connection, "with target.type:", connection.target.type);
          if (connection.target.type === 'ocbpmn:endobject') {
            assign(connection.businessObject, {
              visualLabel: ""
            });
            assign(connection.target.businessObject, {
              name: conn.businessObject.name
            });
            eventBus.fire('element.changed', {element: connection.target});
            console.log("OCBPMN UPDATER: ENDARC Setting visualLabel to empty string for endobject connection:", connection);
          }
          
          // Fire event to trigger immediate label update
          eventBus.fire('element.changed', {element: connection});
        }
      });
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
        //originalType = context.originalType;

    var parent = connection.parent;

    var ocbpmnElements = bpmnjs._ocbpmnElements;

    // make sure element is added / removed from bpmnjs.ocbpmnElements unless originalType is 'ocbpmn:connection'
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
    //updateStackedConnections(connection); //bo not accessible here, so moved to the end

    if (source && target) {
      assign(businessObject, {
        source: source.id,
        target: target.id
      });
    }

    // Update all related connections
    updateRelatedConnections(connection, e);
    updateStackedConnections(connection, e);

    // update connection color if source is ocbpmn:startobject and has customColors
    if (source && source.type === 'ocbpmn:startobject' && source.businessObject.customColors) {
      assign(businessObject, {
        customColors: source.businessObject.customColors
      });

      // Fire event to trigger immediate color update
      eventBus.fire('element.changed', { element: connection });
    }
    // update endobject color if target is ocbpmn:endobject and incoming connection has customColors
    if (target && target.type === 'ocbpmn:endobject' && connection.businessObject.customColors) {
      assign(businessObject, {
        customColors: target.businessObject.customColors
      });
      
      // Fire event to trigger immediate color update
      eventBus.fire('element.changed', { element: target });
    }
    
    console.log("CONNLOG: connection:", connection, "source:", source, "target:", target);
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
    'connection.reconnect',
    'connection.updateWaypoints',
    'connection.delete',
    'connection.layout',
    'connection.move'
  ], ifocbpmnElement(this.updateocbpmnConnection.bind(this)));

  this.reverted([
    'connection.create',
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