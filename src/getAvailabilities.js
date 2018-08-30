import moment from "moment";
import knex from "knexClient";

const getEvents = (queryDate) => knex
  .select("kind", "starts_at", "ends_at", "weekly_recurring")
  .from("events")
  .orderBy('starts_at', 'asc')
  .where(function() {
    this.where("weekly_recurring", true).orWhere("ends_at", ">", +queryDate);
  });

const getHours = (event) => {
  const date = moment(event.starts_at).subtract(30, 'minutes');
  const hours = [];
  while (date.add(30, "minutes").isBefore(event.ends_at)) {
    hours.push(date.format("H:mm"));
  }

  return hours;
}

const getDaysWithEvents = async (queryDate, daysFromDate) => {
  const events = await getEvents(queryDate);

  const daysWithEvents = events.reduce((collector, event) => {
    const eventDate = moment(event.starts_at);
    const weeksToSkip = moment(queryDate).diff(eventDate, 'weeks');
    const hoursInterval = getHours(event);
    const eventDates = [eventDate.format("D-MM-YYYY")];

    if (event.weekly_recurring) {
      eventDate.add(weeksToSkip, 'week');
      let weeksCount = Math.ceil(daysFromDate / 7);
      while (weeksCount > 0) {
        eventDates.push(eventDate.add(1, "weeks").format("D-MM-YYYY"));
        weeksCount -= 1;
      }
    }

    const eventsOnDates = eventDates.reduce((col, date) => {
      const eventsOnDate = collector[date] || {};

      return {
        ...col,
        [date]: { 
          ...eventsOnDate,  
          [event.kind]: eventsOnDate[event.kind] ? [
            ...eventsOnDate[event.kind],
            ...hoursInterval,
          ] : hoursInterval,
        },
      };
    }, {});

    return {
      ...collector,
      ...eventsOnDates,
    }
  }, {});

  return daysWithEvents;
}

export default async function getAvailabilities(queryDate, daysFromDate = 7) {
  const availabilities = new Map();

  const tmpDate = moment(queryDate);
  for (let i = 0; i < daysFromDate; ++i) {
    availabilities.set(tmpDate.format("D-MM-YYYY"), {
      date: tmpDate.toDate(),
      slots: []
    });
    tmpDate.add(1, "days");
  }

  const daysWithEvents = await getDaysWithEvents(queryDate, daysFromDate);

  Object.keys(daysWithEvents).forEach(day => {
    const availabilityDay = availabilities.get(day);
    const { opening = [], appointment = [] } = daysWithEvents[day];
    const availableHours = opening.filter(hour => appointment.indexOf(hour) === -1);

    if (!availabilityDay) return null;

    availabilityDay.slots = [...availabilityDay.slots, ...availableHours];
  });

  return Array.from(availabilities.values())
}
