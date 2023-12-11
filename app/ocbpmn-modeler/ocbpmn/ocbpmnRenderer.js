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

var COLOR_GREEN = '#52B415',
  COLOR_RED = '#cc0000',
  COLOR_YELLOW = '#ffc800';

/**
 * A renderer that knows how to render ocbpmn elements.
 */
export default function ocbpmnRenderer(eventBus, styles) {

  BaseRenderer.call(this, eventBus, 2000);

  var computeStyle = styles.computeStyle;

  //hexagonv01

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


  //hexagonv02 because of difficulties with browser handling svg strokes
  this.drawHexagon = function(p, width, height, color = { fill: 'green', stroke: 'black' }) {
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
  
    p.innerHTML = svgString;
  
    return p;
  };


  this.drawJoin = function (p, width, height) {
    var svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="42" viewBox="0 0 35 42" fill="none">
    <path d="M0.75 40.6754V1.32464L33.5423 21L0.75 40.6754Z" fill="white" stroke="black" stroke-width="1.5"/>
    </svg>
    `;
  
    p.innerHTML = svgString;
  
    return p;
  };
  

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

  this.getTrianglePath = function(element) {
    var x = element.x,
      y = element.y,
      width = element.width,
      height = element.height;

    var trianglePath = [
      [ 'M', x + width / 2, y ],
      [ 'l', width / 2, height ],
      [ 'l', -width, 0 ],
      [ 'z' ]
    ];

    return componentsToPath(trianglePath);
  };

  this.drawCircle = function(p, width, height) {
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

  this.getCirclePath = function(shape) {
    var cx = shape.x + shape.width / 2,
        cy = shape.y + shape.height / 2,
        radius = shape.width / 2;

    var circlePath = [
      [ 'M', cx, cy ],
      [ 'm', 0, -radius ],
      [ 'a', radius, radius, 0, 1, 1, 0, 2 * radius ],
      [ 'a', radius, radius, 0, 1, 1, 0, -2 * radius ],
      [ 'z' ]
    ];

    return componentsToPath(circlePath);
  };

  this.drawocbpmnConnection = function(p, element) {
    var attrs = computeStyle(attrs, {
      stroke: COLOR_RED,
      strokeWidth: 2
    });

    return svgAppend(p, createLine(element.waypoints, attrs));
  };

  this.getocbpmnConnectionPath = function(connection) {
    var waypoints = connection.waypoints.map(function(p) {
      return p.original || p;
    });

    var connectionPath = [
      [ 'M', waypoints[0].x, waypoints[0].y ]
    ];

    waypoints.forEach(function(waypoint, index) {
      if (index !== 0) {
        connectionPath.push([ 'L', waypoint.x, waypoint.y ]);
      }
    });

    return componentsToPath(connectionPath);
  };
}

inherits(ocbpmnRenderer, BaseRenderer);

ocbpmnRenderer.$inject = [ 'eventBus', 'styles' ];


ocbpmnRenderer.prototype.canRender = function(element) {
  return /^ocbpmn:/.test(element.type);
};

ocbpmnRenderer.prototype.drawShape = function(p, element) {
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
};

ocbpmnRenderer.prototype.getShapePath = function(shape) {
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
};

ocbpmnRenderer.prototype.drawConnection = function(p, element) {

  var type = element.type;

  if (type === 'ocbpmn:connection') {
    return this.drawocbpmnConnection(p, element);
  }
};


ocbpmnRenderer.prototype.getConnectionPath = function(connection) {

  var type = connection.type;

  if (type === 'ocbpmn:connection') {
    return this.getocbpmnConnectionPath(connection);
  }
};
