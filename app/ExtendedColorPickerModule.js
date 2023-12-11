import ColorPopupProvider from 'bpmn-js-color-picker/colors/ColorPopupProvider';
import ColorContextPadProvider from 'bpmn-js-color-picker/colors/ColorContextPadProvider';

class ExtendedColorPopupProvider extends ColorPopupProvider {
    getEntries(elements) {
      // Get original entries
      let originalEntries = super.getEntries(elements);

      // Keep only the 'Default' entry from originalEntries
      originalEntries = originalEntries.filter(entry => entry.id === 'default-color');
        const newColors = [
          {
            label: 'Default',
            fill: '#ffffff',
            stroke: '#000000'
          },
          {
            label: 'EmergeRed',
            fill: '#FFC2C2',
            stroke: '#FF0000'
          },
          {
            label: 'EmergeGreen',
            fill: '#C2FFC2',
            stroke: '#44ff00'
          },
          {
            label: 'EmergeBlue',
            fill: '#6691ff',
            stroke: '#0048ff'
          },
          {
            label: 'EmergeYellow',
            fill: '#FFFF00', // Yellow fill
            stroke: '#FFD700' // Gold stroke
          },
          {
            label: 'DissolveRed',
            fill: '#FFFFFF', // White fill
            stroke: '#FF0000' // Red stroke
          },
          {
            label: 'DissolveGreen',
            fill: '#FFFFFF', // White fill
            stroke: '#44ff00' // Green stroke
          },
          {
            label: 'DissolveBlue',
            fill: '#FFFFFF', // White fill
            stroke: '#0048ff' // Blue stroke
          },
          {
            label: 'DissolveYellow',
            fill: '#FFFFFF', // Yellow fill
            stroke: '#FFD700' // Gold stroke
          }
        ];
      
        const newEntries = newColors.map(color => ({
          title: this._translate(color.label),
          id: color.label.toLowerCase() + '-color',
          imageHtml: this._createColorIcon(color),
          action: this._createAction(elements, color)
        }));
      
        return [...originalEntries, ...newEntries];
      }

  _createColorIcon(color) {
    const colorIconHtml = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" height="100%" width="100%">
        <rect rx="2" x="1" y="1" width="22" height="22" fill="${color.fill || this._defaultFillColor}" stroke="${color.stroke || this._defaultStrokeColor}" style="stroke-width:2"></rect>
      </svg>
    `;

    return colorIconHtml;
  }

  _createAction(elements, color) {
    return () => {
      this._modeling.setColor(elements, color);
    };
  }
}

ExtendedColorPopupProvider.$inject = ColorPopupProvider.$inject;

export default {
  __init__: [
    'colorContextPadProvider',
    'extendedColorPopupProvider'
  ],
  colorContextPadProvider: [ 'type', ColorContextPadProvider ],
  extendedColorPopupProvider: [ 'type', ExtendedColorPopupProvider ]
};