// -------------------
// Units
// -------------------

export enum CoinUnits {
  SMH = 'SMH',
  Smidge = 'Smidge',
}

export const toSMH = (smidge: bigint): string => {
  const rounded = smidge / BigInt(10) ** BigInt(5);
  const float = parseFloat(rounded.toString()) / 10 ** 4;
  const [integer, fractional] = float.toFixed(4).split('.');
  if (!integer || !fractional) {
    throw new Error(`Cannot convert ${String(smidge)} into SMH`);
  }
  const hasFractional = fractional !== '0000';
  return hasFractional ? `${integer}.${fractional.slice(0, 3)}` : integer;
};

export const toSmidge = (smh: number): string =>
  String(Math.round(smh * 10 ** 9));

const packValueAndUnit = (value: string, unit: CoinUnits) => ({
  value,
  unit,
});

export const parseSmidge = (a: bigint | string | number) => {
  const amount = BigInt(a);
  const absAmount = amount < BigInt(0) ? -amount : amount;
  // If amount is "falsy" (0 | undefined | null)
  if (amount === BigInt(0)) return packValueAndUnit('0', CoinUnits.SMH);
  // Show `23.053 SMH` for amounts close to 1 SMH or greater
  if (absAmount >= BigInt(10) ** BigInt(6)) {
    return packValueAndUnit(toSMH(amount), CoinUnits.SMH);
  }
  // Or `6739412 Smidge` (without dot) for small amount
  if (!Number.isNaN(Number(amount)))
    return packValueAndUnit(String(amount), CoinUnits.Smidge);
  // Show `0 SMH` for zero amount and NaN
  return packValueAndUnit('0', CoinUnits.SMH);
};

export const formatSmidge = (amount: bigint | string | number): string => {
  const { value, unit } = parseSmidge(amount);
  return `${value} ${unit}`;
};
