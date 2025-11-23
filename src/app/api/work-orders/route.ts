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
    const workOrders = await prisma.workOrder.findMany({
      where: {
        lease: {
          room: {
            property: {
              ownerId: session.user.id,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json(workOrders);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error fetching work orders" },
      { status: 500 }
    );
  }
}
