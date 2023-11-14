import {
  bootstrapBpmnJS,
  inject
} from '../TestHelper';

import ocbpmnModeler from '../../app/ocbpmn-modeler';

import diagramXML from './Modeling.collaboration.bpmn';


describe('modeling', function() {

  describe('collaboration', function() {

    beforeEach(bootstrapBpmnJS(ocbpmnModeler, diagramXML));


    describe('removing participants', function() {

      beforeEach(inject(function(bpmnjs) {

        var ocbpmnShape = {
          type: 'ocbpmn:triangle',
          id: 'ocbpmnTriangle_1',
          x: 300,
          y: 300
        };

        bpmnjs.addocbpmnElements([ ocbpmnShape ]);
      }));


      it('should update parent', inject(function(elementRegistry, canvas, modeling) {

        // given
        var ocbpmnTriangle = elementRegistry.get('ocbpmnTriangle_1');

        // when
        modeling.removeElements([
          elementRegistry.get('_6-53'),
          elementRegistry.get('_6-438')
        ]);

        // then
        expect(ocbpmnTriangle.parent).to.eql(canvas.getRootElement());
      }));

    });

  });

});
