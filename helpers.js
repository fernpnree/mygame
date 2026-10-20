import { createState, createAnimal } from '../js/state.js';

export const T0 = new Date(2026, 9, 19, 9, 0, 0).getTime();
export const MIN = 60_000;
export const HOUR = 60 * MIN;

// rng ที่คืนค่าตามลำดับที่กำหนด (วนซ้ำเมื่อหมด)
export function seq(...values) {
  let i = 0;
  return () => values[i++ % values.length];
}

export function newState(overrides = {}) {
  const s = createState(T0);
  Object.assign(s, overrides);
  return s;
}

export function withAnimals(state, ...ids) {
  for (const id of ids) state.animals.push(createAnimal(id));
  return state;
}
