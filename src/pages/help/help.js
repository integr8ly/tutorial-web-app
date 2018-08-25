import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Grid } from 'patternfly-react';

const HelpPage = ({ t }) => (
  // const threadList = t('steel-thread-zero.section.itemizedlist.listitem', { returnObjects: true });
  <Grid fluid>
    <div className="page-header">
      <h2>Help</h2>
    </div>
  </Grid>
);

HelpPage.propTypes = {
  t: PropTypes.func.isRequired
};

export default translate()(HelpPage);
