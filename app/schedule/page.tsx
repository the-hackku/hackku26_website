import ScheduleGrid from "@/components/ScheduleGrid";
// import BeginnerWorkshops from "@/components/BeginnerWorkshops";
import { prisma } from "@/lib/prisma";
import { Event } from "@prisma/client";
import constants from "@/constants";

/**
 * Fetch events from your database
 */
async function getEvents(): Promise<Event[]> {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      description: true,
      eventType: true,
    },
  });
  return events;
}

export default async function SchedulePage() {
  const events = await getEvents();

  // Convert date fields to ISO strings (so that they are serializable on the client)
  const formattedEvents = events.map((event) => ({
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
  }));

  // Decide how to identify "beginner workshops" vs. "normal" events.
  const cutoffDate = new Date(constants.cutoffDate);

  // Filter out beginner workshops
  // const beginnerWorkshops = formattedEvents.filter(
  //   (ev) => new Date(ev.startDate) < cutoffDate
  // );

  // Filter out the rest (main schedule)
  const mainScheduleEvents = formattedEvents.filter(
    (ev) => new Date(ev.startDate) >= cutoffDate
  );

  // You could also filter by eventType, for instance:
  // const beginnerWorkshops = formattedEvents.filter(
  //   (ev) =>
  //     new Date(ev.startDate) < cutoffDate && ev.eventType === "WORKSHOPS"
  // );

  return (
    <div className="container mx-auto">
      {/* Pass only the main schedule events to the big schedule */}
      {/* <BeginnerWorkshops schedule={beginnerWorkshops} /> */}
      {/* <hr className="my-8" /> */}
      <ScheduleGrid schedule={mainScheduleEvents} />
      {/* Pass only the "beginner" events to the simpler layout */}
    </div>
  );
}
