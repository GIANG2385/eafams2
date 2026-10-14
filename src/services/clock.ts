/**
 * Section 5.1: Clock, Age, and Leap-Year Calculations.
 * Ensures strict F1 1.1.6 compliance (Feb 29 on non-leap years uses Feb 28).
 */

export interface DateTuple {
  y: number;
  m: number;
  d: number;
}

export const isLeap = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

export const anniversary = (dob: DateTuple, years: number): DateTuple => {
  const y = dob.y + years;
  // F1 1.1.6: born 29/02, in non-leap year threshold is 28/02.
  if (dob.m === 2 && dob.d === 29 && !isLeap(y)) {
    return { y, m: 2, d: 28 };
  }
  return { y, m: dob.m, d: dob.d };
};

export const cmp = (d1: DateTuple, d2: DateTuple): number => {
  if (d1.y !== d2.y) return d1.y - d2.y;
  if (d1.m !== d2.m) return d1.m - d2.m;
  return d1.d - d2.d;
};

export const reached = (dob: DateTuple, years: number, today: DateTuple): boolean => {
  return cmp(today, anniversary(dob, years)) >= 0;
};

export const under16 = (dob: DateTuple, today: DateTuple): boolean => {
  return !reached(dob, 16, today);
};

export const eaAgeOk = (dob: DateTuple, today: DateTuple): boolean => {
  return reached(dob, 7, today) && under16(dob, today);
};

export const parseIsoDate = (isoStr: string): DateTuple => {
  const [y, m, d] = isoStr.split('-').map(Number);
  return { y, m, d };
};

export const formatIsoDate = (d: DateTuple): string => {
  return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
};

export const addDays = (d: DateTuple, days: number): DateTuple => {
  const jsDate = new Date(Date.UTC(d.y, d.m - 1, d.d));
  jsDate.setUTCDate(jsDate.getUTCDate() + days);
  return {
    y: jsDate.getUTCFullYear(),
    m: jsDate.getUTCMonth() + 1,
    d: jsDate.getUTCDate(),
  };
};

export const calculateAge = (dob: DateTuple, today: DateTuple): number => {
  let age = today.y - dob.y;
  if (today.m < dob.m || (today.m === dob.m && today.d < dob.d)) {
    age--;
  }
  return age;
};
