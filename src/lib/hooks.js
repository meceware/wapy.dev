import { useRef } from 'react';

export const useThrottle = () => {
  const ref = useRef();

  const throttle = (callback, interval) => {
    if (ref.current) return;

    ref.current = true;
    setTimeout(() => {
      callback();
      ref.current = false;
    }, interval);
  }

  return throttle;
}
