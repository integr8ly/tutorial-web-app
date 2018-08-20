import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Grid } from 'patternfly-react';
import AsciiDocTemplate from '../../components/asciiDocTemplate/asciiDocTemplate';

const HelpPage = ({ t }) => {
  const threadList = t('steel-thread-zero.section.itemizedlist.listitem', { returnObjects: true });
  return (
    <Grid fluid>
      <div className="page-header">
        <h2>Ascii Doc Demo</h2>
      </div>
      <h3>JSON Key / Value String</h3>
      <p>{t('welcome.section.simpara')}</p>
      <h3>JSON List (Unformatted)</h3>
      <ol>
        {threadList.map((item, i) => (
          <li key={i}>{item.simpara}</li>
        ))}
      </ol>
      <h3>AsciiDoc (Formatted) to HTML</h3>
      <AsciiDocTemplate template="steelthread0.html" />
    </Grid>
  );
};

HelpPage.propTypes = {
  t: PropTypes.func.isRequired
};

export default translate()(HelpPage);
