import cookies from 'js-cookie';
import serviceConfig from '../config';

describe('ServiceConfig', () => {
  it('should export a default services config', () => {
    expect(serviceConfig).toBeDefined();

    cookies.set(process.env.REACT_APP_AUTH_TOKEN, 'spoof');

    const configObject = serviceConfig(
      {
        method: 'post',
        timeout: 3
      },
      true
    );

    expect(configObject.method).toEqual('post');
    expect(configObject.timeout).toEqual(3);
    expect(configObject.headers[process.env.REACT_APP_AUTH_HEADER]).toContain('spoof');
  });

  it('should export a default services config without authorization', () => {
    const configObject = serviceConfig({}, false);

    expect(configObject.headers[process.env.REACT_APP_AUTH_HEADER]).toBeUndefined();
  });
});
