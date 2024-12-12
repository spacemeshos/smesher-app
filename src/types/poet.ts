export type PoETURL = string;

export type PoETConfig = {
  phaseShift: number;
  cycleGap: number;
};

export type PoETState = {
  poets: PoETURL[];
  config: PoETConfig;
};
