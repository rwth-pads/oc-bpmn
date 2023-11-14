import {
  bootstrapBpmnJS,
  inject
} from '../TestHelper';

import {
  assign
} from 'min-dash';

import ocbpmnModeler from '../../app/ocbpmn-modeler';

import diagramXML from './diagram.bpmn';


describe('ocbpmn modeling', function() {

  beforeEach(bootstrapBpmnJS(ocbpmnModeler, diagramXML));


  describe('ocbpmn elements', function() {

    beforeEach(inject(function(bpmnjs) {

      var ocbpmnShape = {
        type: 'ocbpmn:triangle',
        id: 'ocbpmnTriangle_1',
        x: 300,
        y: 300
      };

      bpmnjs.addocbpmnElements([ ocbpmnShape ]);
    }));


    it('should export ocbpmn element', inject(
      function(bpmnjs, elementRegistry, modeling) {

        // given
        var ocbpmnElement = {
          type: 'ocbpmn:circle',
          id: 'ocbpmnCircle_1',
          x: 200,
          y: 400
        };

        var position = { x: ocbpmnElement.x, y: ocbpmnElement.y },
            target = elementRegistry.get('Process_1');

        modeling.createShape(
          assign({ businessObject: ocbpmnElement }, ocbpmnElement),
          position,
          target
        );

        // when
        var ocbpmnElements = bpmnjs.getocbpmnElements();

        // then
        expect(ocbpmnElements).to.contain(ocbpmnElement);
      }
    ));


    it('should not resize ocbpmn shape', inject(function(elementRegistry, rules) {

      // given
      var ocbpmnElement = elementRegistry.get('ocbpmnTriangle_1');

      // when
      var allowed = rules.allowed('resize', { shape: ocbpmnElement });

      // then
      expect(allowed).to.be.false;
    }));


    it('should update ocbpmn element', inject(function(elementRegistry, modeling) {

      // given
      var ocbpmnElement = elementRegistry.get('ocbpmnTriangle_1');

      // when
      modeling.moveShape(ocbpmnElement, { x: 200, y: 50 }, ocbpmnElement.parent);

      // then
      expect(ocbpmnElement.businessObject.x).to.equal(500);
      expect(ocbpmnElement.businessObject.y).to.equal(350);
    }));


    it('should remove deleted shape from _ocbpmnElements', inject(
      function(bpmnjs, elementRegistry, modeling) {

        // given
        var ocbpmnShape = elementRegistry.get('ocbpmnTriangle_1'),
            ocbpmnElements = bpmnjs.getocbpmnElements();

        // when
        modeling.removeShape(ocbpmnShape);

        // then
        expect(ocbpmnElements.length).to.equal(0);
      }
    ));

  });


  describe('ocbpmn connections', function() {

    beforeEach(inject(function(bpmnjs) {

      var ocbpmnShape = {
        type: 'ocbpmn:triangle',
        id: 'ocbpmnTriangle_1',
        x: 400,
        y: 300
      };

      bpmnjs.addocbpmnElements([ ocbpmnShape ]);
    }));


    it('should export ocbpmn connection', inject(
      function(bpmnjs, elementRegistry, modeling) {

        // given
        var ocbpmnShape = elementRegistry.get('ocbpmnTriangle_1'),
            taskShape = elementRegistry.get('Task_1');

        modeling.connect(ocbpmnShape, taskShape, {
          type: 'ocbpmn:connection',
          id: 'ocbpmnConnection_1'
        });

        // when
        var ocbpmnElements = bpmnjs.getocbpmnElements();

        // then
        var ids = ocbpmnElements.map(function(element) {
          return element.id;
        });

        expect(ids).to.include('ocbpmnConnection_1');
      }
    ));


    it('should connect ocbpmn shape to task', inject(
      function(bpmnjs, elementRegistry, modeling, rules) {

        // given
        var ocbpmnShape = elementRegistry.get('ocbpmnTriangle_1'),
            taskShape = elementRegistry.get('Task_1');

        // when
        var allowedConnection = rules.allowed('connection.create', {
          source: ocbpmnShape,
          target: taskShape
        });

        modeling.connect(
          ocbpmnShape,
          taskShape,
          allowedConnection
        );

        // then
        expect(allowedConnection.type).to.eql('ocbpmn:connection');

        expect(ocbpmnShape.outgoing.length).to.equal(1);
        expect(taskShape.outgoing.length).to.equal(1);

        expect(bpmnjs.getocbpmnElements().length).to.equal(2);
      }
    ));


    it('should not connect ocbpmn shape to start event', inject(
      function(elementRegistry, rules) {

        // given
        var ocbpmnShape = elementRegistry.get('ocbpmnTriangle_1'),
            startEventShape = elementRegistry.get('StartEvent_1');

        // when
        var allowed = rules.allowed('connection.create', {
          source: ocbpmnShape,
          target: startEventShape
        });

        // then
        expect(allowed).to.be.false;
      }
    ));


    it('should reconnect start', inject(function(bpmnjs, elementRegistry, modeling) {

      // given
      var ocbpmnShape = elementRegistry.get('ocbpmnTriangle_1'),
          taskShape = elementRegistry.get('Task_1');

      var ocbpmnConnection = modeling.connect(ocbpmnShape, taskShape, {
        type: 'ocbpmn:connection'
      });

      bpmnjs.addocbpmnElements([ {
        type: 'ocbpmn:circle',
        id: 'ocbpmnCircle_1',
        x: 200,
        y: 300
      } ]);

      var ocbpmnCircle = elementRegistry.get('ocbpmnCircle_1');

      // when
      modeling.reconnectStart(ocbpmnConnection, ocbpmnCircle, {
        x: ocbpmnCircle.x + ocbpmnCircle.width / 2,
        y: ocbpmnCircle.y + ocbpmnCircle.height / 2
      });

      // then
      expect(ocbpmnConnection.source).to.equal(ocbpmnCircle);
      expect(ocbpmnConnection.target).to.equal(taskShape);
    }));


    it('should reconnect end', inject(function(bpmnjs, elementRegistry, modeling) {

      // given
      var ocbpmnShape = elementRegistry.get('ocbpmnTriangle_1'),
          taskShape1 = elementRegistry.get('Task_1'),
          taskShape2 = elementRegistry.get('Task_2');

      var ocbpmnConnection = modeling.connect(ocbpmnShape, taskShape1, {
        type: 'ocbpmn:connection'
      });

      // when
      modeling.reconnectEnd(ocbpmnConnection, taskShape2, {
        x: taskShape2.x + taskShape2.width / 2,
        y: taskShape2.y + taskShape2.height / 2
      });

      // then
      expect(ocbpmnConnection.source).to.equal(ocbpmnShape);
      expect(ocbpmnConnection.target).to.equal(taskShape2);
    }));


    it('should update ocbpmn connection', inject(function(elementRegistry, modeling) {

      // given
      var ocbpmnElement = elementRegistry.get('ocbpmnTriangle_1'),
          taskShape = elementRegistry.get('Task_1');

      var ocbpmnConnection = modeling.connect(ocbpmnElement, taskShape, {
        type: 'ocbpmn:connection'
      });

      // when
      modeling.moveShape(ocbpmnElement, { x: 200, y: 50 }, ocbpmnElement.parent);

      // then
      expect(ocbpmnConnection.businessObject.waypoints).to.eql([
        { x: 613, y: 364 },
        { x: 354, y: 157 }
      ]);
    }));


    it('should remove deleted connection from _ocbpmnElements', inject(
      function(bpmnjs, elementRegistry, modeling) {

        // given
        var ocbpmnShape = elementRegistry.get('ocbpmnTriangle_1'),
            taskShape = elementRegistry.get('Task_1'),
            ocbpmnElements = bpmnjs.getocbpmnElements();

        var ocbpmnConnection = modeling.connect(ocbpmnShape, taskShape, {
          type: 'ocbpmn:connection'
        });

        // when
        modeling.removeConnection(ocbpmnConnection);

        // then
        expect(ocbpmnElements.length).to.equal(1);
      }
    ));

  });

});
