import inherits from 'inherits-browser';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  componentsToPath,
  createLine
} from 'diagram-js/lib/util/RenderUtil';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

var COLOR_GREEN  = '#52B415',
    COLOR_RED    = '#cc0000',
    COLOR_YELLOW = '#ffc800',
    COLOR_FILLBLUE   = '#6691FF',
    COLOR_STROKEBLUE = '#0048FF';

function renderOcLabel(parentGfx, label, options = {}) {
    const text = svgCreate('text');
    const attrs = {
        x: options.x || 0,
        y: options.y || 0,
        fill: options.fill || 'black',
        'text-anchor': options.align || 'middle',
        'dominant-baseline': 'central',
        'font-size': options.fontSize || '12px',
        'font-family': options.fontFamily || 'Arial, sans-serif'
    };
    //if (options.id) {
      //  attrs.id = options.id;
    //}
    svgAttr(text, attrs);
    text.textContent = label;
    svgAppend(parentGfx, text);
    return text;
}
/**
 * A renderer that knows how to render ocbpmn elements.
 */
export default function ocbpmnRenderer(eventBus, styles, canvas, elementRegistry) {

    BaseRenderer.call(this, eventBus, 2000);
    this._elementRegistry = elementRegistry;
    this._canvas = canvas;
    /*

    //function lineStyle(attrs) {
    //     return styles.computeStyle(attrs, [ 'no-fill' ], {
    //       strokeLinecap: 'round',
    //       strokeLinejoin: 'round',
    //       stroke: black,
    //       strokeWidth: 2
    //     });
    //   } */


   // var markers = {};

    var computeStyle = styles.computeStyle;
    /*
        function ocbpmnShapeStyle(attrs) {
            return styles.computeStyle(attrs, {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                stroke: COLOR_RED,
                strokeWidth: 2,
                fill: COLOR_GREEN
            });
        }

        function ocbpmnLineStyle(attrs) {
            return styles.computeStyle(attrs, [ 'no-fill' ], {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                stroke: COLOR_YELLOW,
                strokeWidth: 2,
            });
        }

        // 3. create <marker> svg element and append the triangle markerEnd <path> to it
        function addMarker(id, options) {
            var {
                ref = {x: 0, y: 0},
                scale = 1,
                element
            } = options;

            var marker = svgCreate('marker', {
                id: id,
                viewBox: '0 0 20 20',
                refX: ref.x,
                refY: ref.y,
                markerWidth: 20 * scale,
                markerHeight: 20 * scale,
                orient: 'auto'
            });

            svgAppend(marker, element);

            //var defs = domQuery('defs', canvas._svg);

            //if (!defs) {
              //  defs = svgCreate('defs');
                // TODO <defs>
              //  svgAppend(canvas._svg, defs);
            //}

          //  svgAppend(defs, marker);


            markers[id] = marker;
        }


        function colorEscape(str) {

            // only allow characters and numbers
            return str.replace(/[^0-9a-zA-Z]+/g, '_');
        }

        // 1. create ID for marker type and create the marker if not registered yet and return its URL
        function ocbpmnMarker(type, fill, stroke) {
            var id = type + '-' + colorEscape(fill) + '-' + colorEscape(stroke);

            if (!markers[id]) {
                createOcbpmnMarker(id, type, fill, stroke);
            }

            return 'url(#' + id + ')';
        }

        // 2. create the markerEnd svg image
        function createOcbpmnMarker(id, type, fill, stroke) {

            if (type === 'object-flow') {
                // create triangular shape marker end path svg
                var objFlowEnd = svgCreate('path', {
                    id: 'markerEnd-path',
                    d: 'M 1 5 L 11 10 L 1 15 Z',
                    ...ocbpmnShapeStyle({
                        fill: stroke,
                        stroke: stroke,
                        strokeWidth: 1.5
                    })
                });

                addMarker(id, {
                    element: objFlowEnd,
                    ref: {x: 11, y: 10},
                    scale: 0.5
                });


            var marker = svgCreate('marker', {
                id: id,
                viewBox: '0 0 20 20',
                refX: 11,
                refY: 10,
                markerWidth: 10,
                markerHeight: 10,
                orient: 'auto'
            });

            svgAppend(marker, objFlowEnd);

            markers[id] = marker;
        }
    }
    */

        //var defaultFillColor = BpmnRendererConfig && BpmnRendererConfig.defaultFillColor;
        //var defaultStrokeColor = BpmnRendererConfig && BpmnRendererConfig.defaultStrokeColor;
        /* //hexagonv01

      // _createAction(elements, color) {
      //   return () => {
      //     const modeling = this._modeling;
      //     const elementRegistry = this._elementRegistry;

      //     elements.forEach(element => {
      //       if (element.type === 'ocbpmn:hexagon') {
      //         // Get the SVG element of the hexagon
      //         const gfx = elementRegistry.getGraphics(element);

      //         // Change the fill color of the fill path and the stroke color of the stroke path
      //         const paths = gfx.selectAll('path');
      //         const fillPath = paths[0];
      //         const strokePath = paths[1];
      //         fillPath.attr('fill', color.fill);
      //         strokePath.attr('stroke', color.stroke);
      //       } else {
      //         // Change the color of the element
      //         modeling.setColor(elements, {
      //           fill: color.fill,
      //           stroke: color.stroke
      //         });
      //       }
      //     });
      //   };
      // }

      */
        //hexagonv02 because of difficulties with browser handling svg strokes
        //container p, width, height, optional color obj with fill and stroke with default colors
        this.drawHexagon = function (p, width, height, color = {fill: '#6691FF', stroke: '#0048FF'}) {
            // svg string: width, height set dynamically, viewbox: def coord syst for drawing
            // path class fill-path: draws main filled hexagon, d drawing commands.. M25 22 = move to top right etc
            // path class stroke-path: creates outline
            // clip path: restricts drawing within spec rectangle
            // g: group svg elements together (two path elem here), clip-path url restricts clipping mask to def rectangular area
            var svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 26 30" fill="none">
                <g clip-path="url(#clip0_2_2)">
                    <path class="fill-path" d="M25 22L13 29L1 22V8L13 1L25 8V22Z" fill="${color.fill}"/>
                    <path class="stroke-path" fill-rule="evenodd" clip-rule="evenodd" d="M13 0.421143L25.5 7.71281V22.2872L13 29.5788L0.5 22.2872V7.71281L13 0.421143ZM1.5 8.80901V21.7128L12.5 28.1295V14.309L1.5 8.80901ZM13.5 14.309V28.1295L24.5 21.7128V8.80901L13.5 14.309ZM23.9497 7.96615L13 13.441L2.05034 7.96615L13 1.57885L23.9497 7.96615Z" stroke="${color.stroke}"/>
                </g>
                <defs>
                    <clipPath id="clip0_2_2">
                        <rect width="25.8576" height="29.8186" fill="white"/>
                    </clipPath>
                </defs>
            </svg>
            `;
            // svg string inserted into container p
            p.innerHTML = svgString;

            return p;
        };

        this.drawJoin = function (p, width, height) {
            var svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" width="37" height="42" viewBox="0 0 37 42" fill="none">
            <path d="M0.75 40.7119V1.28806L35.4806 21L0.75 40.7119Z" fill="white" stroke="#22242A" stroke-width="2.5"/>
            </svg>
            `;

            p.innerHTML = svgString;

            return p;
        };

        this.drawOval = function (element, p, width, height, color = {fill: COLOR_FILLBLUE, stroke: COLOR_STROKEBLUE}) {
            let strokeWidth = 2, doubleLine = false;
            var cx = width / 2,
                cy = height / 2;

            if (element.type === 'ocbpmn:startobject') {
                strokeWidth = 2;
                doubleLine = false;
            } else if (element.type === 'ocbpmn:intermediateobject') {
                strokeWidth = 2;
                doubleLine = true;
            } else if (element.type === 'ocbpmn:endobject') {
                strokeWidth = 4;
                doubleLine = false;
            }

            // Define style attributes depending on shape type (using existing computeStyle function)
            var attrs = computeStyle({}, {
                stroke: element.businessObject?.customColors?.stroke || color.stroke,
                strokeWidth: strokeWidth,
                fill: element.businessObject?.customColors?.fill || color.fill
            });

            // Create an ellipse element
            var ellipse = svgCreate('ellipse');

            // Set the ellipse's attributes
            svgAttr(ellipse, {
                cx: cx,
                cy: cy,
                rx: width / 2,
                ry: height / 2
            });

            // Apply the style attributes and append the ellipse to the parent element
            svgAttr(ellipse, attrs);
            svgAppend(p, ellipse);

            // Double line for intermediate
            if (doubleLine) {
                var innerEllipse = svgCreate('ellipse');
                svgAttr(innerEllipse, {
                    cx: cx,
                    cy: cy,
                    rx: width / 2 - 4,
                    ry: height / 2 - 4,
                    stroke: attrs.stroke,
                    strokeWidth: 2,
                    fill: 'none'
                });
                svgAppend(p, innerEllipse);
            }

            // add text box
            renderOcLabel(p, element.businessObject.name || '', {x: cx, y: cy, fill: 'black', align: 'middle'});
            return ellipse;

        /* old ellipse without element in function args ...
        <ellipse cx="${width / 2}" cy="${height / 2}" rx="${width / 2}" ry="${height / 2}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="2"/>
            var svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" id="myOval" width="${width}" height="${height}" viewBox="0 0 ${width + 2} ${height + 2}" fill="none">

            <ellipse cx="${width / 2}" cy="${height / 2}" rx="${width / 2}" ry="${height / 2}" fill="${color.fill}" stroke="${element.businessObject?.customColors?.stroke || color.stroke}" stroke-width="2"/>
        </svg>
        `;

            p.innerHTML = svgString;

            return p;
            */

        };
        /*
            this.getOvalPath = function(shape) {
                var cx = shape.x + shape.width / 2,
                    cy = shape.y + shape.height / 2,
                    rx = shape.width / 2,
                    ry = shape.height / 2;

                // Build the path commands:
                // Start at the top center of the ellipse
                // Draw an arc down to the bottom, then another back to the start.
                var ellipsePath = [
                    ['M', cx, cy - ry],
                    ['a', rx, ry, 0, 1, 0, 0, 2 * ry],
                    ['a', rx, ry, 0, 1, 0, 0, -2 * ry],
                    ['z']
                ];

                return componentsToPath(ellipsePath);
            };

        */
        this.drawEndOval = function (element, p, width, height, color = {fill: COLOR_FILLBLUE, stroke: COLOR_STROKEBLUE}) {

            var cx = width / 2,
                cy = height / 2;

            // Define style attributes depending on shape type (using existing computeStyle function)
            var attrs = computeStyle({}, {
                stroke: element.businessObject?.customColors?.stroke || color.stroke,
                strokeWidth: 4, // TODO dependent on oval type change stroke width...
                fill: element.businessObject?.customColors?.fill || color.fill
            });

            // Create an ellipse element
            var ellipse = svgCreate('ellipse');

            // Set the ellipse's attributes
            svgAttr(ellipse, {
                cx: cx,
                cy: cy,
                rx: width / 2,
                ry: height / 2
            });

            // Apply the style attributes and append the ellipse to the parent element
            svgAttr(ellipse, attrs);
            svgAppend(p, ellipse);

            // add text box
            renderOcLabel(p, element.businessObject.name || '', {x: cx, y: cy, fill: 'black', align: 'middle'});
            return ellipse;
        }

        this.drawTriangle = function (p, side) {
            var halfSide = side / 2,
                points,
                attrs;

            points = [halfSide, 0, side, side, 0, side];

            attrs = computeStyle(attrs, {
                stroke: COLOR_GREEN,
                strokeWidth: 2,
                fill: COLOR_GREEN
            });

            var polygon = svgCreate('polygon');

            svgAttr(polygon, {
                points: points
            });

            svgAttr(polygon, attrs);

            svgAppend(p, polygon);

            return polygon;
        };

        this.getTrianglePath = function (element) {
            var x = element.x,
                y = element.y,
                width = element.width,
                height = element.height;

            var trianglePath = [
                ['M', x + width / 2, y],
                ['l', width / 2, height],
                ['l', -width, 0],
                ['z']
            ];

            return componentsToPath(trianglePath);
        };

        this.drawCircle = function (p, width, height) {
            var cx = width / 2,
                cy = height / 2;

            var attrs = computeStyle(attrs, {
                stroke: COLOR_YELLOW,
                strokeWidth: 4,
                fill: COLOR_YELLOW
            });

            var circle = svgCreate('circle');

            svgAttr(circle, {
                cx: cx,
                cy: cy,
                r: Math.round((width + height) / 4)
            });

            svgAttr(circle, attrs);

            svgAppend(p, circle);

            return circle;
        };

        this.getCirclePath = function (shape) {
            var cx = shape.x + shape.width / 2,
                cy = shape.y + shape.height / 2,
                radius = shape.width / 2;

            var circlePath = [
                ['M', cx, cy],
                ['m', 0, -radius],
                ['a', radius, radius, 0, 1, 1, 0, 2 * radius],
                ['a', radius, radius, 0, 1, 1, 0, -2 * radius],
                ['z']
            ];

            return componentsToPath(circlePath);
        };

        /*
      this.drawocbpmnConnection = function(p, element) {
        // Use custom colors if available, otherwise default to red
        //const customColors = element.businessObject.customColors || { stroke: '#22242A' };
        var attrs = computeStyle(attrs, {
          //stroke: customColors.stroke,
          //stroke: COLOR_RED,
          //strokeWidth: 2
            strokeLinecap: '',
            strokeLinejoin: '',
            //stroke: p.stroke.color,
            strokeWidth: 2,
            fill: p.getFillColor(element),
            stroke: p.getStrokeColor(element),
            //markerEnd: marker('sequenceflow-end',)

        });

        return svgAppend(p, createLine(element.waypoints, attrs));
    }; */
        /*
        function myMarker(options) {
            var {
                ref = {x: 0, y: 0},
                scale = 1,
                element
            } = options;

            var ofMarker = svgCreate("marker", {
                id: 'of-triangle',
                viewBox: '0 0 20 20',
                refX: ref.x,
                refY: ref.y,
                markerWidth: 20 * scale,
                markerHeight: 20 * scale,
                orient: 'auto'

            });

            //append marker to element (ofEnd)
            svgAppend(ofMarker, element); */
        /*
            //idk what this does and why it's needed
            var defs = domQuery('defs', canvas._svg);

            if (!defs) {
                defs = svgCreate('defs');

                svgAppend(canvas._svg, defs);
            }

            svgAppend(defs, ofMarker);

            //then markers array but no need rn...
        */

        /*
        function createOfMarker(fill, stroke) {
            var ofEnd = svgCreate("path", {
                d: 'M 1 5 L 11 10 L 1 15 Z',
                ...computeStyle({
                    fill: fill,
                    stroke: stroke,
                    strokeWidth: 1
                    })
            });
            myMarker({
                element: ofEnd,
                ref: {x: 11, y: 10},
                scale: 0.5
            });

            return "url(#of-triangle)";
        }
        */

    /*
            this.drawocbpmnConnection = function (p, element, color = {fill: '#6691FF', stroke: '#0048FF'}) {

                // 1. draw connection line
                var connection = createLine(element.waypoints, {
                    color,
                    markerEnd: ocbpmnMarker('object-flow', color.fill, color.stroke)
                });

                // add defs to <p> if non existent rn
                var defs = p.closest('svg').querySelector('defs');
                if (!defs) {
                    defs = svgCreate('defs');
                    svgAppend(p.closest('svg'), defs);
                }
                //svgAppend(defs, marker);

                return connection;

                var defs = p.closest('svg').querySelector('defs');
                if (!defs) {
                    defs = svgCreate('defs');
                    svgAppend(p.closest('svg'), defs);
                }


            }; */

        this.drawocbpmnConnection = function (p, element, color = {fill: '#6691FF', stroke: '#0048FF'}) {
            // neu: source color finden
            const customColor = { // Renamed to avoid conflict with the function parameter 'color'
                fill: element.businessObject?.customColors?.fill || COLOR_STROKEBLUE,
                stroke: element.businessObject?.customColors?.stroke || COLOR_STROKEBLUE
            };
            
            const strokeDashStyle = element.businessObject?.hints?.parallelSequenceId ? '0, 0' : '0, 5'; // Use parallelSequenceId to determine if dashed line is needed
            const markerStyle = element.businessObject?.hints?.parallelSequenceId;
            //console.log("ocbpmnRenderer drawocbpmnConnection called with element:", element, "and customColor:", customColor, "and strokeDashStyle:", strokeDashStyle, "parallelSequenceId:", element.businessObject?.hints?.parallelSequenceId ? 'true' : 'false');

            // style for line
            var attrs = computeStyle({}, { // Pass empty object for baseAttrs if none
                stroke: customColor.stroke,
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeDasharray: strokeDashStyle || '0, 5',
                markerEnd: markerStyle ? 'url(#ofParallelEnd)' : 'url(#ofEnd)'
            });

            // create the connection line
            var connectionGfx = createLine(element.waypoints, attrs, 5); // Renamed to avoid conflict
            svgAppend(p, connectionGfx);

            // Add label to connection
            const waypoints = element.waypoints;
            let midPoint;

            if (waypoints.length === 2) {
                midPoint = {
                    x: (waypoints[0].x + waypoints[1].x) / 2,
                    y: (waypoints[0].y + waypoints[1].y) / 2
                };
            } else {
                // For connections with more than two waypoints, find the middle segment
                const midIndex = Math.floor((waypoints.length - 1) / 2);
                midPoint = {
                    x: (waypoints[midIndex].x + waypoints[midIndex + 1].x) / 2,
                    y: (waypoints[midIndex].y + waypoints[midIndex + 1].y) / 2
                };
            }
            // Adjust label position slightly to avoid overlapping the line
            midPoint.y -= 10; // Offset the label above the line

            // For single connections, show name. For related connections, only show visualLabel if it exists
            const isRelatedConnection = element.businessObject.visualLabel !== undefined;
            const label = isRelatedConnection ?
                         element.businessObject.visualLabel :
                         element.businessObject.name || '';
            
            if (label) {
                renderOcLabel(p, label, {
                    x: midPoint.x,
                    y: midPoint.y,
                    fill: 'black',
                    align: 'middle',
                    fontSize: '12px'
                });
            }

            // check if marker already exists
            var defs = p.closest('svg').querySelector('defs');
            if (!defs) {
                defs = svgCreate('defs');
                svgAppend(p.closest('svg'), defs);
             }

            // create marker svg element with id=#ofEnd if there is no such elem yet
            if (!defs.querySelector('#ofEnd')) {
                // marker svg elem
                var marker = svgCreate('marker', {
                    id: 'ofEnd',
                    viewBox: '0 0 20 20',
                    refX: 11,
                    refY: 10,
                    markerWidth: 10,
                    markerHeight: 10,
                    orient: 'auto'
                });

                // create triangle path shape for marker
                var markerPath = svgCreate("path");
                svgAttr(markerPath, {
                    id: 'ofMarker-path',
                    d: 'M 1 5 L 11 10 L 1 15', //triangle
                    fill: 'none',
                    stroke: '#000000',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    strokeWidth: 1.5
                });
                
                svgAppend(marker, markerPath);
                
                svgAppend(defs, marker);
            }
          
          if (!defs.querySelector('#ofParallelEnd')) {
            // marker svg elem
            var marker = svgCreate('marker', {
              id: 'ofParallelEnd',
              viewBox: '0 0 20 20',
              refX: 11,
              refY: 10,
              markerWidth: 10,
              markerHeight: 10,
              orient: 'auto'
            });
            
            // create triangle path shape for marker
            const markerPath = svgCreate("path");
            svgAttr(markerPath, {
              id: 'ofMarker-path',
              d: 'M 1 5 L 11 10 L 1 15 Z', //triangle
              fill: '#000000',
              stroke: '#000000',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 1.5
            });
            
            svgAppend(marker, markerPath);
            
            svgAppend(defs, marker);
          }

            return connectionGfx; // Return the graphics element
        };



        this.getocbpmnConnectionPath = function (connection) {
            var waypoints = connection.waypoints.map(function (p) {
                return p.original || p;
            });

            var connectionPath = [
                ['M', waypoints[0].x, waypoints[0].y]
            ];

            waypoints.forEach(function (waypoint, index) {
                if (index !== 0) {
                    connectionPath.push(['L', waypoint.x, waypoint.y]);
                }
            });

            return componentsToPath(connectionPath);
        };

    }

    inherits(ocbpmnRenderer, BaseRenderer);

    ocbpmnRenderer.$inject = ['eventBus', 'styles', 'canvas', 'elementRegistry'];


    ocbpmnRenderer.prototype.canRender = function (element) {
        //console.log('ocbpmnRenderer canRender called for element:', element);
      if (element) {
        return /^ocbpmn:/.test(element.type);
      } else {
        console.log('ocbpmnRenderer canRender called with undefined element');
        return false;
      }
    };

    ocbpmnRenderer.prototype.drawShape = function (p, element) {
        var type = element.type;

        if (type === 'ocbpmn:hexagon') {
            return this.drawHexagon(p, element.width, element.height);
        }

        if (type === 'ocbpmn:join') {
            return this.drawJoin(p, element.width, element.height);
        }

        if (type === 'ocbpmn:triangle') {
            return this.drawTriangle(p, element.width);
        }

        if (type === 'ocbpmn:circle') {
            return this.drawCircle(p, element.width, element.height);
        }

        if (type === 'ocbpmn:startobject' ||
            type === 'ocbpmn:intermediateobject' ||
            type === 'ocbpmn:endobject') {
            return this.drawOval(element, p, element.width, element.height);
        }

        if (type === 'ocbpmn:endoval') {
            return this.drawEndOval(element, p, element.width, element.height);
        }
    };

    ocbpmnRenderer.prototype.getShapePath = function (shape) {
        var type = shape.type;

        //if (type === 'ocbpmn:hexagon') {
        //return this.getHexagonPath(shape);
        //}

        //if (type === 'ocbpmn:join') {
        //return this.getJoinPath(shape);
        //}

        if (type === 'ocbpmn:triangle') {
            return this.getTrianglePath(shape);
        }

        if (type === 'ocbpmn:circle') {
            return this.getCirclePath(shape);
        }
        /*
          if (type === 'ocbpmn:oval') {
              return this.getOvalPath(shape);
          }*/
    };

    ocbpmnRenderer.prototype.drawConnection = function (p, element) {
        var type = element.type;

        if (type === 'ocbpmn:connection') {
            // Simply draw the connection as-is - stacking and labels are handled by the updater
            return this.drawocbpmnConnection(p, element);
        }
    };

    ocbpmnRenderer.prototype.getConnectionPath = function (connection) {
        var type = connection.type;

        if (type === 'ocbpmn:connection') {
            return this.getocbpmnConnectionPath(connection);
        }
    };

    /**
     * Pick attributes if they exist. Copied from BpmnRenderer.js
     *
     * @param {Object} attrs
     * @param {string[]} keys
     *
     * @returns {Object}
     */
    function pickAttrs(attrs, keys = []) {
        return keys.reduce((pickedAttrs, key) => {
            if (attrs[key]) {
                pickedAttrs[key] = attrs[key];
            }

            return pickedAttrs;
        }, {});
    }
