import HelpPage from './pages/help/help';
import LandingPage from './pages/landing/landingPage';
import TutorialPage from './pages/tutorial/tutorial';
import ModulePage from './pages/tutorial/module/module';

/**
 * Return the application base directory.
 * @type {string}
 */
const baseName = '/';

/**
 * Return array of objects that describe navigation and views.
 * @return {array}
 */
const routes = () => [
  {
    iconClass: 'pficon pficon-orders',
    title: 'Landing',
    to: '/',
    redirect: true,
    component: LandingPage,
    exact: true
  },
  {
    iconClass: 'pficon pficon-orders',
    title: 'Help',
    to: '/help',
    component: HelpPage,
    exact: true
  },
  {
    iconClass: 'pficon pficon-orders',
    title: 'Learn More',
    to: '/tutorial/:id',
    component: TutorialPage,
    exact: true
  },
  {
    iconClass: 'pficon pficon-orders',
    title: 'Get Started',
    to: '/tutorial/:id/module/:module/:step?',
    component: ModulePage,
    exact: false
  }
];

export { routes as default, baseName, routes };
