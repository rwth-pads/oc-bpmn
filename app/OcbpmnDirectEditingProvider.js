function OcbpmnDirectEditingProvider(directEditing, eventBus) {
  directEditing.registerProvider(this);

  // activate text field for Ovals
  this.activate = function(element) {
    if (element.type === 'ocbpmn:oval') {
      return {
        bounds: {
          x: element.x + element.width / 4, // Zentriert im Oval
          y: element.y + element.height / 4,
          width: element.width / 2,
          height: 30 // Höhe des Textfelds
        },
        text: element.businessObject.name || ''
      };
    }
  };

  // update the text field for Ovals
  this.update = function(element, text) {
    if (element.type === 'ocbpmn:oval') {
      element.businessObject.name = text;

      // make label visible immediately
      eventBus.fire('element.changed', { element: element });
    }
  };

  // Doppelklick-Event für Ovale registrieren
  eventBus.on('element.dblclick', function(event) {
    var element = event.element;

    if (element.type === 'ocbpmn:oval') {
      directEditing.activate(element);
    }
  });

}

OcbpmnDirectEditingProvider.$inject = [ 'directEditing', 'eventBus' ];

export default {
  __init__: [ 'ocbpmnDirectEditingProvider' ],
  ocbpmnDirectEditingProvider: [ 'type', OcbpmnDirectEditingProvider ]
};
