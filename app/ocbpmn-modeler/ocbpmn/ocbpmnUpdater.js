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

import SelectedObjectTypeService from '../../SelectedObjectTypeService';

const COLOR_OCBPMN_DEFAULTSTROKE = '#0048FF'; // Default stroke color for ocbpmn connections
const COLOR_OCBPMN_DEFAULT = {
  fill: '#6691ff',
  stroke: '#0048ff'
};

/**
 * A handler responsible for updating the ocbpmn element's businessObject
 * once changes on the diagram happen.
 */
export default function ocbpmnUpdater(eventBus, modeling, bpmnjs, elementRegistry, canvas, layouting) {

  CommandInterceptor.call(this, eventBus);
  this._elementRegistry = elementRegistry;
  this._eventBus = eventBus;

  // Listen for connection creation
  eventBus.on('commandStack.connection.create.preExecute', function(e) {
    console.log('OCBPMN UPDATER: commandStack.connection.create.preExecute event fired', e);
    if (e.defaultPrevented) return;
    const connection = e.context.connection;

    // if (isocbpmn(connection)) {
    // updateStackedConnections(connection, e);
    // }
  });

  /*
  // Listen for connection deletion
  eventBus.on('commandStack.connection.delete.preExecute', function(e) {
    console.log("OCBPMN UPDATER: commandStack.connection.delete.preExecute event fired", e);
    const connection = e.context.connection;
    if (isocbpmn(connection)) {
      console.log("  storing originalType in context for ocbpmn connection:", connection);
      e.context.originalType = 'ocbpmn:connection';
    }
  });
*/
  // Listen for connection updates
  eventBus.on('commandStack.connection.updateWaypoints.preExecute', function(e) {
    console.log('OCBPMN UPDATER: commandStack.connection.updateWaypoints.preExecute event fired', e);
    if (e.defaultPrevented) return;
    const connection = e.context.connection;
    if (isocbpmn(connection)) {
      updateStackedConnections(connection, e);
    }
  });
  
  eventBus.on('shape.create', function(e) {
    const shape = e.element;
    const shapeType = shape.type || shape.businessObject.type;
    
    if (isocbpmn(shape) && shapeType === 'ocbpmn:startobject') {
      SelectedObjectTypeService.clear();
      console.log("OCBPMN UPDATER shape.create selected object type cleared after creation of a new start object", SelectedObjectTypeService.getSelected());
    }
  });

  eventBus.on('shape.changed', function(e) {
    console.log('OCBPMN UPDATER: shape.changed event fired', e);
    const shape = e.element;
    const shapeBusinessObject = shape.businessObject;
    const shapeName = shapeBusinessObject.name;

    // Update shape when ocbpmn object named
    if (isocbpmn(shape) && shapeName) {
      updateocbpmnElement(e);
    }

    if (isocbpmn(shape) && shape.type === 'ocbpmn:startobject') {
      SelectedObjectTypeService.clear();
      console.log("OCBPMN UPDATER shape.create selected object type cleared after creation of a new start object", SelectedObjectTypeService.getSelected());

    }
  });

  eventBus.on('commandStack.connection.delete.postExecute', function(e) {
    console.log('OCBPMN UPDATER: connection.delete.postExe event fired', e);
    const connection = e.context.connection;
    if (isocbpmn(connection) && connection.type === 'ocbpmn:connection') {
      const source = connection.businessObject.source;
      const target = connection.businessObject.target;
      console.log("updater: isocbpmn and source and target", source, target);
      if (source && target) {
        const stackedCon = elementRegistry.filter(con =>
          con.type === 'ocbpmn:connection' && con.source.id === source && con.target.id === target
        );
        console.log("stackedCon:", stackedCon);
        if (stackedCon && stackedCon.length > 0) {
          console.log("ocbpmn updater element is ocbpmn at delete");
          updateStackedConnections(stackedCon[0]);
        }
      }
    }
  });

  // Listen for connection reconnection
  eventBus.on('commandStack.connection.reconnect.preExecute', function(e) {
    console.log('OCBPMN UPDATER: commandStack.connection.reconnect.preExecute event fired', e);
    if (e.defaultPrevented) return;
    const connection = e.context.connection;
    console.log('OCBPMN UPDATER: connection being reconnected:', connection);

    // Store the original connection type in the context if it's an ocbpmn connection
    if (isocbpmn(connection)) {
      e.context.originalType = 'ocbpmn:connection';
      console.log('  storing originalType in context:', e.context);
      updateStackedConnections(connection, e);
    }
  });


  // Listen for shape move (to update connections when source/target moves)
  eventBus.on('commandStack.shape.move.postExecute', function(e) {
    console.log('OCBPMN UPDATER: commandStack.shape.move.postExecute event fired', e);
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

  /*
  eventBus.on('element.changed', function(e) {
    const element = e.element;

    if (isocbpmn(element) && element.type === 'ocbpmn:startobject') {
      console.log("OCBPMN UPDATER: element.changed event fired for startobject", e);
      const sourceName = element.businessObject.name;
      if (sourceName) {
        // Find all related connection from object flow path (have the same name or the target is an endobject with the same name)
        const sourceColors = element.businessObject.customColors || COLOR_OCBPMN_DEFAULT;
        console.log("OCBPMN UPDATER: sourceName:", sourceName, "sourceColors:", sourceColors);
        const relatedConnections = elementRegistry.filter(e =>
          e.type === 'ocbpmn:connection' &&
          ((e.source && e.source === element) ||
            (e.businessObject && e.businessObject.name === sourceName) ||
            (e.target && e.target.type === 'ocbpmn:endobject' && e.target.businessObject && e.target.businessObject.name === sourceName) ||
            (e.businessObject && e.businessObject.customColors === sourceColors) ||
            (e.businessObject && e.businessObject.name && e.businessObject.name.startsWith(sourceName + ' '))
          )
        );
        console.log("OCBPMN UPDATER: relatedConnections found:", relatedConnections);
        relatedConnections.forEach(conn => {
          assign(conn.businessObject, {
            customColors: sourceColors
          });
          updateStackedConnections(conn);
        });
      }
    }
  });

   */

  // Make updateStackedConnections accessible
  this.updateStackedConnections = updateStackedConnections;

  function updateocbpmnElement(e) {
    console.log('OCPMN UPDATER: updateocbpmnElement called', e);
    var shape = (e.context && e.context.shape) || e.element,
        businessObject = shape && shape.businessObject;

    console.log('OCBPMN UPDATER: updateocbpmnElement: shape:', shape, ' and businessObject:', businessObject);

    if (!shape || !businessObject || !isocbpmn(shape)) {

      // console.log('OCBPMN UPDATER: Skipping updateocbpmnElement - invalid shape or businessObject');
      return;
    }

    var parent = shape.parent;

    var ocbpmnElements = bpmnjs._ocbpmnElements;

    // make sure element is added / removed from bpmnjs.ocbpmnElements
    if (!parent) {

      // console.log('OCBPMN UPDATER: Removing ocbpmn element from bpmnjs.ocbpmnElements: case !parent');
      collectionRemove(ocbpmnElements, businessObject);
    } else {

      // console.log('OCBPMN UPDATER: Adding ocbpmn element to bpmnjs.ocbpmnElements: case with parent');
      collectionAdd(ocbpmnElements, businessObject);
    }

    // Store original label when it's first set
    if (businessObject.name && !businessObject.originalLabel) {
      const ocbpmnObjects = elementRegistry.filter(e =>
        e.type === 'ocbpmn:startobject' && e.businessObject.originalLabel &&
        e.businessObject.originalLabel === businessObject.name
      );

      if (ocbpmnObjects.length > 0 && shape.type === 'ocbpmn:startobject') {
        alert("Element with name '" + businessObject.name + "' already exists in the diagram. Please use a different name.");
      } else {
        assign(businessObject, {
          originalLabel: businessObject.name
        });

        // console.log("OCBPMN UPDATER: Storing original label for element:", businessObject.originalLabel);
      }
    }

    // Assign default colors if customColors are not set
    // if (!businessObject.customColors){
    // assign(businessObject, {
    // customColors: COLOR_OCBPMN_DEFAULT
    // });
    // }

    // save ocbpmn element position
    assign(businessObject, pick(shape, [ 'x', 'y' ]));

  }

  // Helper function to get object flow path connections
  function getObjectFlowPathConnections(element) {
    const objectFlowPathConnections = elementRegistry.filter(e =>
      e.type === 'ocbpmn:connection' && e.businessObject && e.businessObject.originalLabel &&
      e.businessObject.originalLabel === element.businessObject.originalLabel);

    console.log('OCBPMN UPDATER: getObjectFlowPathConnections found connections:', objectFlowPathConnections);
    return objectFlowPathConnections;
  }

  // Helper function to update all connections with same source and target
  function updateStackedConnections(connection, event) {
    console.log("OCBPMN UPDATER: updateStackedConnections called for connection:", connection, "with event:", event);

    // Check if event was prevented
    if (event && event.defaultPrevented) {

      // console.log("OCBPMN UPDATER: Event was prevented, skipping updateStackedConnections");
      return;
    }

    if (!connection || !elementRegistry.get(connection.id)) {

      // connection was deleted, skip update
      return;
    }

    // console.log("OCBPMN UPDATER: updateStackedConnections called for connection:", connection);
    // const source = connection.source;
    // const target = connection.target;
    // when reconnect.. delete event called... source and target null. needed for all deletion or can i edit this ?
    const source = connection.source;
    const target = connection.target;
    //const conRegistry = elementRegistry.getGraphics(connection);
   //const conPath = conRegistry.querySelector('path');

    console.log("OCBPMN UPDATER elementreg target:", target, "source:", source, "connection:");

    if (!source || !target) {
      const conBO = connection.businessObject;
      if (conBO.source && conBO.target) {
      
      }
      return;
    }

    // Get all connections between the same source and target
    const allConnections = elementRegistry.filter(e =>
      e.type === 'ocbpmn:connection' &&
      e.source && e.target &&
      e.source.id === source.id &&
      e.target.id === target.id
    ).sort((a, b) => (a.id || '').localeCompare(b.id || ''));

    console.log('OCBPMN UPDATER: updateStackedConnections all stacked arcs array allConnections:', allConnections, 'for event:', event);

    const parallelSequenceArr = elementRegistry.filter(sf =>
      sf.type === 'bpmn:SequenceFlow' &&
      sf.source && sf.target &&
      sf.source.id === source.id &&
      sf.target.id === target.id &&
      sf.businessObject.ocbpmnReconnect !== true
    );
    const parallelSequence = parallelSequenceArr.length > 0 ? parallelSequenceArr[0] : null;
     console.log("OCBPMN UPDATER parallelSequence:", parallelSequence, "parallelSequenceArr:", parallelSequenceArr);
    
    // console.log("connection names:", allConnections.map(c => c.businessObject.name));
    /*
    if (allConnections) {
      const firstConnection = allConnections[0];
      const parallelSequenceArr = elementRegistry.filter(conn =>
        conn.type === 'bpmn:SequenceFlow' &&
        conn.source.id === source.id &&
        conn.target.id === target.id);
      console.log("OCBPMN UPDATER parallelSequenceArr:", parallelSequenceArr);

      if (parallelSequenceArr.length > 0) {
        const parallelSequence = parallelSequenceArr[0];
        const parallelSequenceWaypoints = copyWaypoints(parallelSequence);
        firstConnection.waypoints = parallelSequenceWaypoints;
        assign(firstConnection.businessObject, {
          waypoints: parallelSequenceWaypoints
        });

        // Get the color from the ocbpmn connection
        const color = firstConnection.businessObject.customColors || COLOR_OCBPMN_DEFAULTSTROKE;

        // Schedule color change for after current command execution
        eventBus.once('commandStack.changed', function () {
          modeling.setColor(parallelSequence, {
            stroke: color.stroke || color
          });
        });
      }
    }

 */
    // Waypoints of stacked connections are based on the parallel sequence flow or the first connection's waypoints
    const baseWaypoints = parallelSequence ? parallelSequence.waypoints : allConnections[0].waypoints;
    console.log("OCBPMN UPDATER baseWaypoints:", baseWaypoints, "for allConnections:", allConnections);
    if (allConnections.length > 1) {
      const Y_AXIS_STACK_OFFSET = parallelSequence ? 2 : 10;
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

          // console.log(`Connection ${c.id} name:`, name);
          return name;
        })
        .filter(name => name && name.trim() !== '');

      // console.log("Valid names collected:", validNames);

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
        
        if (parallelSequence) {
          connBusinessObject.hints = { parallelSequenceId: parallelSequence.id };
        }

        // Handle labels
        if (index === 0) {

          // First connection gets combined label as visualLabel only
          const finalCombinedLabel = validNames.join('x');

          // console.log("First connection combined label:", finalCombinedLabel);

          // Set visualLabel to combined label
          connBusinessObject.visualLabel = finalCombinedLabel;

          // Force a complete redraw of the connection
          eventBus.fire('element.changed', { element: conn });

          // eventBus.fire('element.updateLabel', { element: conn });
          eventBus.fire('element.updateVisuals', { element: conn });
        } else {

          // For stacked connections, set visualLabel to empty string to prevent name from showing
          connBusinessObject.visualLabel = '';

          // Force a complete redraw of the connection
          eventBus.fire('element.changed', { element: conn });

          // eventBus.fire('element.updateLabel', { element: conn });
          eventBus.fire('element.updateVisuals', { element: conn });
        }

        // console.log("OCBPMN UPDATER: elment after redraw", conn);
      });
    }
    else if (allConnections.length === 1) {

      // Single connection - don't set visualLabel so name will be shown... unless it's a start/endobject connection then we want to hide the name
      const singleOcbpmnConnection = allConnections[0];

      if (singleOcbpmnConnection.target.type !== 'ocbpmn:endobject' && singleOcbpmnConnection.source.type !== 'ocbpmn:startobject') {
        const businessObject = singleOcbpmnConnection.businessObject;
        
        // Set waypoints (possibly of parallel sequence flow) and visualLabel to undefined
        singleOcbpmnConnection.waypoints = baseWaypoints;
        assign(businessObject, {
          visualLabel: undefined,
          waypoints: baseWaypoints
        });
        
        if (parallelSequence) {
          singleOcbpmnConnection.businessObject.hints = { parallelSequenceId: parallelSequence.id };
         // conPath.style.setAttribute('stroke-dasharray', 'none');
          //conPath.style.strokeDasharray = '0, 0';
          //conPath.style.setProperty('stroke-dasharray', '0, 0');
          //console.log("elementRegistry conPath.style after setting stroke-dasharray:", conPath.style.strokeDasharray, connection, singleOcbpmnConnection);
          //conPath.style.'stroke-dasharray' = 'none';
        }
        // Force a complete redraw of the connection
        eventBus.fire('element.changed', { element: singleOcbpmnConnection });

        // eventBus.fire('element.updateLabel', {element: singleOcbpmnConnection});
        eventBus.fire('element.updateVisuals', { element: singleOcbpmnConnection });

        // console.log("OCBPMN UPDATER: elment after redraw", singleOcbpmnConnection);
      }
    }
  }

  // Add connection to the current object flow path (update customColors and name)
  function updateRelatedConnections(connection, event) {
    console.log('OCBPMN UPDATER: updateRelatedConnections called for event:', event, 'connection:', connection);

    // All previous connections on the same path (connection.source is the target of the previous connections)
    const allPrevConnections = elementRegistry.filter(e =>
      e.type === 'ocbpmn:connection' &&
        e.source && e.target && connection.source &&
        e.target.id === connection.source.id &&
        e.target.type !== 'ocbpmn:startobject'
    );
    // TODO deal with ocbpmn:endobject connections ??
    const selectedObjectType = SelectedObjectTypeService.getSelected();
    console.log('allPrevConnections:', allPrevConnections, 'of connection', connection, 'and selected object type:', selectedObjectType);

    // Update new connections (without a set name) with customColors of startobject or related previous connections
    if (!connection.businessObject.name) {

      // console.log("OCBPMN UPDATER new connection setting colors for connection", connection);
      // If multiple previous ocbpmn connections exist, the last one will set the color (good? idk)
      if (allPrevConnections.length > 0) {

        const recentPrevCon = allPrevConnections[allPrevConnections.length - 1];
        const prevBO = selectedObjectType || recentPrevCon.businessObject;
        console.log('OCBPMN UPDATER: updating new connection', connection.id,
          'with the name and color of the most recent previous connection', recentPrevCon, 'prevBO:', prevBO);

        // Set color of connection to selected object type's or previous connection's custom colors
        if (prevBO.customColors) {
          console.log('OCBPMN UPDATER: coloring new connection', connection, 'with target', connection.target);

          assign(connection.businessObject, {
            customColors: prevBO.customColors
          });

          if (connection.target && connection.target.type && connection.target.type === 'ocbpmn:intermediateobject' || connection.target.type === 'ocbpmn:endobject') {
            assign(connection.target.businessObject, {
              customColors: prevBO.customColors
            });
            console.log('OCBPMN UPDATER: shape changed connection.target', connection.target);
            eventBus.fire('element.changed', { element: connection.target });
          }
        }

        // Name connection
        if (prevBO.name) {
          console.log('OCBPMN UPDATER: naming new connection', connection, 'with target', connection.target);
          assign(connection.businessObject, {
            name: prevBO.name,
            originalLabel: prevBO.originalLabel || ''
          });

          if (connection.target && connection.target.type && connection.target.type === 'ocbpmn:intermediateobject' || connection.target.type === 'ocbpmn:endobject') {
            assign(connection.target.businessObject, {
              name: prevBO.name,
              originalLabel: prevBO.originalLabel
            });

            if (connection.target.type === 'ocbpmn:endobject') {
              assign(connection.businessObject, {
                visualLabel: ''
              });

              // Finished object flow path, clear selected object type
              SelectedObjectTypeService.clear();
            }
            eventBus.fire('element.changed', { element: connection.target });
          }
        }


        /*
          if (prevCon.businessObject.customColors) {
            // Update the connection's businessObject with the customColors from the source
            assign(connection.businessObject, {
              customColors: prevCon.businessObject.customColors
            });
            // Update intermediate and end objects in the path with the same customColors
            if (connection.target.type === 'ocbpmn:endobject' || connection.target.type === 'ocbpmn:intermediateobject') {
              assign(connection.target.businessObject, {
              customColors: prevCon.businessObject.customColors
              });
              eventBus.fire('element.changed', {element: connection.target});
            }
            // Fire event to trigger immediate color update
            eventBus.fire('element.changed', {element: connection});
          }
          if (prevCon.source.type === 'ocbpmn:startobject' && prevCon.source.businessObject.name) {
            // Update the connection's businessObject with the name from the source
            assign(connection.businessObject, {
              name: prevCon.source.businessObject.name,
              originalLabel: prevCon.source.businessObject.originalLabel
            });
            // Fire event to trigger immediate label update
            eventBus.fire('element.changed', {element: connection});
          } else if (prevCon.businessObject.name) {
            // If the source is not a startobject, use the previous connection's name for intermediate connections
            assign(connection.businessObject, {
              name: prevCon.businessObject.name,
              originalLabel: prevCon.businessObject.originalLabel
            });
            //console.log("OCBPMN UPDATER: ENDARC Updating connection name for:", connection, "with target.type:", connection.target.type);
            if (connection.target.type === 'ocbpmn:endobject' || connection.target.type === 'ocbpmn:intermediateobject') {
              assign(connection.target.businessObject, {
                name: prevCon.businessObject.name,
                originalLabel: prevCon.businessObject.originalLabel
              });
              if (connection.target.type === 'ocbpmn:endobject') {
                assign(connection.businessObject, {
                  visualLabel: ""
                });
              }
              console.log("OCBPMN UPDATER: target=intermediateobject or endobject, setting name:", prevCon.businessObject.name, "and originalLabel:", prevCon.businessObject.originalLabel, "for connection:",)
              eventBus.fire('element.changed', {element: connection.target});
              //console.log("OCBPMN UPDATER: ENDARC Setting visualLabel to empty string for endobject connection:", connection);
            }
            // Fire event to trigger immediate label update
            eventBus.fire('element.changed', {element: connection});
          }

           */


      } else if (connection.source && connection.source.type === 'ocbpmn:startobject') {

        // First connection on the path, set customColors and name from startobject
        const sourceObj = connection.source;
        const sourceObjBusinessObject = sourceObj.businessObject;

        // console.log("OCBPMN UPDATER: updateRelatedConnections: connection.source is a startobject, setting customColors and name:", connection);
        assign(connection.businessObject, {
          customColors: sourceObj.customColors || sourceObjBusinessObject.customColors || COLOR_OCBPMN_DEFAULT,
          name: sourceObjBusinessObject.name || '',
          originalLabel: sourceObjBusinessObject.originalLabel,
          visualLabel: ''
        });

        // console.log("OCBPMN UPDATER: updateRelatedConnections: connection.businessObject after updates:", connection.businessObject);
      }
      // Isolated connection (no prev connections or start obj as source. If Type selected, assign its properties.
      else if (selectedObjectType) {
        assign(connection.businessObject, {
          customColors: selectedObjectType.customColors,
          name: selectedObjectType.name,
          originalLabel: selectedObjectType.originalLabel
        });
      }
    }
    // If connection already has a name, update all connections on the same path with the same name
    getObjectFlowPathConnections(connection); // still has reconnected connections atp
  }

  this.updateocbpmnConnection = function(e) {

    console.log('OCBPMN UPDATER: updateocbpmnConnection called', e);
    var context = e.context,
        connection = context.connection,
        source = connection.source,
        target = connection.target,
        businessObject = connection.businessObject;

    // originalType = context.originalType;
    
    var ocbpmnElements = bpmnjs._ocbpmnElements;
    
    if (!connection || !elementRegistry.get(connection.id)) {
      console.log('OCBPMN UPDATER: Skipping updateocbpmnConnection - connection', connection,' was deleted or not found in registry', elementRegistry.get(connection.id));
      //collectionRemove(ocbpmnElements, businessObject);
      return;
    }

    var parent = connection.parent;

    var ocbpmnElements = bpmnjs._ocbpmnElements;

    // make sure element is added / removed from bpmnjs.ocbpmnElements unless originalType is 'ocbpmn:connection'
    if (!parent) {
      collectionRemove(ocbpmnElements, businessObject);
    } else {
      collectionAdd(ocbpmnElements, businessObject);
    }

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

    // Add new connection to current object flow path
    updateRelatedConnections(connection, e);

    // Update stacked connections
    updateStackedConnections(connection, e);

    // update endobject color if target is ocbpmn:endobject and incoming connection has customColors
    if (target && target.type === 'ocbpmn:endobject' && connection.businessObject.customColors) {
      assign(businessObject, {
        customColors: target.businessObject.customColors
      });

      // Fire event to trigger immediate color update
      eventBus.fire('element.changed', { element: target });
    }

    console.log('CONNLOG: connection:', connection, 'source:', source, 'target:', target);
  };

  this.executed([
    'shape.create',
    'shape.move',
    'shape.delete'
  ], function(e) {
    if (e.defaultPrevented) {
      console.log('OCBPMN UPDATER: Command event was prevented, skipping execution');
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
  ], (e) => {
    console.log('OCBPMN UPDATER: this.executed event received:', e);
    if (e.context && e.context.connection) {
      console.log('OCBPMN UPDATER: Connection in executed event:', e.context.connection);
    }
    ifocbpmnElement(this.updateocbpmnConnection.bind(this))(e);
  });

  this.reverted([
    'connection.create',
    'connection.reconnect',
    'connection.updateWaypoints',
    'connection.delete',
    'connection.layout',
    'connection.move'
  ], (e) => {
    console.log('OCBPMN UPDATER: this.reverted event received:', e);
    if (e.context && e.context.connection) {
      console.log('OCBPMN UPDATER: Connection in reverted event:', e.context.connection);
    }
    ifocbpmnElement(this.updateocbpmnConnection.bind(this))(e);
  });


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
      this._modeling.moveElements(ocbpmnChildren, { x: 0, y: 0 }, newRoot);
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