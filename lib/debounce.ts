export const debounce = <T extends Function>(func: T, delayInMs: number): ((...args: any[]) => void) => {
  let timeoutId: number;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(func, delayInMs, ...args);
  };
};
