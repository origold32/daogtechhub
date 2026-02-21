export const debounce = <T extends Function>(func: T, delayInMs: number): ((...args: any[]) => void) => {
  console.log("Beboounced called");
  let timeoutId: number;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(func, delayInMs, ...args);
  };
};
