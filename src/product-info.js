// This file needs to live inside src to be importable
export default {
  codeready: {
    prettyName: 'Red Hat CodeReady Workspaces',
    gaStatus: 'GA',
    primaryTask: 'Write code',
    description: 'Rapidly code, build, and test your cloud applications with a Kubernetes-native IDE.'
  },
  apicurito: {
    prettyName: 'API Designer',
    gaStatus: 'GA',
    primaryTask: 'Design APIs',
    description: 'Quickly design your own REST APIs without writing any code.'
  },
  '3scale': {
    prettyName: 'Red Hat 3scale API Management',
    gaStatus: 'GA',
    primaryTask: 'Manage APIs',
    description: 'Securely distribute, control, and monetize shared APIs for your internal or external users.'
  },
  fuse: {
    prettyName: 'Red Hat Fuse Online',
    gaStatus: 'GA',
    primaryTask: 'Integrate applications and services',
    description:
      'Easily create integrations so that you can connect your applications, services, date, processes, and devices.',
    // Don't show the fuse instance only intended for walkthroughs
    // in the installed apps list
    hidden: true
  },
  'fuse-managed': {
    prettyName: 'Red Hat Fuse Online',
    gaStatus: 'GA',
    primaryTask: 'Integrate applications and services',
    description:
      'Easily create integrations so that you can connect your applications, services, date, processes, and devices.'
  },
  'amq-online-standard': {
    prettyName: 'Red Hat AMQ Online',
    gaStatus: 'GA',
    primaryTask: 'Provision messaging',
    description: ' Quickly provision and secure message brokers and queues across your applications and services.'
  },
  amqonline: {
    // This is used on OS4 instead of `amq-online-standard`
    prettyName: 'Red Hat AMQ Online',
    gaStatus: 'GA',
    primaryTask: 'Provision messaging',
    description: 'Quickly provision and secure message brokers and queues across your applications and services.'
  },
  unifiedpush: {
    prettyName: 'Push Notification Service',
    gaStatus: 'GA',
    primaryTask: 'Mobile Push Messaging',
    description: 'Provides messaging services for Android and iOS.'
  },
  ups: {
    // This is used on OS4 instead of `unifiedpush`
    prettyName: 'Push Notification Service',
    gaStatus: 'GA',
    primaryTask: 'Mobile Push Messaging',
    description: 'Provides messaging services for Android and iOS.'
  },
  'user-rhsso': {
    prettyName: 'Single sign-on',
    gaStatus: 'GA',
    primaryTask: 'Protect customer applications',
    description: "Easily add identity and authentication to protect your customers’ applications and services."
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
