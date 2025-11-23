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
    const leases = await prisma.lease.findMany({
      where: {
        room: {
          property: {
            ownerId: session.user.id,
          },
        },
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json(leases);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error fetching leases" },
      { status: 500 }
    );
  }
}
