"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Input,
  Box,
  Listbox,
  Spinner,
  Text,
  InputGroup,
} from "@chakra-ui/react";

const HotelSearchInput = React.memo(function HotelSearchInput({
  value,
  onChange,
  error,        // should be just a string now
  initialQuery, // a stable string
  icon,
  id,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 🔹 Normalize initialQuery to avoid new objects causing rerender
  const stableInitialQuery = useMemo(
    () => initialQuery?.trim() || "",
    [initialQuery]
  );

  // 🔹 Search for destination match (by dest_code)
  const fetchDestinationMatch = useCallback(
    (query) => {
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/searchhoteldestinations?request_type=search_destination&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.result) {
            const results = Array.isArray(data.result)
              ? data.result
              : [data.result];

            const exactMatch = results.find((item) => item.dest_code === query);

            if (exactMatch) {
              const item = {
                type: "destination",
                dest_code: exactMatch.dest_code,
                label: `${exactMatch.dest} (${exactMatch.dest_code}), ${exactMatch.country} - ${exactMatch.total} Hotels`,
                details: exactMatch,
              };

              setQuery(item.label);
              setSelectedItem(item);
              onChange(item.dest_code); // Update form value
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    [onChange]
  );

  // 🔹 Autofill if initialQuery (dest_code) is provided
  useEffect(() => {
    if (stableInitialQuery) {
      setLoading(true);

      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/searchhoteldestinations?request_type=search_hotel&q=${encodeURIComponent(
          stableInitialQuery
        )}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.result) {
            const results = Array.isArray(data.result)
              ? data.result
              : [data.result];

            const exactMatch = results.find(
              (item) => item.dest_code === stableInitialQuery
            );

            if (exactMatch) {
              const item = {
                type: "hotel",
                dest_code: exactMatch.dest_code,
                label: `${exactMatch.name}, ${exactMatch.dest}, ${exactMatch.country}`,
                details: exactMatch,
              };

              setQuery(item.label);
              setSelectedItem(item);
              onChange(item.dest_code);
              setLoading(false);
            } else {
              fetchDestinationMatch(stableInitialQuery);
            }
          } else {
            fetchDestinationMatch(stableInitialQuery);
          }
        })
        .catch(() => {
          fetchDestinationMatch(stableInitialQuery);
        });
    }
  }, [stableInitialQuery, onChange, fetchDestinationMatch]);

  // 🔹 Search hotels + destinations
  const fetchSearchResults = (searchQuery) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);

    Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/searchhoteldestinations?request_type=search_hotel&q=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          signal,
        }
      ).then((res) => res.json()),
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/searchhoteldestinations?request_type=search_destination&q=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          signal,
        }
      ).then((res) => res.json()),
    ])
      .then(([hotels, destinations]) => {
        if (signal.aborted) return;

        const hotelResults = (hotels?.result || []).map((hotel) => ({
          type: "hotel",
          dest_code: hotel.dest_code,
          label: `${hotel.name}, ${hotel.dest}, ${hotel.country}`,
          details: hotel,
        }));

        const destinationResults = (destinations?.result || []).map((dest) => ({
          type: "destination",
          dest_code: dest.dest_code,
          label: `${dest.dest} (${dest.dest_code}), ${dest.country} - ${dest.total} Hotels`,
          details: dest,
        }));

        setResults([...hotelResults, ...destinationResults]);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Search request failed", err);
          setLoading(false);
        }
      });

    return () => controller.abort();
  };

  // 🔹 Handle item selection
  const handleItemSelect = (item) => {
    setQuery(item.label);
    setResults([]);
    setSelectedItem(item);
    onChange(item.dest_code);
  };

  // 🔹 Handle input change
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.length >= 2) {
      fetchSearchResults(newQuery);
    } else {
      setResults([]);
    }

    if (newQuery !== selectedItem?.label) {
      setSelectedItem(null);
      onChange("");
    }
  };

  // 🔹 Handle blur event
  const handleBlur = () => {
    setTimeout(() => {
      setResults([]);
    }, 200);
  };

  return (
    <Box position="relative">
      <InputGroup
        startElement={icon}
        endElement={
          loading && (
            <Spinner size="sm" position="absolute" top="10px" right="10px" />
          )
        }
      >
        <Input
          id={id}
          placeholder="Search for hotel or destination"
          borderColor={error ? "red.500" : "gray.400"}
          color="black"
          value={query}
          onChange={handleInputChange}
          onBlur={handleBlur}
          autoComplete="off"
        />
      </InputGroup>

      {results.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          bg="white"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="md"
          mt={1}
          zIndex={10}
          maxH="200px"
          overflowY="auto"
        >
          <Listbox.Root variant="solid" spacing={1}>
            <Listbox.Content divideY="1px">
              {results.map((item, idx) => (
                <Listbox.Item
                  key={`${item.type}-${item.dest_code}-${idx}`}
                  px={3}
                  py={2}
                  item={item}
                  _hover={{ bg: "gray.100", cursor: "pointer" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleItemSelect(item);
                  }}
                >
                  <Text fontSize="sm" fontWeight="medium">
                    {item.label}
                  </Text>
                  <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                    {item.type} • {item.dest_code}
                  </Text>
                </Listbox.Item>
              ))}
            </Listbox.Content>
          </Listbox.Root>
        </Box>
      )}

      {error && (
        <Text color="red.500" fontSize="sm" mt={1}>
          {error}
        </Text>
      )}
    </Box>
  );
});

export default HotelSearchInput;
