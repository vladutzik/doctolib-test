import knex from "knexClient";
import getAvailabilities from "./getAvailabilities";

describe("getAvailabilities - custom test", () => {
  beforeEach(() => knex("events").truncate());

  describe("Testing dynamic days count, with empty schedules", () => {
    it("Testing default value, should be 7", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);
      for (let i = 0; i < 7; ++i) {
        expect(availabilities[i].slots).toEqual([]);
      }
    });

    it("Testing dynamic period, 30 days", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"), 30);
      expect(availabilities.length).toBe(30);
      for (let i = 0; i < 30; ++i) {
        expect(availabilities[i].slots).toEqual([]);
      }
    });

    it("Testing dynamic period, 40 days", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"), 40);
      expect(availabilities.length).toBe(40);
      for (let i = 0; i < 40; ++i) {
        expect(availabilities[i].slots).toEqual([]);
      }
    });

    it("Testing dynamic period, 365 days", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"), 365);
      expect(availabilities.length).toBe(365);
      for (let i = 0; i < 365; ++i) {
        expect(availabilities[i].slots).toEqual([]);
      }
    });

    it("Testing dynamic period, 1365 days", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"), 1365);
      expect(availabilities.length).toBe(1365);
      for (let i = 0; i < 1365; ++i) {
        expect(availabilities[i].slots).toEqual([]);
      }
    });
  });

  describe("Testing dynamic days count, with recuring schedules", () => {
    beforeEach(async () => {
      await knex("events").insert([{
          kind: "opening",
          starts_at: new Date("2014-08-04 09:00"),
          ends_at: new Date("2014-08-04 12:00"),
          weekly_recurring: true
        },
      ]);
    });

    const generateTest = (fromDate = "2014-08-11", amount = 7, offset = 0, debug) => {
      it(`Testing dynamic period, ${amount} days`, async () => {
        const availabilities = await getAvailabilities(new Date(fromDate), amount);

        if (debug) {
          console.log(availabilities);
        }

        expect(availabilities.length).toBe(amount);
        for (let i = offset; i < amount; i+=7) {
          if (debug) {
            console.log(i, availabilities[i]);
          }
          expect(availabilities[i].slots).toEqual([
            "9:00",
            "9:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
          ]);
        }
      });
    }

    it("Testing availabilities on a day of week", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);
      
      expect(availabilities[1].slots).toEqual([
        "9:00",
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
      ]);
    });

    generateTest(undefined, 1365);
    describe("Testing 100 days scheduling, after 4 years of recuring event", () => {
      generateTest("2018-01-12", 100, 3);
    });

    describe("Testing 200 days scheduling, after 8 years of recuring event", () => {
      generateTest("2022-01-12", 200, 5);
    });

    // if we use Math.floor for weeksCount, this one will fail
    describe("Testing an edge case, Math.floor", () => {
      for (let i = 0; i < 7; ++i) {
        generateTest(undefined, i);
      }
    });
  });
  describe("Testing multiple events, with mixed oreder of dates and time frames.", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 12:30"),
          weekly_recurring: true
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-12 13:00"),
          ends_at: new Date("2014-08-12 18:00")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-12 8:00"),
          ends_at: new Date("2014-08-12 11:00")
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-12 9:30"),
          ends_at: new Date("2014-08-12 15:30")
        },
      ]);
    });

    it("Testing if order is correct, and if appointment events overrides the opening hours.", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00"
      ]);

      expect(availabilities[2].slots).toEqual([
        "8:00",
        "8:30",
        "9:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
      ]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-16"))
      );
    });
  });

});

describe("getAvailabilities - initial test cases.", () => {
  beforeEach(() => knex("events").truncate());

  describe("case 1", () => {
    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);
      for (let i = 0; i < 7; ++i) {
        expect(availabilities[i].slots).toEqual([]);
      }
    });
  });

  describe("case 2", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 12:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00"
      ]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-16"))
      );
    });
  });

  describe("case 3", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2018-08-04 09:30"),
          ends_at: new Date("2018-08-04 12:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[6].slots).toEqual([]);
    });
  });
});
