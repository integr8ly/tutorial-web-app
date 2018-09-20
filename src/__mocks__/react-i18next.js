const React = require('react');
const reactI18next = require('react-i18next');

module.exports = {
  translate: () => Component => props => <Component t={k => k} {...props} />,
  Trans: ({ children }) => children,
  I18n: ({ children }) => children(k => k, { i18n: {} }),

  // mock if needed
  Interpolate: reactI18next.Interpolate,
  I18nextProvider: reactI18next.I18nextProvider,
  loadNamespaces: reactI18next.loadNamespaces,
  reactI18nextModule: reactI18next.reactI18nextModule,
  setDefaults: reactI18next.setDefaults,
  getDefaults: reactI18next.getDefaults,
  setI18n: reactI18next.setI18n,
  getI18n: reactI18next.getI18n
};
