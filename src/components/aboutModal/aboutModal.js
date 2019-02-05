import React from 'react';
import { AboutModal as PfAboutModal, TextContent, TextList, TextListItem } from '@patternfly/react-core';
import { detect } from 'detect-browser';
import solutionsExplorerLogo from '../../img/logo-alt.svg';
import redHatLogo from '../../img/Logo_RH_RGB_Reverse.png';

const pkgJson = require('../../../package.json');

class AboutModal extends React.Component {
  state = {
    isModalOpen: true
  };

  handleModalToggle = () => {
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen
    }));
  };

  render() {
    const { isModalOpen } = this.state;
    const browser = detect();

    return (
      <React.Fragment>
        <PfAboutModal
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          productName="Red Hat Solution Explorer"
          trademark={`Copyright (c) ${new Date().getFullYear()} Red Hat, Inc.`}
          brandImageSrc={redHatLogo}
          brandImageAlt="Patternfly Logo"
          logoImageSrc={solutionsExplorerLogo}
          logoImageAlt="Patternfly Logo"
        >
          <TextContent>
            <TextList component="dl">
              <TextListItem component="dt">Webapp version</TextListItem>
              <TextListItem component="dd">{pkgJson.version}</TextListItem>
              <TextListItem component="dt">Server name</TextListItem>
              <TextListItem component="dd">TBD</TextListItem>
              <TextListItem component="dt">User Name</TextListItem>
              <TextListItem component="dd">{window.localStorage.getItem('currentUserName')}</TextListItem>
              <TextListItem component="dt">User Role</TextListItem>
              <TextListItem component="dd">TBD</TextListItem>
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
export { AboutModal as default, AboutModal };
