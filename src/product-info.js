// This file needs to live inside src to be importable
export default {
  'amq-online-standard': {
    prettyName: 'Red Hat AMQ Online',
    gaStatus: 'GA'
  },
  fuse: {
    prettyName: 'Red Hat Fuse Online',
    gaStatus: 'GA',
    // Don't show the fuse instance only intended for walkthroughs
    // in the installed apps list
    hidden: true
  },
  'fuse-managed': {
    prettyName: 'Red Hat Fuse Online (Shared)',
    gaStatus: 'GA'
  },
  codeready: {
    prettyName: 'Red Hat CodeReady Workspaces',
    gaStatus: 'GA'
  },
  launcher: {
    prettyName: 'Red Hat Developer Launcher',
    gaStatus: 'community'
  },
  '3scale': {
    prettyName: 'Red Hat 3scale API Management Platform',
    gaStatus: 'GA'
  },
  apicurio: {
    prettyName: 'Apicurito',
    gaStatus: 'GA'
  }
};
