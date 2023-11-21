import ColorPopupProvider from 'bpmn-js-color-picker/colors/ColorPopupProvider';
import ColorContextPadProvider from 'bpmn-js-color-picker/colors/ColorContextPadProvider';

class ExtendedColorPopupProvider extends ColorPopupProvider {
    getEntries(elements) {
        const originalEntries = super.getEntries(elements);
      
        const newColors = [
          {
            label: 'NewRed',
            fill: '#FFC2C2',
            stroke: '#FF0000'
          },
          {
            label: 'NewGreen',
            fill: '#C2FFC2',
            stroke: '#00920B'
          },
          {
            label: 'NewBlue',
            fill: '#A299FF',
            stroke: '#090068'
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