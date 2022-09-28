import util from 'util';

util.inspect.defaultOptions.depth = 5;

export default {
  timeout: '60000',
  files: ['src/*.ava.ts'],
  failWithoutAssertions: false,
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=ts-node/esm', '--experimental-specifier-resolution=node'],
};
