"use client";

import { useState, useEffect } from "react";
import { TextInput } from "flowbite-react";
import { useTranslations } from "use-intl";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const t = useTranslations("home");

  // debounce 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // call search khi debouncedQuery thay đổi
  useEffect(() => {
    if (debouncedQuery.trim() !== "") {
      console.log("Searching:", debouncedQuery);
      // chỗ này bà gọi API search luôn
    }
  }, [debouncedQuery]);

  return (
    <div className="flex gap-2 items-center w-full min-w-[280px]">
      <TextInput
        type="text"
        placeholder={t("typeToSearch")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />
    </div>
  );
};

export default SearchBar;
