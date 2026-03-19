import {
  useState,
  useEffect,
  RefObject,
  MutableRefObject,
  LegacyRef,
} from "react";

export default function useOverflowCheck(
  ref: MutableRefObject<HTMLDivElement | null>
) {
  const [isOverflowing, setIsOverflowing] = useState({
    horizontal: false,
    vertical: false,
  });
  const [isAtEdge, setIsAtEdge] = useState({
    isAtStartX: false,
    isAtStartY: false,
    isAtEndX: false,
    isAtEndY: false,
  });
  const [toggleRecalc, setToggleRecalc] = useState(false);

  function scrollToStart(left = 0, top = 0) {
    if (ref.current) {
      const element = ref.current;
      element.scrollTo({
        left: left,
        top: top,
        behavior: "smooth",
      });
    }
  }

  function scrollToEnd() {
    if (ref.current) {
      const element = ref.current;
      element.scrollTo({
        left: element.scrollWidth,
        top: element.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  function isAtBeginningX(ref: any, offSetx = 50) {
    if (ref.current) {
      const element = ref.current;
      return element.scrollLeft <= 0 + offSetx;
    }
    return false;
  }
  function isAtBeginningY(ref: any, offSetY = 0) {
    if (ref.current) {
      const element = ref.current;
      return element.scrollTop === 0 + offSetY;
    }
    return false;
  }

  function isAtEndingX(ref: any, offsetX = 50) {
    if (ref?.current) {
      const element = ref.current;
      return (
        element.scrollLeft + element.clientWidth >=
        element.scrollWidth - offsetX
      );
    }
    return false;
  }

  function isAtEndingY(ref: any, offSetY = 0) {
    if (ref?.current) {
      const element = ref.current;
      return (
        element.scrollTop + element.clientHeight ===
        element.scrollHeight - offSetY
      );
    }
    return false;
  }

  function recalculate() {
    setToggleRecalc((val) => !val);
  }

  useEffect(() => {
    const element = ref?.current;
    function checkOverflow() {
      if (ref?.current) {
        const element = ref?.current;
        const isOverflowingHorizontally =
          element.scrollWidth > element.clientWidth;
        const isOverflowingVertically =
          element.scrollHeight > element.clientHeight;
        setIsOverflowing({
          horizontal: isOverflowingHorizontally,
          vertical: isOverflowingVertically,
        });
      }
    }

    function checkIsAtStartOrAtEnd() {
      const isAtStartX = isAtBeginningX(ref);
      const isAtStartY = isAtBeginningY(ref);
      const isAtEndX = isAtEndingX(ref);
      const isAtEndY = isAtEndingY(ref);

      setIsAtEdge({ isAtStartX, isAtEndX: isAtEndX, isAtEndY, isAtStartY });
    }

    checkOverflow();
    checkIsAtStartOrAtEnd();

    // Re-run the check on resize
    window.addEventListener("resize", checkOverflow);
    window.addEventListener("resize", checkIsAtStartOrAtEnd);
    element?.addEventListener("scroll", checkIsAtStartOrAtEnd);

    return () => {
      window.removeEventListener("resize", checkOverflow);
      window.removeEventListener("resize", checkIsAtStartOrAtEnd);
      element?.removeEventListener("scroll", checkIsAtStartOrAtEnd);
    };
  }, [ref, toggleRecalc]);

  return { isOverflowing, scrollToEnd, scrollToStart, isAtEdge, recalculate };
}
