import CongratulationsPage from './pages/congratulations/congratulations';
import LandingPage from './pages/landing/landingPage';
import TutorialPage from './pages/tutorial/tutorial';
import TaskPage from './pages/tutorial/task/task';
import OAuthPage from './pages/oauth/oauth';
import SettingsPage from './pages/settings/settings';
import ErrorPage from './pages/error/error';

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
    title: 'Landing',
    to: '/home',
    redirect: true,
    component: LandingPage,
    exact: true
  },
  {
    iconClass: 'pficon pficon-orders',
    title: 'Settings',
    to: '/settings',
    component: SettingsPage,
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
  },
  {
    iconClass: 'pficon pficon-orders',
    title: 'Congratulations',
    to: '/congratulations/:id',
    component: CongratulationsPage,
    exact: false
  },
  {
    iconClass: 'pficon pficon-orders',
    title: 'Page Not Found',
    to: '*',
    component: ErrorPage,
    exact: false
  }
];

export { routes as default, baseName, routes };
