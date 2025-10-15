"use client";

import React, { useEffect, useRef } from "react";
import Litepicker from "litepicker";
import { FaCalendar } from "react-icons/fa";
import { Input, InputGroup } from "@chakra-ui/react";

const DatePicker = ({
  value,
  onChange,
  placeholder,
  minDate,
  mode, // "single" or "range"
  ...rest
}) => {
  const inputRef = useRef(null);
  const pickerRef = useRef(null);

  //console.log("DatePicker value:", value);

  useEffect(() => {
    if (!inputRef.current) return;

    const isRange = mode === "range";

     if (pickerRef.current) {
        pickerRef.current.destroy();
      }

    const createPicker = () => {
      // Destroy any existing picker instance before creating a new on
      const parent = document.querySelector(".chakra-drawer__body");
      //console.log(parent);
      const newPicker = new Litepicker({
        element: inputRef.current,
        parentEl: parent,
        singleMode: mode === "single",
        format: "YYYY-MM-DD",
        autoApply: true,
        minDate: minDate || new Date(new Date().setDate(new Date().getDate() + 1)),
        numberOfMonths: 2,
        maxDays: 30,
        setup: (picker) => {
          picker.on("selected", (date1, date2) => {
            console.log("Selected date:", date1?.format("YYYY-MM-DD"));
            if (isRange) {
              const newValue = {
                start: date1?.format("YYYY-MM-DD") || null,
                end: date2?.format("YYYY-MM-DD") || null,
              };

              // Prevent infinite loop by checking for changes
              if (
                !value ||
                newValue.start !== value.start ||
                newValue.end !== value.end
              ) {
                onChange?.(newValue);
              }
            } else {
              const newValue = date1?.format("YYYY-MM-DD") || null;
              if (newValue !== value) {
                onChange?.(newValue);
              }
            }
          });
        },
        ...rest,
      });

      pickerRef.current = newPicker;

      // Sync initial and external values
      if (mode === "range" && value?.start && value?.end) {
        newPicker.setDateRange(value.start, value.end);
      } else if (mode === "single" && value) {
        newPicker.setDate(value);
      }
    };

    createPicker();

    return () => {
      pickerRef.current?.destroy();
    };

  }, [minDate, mode, onChange, rest, value]); // value is now a dependency

  return (
    <InputGroup startElement={<FaCalendar />}>
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder || (mode === "range" ? "Select date range" : "Select date")}
        readOnly
        className="litepicker-input"
        color="black"
        borderColor="#9ca3af"
      />
    </InputGroup>
  );
};



export default DatePicker;



