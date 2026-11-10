import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import ActivitiesSelector from "@/components/activities/ActivitiesSelector";
import WorkplaceSelect, { WorkplaceValue } from "@/components/WorkplaceSelect";
import DatePicker from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TraineeTypeService } from "@/services/trainee-types.service";
import { Activity } from "@/types";

const academicYear = () => {
  const now = new Date();
  const startYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    startDate: new Date(`${startYear}-09-01`),
    endDate: new Date(`${startYear + 1}-06-30`),
  };
};

export interface ReportFiltersState {
  activities: Activity[];
  isDate: boolean;
  startDate: Date;
  endDate: Date;
  traineeTypeId: string; // "all" or id
  workplace: WorkplaceValue;
  includeSub: boolean;
}

const toDay = (d: Date) => format(d, "yyyy-MM-dd");
const fromDay = (s: string | null, fallback: Date) => {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return fallback;
  const d = new Date(`${s}T00:00:00`);
  return isNaN(d.getTime()) ? fallback : d;
};

/** URL keys used by the report filters */
const KEYS = {
  activities: "activities", // JSON [{id,title}]
  period: "period", // "1" | "0"
  from: "from",
  to: "to",
  traineeType: "traineeType",
  workplaceId: "workplaceId",
  workplaceName: "workplaceName",
  sub: "sub", // "0" = without sub offices
};

/**
 * Report filters kept in the page URL: they survive going back to the page
 * and the link can be shared / bookmarked with the same report.
 * `defaultPeriod`: filter by the current academic year when the URL says nothing.
 */
export const useReportFilters = (options: { defaultPeriod?: boolean } = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const year = academicYear();

  const filters = useMemo<ReportFiltersState>(() => {
    let activities: Activity[] = [];
    try {
      const raw = searchParams.get(KEYS.activities);
      if (raw) {
        activities = (JSON.parse(raw) as { id: number; title: string }[])
          .filter((a) => a && Number(a.id))
          .map((a) => ({ id: Number(a.id), title: String(a.title ?? "") }) as Activity);
      }
    } catch {
      activities = [];
    }
    const period = searchParams.get(KEYS.period);
    const workplaceId = Number(searchParams.get(KEYS.workplaceId)) || null;
    return {
      activities,
      isDate: period === null ? !!options.defaultPeriod : period === "1",
      startDate: fromDay(searchParams.get(KEYS.from), year.startDate),
      endDate: fromDay(searchParams.get(KEYS.to), year.endDate),
      traineeTypeId: searchParams.get(KEYS.traineeType) || "all",
      workplace: {
        workplaceId,
        name: workplaceId ? searchParams.get(KEYS.workplaceName) || "" : "",
      },
      includeSub: searchParams.get(KEYS.sub) !== "0",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, options.defaultPeriod]);

  const update = (patch: Partial<ReportFiltersState>) => {
    const f = { ...filters, ...patch };
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const set = (key: string, value: string | null) =>
          value === null || value === "" ? next.delete(key) : next.set(key, value);
        set(
          KEYS.activities,
          f.activities.length
            ? JSON.stringify(f.activities.map((a) => ({ id: a.id, title: a.title })))
            : null,
        );
        set(KEYS.period, f.isDate === !!options.defaultPeriod ? null : f.isDate ? "1" : "0");
        set(KEYS.from, f.isDate ? toDay(f.startDate) : null);
        set(KEYS.to, f.isDate ? toDay(f.endDate) : null);
        set(KEYS.traineeType, f.traineeTypeId === "all" ? null : f.traineeTypeId);
        set(KEYS.workplaceId, f.workplace.workplaceId ? String(f.workplace.workplaceId) : null);
        set(KEYS.workplaceName, f.workplace.workplaceId ? f.workplace.name : null);
        set(KEYS.sub, f.includeSub ? null : "0");
        return next;
      },
      { replace: true },
    );
  };
  return { filters, update };
};

/** a single report option kept in the URL (e.g. a tab of the report) */
export const useUrlParam = <T extends string>(key: string, fallback: T) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = (searchParams.get(key) as T | null) ?? fallback;
  const setValue = (v: T) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (v === fallback) next.delete(key);
        else next.set(key, v);
        return next;
      },
      { replace: true },
    );
  return [value, setValue] as const;
};

