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
    var fillPathData = 'M25 22L13 29L1 22V8L13 1L25 8V22Z';
    var strokePathData = 'M13 29L25 22V8M13 29L1 22V8M13 29V14M25 8L13 1L1 8M25 8L13 14M1 8L13 14';
  
    var fillAttrs = computeStyle({}, {
      fill: 'white'
    });
  
    var strokeAttrs = computeStyle({}, {
      stroke: 'black',
      fill: 'none'
    });
  
    var fillPath = svgCreate('path');
    var strokePath = svgCreate('path');
  
    svgAttr(fillPath, {
      d: fillPathData,
      transform: 'scale(' + width / 26 + ',' + height / 30 + ')'
    });
  
    svgAttr(strokePath, {
      d: strokePathData,
      transform: 'scale(' + width / 26 + ',' + height / 30 + ')'
    });
  
    svgAttr(fillPath, fillAttrs);
    svgAttr(strokePath, strokeAttrs);
  
    svgAppend(p, fillPath);
    svgAppend(p, strokePath);
  
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
