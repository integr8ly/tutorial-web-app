// This file needs to live inside src to be importable
export default {
  'amq-online-standard': {
    prettyName: 'Red Hat AMQ Online',
    gaStatus: 'GA',
    primaryTask: 'Provision messaging',
    description: 'Fast, lightweight, and secure messaging for Internet-scale applications.'
  },
  fuse: {
    prettyName: 'Red Hat Fuse Online',
    gaStatus: 'GA',
    primaryTask: 'Create integrations',
    description: 'A facility to obtain data from an application or service, operate on that data, and then send the data to another application or service without writing code.',
    // Don't show the fuse instance only intended for walkthroughs
    // in the installed apps list
    hidden: true
  },
  'fuse-managed': {
    prettyName: 'Red Hat Fuse Online (Shared)',
    gaStatus: 'GA',
    primaryTask: 'Create integrations',
    description: 'A facility to obtain data from an application or service, operate on that data, and then send the data to another application or service without writing code.'
  },
  codeready: {
    prettyName: 'Red Hat CodeReady Workspaces',
    gaStatus: 'GA',
    primaryTask: 'Online IDE',
    description: 'A developer workspace server and cloud IDE.'
  },
  launcher: {
    prettyName: 'Red Hat Developer Launcher',
    gaStatus: 'GA',
    primaryTask: 'Deliver apps',
    description: 'A platform for continuous application delivery, with a set of templates.'
  },
  '3scale': {
    prettyName: 'Red Hat 3scale API Management Platform',
    gaStatus: 'GA',
    primaryTask: 'Manage APIs',
    description: 'A platform that provides RESTful API Management.'
  },
  apicurio: {
    prettyName: 'API Designer',
    gaStatus: 'GA',
    primaryTask: 'Design APIs',
    description: 'The Apicurito RESTful API visual designer.'
  },
  mdc: {
    prettyName: 'Mobile Developer Console',
    gaStatus: 'preview',
    primaryTask: 'Create mobile apps',
    description: 'Allows you register your mobile app and associate it with Mobile Developer Services.'
  },
  rhsso: {
    prettyName: 'Red Hat Single Sign-On',
    gaStatus: 'GA',
    primaryTask: 'Manage users (Admins only)',
    description: 'A single sign-on solution for web apps, mobile apps, and RESTful web services.'
  },
  'user-rhsso': {
    prettyName: 'End-user Red Hat Single Sign-On',
    gaStatus: 'GA',
    primaryTask: 'Setup authentication',
    description: 'Admins can use our single sign-on solution for managing cluster users. Contact your local customer admin if you do not have access to this console. '
  }
};
