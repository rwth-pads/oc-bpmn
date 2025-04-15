export default function ChangeColor(modeler) {
    var modeling = modeler.get('modeling');
    var elementRegistry = modeler.get('elementRegistry');
    var canvas = modeler.get('canvas'); // Access the canvas

    // Backup the original setColor function
    var originalSetColor = modeling.setColor;

    // Override the setColor function
    modeling.setColor = function(elements, colors) {
        elements = Array.isArray(elements) ? elements : [elements];

        elements.forEach(element => {

            if (element.type === 'ocbpmn:oval'){
                var oval = elementRegistry.getGraphics(element);
                var svgOval = oval.querySelector('ellipse');
                if (svgOval) {
                    svgOval.setAttribute('fill', colors.fill);
                    svgOval.setAttribute('stroke', colors.stroke);
                }
            }
            else if (element.type === 'ocbpmn:connection'){
                var ocCon = elementRegistry.getGraphics(element);
                var svgOcConLine = ocCon.querySelector("#ofCon-path");
                //var svgOcConMarker = ocCon.querySelector("marker").closest('path');
                // var svgOcConMarker = ocCon.querySelector("#ofMarker-path"); // = null
                if (svgOcConLine) {
                    //svgOcConLine.setAttribute('fill', colors.fill);
                    //svgOcConLine.style.fill = colors.fill;
                    //svgOcConLine.setAttribute('stroke', colors.stroke);
                    svgOcConLine.style.stroke = colors.stroke;
                }
               // if (svgOcConMarker) {
                  //  svgOcConMarker.setAttribute('fill', colors.fill);
                   // svgOcConMarker.setAttribute('stroke', colors.stroke);
               // }


            }
            else if (element.type === 'ocbpmn:hexagon'){
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
                originalSetColor.call(this, [element], colors);
            }

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
// TODO change color ehhhh
                    debugger

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
}
