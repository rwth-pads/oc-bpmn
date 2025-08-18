import { assign } from 'min-dash';

export default function ChangeColor(modeler) {
  var modeling = modeler.get('modeling');
  var elementRegistry = modeler.get('elementRegistry');

  // var canvas = modeler.get('canvas'); // Access the canvas
  var eventBus = modeler.get('eventBus');

  // Backup the original setColor function
  var originalSetColor = modeling.setColor;

  // Override the setColor function
  modeling.setColor = function(elements, colors) {
    elements = Array.isArray(elements) ? elements : [ elements ];

    elements.forEach(element => {

      if (element.type === 'ocbpmn:startobject' || element.type === 'ocbpmn:endobject' || element.type === 'ocbpmn:intermediateobject') {

        // color oval
        element.businessObject.customColors = colors;
        var oval = elementRegistry.getGraphics(element);
        var svgOval = oval.querySelector('ellipse');
        if (svgOval) {
          svgOval.style.fill = colors.fill;
          svgOval.style.stroke = colors.stroke;
          svgOval.setAttribute('fill', colors.fill); // wenn nur setAttribute dann wird die customfarbe erst nach bewegen des elementes veraendert???
          svgOval.setAttribute('stroke', colors.stroke);
        }

        // Automatische Farbübertragung auf ausgehende Verbindungen
        const outgoingCon = Array.isArray(element.outgoing) ? element.outgoing : [];
        outgoingCon.forEach(connection => {
          if (connection.type === 'ocbpmn:connection') {
            connection.businessObject.customColors = {
              fill: colors.fill,
              stroke: colors.stroke,
            };

            const conGraphics = elementRegistry.getGraphics(connection);
            const conLine = conGraphics.querySelector('path'); // was id #ofCon-path
            if (conLine) {
              conLine.style.stroke = colors.stroke;
              conLine.setAttribute('stroke', colors.stroke);
            }
          }
        });
      } else if (element.type === 'ocbpmn:connection') {

        // color connection
        element.businessObject.customColors = colors;

        var ocCon = elementRegistry.getGraphics(element);

        // var svgOcConLine = ocCon.querySelector('#ofCon-path');
        var svgOcConLine = ocCon.querySelector('path'); // was id #ofCon-path
        if (svgOcConLine) {
          svgOcConLine.style.stroke = colors.stroke;
          svgOcConLine.setAttribute('stroke', colors.stroke);
        }

        // save manually set custom color
        // element.businessObject.customColors = colors;
        // eventBus.fire('element.changed', { element: element });

      } else if (element.type === 'ocbpmn:hexagon') {

        // color hexagon
        const gfx = elementRegistry.getGraphics(element);
        const svgPath = gfx.querySelector('.fill-path');
        const svgStrokePath = gfx.querySelector('.stroke-path');

        if (svgPath) {
          svgPath.setAttribute('fill', colors.fill);
        }
        if (svgStrokePath) {
          svgStrokePath.setAttribute('stroke', colors.stroke);
        }

      } else {
        originalSetColor.call(this, [ element ], colors);
      }

      // trigger a redraw/update of the element
      eventBus.fire('element.changed', { element: element });

      /*
        if (element.type === 'ocbpmn:oval' || element.type === 'ocbpmn:hexagon') {
            this._commandStack.execute('element.setColor')
            {
                //if (element.type === 'ocbpmn:oval' || element.type === 'ocbpmn:hexagon') {
                element.businessObject.customColors = colors;

                if (element.type === 'ocbpmn:oval') {

                    // Update the element's graphical representation

                    const ovl = elementRegistry.getGraphics(element);
                    const svgOvl = ovl.querySelector("ellipse");

                    if (svgOvl) {
                        svgOvl.setAttribute('fill', colors.fill);
                        svgOvl.setAttribute('stroke', colors.stroke);
                    }
                } else { //hexagon

                    // Update the element's graphical representation

                    const gfx = elementRegistry.getGraphics(element);
                    const svgPath = gfx.querySelector('.fill-path');
                    const svgStrokePath = gfx.querySelector('.stroke-path');

                    if (svgPath) {
                        svgPath.setAttribute('fill', colors.fill);
                    }
                    if (svgStrokePath) {
                        svgStrokePath.setAttribute('stroke', colors.stroke);
                    }
                }
                // Trigger a redraw/update of the element
                canvas.addMarker(element, 'needs-update');
                canvas.removeMarker(element, 'needs-update');
                canvas.changed(element);
            }
        } else {
                originalSetColor.call(this, [element], colors);
            }
        }

*/

      /*
        elements.forEach(element => {
         //  if (element.type === 'ocbpmn:hexagon' || element.type === 'ocbpmn:connection' || element.type === 'ocbpmn:oval') {
           if (element.type === 'ocbpmn:hexagon' ) {
                    element.businessObject.customColors = colors;

                    // Update the element's graphical representation
                    const gfx = elementRegistry.getGraphics(element);
                    const svgPath = gfx.querySelector('.fill-path');
                    const svgStrokePath = gfx.querySelector('.stroke-path');
                    if (svgPath) {
                        svgPath.setAttribute('fill', colors.fill);
                    }
                    if (svgStrokePath) {
                        svgStrokePath.setAttribute('stroke', colors.stroke);
                    }

                    // Trigger a redraw/update of the element
                    canvas.addMarker(element, 'needs-update');
                    canvas.removeMarker(element, 'needs-update');
                    canvas.changed(element);
                } else {
                    originalSetColor.call(this, [element], colors);
                }

        }); */


      /*
        elements.forEach(element => {
            //  if (element.type === 'ocbpmn:hexagon' || element.type === 'ocbpmn:connection' || element.type === 'ocbpmn:oval') {
            if (element.type === 'ocbpmn:oval' || element.type === 'ocbpmn:hexagon' || element.type === 'ocbpmn:connection') {
                element.businessObject.customColors = colors;

                if (element.type === 'ocbpmn:oval'){

                    // Update the element's graphical representation

                    //var ovl = elementRegistry.getGraphics(element);
                   // var svgOvl = ovl.querySelector("ellipse");

                    //this actually does work kinda.. eg if you remove setAttribute for the fill color here
                    // then selecting a new color will only change the stroke color
                   // if (svgOvl){
                     //   svgOvl.setAttribute('fill', colors.fill);
                       // svgOvl.setAttribute('stroke', colors.stroke);
                    //}
                }
                if (element.type === 'ocbpmn:connection'){


                   // var ofCon = elementRegistry.getGraphics(element);
                    //var svgMarker = ofCon.querySelector('marker').querySelector('path');
                    //var svgCon = ofCon.querySelector('.line-path');
                    //var svgOfCon = ofCon.querySelectorAll('.ofConn');

                    //if (svgCon){
                        //svgOfCon.setAttribute('fill', colors.fill);
                        //svgOfCon.setAttribute('stroke', colors.stroke);
                      // svgCon.setAttribute('fill', colors.fill);
                      // svgCon.setAttribute('stroke', colors.stroke);
                      // svgCon.style.stroke = colors.stroke;
                   // }
                   // svgOfCon.setAttribute('fill', colors.fill);
                    //svgOfCon.setAttribute('stroke', colors.stroke);


                } else { //hexagon

                    // Update the element's graphical representation

                    var gfx = elementRegistry.getGraphics(element);
                    var svgPath = gfx.querySelector('.fill-path');
                    var svgStrokePath = gfx.querySelector('.stroke-path');

                    if (svgPath) {
                        svgPath.setAttribute('fill', colors.fill);
                    }
                    if (svgStrokePath) {
                        svgStrokePath.setAttribute('stroke', colors.stroke);
                    }
                }
                // Trigger a redraw/update of the element
                canvas.addMarker(element, 'needs-update');
                canvas.removeMarker(element, 'needs-update');
                debugger
                canvas.changed(element);
            } //else {
                originalSetColor.call(this, [element], colors);
           // }

         */

    });
  };
  
  // Listen for element changes to update colors
  eventBus.on('element.changed', function(event) {
    var element = event.element;

    // Update element and entire related object flow on startobject change
    if (element.type === 'ocbpmn:startobject') {

      // Sicherstellen, dass outgoing ein Array ist und Verbindungen enthält
      const outgoingCon = Array.isArray(element.outgoing) ? element.outgoing : [];
      const sourceColors = element.businessObject.customColors || { fill: '#6691ff',
        stroke: '#0048ff' };
      const sourceName = element.businessObject.name;
      const sourceOgLabel = element.businessObject.originalLabel;

      // Find all related connection from object flow path (have the same name or the target is an endobject with the same name)
      const relatedConnections = elementRegistry.filter(e =>
        e.type === 'ocbpmn:connection' &&
        ((e.businessObject && sourceName && e.businessObject.name === sourceName) ||
          (e.target && e.target.type === 'ocbpmn:endobject' && e.target.businessObject && e.target.businessObject.name === sourceName) ||
          (e.businessObject && e.businessObject.originalLabel && e.businessObject.originalLabel === sourceOgLabel) ||
          (e.businessObject && e.businessObject.name && sourceName !== '' && e.businessObject.name.includes(sourceName) && e.businessObject.name.includes('['))
        )
      );
      console.log('CHANGECOLOR: eventBus element.changed for ocbpmn:startobject:', element, 'and relatedConnections:', relatedConnections, 'sourcename:', sourceName, 'sourceColors:', sourceColors, 'sourceOgLabel:', sourceOgLabel);

      // Update customColors of related object flow connections on color change of startobject
      if (sourceColors) {
        outgoingCon.forEach(connection => {

          // Set outgoing connections from startobject to the same color and name (but clear visualLabel for better readability)
          if (connection.type === 'ocbpmn:connection') {
            assign(connection.businessObject, {
              customColors: sourceColors,
              name: connection.businessObject.status ? sourceName + ' [' + connection.businessObject.status + ']' : sourceName,
              originalLabel: sourceOgLabel || '',
              visualLabel: ''
            });
          }
        });

        // Update the colors of all related connections in object flow path
        relatedConnections.forEach(connection => {
          assign(connection.businessObject, {
            customColors: sourceColors,
            name: connection.businessObject.status ? sourceName + ' [' + connection.businessObject.status + ']' : sourceName // Keep obj state if it exists
          });

          if (connection.target.type === 'ocbpmn:endobject' || connection.target.type === 'ocbpmn:intermediateobject') {
            assign(connection.target.businessObject, {
              customColors: sourceColors,
              name: connection.businessObject.status ? sourceName + ' [' + connection.businessObject.status + ']' : sourceName
            });
            if (connection.target.type === 'ocbpmn:endobject') {
              assign(connection.target.businessObject, {
                visualLabel: ''
              });
            }
            eventBus.fire('element.changed', { element: connection.target });
          }
          eventBus.fire('element.changed', { element: connection });
          eventBus.fire('element.updateLabel', { element: connection });
          
          if (connection.businessObject.visualLabel !== undefined) {
            console.log("CHANGECOLOR: visualLabel updateLabel for connection", connection.id, "is set to", connection.businessObject.visualLabel);
            eventBus.fire('connection.updateLabel', { connection: connection });
          }

        });

      }
    }
  });

  // hilft nicht
  eventBus.on('element.added', function(event) {
    var element = event.element;

    if (element.type === 'ocbpmn:connection') {
      var source = element.source;

      if (source && source.type === 'ocbpmn:startobject' && source.businessObject.customColors) {
        const sourceColors = source.businessObject.customColors;

        // Setze die Farben der Verbindung
        element.businessObject.customColors = {
          fill: sourceColors.fill,
          stroke: sourceColors.stroke,
          auto: true
        };

        const conGraphics = elementRegistry.getGraphics(element);
        const conLine = conGraphics.querySelector('#ofCon-path');
        if (conLine) {
          conLine.style.stroke = sourceColors.stroke;
          conLine.setAttribute('stroke', sourceColors.stroke);
        }

        // Trigger ein Update der Verbindung
        eventBus.fire('element.changed', { element: element });
      }
    }
  });
}
