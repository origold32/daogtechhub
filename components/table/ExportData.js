import React, { useEffect, useState } from "react";
import DateRangePicker from "rsuite/DateRangePicker";
import { Menu } from "@headlessui/react";
import { usePopper } from "react-popper";
import { createPortal } from "react-dom";
import Button from "../form-elements/Button";

const ExportData = ({
  isOpen,
  setIsOpen = () => {},
  onSelectRange = () => {},
  children,
}) => {
  console.log("is open", isOpen);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-end",
    // strategy: "fixed",
    modifiers: [{ name: "arrow", options: { element: arrowElement } }],
  });

  useEffect(() => {
    const handleClickAway = function (event) {
      // var targetElement = popperElement;
      var targetElement = document.getElementById("targetElement");
      console.log("is open", isOpen, popperElement, targetElement);

      // Check if the clicked element is outside the target element
      if (targetElement && !targetElement.contains(event.target)) {
        // Clicked outside the target element
        console.log("Clicked outside the target element");
        // setIsOpen(false);
      }
    };
    var targetElement = document.getElementById("targetElement");
    console.log("target element", targetElement);
    document.addEventListener("click", handleClickAway);

    return () => {
      document.removeEventListener("click", handleClickAway);
    };
  }, [isOpen, popperElement]);
  return (
    <div id="targetElement">
      <div ref={setReferenceElement}>{children}</div>
      {isOpen ? (
        <>
          {createPortal(
            <div
              className={
                "relative p-4 shadow  flex flex-col text-left z-10 bg-white rounded-lg"
              }
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
            >
              <div ref={setArrowElement} style={styles.arrow} />
              <button className="p-2 text-left">
                <DateRangePicker
                  placement="bottomEnd"
                  onChange={(range) => {
                    console.log("date range is", range);
                    onSelectRange(range);
                  }}
                />
              </button>
              <Button
                onClick={() => {
                  onSelectRange();
                }}
                className="p-2 text-left mt-1"
              >
                Export All
              </Button>
            </div>,
            document.querySelector("#p-1")
          )}
        </>
      ) : null}
    </div>
  );
};

export default ExportData;
