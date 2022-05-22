import { useState, useEffect, useRef } from "react";

function useSession(
  localStorageKey: string,
  initValue: number
): [number, (e: number) => void] {
  const [value, setValue] = useState(
    sessionStorage.getItem(localStorageKey) ?? initValue
  );
  const firstRender = useRef(false);

  useEffect(() => {
    if (!firstRender.current) {
      firstRender.current = true;
      return;
    }
    sessionStorage.setItem(localStorageKey, value.toString());
  }, [value]);

  return [Number(value), setValue];
}

export default useSession;