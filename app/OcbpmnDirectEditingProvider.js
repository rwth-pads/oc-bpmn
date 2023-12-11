function OcbpmnDirectEditingProvider(directEditing) {
    directEditing.registerProvider(this);
  
    this.activate = function(element) {
      // Check if the element is a hexagon
      if (element.type === 'ocbpmn:hexagon') {
        // Add a class to the text box
        var textBox = document.querySelector('.djs-direct-editing-parent');
        if (textBox) {
          textBox.classList.add('hexagon-text-box');
        }
  
        return {
          bounds: {
            x: element.x,
            y: element.y + element.height, // position the text box under the hexagon
            width: element.width,
            height: 30 // set a fixed height for the text box
          },
          text: element.businessObject.name || ''
        };
      }
    };
  
    this.update = function(element, text, oldText) {
      // Check if the element is a hexagon
      if (element.type === 'ocbpmn:hexagon') {
        // Update the name of the business object of the element
        element.businessObject.name = text;
      }
    };
  }
  
  OcbpmnDirectEditingProvider.$inject = [ 'directEditing' ];
  
  export default {
    __init__: [ 'ocbpmnDirectEditingProvider' ],
    ocbpmnDirectEditingProvider: [ 'type', OcbpmnDirectEditingProvider ]
  };