import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payments = await prisma.payment.findMany({
      where: {
        lease: {
          room: {
            property: {
              ownerId: session.user.id,
            },
          },
        },
      },
      include: {
        lease: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        paidAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json(payments);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error fetching payments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { leaseId, amount, paidAt } = body;

  if (!leaseId || !amount || !paidAt) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  try {
    const lease = await prisma.lease.findUnique({ where: { id: leaseId }, include: { room: { include: { property: true } } } });
    if (!lease) return NextResponse.json({ message: "Lease not found" }, { status: 404 });

    if (lease.room.property.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized to add payment for this lease" }, { status: 403 });
    }

    const payment = await prisma.payment.create({
      data: {
        leaseId,
        amount: Number(amount),
        paidAt: new Date(paidAt),
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error creating payment" }, { status: 500 });
  }
}
