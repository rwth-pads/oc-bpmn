/**
 * A simple service to store the intent of the connection operation.
 */
export default function OcbpmnConnectionIntent() {
  this._intent = null;
  console.log('OCBPMN INTENT SERVICE: Instance created, initial intent:', this._intent);

  this.setIntent = function(intentType) {
    console.log('OCBPMN INTENT SERVICE: setIntent called. Old intent:', this._intent, 'New intent:', intentType);
    this._intent = intentType;
  };

  this.getIntent = function() {
    console.log('OCBPMN INTENT SERVICE: getIntent called. Current intent:', this._intent);
    return this._intent;
  };

  this.clearIntent = function() {
    console.log('OCBPMN INTENT SERVICE: clearIntent called. Old intent:', this._intent);
    this._intent = null;
  };
}

OcbpmnConnectionIntent.$inject = [];