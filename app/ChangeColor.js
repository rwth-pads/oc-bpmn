export default function ChangeColor(modeler) {
  var modeling = modeler.get('modeling');
  var elementRegistry = modeler.get('elementRegistry');
  var canvas = modeler.get('canvas'); // Access the canvas
  var eventBus = modeler.get('eventBus');

  // Backup the original setColor function
  var originalSetColor = modeling.setColor;

  // Override the setColor function
  modeling.setColor = function(elements, colors) {
    elements = Array.isArray(elements) ? elements : [ elements ];

    elements.forEach(element => {
      // color oval
      if (element.type === 'ocbpmn:oval') {
        element.businessObject.customColors = colors;
        var oval = elementRegistry.getGraphics(element);
        var svgOval = oval.querySelector('ellipse');
        if (svgOval) {
          svgOval.style.fill = colors.fill;
          svgOval.style.stroke = colors.stroke;
          svgOval.setAttribute('fill', colors.fill); // wenn nur setAttribute dann wird die customfarbe erst nach bewegen des elementes veraendert???
          svgOval.setAttribute('stroke', colors.stroke);
        }
      }
      // color oc connection
      else if (element.type === 'ocbpmn:connection') {
        // automatically set connection color to source color if custom
        // const sourceElement = element.source?.businessObject;
        const sourceElement = element.source && element.source.businessObject;
        //if (!element.businessObject.customColors && sourceElement?.customColors) {
        if (!element.businessObject.customColors && sourceElement && sourceElement.customColors) {
          element.businessObject.customColors = {
            fill: sourceElement.customColors.fill,
            stroke: sourceElement.customColors.stroke
          };
        }
        var ocCon = elementRegistry.getGraphics(element);
        var svgOcConLine = ocCon.querySelector('#ofCon-path');
        if (svgOcConLine) {
          // svgOcConLine.setAttribute('fill', colors.fill);
          // svgOcConLine.style.fill = colors.fill;
          // svgOcConLine.setAttribute('stroke', colors.stroke);
          svgOcConLine.style.stroke = colors.stroke;
          svgOcConLine.setAttribute('stroke', colors.stroke);
        }
        // save manually set custom color
        element.businessObject.customColors = colors;

      }
      // color hexagon
      else if (element.type === 'ocbpmn:hexagon') {
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
      else {
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
    console.log('Element:', element); // Debugging: Zeigt die gesamte Struktur des Elements
    console.log('Outgoing:', element.outgoing); // Debugging: Zeigt die ausgehenden Verbindungen
    if (element.type === 'ocbpmn:oval') {
      //const outgoingCon = element.outgoing || [];
      // Sicherstellen, dass outgoing ein Array ist und Verbindungen enthält
      const outgoingCon = Array.isArray(element.outgoing) ? element.outgoing : [];
      const sourceColors = element.businessObject.customColors;

      if (!Array.isArray(outgoingCon) || outgoingCon.length === 0) {
        console.warn('Keine ausgehenden Verbindungen gefunden für:', element);
        return;
      }

      outgoingCon.forEach(connection => {
        console.log('Connection:', connection);
        if (connection.type === 'ocbpmn:connection' && sourceColors) {
          connection.businessObject.customColors =
            {
                fill: sourceColors.fill,
                stroke: sourceColors.stroke
            };

          const conGraphics = elementRegistry.getGraphics(connection);
          const conLine = conGraphics.querySelector('#ofCon-path');
          if (conLine){
            conLine.style.stroke = sourceColors.stroke;
            conLine.setAttribute('stroke', sourceColors.stroke);
          }
        }
      });
    }
  });
}
