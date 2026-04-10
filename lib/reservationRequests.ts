import { TimeSlot } from "@prisma/client";

export const ALL_TIMESLOTS: TimeSlot[] = [
  "FRI_8_11PM",
  "FRI_11PM_2AM",
  "SAT_2_5AM",
  "SAT_5_8AM",
  "SAT_8_11AM",
  "SAT_11AM_2PM",
  "SAT_2_5PM",
  "SAT_5_8PM",
  "SAT_8_11PM",
  "SAT_11PM_2AM",
  "SUN_2_5AM",
  "SUN_5_8AM",
];

export function formatTimeSlot(slot: TimeSlot): string {
  const parts = slot.split("_");
  const day = parts[0];
  const rest = parts.slice(1).join("_");
  const dayLabel =
    day === "FRI" ? "Friday" : day === "SAT" ? "Saturday" : "Sunday";
  return `${dayLabel}: ${rest.replace(/_/g, "–").replace(/([AP]M)/g, " $1")}`;
}

