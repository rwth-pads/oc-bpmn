export default function ChangeColor(modeler) {
    const modeling = modeler.get('modeling');
    const elementRegistry = modeler.get('elementRegistry');
    const canvas = modeler.get('canvas'); // Access the canvas

    // Backup the original setColor function
    const originalSetColor = modeling.setColor;

    // Override the setColor function
    modeling.setColor = function(elements, colors) {
        elements = Array.isArray(elements) ? elements : [elements];

        elements.forEach(element => {
            if (element.type === 'ocbpmn:hexagon' || element.type === 'ocbpmn:connection') {
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
        });
    };
}
