import HomePage from './pages/home/home';
import HelpPage from './pages/help/help';

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
    title: 'Home',
    to: '/home',
    redirect: true,
    component: HomePage,
    exact: true
  },
  {
    iconClass: 'pficon pficon-orders',
    title: 'Help',
    to: '/help',
    component: HelpPage,
    exact: true
  }
];

export { routes as default, baseName, routes };
