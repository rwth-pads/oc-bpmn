function OcbpmnDirectEditingProvider(directEditing, eventBus) {
  directEditing.registerProvider(this);

  // activate text field for Ovals
  this.activate = function(element) {
    if (element.type === 'ocbpmn:startobject' || element.type === 'ocbpmn:intermediateobject' || element.type === 'ocbpmn:endobject') {
      var bounds = {
        x: element.x + (element.width / 4), // textbox position
        y: element.y + (element.height / 4), // textbox position
        width: element.width / 2,
        height: 20 // Höhe des Textfelds
      };

      setTimeout(() => {
        var directEditingParent = document.querySelector('.djs-direct-editing-parent');

        if (directEditingParent) {
          const ovalElement = document.querySelector(`[data-element-id="${element.id}"]`);
          const ovalRect = ovalElement.getBoundingClientRect();
          const diagramRect = document.querySelector('.djs-container').getBoundingClientRect();

          const centerX = ovalRect.left + (ovalRect.width / 2) - diagramRect.left;
          const centerY = ovalRect.top + (ovalRect.height / 2) - diagramRect.top;

          directEditingParent.style.position = 'absolute';
          directEditingParent.style.width = bounds.width + 'px';
          directEditingParent.style.height = bounds.height + 'px';
          directEditingParent.style.left = centerX + 'px';
          directEditingParent.style.top = centerY + 'px';
          directEditingParent.style.transform = 'translate(-50%, -50%)'; // center the textbox
          directEditingParent.style.background = 'transparent';
        }
      }, 0);

      return {
        bounds,
        text: element.businessObject.name || ''
      };
    }
  };

  // update the text field for Ovals
  this.update = function(element, text) {
    if (element.type === 'ocbpmn:startobject' || element.type === 'ocbpmn:intermediateobject' || element.type === 'ocbpmn:endobject') {
      element.businessObject.name = text;

      // make label visible immediately
      eventBus.fire('element.changed', { element: element });
    }
  };

  // Doppelklick-Event für Ovale registrieren
  eventBus.on('element.dblclick', function(event) {
    var element = event.element;

    if (element.type === 'ocbpmn:startobject' || element.type === 'ocbpmn:intermediateobject' || element.type === 'ocbpmn:endobject') {
      directEditing.activate(element);
    }
  });

}

OcbpmnDirectEditingProvider.$inject = [ 'directEditing', 'eventBus' ];

export default {
  __init__: [ 'ocbpmnDirectEditingProvider' ],
  ocbpmnDirectEditingProvider: [ 'type', OcbpmnDirectEditingProvider ]
};
