import inherits from 'inherits-browser';

import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  assign,
  bind
} from 'min-dash';

// my edit....
// import ColorPicker from 'bpmn-js-color-picker';
/*
export default function ocbpmnContextPadProvider(contextPad, popupMenu, canvas, injector, connect, translate) {

    injector.invoke(ContextPadProvider, this);

    var cached = bind(this.getContextPadEntries, this);

    this.getContextPadEntries = function(element) {
        var actions = cached(element);

        var businessObject = element.businessObject;

        function startConnect(event, element, autoActivate) {
            connect.start(event, element, autoActivate);
        }

        //TODO change this for intermediate OF arcs ?
        if (isAny(businessObject, [ 'ocbpmn:triangle', 'ocbpmn:circle', 'ocbpmn:hexagon', 'ocbpmn:join', 'ocbpmn:oval' ])) {
            assign(actions, {
                'connect': {
                    group: 'connect',
                    className: 'bpmn-icon-connection-multi',
                    title: translate('Connect using ocbpmn connection'),
                    action: {
                        click: startConnect,
                        dragstart: startConnect
                    }
                },
                'color-picker': {
                    group: 'edit',
                    className: 'bpmn-icon-color',
                    title: translate('Set color'),
                    action: {
                        click: function (event, element) {
                            ColorPicker.open(event, element);
                        }
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
*/
// original ocbpmn

export default function ocbpmnContextPadProvider(injector, connect, translate) {

  injector.invoke(ContextPadProvider, this);

  var cached = bind(this.getContextPadEntries, this);

  this.getContextPadEntries = function(element) {
    var actions = cached(element);

    var businessObject = element.businessObject;

    function startConnect(event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    }

    function startObjectConnect(event, element, autoActivate) {
      connect.start(event, element, autoActivate, { type: 'ocbpmn:connection' });
    }

    // Add regular BPMN connections for BPMN elements
    if (isAny(businessObject, [ 'bpmn:Task', 'bpmn:Event' ])) {
      assign(actions, {
        'connect': {
          group: 'connect',
          className: 'bpmn-icon-connection-multi',
          title: translate('Connect using BPMN connection'),
          action: {
            click: startConnect,
            dragstart: startConnect
          }
        }
      });
    }

    // Add ocbpmn connections for both BPMN and ocbpmn elements
    if (isAny(businessObject, [ 'bpmn:Task', 'ocbpmn:circle', 'ocbpmn:hexagon', 'ocbpmn:join', 'ocbpmn:oval' ])) {
      assign(actions, {
        'object-connect': {
          group: 'connect',
          className: 'ocbpmn-icon-connection',
          title: translate('Connect using ocbpmn connection'),
          action: {
            click: startObjectConnect,
            dragstart: startObjectConnect
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

