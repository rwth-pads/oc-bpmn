function OcbpmnDirectEditingProvider(directEditing, eventBus, ocbpmnUpdater) {
  directEditing.registerProvider(this);

  // activate text field
  this.activate = function(element) {
    var bounds, textContent = element.businessObject.name || '';

    if (element.type === 'ocbpmn:startobject' || element.type === 'ocbpmn:intermediateobject' || element.type === 'ocbpmn:endobject') {
      bounds = {
        x: element.x + (element.width / 4), // textbox position
        y: element.y + (element.height / 4), // textbox position
        width: element.width / 2,
        height: 20 // Höhe des Textfelds
      };

      setTimeout(() => {
        var directEditingParent = document.querySelector('.djs-direct-editing-parent');
        if (directEditingParent) {
          const shapeElement = document.querySelector(`[data-element-id="${element.id}"]`); //shape_13 zB
          const shapeRect = shapeElement.getBoundingClientRect();
          const diagramRect = document.querySelector('.djs-container').getBoundingClientRect();

          const centerX = shapeRect.left + (shapeRect.width / 2) - diagramRect.left;
          const centerY = shapeRect.top + (shapeRect.height / 2) - diagramRect.top;

          directEditingParent.style.position = 'absolute';
          directEditingParent.style.width = bounds.width + 'px';
          directEditingParent.style.height = bounds.height + 'px';
          directEditingParent.style.left = centerX + 'px';
          directEditingParent.style.top = centerY + 'px';
          directEditingParent.style.transform = 'translate(-50%, -50%)'; // center the textbox
          directEditingParent.style.background = 'rgba(255, 255, 255, 0.9)';
        }
      }, 0);

      return {
        bounds,
        text: textContent
      };
    } else if (element.type === 'ocbpmn:connection') {

      // Calculate midpoint for connection label editing
      const waypoints = element.waypoints;
      let midPoint;
      if (waypoints.length === 2) {
        midPoint = {
          x: (waypoints[0].x + waypoints[1].x) / 2,
          y: (waypoints[0].y + waypoints[1].y) / 2
        };
      } else {
        const midIndex = Math.floor((waypoints.length - 1) / 2);
        midPoint = {
          x: (waypoints[midIndex].x + waypoints[midIndex + 1].x) / 2,
          y: (waypoints[midIndex].y + waypoints[midIndex + 1].y) / 2
        };
      }

      // Adjust for label offset, same as in renderer
      midPoint.y -= 10;

      // Initial rough bounds, will be refined by setTimeout
      bounds = {
        x: midPoint.x,
        y: midPoint.y,
        width: 100,
        height: 20
      };

      setTimeout(() => {
        var directEditingParent = document.querySelector('.djs-direct-editing-parent');
        if (directEditingParent) {

          // const labelElement = document.querySelector(`#connection-label-${element.id}`);
          const labelElement = document.querySelector(`[data-element-id="${element.id}"]`);
          const labelRect = labelElement.getBoundingClientRect();
          const diagramRect = document.querySelector('.djs-container').getBoundingClientRect();

          // Calculate the center of the label relative to the diagram container
          const labelCenterX = labelRect.left + (labelRect.width / 2) - diagramRect.left;
          const labelCenterY = labelRect.top + (labelRect.height / 2) - diagramRect.top;

          // Get the desired textbox dimensions (can be dynamic or fixed)
          const textboxWidth = bounds.width; // Or a fixed value like 100
          const textboxHeight = bounds.height; // Or a fixed value like 20

          directEditingParent.style.position = 'absolute';
          directEditingParent.style.width = textboxWidth + 'px';
          directEditingParent.style.height = textboxHeight + 'px';

          // Position the top-left of the textbox so its center aligns with the label's center
          directEditingParent.style.left = labelCenterX + 'px';
          directEditingParent.style.top = labelCenterY + 'px';
          directEditingParent.style.transform = 'translate(-50%, -50%)'; // Remove any previous transform
          directEditingParent.style.background = 'rgba(255, 255, 255, 0.9)'; // Optional: slight background for visibility
          // } else {
          // Fallback or error handling if label element not found
          //  console.warn(`Label element #connection-label-${element.id} not found for direct editing.`);
          // }
        }
      }, 0);

      return {
        bounds,
        text: textContent
      };
    }
  };

  // update the text field
  this.update = function(element, text) {
    if (element.type === 'ocbpmn:startobject' ||
        element.type === 'ocbpmn:intermediateobject' ||
        element.type === 'ocbpmn:endobject' ||
        element.type === 'ocbpmn:connection') { // Added ocbpmn:connection
      element.businessObject.name = text;
      
      // For connections, update related connections immediately
      if (element.type === 'ocbpmn:connection') {
        // Force update of the element in the registry
        eventBus.fire('element.changed', { element: element });
        
        // Update related connections using the injected updater
        ocbpmnUpdater.updateRelatedConnections(element);
      } else {
        eventBus.fire('element.changed', { element: element });
      }
    }
  };

  // Doppelklick-Event registrieren
  eventBus.on('element.dblclick', function(event) {
    var element = event.element;

    if (element.type === 'ocbpmn:startobject' ||
        element.type === 'ocbpmn:intermediateobject' ||
        element.type === 'ocbpmn:endobject' ||
        element.type === 'ocbpmn:connection') { // Added ocbpmn:connection
      directEditing.activate(element);
    }
  });

}

OcbpmnDirectEditingProvider.$inject = [ 'directEditing', 'eventBus', 'ocbpmnUpdater' ];

export default {
  __init__: [ 'ocbpmnDirectEditingProvider' ],
  ocbpmnDirectEditingProvider: [ 'type', OcbpmnDirectEditingProvider ]
};
