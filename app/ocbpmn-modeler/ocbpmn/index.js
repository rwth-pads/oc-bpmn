import ocbpmnContextPadProvider from './ocbpmnContextPadProvider';
import ocbpmnElementFactory from './ocbpmnElementFactory';
import ocbpmnOrderingProvider from './ocbpmnOrderingProvider';
import ocbpmnPalette from './ocbpmnPalette';
import ocbpmnRenderer from './ocbpmnRenderer';
import ocbpmnRules from './ocbpmnRules';
import ocbpmnUpdater from './ocbpmnUpdater';

export default {
  __init__: [
    'contextPadProvider',
    'ocbpmnOrderingProvider',
    'ocbpmnRenderer',
    'ocbpmnRules',
    'ocbpmnUpdater',
    'paletteProvider'
  ],
  contextPadProvider: [ 'type', ocbpmnContextPadProvider ],
  ocbpmnOrderingProvider: [ 'type', ocbpmnOrderingProvider ],
  ocbpmnRenderer: [ 'type', ocbpmnRenderer ],
  ocbpmnRules: [ 'type', ocbpmnRules ],
  ocbpmnUpdater: [ 'type', ocbpmnUpdater ],
  elementFactory: [ 'type', ocbpmnElementFactory ],
  paletteProvider: [ 'type', ocbpmnPalette ]
};
