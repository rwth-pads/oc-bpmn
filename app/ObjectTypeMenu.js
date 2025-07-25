import SelectedObjectTypeService from "./SelectedObjectTypeService";

export function createObjectTypeMenu() {
  console.log("Creating object type menu...");
  // Remove old menu if it exists
  let oldMenu = document.getElementById('ocbpmn-object-type-menu');
  if (oldMenu) oldMenu.remove();
  
  // Find the palette
  const palette = document.querySelector('.djs-palette');
  if (!palette) return;
  
  // Style for selected button
  const style = document.createElement('style');
  style.textContent = `
  #ocbpmn-object-type-menu button.ocbpmn-selected-type {
      border: 3px solid black;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);
  
  // Create menu container
  const menu = document.createElement('div');
  menu.id = 'ocbpmn-object-type-menu';
  menu.style.marginTop = '10px';
  menu.style.padding = '8px';
  menu.style.background = '#f9f9f9';
  menu.style.border = '1px solid #ccc';
  menu.style.borderRadius = '4px';
  
  // Get all startobjects
  const modeler = window.bpmnjs;
  const elementRegistry = modeler.get('elementRegistry');
  const startObjects = elementRegistry.filter(e => e.type === 'ocbpmn:startobject' &&
    e.businessObject.originalLabel && e.businessObject.name);
  
  // Add listener
  SelectedObjectTypeService.addListener((event, objectData) => {
    const buttons = document.querySelectorAll('#ocbpmn-object-type-menu button');
    buttons.forEach(button => {
      button.classList.remove('ocbpmn-selected-type');
      if (event === 'selected' && button.innerText === objectData?.name) {
        button.classList.add('ocbpmn-selected-type');
      }
    });
  });
  
  if (startObjects.length === 0) {
    menu.innerHTML = '<em>No object types yet</em>';
  } else {
    menu.innerHTML = '<strong>Object Types:</strong><br/>';
    startObjects.forEach(obj => {
      const btn = document.createElement('button');
      btn.innerText = obj.businessObject.name;
      btn.title = 'Select Object Type: ' + obj.businessObject.name;
      btn.style.background = obj.businessObject.customColors?.fill || '#6691ff';
      btn.style.color = obj.businessObject.customColors?.stroke || '#0048ff';
      btn.style.margin = '2px';
      //btn.style.border = '3px solid black';
      btn.onclick = function(e) {
        // Save the selected object type in the service
        SelectedObjectTypeService.setSelected({
          name: obj.businessObject.name,
          customColors: obj.businessObject.customColors,
          originalLabel: obj.businessObject.originalLabel,
          visualLabel: obj.businessObject.visualLabel
        });
      };
      menu.appendChild(btn);
    });
  }
  
  // Insert after palette
 // palette.parentNode.insertBefore(menu, palette.nextSibling);
  palette.parentNode.appendChild(menu);
  
  // Position the menu right below the palette
  const paletteRect = palette.getBoundingClientRect();
  menu.style.position = 'absolute';
  menu.style.left = paletteRect.left + 'px';
  menu.style.top = (paletteRect.bottom + window.scrollY) + 'px';
  menu.style.zIndex = 1000; // Make sure it's above other elements
}