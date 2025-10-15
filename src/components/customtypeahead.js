"use client";

import {
  Combobox,
  Box,
  Portal,
  useListCollection,
  InputGroup
} from "@chakra-ui/react";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDebounce } from "use-debounce";
import airportsData from "./airports";

const CustomTypeahead = ({
  id,
  placeholder,
  onCodeSelect,
  error,
  initialQuery,
  icon
}) => {
  const [inputValue, setInputValue] = useState("");
  const [initialQueryUsed, setInitialQueryUsed] = useState(false);
  const [debouncedQuery] = useDebounce(inputValue, 300);
  const airports = useMemo(() => airportsData, []);
  const { collection, set } = useListCollection({
    initialItems: airports.map((item) => ({
      code: item.iata.trim(),
      value: item.iata.trim(),
      city: item.city.trim(),
      name: item.name.trim(),
      country: item.country.trim(),
    })),
    itemToString: (item) => `${item.code} - ${item.city}${item.name ? ` (${item.name})` : ""} ${item.country}`,
    itemToValue: (item) => item.iata?.toString(),
    limit: 5,
  })

   const handleInputChange = useCallback((e) => {
      const query = e.toLowerCase();
      const filteredItems = airports
      .filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.city.toLowerCase().includes(query) ||
          item.iata.toLowerCase().includes(query)
      )
      .slice(0, 50)
      .map((item) => ({
        code: item.iata.trim(),
        value: item.iata.trim(),
        city: item.city.trim(),
        name: item.name.trim(),
        country: item.country.trim(),
      }));

      set(filteredItems)

      if (initialQuery && !initialQueryUsed) {
        const matchedOption = filteredItems.find(option => 
          option.code.toLowerCase() === initialQuery.trim().toLowerCase()
        );
        //console.log("matchedOption", matchedOption);
         // Use matched option if found, otherwise fall back to first option
        const selectedOption = matchedOption ? [matchedOption] : [filteredItems[0]];
        //setSelected(selectedOption);
        if (selectedOption && onCodeSelect) {
          onCodeSelect(selectedOption[0]?.code);
          setInputValue(`${selectedOption[0]?.code} - ${selectedOption[0]?.city}${selectedOption[0]?.name ? ` (${selectedOption[0]?.name})` : ""} ${selectedOption[0]?.country}`);
          set(selectedOption);
        }
        setInitialQueryUsed(true);
    }
    }, [set, initialQuery, airports, initialQueryUsed, onCodeSelect]);


  // Handle initial query (if passed in props)
  	useEffect(() => {
		if (initialQuery && !initialQueryUsed){
			handleInputChange(initialQuery);
		}
	}, [initialQuery, handleInputChange, initialQueryUsed]);


  return (
    <Combobox.Root
      collection={collection}
      onChange={(e) => { 
        handleInputChange(e.target.value);
        setInitialQueryUsed(true); // Mark as used once the user types
      }}
      placeholder={placeholder}
      onSelect={(value) => {
        console.log(value.itemValue);
        const selected = collection.items.find((opt) => opt.code === value.itemValue);
        console.log("selected", selected);
        if (selected) {
          onCodeSelect?.(selected.code);
        }
      }}
    >
      <Combobox.Control>
        <InputGroup startElement={icon}><Combobox.Input defaultValue={inputValue} color="black" borderColor="#9ca3af" /></InputGroup>
        <Combobox.Trigger />
      </Combobox.Control>

      <Portal>
        <Combobox.Positioner>
          <Combobox.Content 
            bg="white" 
            shadow="md"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            maxH="300px"
            overflowY="auto"
            style={{ opacity: 1 }}
          >
            {collection.items.length > 0 ? (
              collection.items.map((option, id) => (
                <Combobox.Item key={id} item={option}>
                  <Box color="black">
                    <Box as="span" fontWeight="bold">
                      {option.code}
                    </Box>{" "}
                    - {option.city}{" "}
                    {option.name && (
                      <Box as="span" fontSize="sm">
                        ({option.name})
                      </Box>
                    )}{" "}
                    {option.country}
                  </Box>
                </Combobox.Item>
              ))
            ) : (
              <Combobox.Empty>No results found</Combobox.Empty>
            )}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>

      {error && <Box color="red.500">{error.message}</Box>}
    </Combobox.Root>
  );
};

export default CustomTypeahead;
