import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function clampDay(year: number, month: number, day: number) {
  // month is 0-based for JS Date
  const last = new Date(year, month + 1, 0).getDate();
  return Math.min(day, last);
}

function computeDueCount(startDate: Date, rentDueDay: number, now: Date) {
  // Find the first due date on/after the lease start
  let year = startDate.getFullYear();
  let month = startDate.getMonth();
  let day = clampDay(year, month, rentDueDay);
  let firstDue = new Date(year, month, day);

  if (firstDue < startDate) {
    // move to next month
    if (month === 11) {
      year += 1;
      month = 0;
    } else {
      month += 1;
    }
    day = clampDay(year, month, rentDueDay);
    firstDue = new Date(year, month, day);
  }

  if (firstDue > now) return 0;

  const yearDiff = now.getFullYear() - firstDue.getFullYear();
  const monthDiff = now.getMonth() - firstDue.getMonth();
  const monthsBetween = yearDiff * 12 + monthDiff;

  // dueCount is monthsBetween + 1 (inclusive of firstDue)
  return monthsBetween + 1;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  try {
    const leases = await prisma.lease.findMany({
      where: {
        room: {
          property: { ownerId: session.user.id },
        },
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        tenant: { select: { id: true, name: true, email: true, phone: true } },
        room: { include: { property: { select: { id: true, name: true, address: true } } } },
        payments: { select: { amount: true, paidAt: true } },
      },
    });

    const pendingList = leases.map((lease) => {
      const rent = Number(lease.rent as unknown as string || 0);

      const dueCount = computeDueCount(new Date(lease.startDate), lease.rentDueDate, now);

      const expected = dueCount * rent;

      const paid = (lease.payments || []).reduce((s, p) => s + Number(p.amount as unknown as string || 0), 0);

      const pending = Math.max(0, expected - paid);

      return {
        leaseId: lease.id,
        tenant: lease.tenant,
        room: { id: lease.room.id, name: lease.room.name },
        property: lease.room.property,
        dueCount,
        expected,
        paid,
        pending: Number(pending.toFixed(2)),
      };
    }).filter((p) => p.pending > 0);

    return NextResponse.json(pendingList);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error calculating pending payments" }, { status: 500 });
  }
}
