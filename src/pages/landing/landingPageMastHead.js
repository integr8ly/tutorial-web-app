import * as React from 'react';
import { PageSection, PageSectionVariants, TextContent, Text, TextVariants } from '@patternfly/react-core';

const LandingPageMastHead = () => (
  <PageSection variant={PageSectionVariants.dark} className="integr8ly-landing-page-masthead">
    <TextContent>
      <Text component={TextVariants.h1}>Welcome to the Red Hat Solution Explorer</Text>
      <Text component={TextVariants.p}>
        Get started with an end-to-end solution walkthrough or use any of the available application services to create
        custom integrations.
      </Text>
    </TextContent>
  </PageSection>
);

export default LandingPageMastHead;
