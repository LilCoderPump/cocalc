/*
 *  This file is part of CoCalc: Copyright © 2022 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

// test produce ID and pricing

import { ONE_DAY_MS } from "@cocalc/util/consts/billing";
import {
  PurchaseInfo,
  PurchaseInfoQuota,
} from "@cocalc/util/licenses/purchase/types";
import { money } from "@cocalc/util/licenses/purchase/utils";
import { compute_cost } from "@cocalc/util/licenses/purchase/compute-cost";
import { round2 } from "@cocalc/util/misc";
import {
  endOfDay,
  getDays,
  startOfDay,
  roundToMidnight,
} from "@cocalc/util/stripe/timecalcs";
import expect from "expect";
import { unitAmount } from "./licenses/purchase/charge";
import { getProductId } from "./licenses/purchase/product-id";
import { COSTS } from "@cocalc/util/licenses/purchase/consts";

// TODO: some tests are ignored if the machine is not running on UTC.
// Ideally, this is taken into account, but that's not implemented.
const isUTC = new Date().getTimezoneOffset() === 0;

describe("product id and compute cost", () => {
  const info1: Omit<PurchaseInfoQuota, "quantity"> = {
    type: "quota",
    user: "academic",
    upgrade: "custom",
    custom_uptime: "short",
    custom_ram: 1,
    custom_cpu: 1,
    custom_disk: 1,
    custom_member: true,
    subscription: "no",
    start: startOfDay(new Date("2022-04-28 12:00")),
    end: endOfDay(new Date("2022-05-07 12:00")),
    custom_dedicated_ram: 0,
    custom_dedicated_cpu: 0,
  } as const;

  it.each([1, 2, 10, 15])("id with quantity %p", (quantity) => {
    const id = getProductId({ ...info1, quantity });
    expect(id).toEqual(`license_a0b0c1d1m1p10r1_v2`);
  });

  it.each([1, 2, 10, 15])("compute price quantity %p", (quantity) => {
    const base = compute_cost({ ...info1, quantity: 1 }).cost;
    const cost = compute_cost({ ...info1, quantity });
    const cexp = round2(base * quantity);
    expect(round2(cost.cost)).toEqual(cexp);
    expect(
      Math.abs(
        round2(cost.discounted_cost) - round2(COSTS.online_discount * cexp)
      )
    ).toBeLessThan(0.01);
  });

  it.each([
    [1, 13333, 1],
    [2, 13333, 10],
    [3, 13333, 10], // the point is, unit price is independent of quantity
    [4, 13333, 50],
    [5, 13333, 100],
    [6, 13333, 5],
    [7, 13333, 100],
    [8, 14329, 5],
    [9, 15921, 10],
    [10, 17500, 1],
    [15, 25500, 1],
  ])("compute price days %p → price %p", (days, price, quantity) => {
    price /= 100;
    const info2 = {
      ...info1,
      quantity,
      end: endOfDay(
        new Date((info1.start as Date).getTime() + days * ONE_DAY_MS)
      ),
    };
    info2.cost = compute_cost(info2);
    //console.log(days, info2.cost);
    const unit_amount = unitAmount(info2);

    expect(unit_amount).toEqual(Math.round(price));

    const total_exp = Math.round(price * quantity);
    // this test checks if the displayed amount matches the invoice amount
    // see notes about using "round2" in compute_cost
    expect(money(info2.cost.cost, true)).toEqual(`$${total_exp / 100}`);
  });

  it("specific start/end date", () => {
    const info2 = {
      ...info1,
      quantity: 1,
      start: new Date("2022-04-28T10:08:10.072Z"),
      end: new Date("2022-05-05T10:08:10.072Z"),
    };
    info2.cost = compute_cost(info2);
    expect(unitAmount(info2)).toEqual(133);
  });
});

describe("days interval", () => {
  it("entire day counts (slightly more)", () => {
    const info = {
      start: startOfDay(new Date("2022-04-01 12:23:00")),
      end: endOfDay(new Date("2022-04-06 12:23:03")),
    };
    expect(getDays(info)).toEqual(6);
  });

  it("entire day counts (slightly less)", () => {
    const info = {
      start: startOfDay(new Date("2022-04-01 12:23:00")),
      end: endOfDay(new Date("2022-04-06 12:22:58")),
    };
    expect(getDays(info)).toEqual(6);
  });

  it("works with a user's timezone in utc", () => {
    const info = {
      start: new Date("2022-04-30T22:00:00Z"),
      end: new Date("2022-05-28T21:59:59.999Z"),
    };
    // this is 1 to 28th in may, full days.
    expect(getDays(info)).toEqual(28);
  });
});

describe("start/end of day", () => {
  if (!isUTC) return;

  const d = new Date("2022-04-04 14:31:00");
  const s = "2022-04-04 14:31:00";

  it("start", () => {
    expect(startOfDay(d)).toEqual(new Date("2022-04-04 00:00:00.000Z"));
  });

  it("end", () => {
    expect(endOfDay(d)).toEqual(new Date("2022-04-04 23:59:59.999Z"));
  });

  it("start on string", () => {
    expect(startOfDay(s)).toEqual(new Date("2022-04-04 00:00:00.000Z"));
  });

  it("end on string", () => {
    expect(endOfDay(s)).toEqual(new Date("2022-04-04 23:59:59.999Z"));
  });
});

describe("roundToMidnight", () => {
  if (!isUTC) return;

  const am = new Date("2022-04-04 1:01:00");
  const pm = new Date("2022-04-04 14:31:00");

  it("am/side=start", () => {
    expect(roundToMidnight(am, "start")).toEqual(
      new Date("2022-04-04T00:00:00.000Z")
    );
  });

  it("am/side=end", () => {
    expect(roundToMidnight(am, "end")).toEqual(
      new Date("2022-04-03T23:59:59.999Z")
    );
  });

  it("pm/side=start", () => {
    expect(roundToMidnight(pm, "start")).toEqual(
      new Date("2022-04-05T00:00:00.000Z")
    );
  });

  it("pm/side=end", () => {
    expect(roundToMidnight(pm, "end")).toEqual(
      new Date("2022-04-04T23:59:59.999Z")
    );
  });
});

describe("dedicated disk", () => {
  it("calculates subscription price of one disk", () => {
    const pi: PurchaseInfo = {
      type: "disk",
      start: startOfDay(new Date()),
      quantity: 1,
      subscription: "monthly",
      dedicated_disk: {
        name: "mydisk123",
        speed: "balanced",
        size_gb: 32,
      },
    };

    const cost = compute_cost(pi);
    expect(cost).toEqual({
      cost: 8,
      cost_per_project_per_month: 8,
      cost_per_unit: 8,
      cost_sub_month: 8,
      cost_sub_year: 96,
      discounted_cost: 8,
      period: "monthly",
    });
  });
});
