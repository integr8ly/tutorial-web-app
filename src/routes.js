import HelpPage from './pages/help/help';
import LandingPage from './pages/landing/landingPage';
// import StaticLandingPage from './pages/staticLanding/staticLandingPage';
import TutorialPage from './pages/tutorial/tutorial';
import TaskPage from './pages/tutorial/task/task';
import OAuthPage from './pages/oauth/oauth';

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
    to: '/tutorial/:id/task/:task/:step?',
    component: TaskPage,
    exact: false
  },
  {
    iconClass: 'pficon pficon-orders',
    title: 'Auth',
    to: '/oauth/callback',
    component: OAuthPage,
    exact: true
  }
];

export { routes as default, baseName, routes };
