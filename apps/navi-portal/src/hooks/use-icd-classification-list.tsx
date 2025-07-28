import { useState, useEffect, useRef, useCallback } from "react";
import { debounce } from "@/lib/utils";

const ICD_10_CLASSIFICATION_ENDPOINT = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search`;

interface ICDOption {
  value: string;
  label: string;
  code: string;
  name: string;
}

export const useICDClassificationList = (questionId: string) => {
  const [options, setOptions] = useState<Array<ICDOption>>(() => {
    if (typeof window !== "undefined") {
      const savedOptions = localStorage.getItem(`icdOptions-${questionId}`);
      return savedOptions ? JSON.parse(savedOptions) : [];
    }
    return [];
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const fetchICDCodes = async (terms: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL(ICD_10_CLASSIFICATION_ENDPOINT);
      url.searchParams.append("terms", terms);
      url.searchParams.append("sf", "code,name");
      url.searchParams.append("df", "code,name");
      url.searchParams.append("maxList", "10");

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const [, , , displayStrings] = data;

      const icdOptions: Array<ICDOption> = displayStrings.map(
        ([code, name]: [string, string]) => ({
          value: `${code}|${name}`,
          label: `${code} - ${name}`,
          code,
          name,
        })
      );

      setOptions(icdOptions);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          `icdOptions-${questionId}`,
          JSON.stringify(icdOptions)
        );
      }
    } catch (err) {
      console.error("Failed to fetch ICD-10 codes:", err);
      setError("Failed to fetch ICD-10 codes");
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchICDCodesRef = useRef(
    debounce((terms: string) => {
      fetchICDCodes(terms);
    }, 300)
  );

  useEffect(() => {
    const ref = debouncedFetchICDCodesRef.current;
    if (searchValue.length > 1) {
      ref(searchValue);
    } else {
      setOptions([]);
    }

    return () => {
      // Cancel any pending debounced calls when component unmounts or searchValue changes
      clearTimeout(ref as unknown as number);
    };
  }, [searchValue]);

  const onIcdClassificationSearchChange = useCallback(
    (val: string) => {
      setSearchValue(val);
      if (typeof window !== "undefined") {
        localStorage.setItem(`icdSearchValue-${questionId}`, val);
      }
    },
    [questionId]
  );

  return {
    options,
    loading,
    error,
    searchValue,
    onIcdClassificationSearchChange,
  };
};
