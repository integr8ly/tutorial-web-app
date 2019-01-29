import * as React from 'react';
import { Link } from 'react-router-dom';
import homePageDefault from '../../img/HomePageDefault.png';

const StaticLandingPage = () => (
  <Link to="/tutorial/0">
    <img style={{ maxWidth: '100%', height: 'auto', width: 'auto' }} src={homePageDefault} alt="static home page" />
  </Link>
);

export default StaticLandingPage;
