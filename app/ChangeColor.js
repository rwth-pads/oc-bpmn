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
            const conLine = conGraphics.querySelector('#ofCon-path');
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
        var svgOcConLine = ocCon.querySelector('#ofCon-path');
        if (svgOcConLine) {
          svgOcConLine.style.stroke = colors.stroke;
          svgOcConLine.setAttribute('stroke', colors.stroke);
        }
        // save manually set custom color
        //element.businessObject.customColors = colors;
        //eventBus.fire('element.changed', { element: element });

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


  // watch source color

  eventBus.on('element.changed', function(event) {
    var element = event.element;

    if (element.type === 'ocbpmn:startobject') {

      // Sicherstellen, dass outgoing ein Array ist und Verbindungen enthält
      const outgoingCon = Array.isArray(element.outgoing) ? element.outgoing : [];
      const sourceColors = element.businessObject.customColors;

      if (sourceColors){
        outgoingCon.forEach(connection => {
          if (connection.type === 'ocbpmn:connection' && connection.businessObject.customColors?.auto !== false) {
            connection.businessObject.customColors = {
              fill: sourceColors.fill,
              stroke: sourceColors.stroke,
              auto: true
            };

            const conGraphics = elementRegistry.getGraphics(connection);
            const conLine = conGraphics.querySelector('#ofCon-path');
            if (conLine) {
              conLine.style.stroke = sourceColors.stroke;
              conLine.setAttribute('stroke', sourceColors.stroke);
            }
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
