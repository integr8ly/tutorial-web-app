import * as services from '..';

describe('Services', () => {
  it('should have specific methods and classes', () => {
    expect(services.serviceConfig).toBeDefined();
    expect(services.userServices).toBeDefined();
  });
});