/** query string params for the backend from the filters */
export const filtersToParams = (
  f: ReportFiltersState,
  options: { workplace?: boolean } = { workplace: true },
) => {
  const params = new URLSearchParams();
  if (f.activities.length)
    params.set("activityIds", f.activities.map((a) => a.id).join(","));
  if (f.isDate) {
    params.set("startDate", format(f.startDate, "yyyy-MM-dd"));
    params.set("endDate", format(f.endDate, "yyyy-MM-dd"));
  }
  if (f.traineeTypeId !== "all") params.set("traineeTypeId", f.traineeTypeId);
  if (options.workplace && f.workplace.workplaceId) {
    params.set("workplaceId", String(f.workplace.workplaceId));
    if (f.includeSub) params.set("includeSub", "true");
  }
  return params;
};

/** human readable description of the filters (for print / Excel headers) */
export const describeFilters = (
  f: ReportFiltersState,
  traineeTypeName?: string,
  options: { workplace?: boolean } = { workplace: true },
) =>
  [
    f.activities.length
      ? `الأنشطة: ${f.activities.map((a) => a.title).join("، ")}`
      : "",
    f.isDate
      ? `الفترة: من ${format(f.startDate, "dd-MM-yyyy")} إلى ${format(
          f.endDate,
          "dd-MM-yyyy",
        )}`
      : "",
    traineeTypeName ? `النوع: ${traineeTypeName}` : "",
    options.workplace && f.workplace.name
      ? `جهة العمل: ${f.workplace.name}${f.includeSub ? " (مع الجهات الفرعية)" : ""}`
      : "",
  ].filter(Boolean);

export const useTraineeTypes = () =>
  useQuery({
    queryKey: ["trainee-types"],
    queryFn: TraineeTypeService.getTraineeTypes,
  });

interface Props {
  filters: ReportFiltersState;
  update: (patch: Partial<ReportFiltersState>) => void;
  showWorkplace?: boolean;
  activitiesPlaceholder?: string;
}

export default function ReportFilters({
  filters,
  update,
  showWorkplace = true,
  activitiesPlaceholder = "كل الأنشطة",
}: Props) {
  const { data: types } = useTraineeTypes();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        {filters.activities.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            title="إلغاء تحديد الأنشطة"
            onClick={() => update({ activities: [] })}
          >
            <RotateCcw />
          </Button>
        )}
        <ActivitiesSelector
          selectedActivities={filters.activities}
          setSelectedActivities={(value) =>
            update({
              activities:
                typeof value === "function" ? value(filters.activities) : value,
            })
          }
        >
          <Button variant="outline">
            {filters.activities.length
              ? `${filters.activities.length} نشاط/أنشطة`
              : activitiesPlaceholder}
          </Button>
        </ActivitiesSelector>
      </div>

      <Select
        dir="rtl"
        value={filters.traineeTypeId}
        onValueChange={(v) => update({ traineeTypeId: v })}
      >
        <SelectTrigger dir="rtl" className="w-40">
          <SelectValue placeholder="النوع" />
        </SelectTrigger>
        <SelectContent dir="rtl">
          <SelectGroup>
            <SelectLabel>النوع</SelectLabel>
            <SelectItem value="all">كل الأنواع</SelectItem>
            {types?.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {showWorkplace && (
        <div className="flex items-center gap-2">
          <div className="w-64">
            <WorkplaceSelect
              value={filters.workplace}
              onChange={(workplace) => update({ workplace })}
              placeholder="كل جهات العمل"
            />
          </div>
          {filters.workplace.workplaceId && (
            <label className="flex items-center gap-1 text-sm whitespace-nowrap">
              <Checkbox
                checked={filters.includeSub}
                onCheckedChange={(c) => update({ includeSub: !!c })}
              />
              مع الفرعية
            </label>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-sm whitespace-nowrap">
          <Checkbox
            checked={filters.isDate}
            onCheckedChange={(c) => update({ isDate: !!c })}
          />
          تصفية حسب التاريخ
        </label>
        {filters.isDate && (
          <>
            <DatePicker
              title="من"
              date={filters.startDate}
              setDate={(startDate) => update({ startDate })}
            />
            <DatePicker
              title="إلى"
              date={filters.endDate}
              setDate={(endDate) => update({ endDate })}
            />
          </>
        )}
      </div>
    </div>
  );
}
