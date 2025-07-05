"use client";

import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, CalendarSearch, Eraser, X } from "lucide-react";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const DateFilter = () => {
  const { date, setDate } = useDashboard();
  const [calendarOpen, setCalendarOpen] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [dateSelected, setDateSelected] = useState<DateRange | undefined>(
    undefined
  );

  useEffect(() => {
    if (!calendarOpen) {
      if (dateSelected?.from !== undefined && dateSelected.to !== undefined) {
        setDate(dateSelected);
      } else {
        setDate(undefined);
        setDateSelected(undefined);
        setIsFiltering(false)
      }
    }
  }, [calendarOpen, dateSelected, setDate]);

  const handleClearInputCalendar = () => {
    setCalendarOpen(false);
    setDateSelected(undefined);
    setDate(undefined);
  };

  useEffect(() => {
    if (!date) {
      setIsFiltering(false);
    }
  }, [date]);

  const onOpenFiltering = () => {
    setIsFiltering(true)
    setCalendarOpen(true)
  }

  return (
    <div className={cn("flex items-center ")}>
      {isFiltering ? (
        <div className="flex items-center relative transition">
          <Button
            onClick={handleClearInputCalendar}
            variant="default"
            className={cn(
              `absolute top-2 right-1 w-7 h-7 p-0 rounded-md`,
              !!!date && "hidden"
            )}
          >
            <Eraser className="w-5 h-4" />
          </Button>
          <span className="text-white text-sm text-right mx-2 leading-3">
            {date ? "Filtrando por:" : ""}
          </span>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild className="pr-6 hover:bg-slate-200 hover:text-zinc-800">
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "h-11 w-full justify-start text-left font-normal bg-slate-100",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <span className="font-bold">
                      {format(date.from, "dd LLLL y", {
                        locale: es,
                      })}{" "}
                      - {format(date.to, "dd LLLL y", { locale: es })}
                    </span>
                  ) : (
                    format(date.from, "dd LLLL y", { locale: es })
                  )
                ) : (
                  <span>Selecciona un rango de fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto mr-4" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateSelected ? dateSelected.to : new Date()}
                selected={dateSelected}
                onSelect={setDateSelected}
                numberOfMonths={2}
                locale={es}
                className="mr-6 me-6"
              />
            </PopoverContent>
          </Popover>
          {!date && (
            <Button
              onClick={(e) => setIsFiltering(!isFiltering)}
              variant="secondary"
              className="absolute top-3 right-0.5 w-5 h-5 m-0 p-0"
            >
              <X className="w-4 h-4 text-white" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-sm text-white">Mostrando | <span className="font-bold">todos los registros</span> </p>
          <Button
            variant="secondary"
            className="text-white bg-accent"
            onClick={() => onOpenFiltering()}
          >
            <CalendarSearch className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};
