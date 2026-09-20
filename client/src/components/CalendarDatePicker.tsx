import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react';

export interface DateRangeSelection {
  startDate: Date;
  endDate: Date;
  formattedRange: string;
  daysCount: number;
}

interface CalendarDatePickerProps {
  initialStartDate?: Date;
  initialEndDate?: Date;
  onChange: (selection: DateRangeSelection) => void;
  className?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Helpers for date calculations
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isBetweenDays(target: Date, start: Date, end: Date): boolean {
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return t > s && t < e;
}

function formatDisplayDate(d: Date): string {
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()].slice(0, 3);
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatRangeString(start: Date, end: Date): string {
  const startDay = start.getDate();
  const startMonth = MONTH_NAMES[start.getMonth()].slice(0, 3);
  const startYear = start.getFullYear();

  const endDay = end.getDate();
  const endMonth = MONTH_NAMES[end.getMonth()].slice(0, 3);
  const endYear = end.getFullYear();

  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay} – ${endDay} ${startMonth} ${startYear}`;
  }
  if (startYear === endYear) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }
  return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
}

export function calculateDaysCount(start: Date, end: Date): number {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  const diffTime = Math.abs(e - s);
  return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
}

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  initialStartDate,
  initialEndDate,
  onChange,
  className = '',
}) => {
  // Default to a realistic upcoming travel window: e.g. next month 12th to 16th
  const now = new Date();
  const defaultStart =
    initialStartDate || new Date(now.getFullYear(), now.getMonth() + 1, 12);
  const defaultEnd =
    initialEndDate || new Date(now.getFullYear(), now.getMonth() + 1, 16);

  const [startDate, setStartDate] = useState<Date>(defaultStart);
  const [endDate, setEndDate] = useState<Date | null>(defaultEnd);
  const [currentViewMonth, setCurrentViewMonth] = useState<number>(defaultStart.getMonth());
  const [currentViewYear, setCurrentViewYear] = useState<number>(defaultStart.getFullYear());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Month navigation
  const prevMonth = () => {
    if (currentViewMonth === 0) {
      setCurrentViewMonth(11);
      setCurrentViewYear((prev) => prev - 1);
    } else {
      setCurrentViewMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentViewMonth === 11) {
      setCurrentViewMonth(0);
      setCurrentViewYear((prev) => prev + 1);
    } else {
      setCurrentViewMonth((prev) => prev + 1);
    }
  };

  // Generate calendar days
  const daysInMonth = new Date(currentViewYear, currentViewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentViewYear, currentViewMonth, 1).getDay();

  const handleDateClick = (dayNum: number) => {
    const clicked = new Date(currentViewYear, currentViewMonth, dayNum);

    if (!endDate && startDate) {
      // We are in selection mode for end date
      if (clicked < startDate) {
        // Clicked before start: make this the new start date
        setStartDate(clicked);
        setEndDate(null);
      } else {
        // Set end date and propagate
        setEndDate(clicked);
        const days = calculateDaysCount(startDate, clicked);
        onChange({
          startDate,
          endDate: clicked,
          formattedRange: formatRangeString(startDate, clicked),
          daysCount: days,
        });
      }
    } else {
      // Start a fresh range selection
      setStartDate(clicked);
      setEndDate(null);
    }
  };

  // Quick Preset Handlers
  const applyPreset = (days: number) => {
    const base = new Date();
    // Start next weekend or in 7 days
    const start = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 7);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + (days - 1));

    setStartDate(start);
    setEndDate(end);
    setCurrentViewMonth(start.getMonth());
    setCurrentViewYear(start.getFullYear());

    onChange({
      startDate: start,
      endDate: end,
      formattedRange: formatRangeString(start, end),
      daysCount: days,
    });
  };

  const totalDays = endDate ? calculateDaysCount(startDate, endDate) : 1;

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 ${className}`}
    >
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {MONTH_NAMES[currentViewMonth]} {currentViewYear}
            </h4>
            <span className="text-[11px] text-slate-500">Select trip start & end dates</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick presets pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
        <span className="text-slate-400 text-[11px] font-medium mr-1">Quick pick:</span>
        <button
          type="button"
          onClick={() => applyPreset(3)}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 font-semibold transition-colors cursor-pointer text-[11px]"
        >
          Weekend (3 Days)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(5)}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 font-semibold transition-colors cursor-pointer text-[11px]"
        >
          Getaway (5 Days)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(7)}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 font-semibold transition-colors cursor-pointer text-[11px]"
        >
          1 Week (7 Days)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(10)}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 font-semibold transition-colors cursor-pointer text-[11px]"
        >
          Extended (10 Days)
        </button>
      </div>

      {/* Weekday Row */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_LABELS.map((day, idx) => (
          <div
            key={day}
            className={`text-[11px] font-bold py-1 ${
              idx === 0 || idx === 6 ? 'text-orange-600' : 'text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Empty slots for start of month */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8.5 sm:h-9" />
        ))}

        {/* Month Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const currentCellDate = new Date(currentViewYear, currentViewMonth, dayNum);

          const isStart = startDate && isSameDay(currentCellDate, startDate);
          const isEnd = endDate && isSameDay(currentCellDate, endDate);
          const isInRange =
            startDate &&
            endDate &&
            isBetweenDays(currentCellDate, startDate, endDate);
          const isToday = isSameDay(currentCellDate, new Date());

          return (
            <button
              key={`day-${dayNum}`}
              type="button"
              onClick={() => handleDateClick(dayNum)}
              onMouseEnter={() => setHoverDate(currentCellDate)}
              className={`h-8.5 sm:h-9 w-full rounded-lg text-xs font-semibold flex items-center justify-center transition-all relative cursor-pointer ${
                isStart || isEnd
                  ? 'bg-orange-600 text-white font-bold shadow-xs scale-102 z-10'
                  : isInRange
                  ? 'bg-orange-50 text-orange-950 rounded-none'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{dayNum}</span>
              {isToday && !isStart && !isEnd && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 bg-slate-50/60 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3 sm:px-4 rounded-b-2xl">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-800">
            {formatRangeString(startDate, endDate || startDate)}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px]">
            {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          {!endDate ? (
            <span className="text-orange-600 font-semibold animate-pulse">
              Click another date to set your return date
            </span>
          ) : (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dates locked in</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
