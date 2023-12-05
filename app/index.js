/* eslint-env browser */

import pizzaDiagram from '../resources/pizza-collaboration.bpmn';

import ocbpmnElements from './ocbpmn-elements.json';

import ocbpmnModeler from './ocbpmn-modeler';

import ExtendedColorPickerModule from './ExtendedColorPickerModule';

import OcbpmnDirectEditingProvider from './OcbpmnDirectEditingProvider';



var modeler = new ocbpmnModeler({
  container: '#canvas',
  keyboard: {
    bindTo: document
  },
  additionalModules: [
    ExtendedColorPickerModule,
    OcbpmnDirectEditingProvider
  ]
});

modeler.importXML(pizzaDiagram).then(() => {
  modeler.get('canvas').zoom('fit-viewport');

  modeler.addocbpmnElements(ocbpmnElements);
}).catch(err => {
  console.error('something went wrong:', err);
});


// expose bpmnjs to window for debugging purposes
window.bpmnjs = modeler;
