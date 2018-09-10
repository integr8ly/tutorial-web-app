import React from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import XHR from 'i18next-xhr-backend';
import { I18nextProvider, reactI18nextModule } from 'react-i18next';

class I18nProvider extends React.Component {
  constructor(props) {
    super(props);
    this.i18n = i18next
      .use(XHR)
      .use(reactI18nextModule)
      .init({
        backend: {
          loadPath: `/locales/${props.locale}.json`
        },
        fallbackLng: 'en',
        lng: props.locale,
        ns: ['default'],
        defaultNS: 'default',
        react: {
          wait: true
        }
      });
  }
  render() {
    return <I18nextProvider i18n={this.i18n}>{this.props.children}</I18nextProvider>;
  }
}

I18nProvider.propTypes = {
  locale: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export { I18nProvider as default, I18nProvider };
