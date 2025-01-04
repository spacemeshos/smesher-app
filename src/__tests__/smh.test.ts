import { formatSmidge } from '../utils/smh';

describe('formatSmidge', () => {
  const check = (input: bigint | string | number, expected: string) => {
    it(`should format ${input} as ${expected}`, () => {
      expect(formatSmidge(input)).toEqual(expected);
    });
  };

  // Numbers
  check(0, '0 SMH');
  check(1, '1 Smidge');
  check(12500, '12500 Smidge');
  check(10 ** 10, '10 SMH');
  check(10 ** 10 + 2315, '10 SMH');
  check(10 ** 10 + 231500000, '10.231 SMH');

  // Strings
  check('0', '0 SMH');
  check('1', '1 Smidge');
  check('12500', '12500 Smidge');
  check(String(10 ** 10), '10 SMH');
  check(String(10 ** 10 + 2315), '10 SMH');
  check(String(10 ** 10 + 231500000), '10.231 SMH');

  // Positive values
  check(0n, '0 SMH');
  check(1n, '1 Smidge');
  check(12500n, '12500 Smidge');
  check(10n ** 10n, '10 SMH');
  check(2681927462728471910n, '2681927462.728 SMH');

  // Negative values
  check(-0n, '0 SMH');
  check(-1n, '-1 Smidge');
  check(-12500n, '-12500 Smidge');
  check(-1n * 10n ** 10n, '-10 SMH');
  check(-2681927462728471910n, '-2681927462.728 SMH');

  // Check rounding
  check(999999999n, '0.999 SMH');
  check(1000000000n, '1 SMH');
  check(1234500000n, '1.234 SMH');
  check(1021234500000n, '1021.234 SMH');
  check(99999999n, '0.099 SMH');
  check(9999999n, '0.009 SMH');
  check(999999n, '999999 Smidge');
});
