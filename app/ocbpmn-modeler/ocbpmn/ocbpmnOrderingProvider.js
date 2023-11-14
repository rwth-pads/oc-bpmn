import inherits from 'inherits-browser';

import OrderingProvider from 'diagram-js/lib/features/ordering/OrderingProvider';


/**
 * a simple ordering provider that ensures that ocbpmn
 * connections are always rendered on top.
 */
export default function ocbpmnOrderingProvider(eventBus, canvas) {

  OrderingProvider.call(this, eventBus);

  this.getOrdering = function(element, newParent) {

    if (element.type === 'ocbpmn:connection') {

      // always move to end of root element
      // to display always on top
      return {
        parent: canvas.getRootElement(),
        index: -1
      };
    }
  };
}

ocbpmnOrderingProvider.$inject = [ 'eventBus', 'canvas' ];

inherits(ocbpmnOrderingProvider, OrderingProvider);