
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * A custom hook that scrolls the window to the top whenever
 * the route path changes
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant" // Using "instant" instead of "smooth" to avoid animation issues
    });
  }, [pathname]);
};
