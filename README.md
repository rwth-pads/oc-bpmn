
# bpmn-js: Object-Centric Custom Shapes (ocbpmn)

This advanced example shows how to extend [bpmn-js](https://github.com/bpmn-io/bpmn-js) with new shapes and connections that are __not part of the BPMN 2.0 diagram / incompatible with the BPMN 2.0 standard__. It is based on [bpmn-js-example-custom-shapes](https://github.com/bpmn-io/bpmn-js-example-custom-shapes)

## About

This example extends [bpmn-js](https://github.com/bpmn-io/bpmn-js), creating an object-centric BPMN modeler that can display and add ocbpmn shapes and connections to BPMN 2.0 diagrams.

The renderer ships with custom rules that define which modeling operations are possible on ocbpmn shapes and connections.
<!--
It can import ocbpmn shapes and connections from a [JSON](http://json.org/) descriptor and updates their properties during modeling.
-->

![demo application screenshot](docs/screenshot.png "bpmn-js ocbpmn elements example")


## Usage Summary

This tool support for modeling object-centric business processes in the extended BPMN 2.0 standard **OC-BPMN** provides a [ocbpmn modeler](app/ocbpmn-modeler/index.js). After instantiation, the modeler allows you to add and get ocbpmn shapes and connections.


The modeler ships with a [module](app/ocbpmn-modeler/ocbpmn/index.js) that provides the following [bpmn-js](https://github.com/bpmn-io/bpmn-js) extensions:

* [`ocbpmnContextPadProvider`](app/ocbpmn-modeler/ocbpmn/ocbpmnContextPadProvider.js): offers an ocbpmn-specific context pad, enabling connections between ocbpmn and BPMN elements.
* [`ocbpmnElementFactory`](app/ocbpmn-modeler/ocbpmn/ocbpmnElementFactory.js): is a specialized factory adept in creating shapes for both BPMN and ocbpmn.
* [`ocbpmnOrderingProvider`](app/ocbpmn-modeler/ocbpmn/ocbpmnOrderingProvider.js):  ensures that ocbpmn connections are consistently rendered on top.
* [`ocbpmnPalette`](app/ocbpmn-modeler/ocbpmn/ocbpmnPalette.js): generates ocbpmn elements within the modeler.
* [`ocbpmnRenderer`](app/ocbpmn-modeler/ocbpmn/ocbpmnRenderer.js): visually renders ocbpmn elements within the diagram.
* [`ocbpmnRules`](app/ocbpmn-modeler/ocbpmn/ocbpmnRules.js): sets the interaction rules for handling ocbpmn elements.
* [`ocbpmnUpdater`](app/ocbpmn-modeler/ocbpmn/ocbpmnUpdater.js): updates business data in response to user interactions with the diagram.
* [`ChangeColor`](app/ChangeColor.js): updates business data in response to user interactions with the diagram.
* [`ExtendedColorPickerModule`](app/ExtendedColorPickerModule.js): updates business data in response to user interactions with the diagram.
* [`OcbpmnDirectEditingProvider`](app/OcbpmnDirectEditingProvider.js): updates business data in response to user interactions with the diagram.


## Build and Run

```
# install dependencies
npm install

# spin up development mode
npm run dev

# execute tests
npm test
```


## License

MIT
