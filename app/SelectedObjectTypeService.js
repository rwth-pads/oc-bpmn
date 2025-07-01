class SelectedObjectTypeService {
  constructor() {
    this.selected = null;
  }
  
  setSelected(obj) {
    this.selected = obj;
  }
  
  getSelected() {
    return this.selected;
  }
  
  clear() {
    this.selected = null;
  }
}

export default new SelectedObjectTypeService();