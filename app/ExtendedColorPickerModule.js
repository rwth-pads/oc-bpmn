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
        fill: '#6691ff',
        stroke: '#0048ff'
      },
      {
        label: 'BrightRed',
        fill: '#FFC2C2',
        stroke: '#FF0000'
      },
      {
        label: 'BrightGreen',
        fill: '#C2FFC2',
        stroke: '#44ff00'
      },
      {
        label: 'EmergeOrange',
        fill: '#ffb375',
        stroke: '#ff8100'
      },
      {
        label: 'EmergeYellow',
        fill: '#fdff8f', // Yellow fill
        stroke: '#FFD700' // Gold stroke
      },
      {
        label: 'EmergePurple',
        fill: '#ab66ff', // White fill
        stroke: '#762cd1' // Red stroke
      },
      {
        label: 'DissolveGreen',
        fill: '#8bda76', // White fill
        stroke: '#1b9500' // Green stroke
      },
      {
        label: 'DissolveBlue',
        fill: '#a4e9ff', // White fill
        stroke: '#00abdd' // Blue stroke
      },
      {
        label: 'EmergeBrown',
        fill: '#ed9e5e', // Yellow fill
        stroke: '#9e551b' // Gold stroke
      },
      {
        label: 'BrightPink',
        fill: '#ff87ed',
        stroke: '#ff00dd'
      },
      {
        label: 'EmergeLime',
        fill: '#ecff97',
        stroke: '#c0ff00'
      }
    ];

    const newEntries = newColors.map(color => ({
      title: this._translate(color.label),
      id: color.label.toLowerCase() + '-color',
      imageHtml: this._createColorIcon(color),
      action: this._createAction(elements, color)
    }));

    return [ ...originalEntries, ...newEntries ];
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