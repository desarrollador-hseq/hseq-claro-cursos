import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

const useTabs = <T extends string>({ initialTab = "" } = {}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<T>(initialTab as T);

  useEffect(() => {
    if (!searchParams.get("tab")) {
      handleTabChange(initialTab);
    }
  }, [searchParams.get("tab"), initialTab]);

  useEffect(() => {
    setActiveTab(searchParams.get("tab") as T || initialTab as T);
  }, [searchParams.get("tab"), initialTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as T);
    if (value) {
      const url = qs.stringifyUrl(
        {
          url: pathname,
          query: { tab: value },
        },
        { skipNull: true, skipEmptyString: true }
      );
      router.replace(url);
    }
  };

  return { activeTab, handleTabChange };
};

export default useTabs;
