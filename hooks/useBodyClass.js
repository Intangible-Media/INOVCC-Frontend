// hooks/useBodyClass.js
import { useEffect } from "react";

const useBodyClass = (className, condition = true) => {
  useEffect(() => {
    if (condition) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    return () => {
      document.body.classList.remove(className);
    };
  }, [className, condition]);
};

export default useBodyClass;
