import '../TestHelper';

import TestContainer from 'mocha-test-container-support';

import ocbpmnModeler from '../../app/ocbpmn-modeler';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './diagram.bpmn';


describe('ocbpmn modeler', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('ocbpmn elements', function() {

    var modeler;

    // spin up modeler with ocbpmn element before each test
    beforeEach(function() {
      modeler = new ocbpmnModeler({ container: container });

      return modeler.importXML(diagramXML);
    });


    it('should import ocbpmn element', function() {

      // given
      var elementRegistry = modeler.get('elementRegistry'),
          ocbpmnElements = modeler.getocbpmnElements();

      // when
      var ocbpmnElement = {
        type: 'ocbpmn:triangle',
        id: 'ocbpmnTriangle_1',
        x: 300,
        y: 200
      };

      modeler.addocbpmnElements([ ocbpmnElement ]);
      var ocbpmnTriangle = elementRegistry.get('ocbpmnTriangle_1');

      // then
      expect(is(ocbpmnTriangle, 'ocbpmn:triangle')).to.be.true;

      expect(ocbpmnTriangle).to.exist;
      expect(ocbpmnElements).to.contain(ocbpmnElement);

    });

  });


  describe('ocbpmn connections', function() {

    var modeler;

    // spin up modeler with ocbpmn element before each test
    beforeEach(function() {
      modeler = new ocbpmnModeler({ container: container });

      return modeler.importXML(diagramXML).then(() => {
        modeler.addocbpmnElements([ {
          type: 'ocbpmn:triangle',
          id: 'ocbpmnTriangle_1',
          x: 300,
          y: 200
        } ]);
      });

    });


    it('should import ocbpmn connection', function() {

      // given
      var elementRegistry = modeler.get('elementRegistry');
      var ocbpmnElements = modeler.getocbpmnElements();

      // when
      var ocbpmnElement = {
        type: 'ocbpmn:connection',
        id: 'ocbpmnConnection_1',
        source: 'ocbpmnTriangle_1',
        target: 'Task_1',
        waypoints: [
          { x: 100, y: 100 },
          { x: 200, y: 300 }
        ]
      };

      modeler.addocbpmnElements([ ocbpmnElement ]);
      var ocbpmnConnection = elementRegistry.get('ocbpmnConnection_1');

      // then
      expect(ocbpmnConnection).to.exist;
      expect(ocbpmnElements).to.contain(ocbpmnElement);

    });

  });

});
