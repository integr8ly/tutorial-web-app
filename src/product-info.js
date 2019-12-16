// This file needs to live inside src to be importable
export default {
  codeready: {
    prettyName: 'Red Hat CodeReady Workspaces',
    gaStatus: 'GA',
    primaryTask: 'Online IDE',
    description: 'A developer workspace server and cloud IDE.'
  },
  apicurio: {
    prettyName: 'API Designer',
    gaStatus: 'GA',
    primaryTask: 'Design APIs',
    description: 'The Apicurito RESTful API visual designer.'
  },
  '3scale': {
    prettyName: 'Red Hat 3scale API Management Platform',
    gaStatus: 'GA',
    primaryTask: 'Manage APIs',
    description: 'A platform that provides RESTful API Management.'
  },
  fuse: {
    prettyName: 'Red Hat Fuse Online',
    gaStatus: 'GA',
    primaryTask: 'Create integrations',
    description:
      'A facility to obtain data from an application or service, operate on that data, and then send the data to another application or service without writing code.',
    // Don't show the fuse instance only intended for walkthroughs
    // in the installed apps list
    hidden: true
  },
  'fuse-managed': {
    prettyName: 'Red Hat Fuse Online (Shared)',
    gaStatus: 'GA',
    primaryTask: 'Create integrations',
    description:
      'A facility to obtain data from an application or service, operate on that data, and then send the data to another application or service without writing code.'
  },
  'amq-online-standard': {
    prettyName: 'Red Hat AMQ Online',
    gaStatus: 'GA',
    primaryTask: 'Provision messaging',
    description: 'Fast, lightweight, and secure messaging for Internet-scale applications.'
  },
  unifiedpush: {
    prettyName: 'Push Notification Service',
    gaStatus: 'GA',
    primaryTask: 'Mobile Push Messaging',
    description: 'Provides messaging services for Android and iOS'
  },
  'user-rhsso': {
    prettyName: 'Customer Application SSO',
    gaStatus: 'GA',
    primaryTask: 'Protect your end-user applications',
    description: "A single sign-on solution for your end-users' web apps, mobile apps, and RESTful web services."
  },
  rhsso: {
    prettyName: 'Managed Integration SSO',
    gaStatus: 'GA',
    primaryTask: 'Manage your cluster users (Admins only)',
    description:
      'Administrators can use this single sign-on solution for managing user permissions and access to the cluster. If you do not have access to this console, contact your local admin.'
  },
  launcher: {
    prettyName: 'Red Hat Developer Launcher',
    gaStatus: 'GA',
    primaryTask: 'Deliver apps',
    description: 'A platform for continuous application delivery, with a set of templates.'
  }
};
