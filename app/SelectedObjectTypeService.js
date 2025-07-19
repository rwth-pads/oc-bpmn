class SelectedObjectTypeService {
  constructor() {
    this.selected = null;
    this.listeners = [];
  }
  
  addListener(listener) {
    this.listeners.push(listener);
  }
  
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  notifyListeners(event, objectData) {
    this.listeners.forEach(listener => listener(event, objectData));
  }
  
  setSelected(obj) {
    this.selected = obj;
    this.notifyListeners('selected', obj);
  }
  
  getSelected() {
    return this.selected;
  }
  
  clear() {
    this.selected = null;
    this.notifyListeners('cleared');
  }
}

export default new SelectedObjectTypeService();