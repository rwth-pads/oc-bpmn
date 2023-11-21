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

  this.drawHexagon = function (p, width, height) {
  // Using the SVG path from the custom design to ensure visual consistency across the application.
  var pathData = 'm 135.52411,89.188187 3.09831,-1.805787 c 0.0583,-0.03396 0.0874,-0.05094 0.11827,-0.05759 0.0274,-0.0059 0.0555,-0.0059 0.0829,0 0.0309,0.0067 0.06,0.02363 0.11826,0.05759 l 3.09831,1.805787 m -6.51607,0 v 3.600324 m 0,0 c 0,0.07191 0,0.107815 0.0102,0.139927 m 0,0 c 0.009,0.0284 0.0237,0.05448 0.0432,0.0765 m 0,0 c 0.022,0.02494 0.0522,0.04258 0.1127,0.07781 m 0,0 3.09196,1.802073 m -3.25804,-5.69664 3.25804,1.687896 m 0,4.008744 3.09195,-1.802073 m 0,0 c 0.0605,-0.03524 0.0907,-0.05287 0.11269,-0.07781 m 0,0 c 0.0195,-0.02203 0.0342,-0.04811 0.0432,-0.0765 m 0,0 c 0.0102,-0.03211 0.0102,-0.06802 0.0102,-0.139927 m 0,0 v -3.600324 m -3.25803,5.696644 v -4.008748 m 3.25803,-1.687896 -3.25803,1.687896';

  // Applying visual styles that match the SVG's appearance to maintain design integrity.
  var attrs = computeStyle({}, {
    stroke: '#000000', //stroke color
    strokeWidth: 0.325092,
    fill: 'none'
  });

  var path = svgCreate('path');

  // Calculate the scale and position.
  var scaleX = width / 6.8414822;
  var scaleY = height / 7.8895063;
  var translateX = -135.3614 * scaleX;
  var translateY = -87.157871 * scaleY;

  // Apply the scale and position transformations to the path.
  svgAttr(path, {
    d: pathData,
    transform: 'translate(' + translateX + ',' + translateY + ') scale(' + scaleX + ',' + scaleY + ')'
  });
  svgAttr(path, attrs);

  svgAppend(p, path);

  return path;
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

  if (type === 'ocbpmn:triangle') {
    return this.drawTriangle(p, element.width);
  }

  if (type === 'ocbpmn:circle') {
    return this.drawCircle(p, element.width, element.height);
  }
};

ocbpmnRenderer.prototype.getShapePath = function(shape) {
  var type = shape.type;

  if (type === 'ocbpmn:hexagon') {
    return this.getHexagonPath(shape);
  }

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
