
"use client"
import ScrollToTop from "react-scroll-up";
import { ArrowUp } from "lucide-react";
import { Button } from "./ui/button";

export const ScrollUp = () => {
  return (
    <ScrollToTop showUnder={160}>
      <Button className="bg-secondary p-2">
        <ArrowUp className="w-4 h-4" />
      </Button>
    </ScrollToTop>
  );
};
