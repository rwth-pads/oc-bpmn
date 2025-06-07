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

export default function ocbpmnContextPadProvider(injector, connect, translate, ocbpmnConnectionIntent) {
  console.log('OCBPMN CONTEXT PAD: Initialized with ocbpmnConnectionIntent:', ocbpmnConnectionIntent);

  injector.invoke(ContextPadProvider, this);

  var cached = bind(this.getContextPadEntries, this);

  this.getContextPadEntries = function(element) {
    var actions = cached(element);
    var businessObject = element.businessObject;

    function startConnect(event, element, autoActivate) {
      console.log('OCBPMN CONTEXT PAD: startConnect (BPMN) called');
      ocbpmnConnectionIntent.setIntent('bpmn:SequenceFlow');
      console.log('OCBPMN CONTEXT PAD: Intent set to bpmn:SequenceFlow');
      connect.start(event, element, autoActivate);
    }

    function startObjectConnect(event, element, autoActivate) {
      console.log('OCBPMN CONTEXT PAD: startObjectConnect (OCBPMN) called');
      // Store the current connection type if we're reconnecting
      const currentConnection = element.type === 'ocbpmn:connection' ? element : null;
      console.log("OCBPMN CONTEXT PAD: Current connection type:", currentConnection);

      // Always set the intent to ocbpmn:connection for reconnection
      if (currentConnection) {
        ocbpmnConnectionIntent.setIntent('ocbpmn:connection');
      } else {
        ocbpmnConnectionIntent.setIntent('ocbpmn:connection');
      }
      console.log('OCBPMN CONTEXT PAD: Intent set to', ocbpmnConnectionIntent.getIntent());
      connect.start(event, element, autoActivate);
    }

    // Add regular BPMN connections for BPMN elements
    if (isAny(businessObject, [ 'bpmn:Task', 'bpmn:Event', 'bpmn:Gateway' ])) {
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

    // Add ocbpmn connections for specified elements
    if (isAny(businessObject, [ 'ocbpmn:startobject', 'ocbpmn:intermediateobject', 'bpmn:Task', 'bpmn:Gateway', 'bpmn:IntermediateThrowEvent' ])) {
      assign(actions, {
        'object-connect': {
          group: 'connect',
          className: 'ocbpmn-icon-connection',
          title: translate('Connect using OCBPMN connection'),
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
  'translate',
  'ocbpmnConnectionIntent'
];

