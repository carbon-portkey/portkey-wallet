import { getHostName } from './index';

describe('getHostName', () => {
  it('gets hostname from url successfully', () => {
    const urls = [
      'http://www.a.com',
      'http://www.a.com/',
      'http://www.a.com/net',
      'https://www.a.com',
      'https://www.a.com:9087',
      'https://www.a.com:9087/',
    ];
    const res = ['http://www.a.com', 'https://www.a.com'];
    urls.forEach(url => expect(res).toContain(getHostName(url)));
  });
});
