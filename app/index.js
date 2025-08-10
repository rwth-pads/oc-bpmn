/* eslint-env browser */

import pizzaDiagram from '../resources/pizza-collaboration.bpmn';
import orderDiagram from '../resources/simpleorderprocess.bpmn';
import makePizzaDiagram from '../resources/pizzaBakingDiag.bpmn';
import pumpkinpie from '../resources/pumpkinpie.bpmn';
import ocbpmnElements from './ocbpmn-elements.json';
import ocbpmnModeler from './ocbpmn-modeler';
import ExtendedColorPickerModule from './ExtendedColorPickerModule';
import OcbpmnDirectEditingProvider from './OcbpmnDirectEditingProvider';
import ChangeColor from './ChangeColor';
import Modeler from 'bpmn-js/lib/Modeler';
import ocbpmnModule from './ocbpmn-modeler/ocbpmn';
import { assign } from 'min-dash';
import { createObjectTypeMenu } from './ObjectTypeMenu';
import ocbpmnElementFactory from './ocbpmn-modeler/ocbpmn/ocbpmnElementFactory';
import SelectedObjectTypeService from "./SelectedObjectTypeService";

// import { addocbpmnElements } from './ocbpmn-modeler';

var modeler = new ocbpmnModeler({
  container: '#canvas',
  keyboard: {
    bindTo: document
  },
  additionalModules: [
    ocbpmnModule,
    ExtendedColorPickerModule,
    OcbpmnDirectEditingProvider
  ]
});


window.bpmnjs = modeler; // assign to window first!

const eventBus = modeler.get('eventBus');
const modeling = modeler.get('modeling');
const ocbpmnConnectionIntent = modeler.get('ocbpmnConnectionIntent');

eventBus.on('element.changed', function(event) {
  const startobj = event.element;
  const startobjColor = startobj.businessObject.customColors;
  const startobjName = startobj.businessObject.name;
  if (startobj && startobj.type === 'ocbpmn:startobject' && startobjName) {
    createObjectTypeMenu();
  }
});

createObjectTypeMenu();

// Handling reconnection of OCBPMN connections by replacing the wrongly created default BPMN connections with a new OCBPMN connection
eventBus.on('commandStack.connection.create.postExecuted', function(event) {
  const context = event.context;
  const connection = context.connection;
  const intent = ocbpmnConnectionIntent.getIntent();

  if ((connection.type === 'bpmn:SequenceFlow' || connection.type === 'bpmn:MessageFlow') &&
    ocbpmnConnectionIntent.getIntent &&
    ocbpmnConnectionIntent.getIntent() === 'ocbpmn:connection') {
    
    console.log('index.js thinks this is a reconnect of', connection, ' and intent: ', ocbpmnConnectionIntent.getIntent(), intent);
    const source = context.source;
    const target = context.target;

    if (source && target) {

      const newOcbpmnCon = {
        type: 'ocbpmn:connection',
        source: source,
        target: target
      };

      // Assign the ocbpmnReconnect flag to sequence flow to indicate it is being replaced
      assign(connection.businessObject, {
        ocbpmnReconnect: true
      });

      // Create a new ocbpmn connection after the SequenceFlow is falsely created
      const newCon = modeling.createConnection(source, target, newOcbpmnCon, source.parent);
      console.log('Created new ocbpmn:connection', newCon, 'with source:', source, 'and target:', target);

      // Name SequenceFlow with the new ocbpmn connection ID to delete it later
      assign(connection.businessObject, {
        name: newCon.id
      });
      
      // Clear the set object type after reconnection
      console.log("Clearing selected object type and connection intent post reconnection creation..was", SelectedObjectTypeService.getSelected(), ocbpmnConnectionIntent.getIntent());
      SelectedObjectTypeService.clear();
      ocbpmnConnectionIntent.clearIntent();

      console.log('Replaced BPMN SequenceFlow', connection, 'with ocbpmn:connection ',newOcbpmnCon, ' and modeling is:', modeling);
    } else {
      console.log('Failed to create ocbpmn:connection and replace SF, source or target is missing:', source, target);
    }
  }
});

// Delete the BPMN connection after reconnection to replace it with the new ocbpmn connection
eventBus.on('commandStack.connection.reconnect.postExecuted', function(event) {
  const context = event.context;
  const connection = context.connection;

  if ((connection.type === 'bpmn:SequenceFlow' || connection.type === 'bpmn:MessageFlow') &&
    connection.businessObject && connection.businessObject.name) {
    const elementRegistry = modeler.get('elementRegistry');
    const getcopiedSequenceFlow = elementRegistry.get(connection.businessObject.name);
    if (getcopiedSequenceFlow) {
      console.log('Reconnected BPMN SequenceFlow', connection, 'with name:', connection.businessObject.name, 'and get:', getcopiedSequenceFlow);
      modeling.removeConnection(connection);
    }
    // Clear the set object type after reconnection
    console.log("Clearing selected object type post reconnection. was:", SelectedObjectTypeService.getSelected(), "intent was", ocbpmnConnectionIntent.getIntent());
    SelectedObjectTypeService.clear();
  }
  else if (connection.type === 'ocbpmn:connection' && ocbpmnConnectionIntent.getIntent) {
    // Reconnection of ocbpmn:connections with source/target ocbpmn work normally and require the intent to be cleared
    // Implicit ocbpmn reconnections already cleared intent before
    console.log("clearing intent post reconnection. was:", ocbpmnConnectionIntent.getIntent());
    ocbpmnConnectionIntent.clearIntent();
  }
});

// Now patch the handler
// window.bpmnjs.get('commandStack')._handlerMap['connection.reconnect'] = new ocbpmnReconnectionHandler(
// window.bpmnjs.get('modeling'),
// window.bpmnjs.get('eventBus')
// );

/* //temp test
var modeler = new ocbpmnModeler({
  container: '#canvas',
  keyboard: {
    bindTo: document
  },
  additionalModules: [
    ocbpmnModule,
    ExtendedColorPickerModule,
    OcbpmnDirectEditingProvider
    // ChangeColor is not included here as an additional module
  ]
});

 */

// Import BPMN diagram here
modeler.importXML(pumpkinpie).then(() => {
  modeler.get('canvas').zoom('fit-viewport');

  // Only call addocbpmnElements after importXML resolves!
  modeler.addocbpmnElements(ocbpmnElements);
}).catch(err => {
  console.error('something went wrong:', err);
});

// Initialize the ChangeColor module
ChangeColor(modeler); // Call ChangeColor directly after modeler instantiation

// expose bpmnjs to window for debugging purposes
window.bpmnjs = modeler;
