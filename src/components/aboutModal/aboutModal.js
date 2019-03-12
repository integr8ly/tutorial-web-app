import React from 'react';
import PropTypes from 'prop-types';

import { AboutModal as PfAboutModal, TextContent, TextList, TextListItem } from '@patternfly/react-core';

import { detect } from 'detect-browser';
import solutionsExplorerLogo from '../../img/logo-alt.svg';
import redHatLogo from '../../img/Logo_RH_RGB_Reverse.png';
import pfBackgroundImage from '../../img/pfbg_992.jpg';

const pkgJson = require('../../../package.json');

class AboutModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { isOpen, closeAboutModal } = this.props;
    const browser = detect();

    return (
      <React.Fragment>
        <PfAboutModal
          isOpen={isOpen}
          onClose={closeAboutModal}
          productName="Red Hat Solution Explorer"
          heroImageSrc={pfBackgroundImage}
          heroImageAlt="Red Hat Solutions Explorer background image"
          brandImageSrc={redHatLogo}
          brandImageAlt="Red Hat logo"
          logoImageSrc={solutionsExplorerLogo}
          logoImageAlt="Red Hat Solutions Explorer logo"
        >
          <TextContent>
            <TextList component="dl">
              <TextListItem component="dt">Webapp version</TextListItem>
              <TextListItem component="dd">{pkgJson.version}</TextListItem>
              <TextListItem component="dt">User Name</TextListItem>
              <TextListItem component="dd">{window.localStorage.getItem('currentUserName')}</TextListItem>
              <TextListItem component="dt">Browser Version</TextListItem>
              <TextListItem component="dd">
                {browser ? browser.name : ' '} {browser ? browser.version : ' '}
              </TextListItem>
              <TextListItem component="dt">Browser OS</TextListItem>
              <TextListItem component="dd">{browser ? browser.os : ' '}</TextListItem>
            </TextList>
          </TextContent>
        </PfAboutModal>
      </React.Fragment>
    );
  }
}

AboutModal.propTypes = {
  isOpen: PropTypes.bool,
  closeAboutModal: PropTypes.func
};

AboutModal.defaultProps = {
  isOpen: false,
  closeAboutModal: null
};

export { AboutModal as default, AboutModal };
