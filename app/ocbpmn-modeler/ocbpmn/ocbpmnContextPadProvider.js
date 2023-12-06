import inherits from 'inherits-browser';

import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  assign,
  bind
} from 'min-dash';


export default function ocbpmnContextPadProvider(injector, connect, translate) {

  injector.invoke(ContextPadProvider, this);

  var cached = bind(this.getContextPadEntries, this);

  this.getContextPadEntries = function(element) {
    var actions = cached(element);

    var businessObject = element.businessObject;

    function startConnect(event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    }

    if (isAny(businessObject, [ 'ocbpmn:triangle', 'ocbpmn:circle', 'ocbpmn:hexagon', 'ocbpmn:join' ])) {
      assign(actions, {
        'connect': {
          group: 'connect',
          className: 'bpmn-icon-connection-multi',
          title: translate('Connect using ocbpmn connection'),
          action: {
            click: startConnect,
            dragstart: startConnect
          }
        }
      });
    }

    return actions;
  };
}

inherits(ocbpmnContextPadProvider, ContextPadProvider);

ocbpmnContextPadProvider.$inject = [
  'injector',
  'connect',
  'translate'
];