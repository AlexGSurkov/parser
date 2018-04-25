'use strict';

export default {

  apiURL: __API_URL__ || 'http://localhost:1400/',

  /**
   * Current language for admin
   */
  currentLanguage: 'en',

  /**
   * define existing Languages
   */
  availableLanguages: [
    {title: 'english', value: 'en'},
    {title: 'русский', value: 'ru'},
    {title: 'українська', value: 'uk'}
  ],

  supportPhone: '+38 068 733 31 87',
  // Use in kpi/components/planning/planningHelper as start time period date
  planningHelperStartDate: '2013-01-01',

  colorsScheme: {
    dropDownOptionBackground: '#585A69',
    stylizedInputListBackground: '#535563',
    loginBackground: '#2E2F3B',
    inputText: '#B7B8BD',
    menuBackground: '#2E2F3B',
    menuSeparateLine: '#3D3E4D',
    menuItem: '#8ED0BE',
    menuItemPressed: '#C7E8DF',
    menuItemActive: '#EF4331',
    contentBackground: '#3D3E4D',
    contentColor: '#FFFFFF',
    contentElementBackground: '#4D4F5C',
    contentElementHoverBackground: '#626575',
    logoImage: 'url(/images/admin/logo.png)'
  },

  pathPrefix: '/app',
  apiPrefix: '/api'
};
