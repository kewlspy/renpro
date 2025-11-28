import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { roomId, propertyId, tenantId, startDate, endDate, rent, rentDueDate } = body;

  if (!tenantId || !startDate || !endDate || !rent) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  if (!roomId && !propertyId) {
    return NextResponse.json({ message: "Either roomId or propertyId is required" }, { status: 400 });
  }

  // If creating lease for the entire property, find first available room
  let finalRoomId = roomId;
  if (propertyId) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return NextResponse.json({ message: "Property not found" }, { status: 404 });
    if (property.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized to lease this property" }, { status: 403 });
    }

    // Find the first available room (no active lease)
    const now = new Date();
    const room = await prisma.room.findFirst({
      where: {
        propertyId,
        leases: {
          none: {
            AND: [
              { startDate: { lte: now } },
              { endDate: { gte: now } },
            ],
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ message: "No available rooms in this property" }, { status: 400 });
    }
    finalRoomId = room.id;
  } else {
    const room = await prisma.room.findUnique({ where: { id: roomId }, include: { property: true } });
    if (!room) return NextResponse.json({ message: "Room not found" }, { status: 404 });
    if (room.property.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized to lease this room" }, { status: 403 });
    }
  }

  const owner = await prisma.user.findUnique({ where: { id: session.user.id } });
  const tenant = await prisma.user.findUnique({ where: { id: tenantId } });
  if (!tenant) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });

  if (owner?.country && tenant.country !== owner.country) {
    return NextResponse.json({ message: "Tenant must be in the same country as owner" }, { status: 400 });
  }

  try {
    const lease = await prisma.lease.create({
      data: {
        tenantId,
        roomId: finalRoomId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rent: Number(rent),
        rentDueDate: rentDueDate ?? 1,
      },
    });

    return NextResponse.json(lease, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error creating lease" }, { status: 500 });
  }
}

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
        room: {
          select: {
            id: true,
            name: true,
            property: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
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

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { leaseId, endDate } = body;

  if (!leaseId || !endDate) {
    return NextResponse.json({ message: "Missing leaseId or endDate" }, { status: 400 });
  }

  try {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { room: { include: { property: true } } },
    });

    if (!lease) {
      return NextResponse.json({ message: "Lease not found" }, { status: 404 });
    }

    if (lease.room.property.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized to update this lease" }, { status: 403 });
    }

    const updatedLease = await prisma.lease.update({
      where: { id: leaseId },
      data: { endDate: new Date(endDate) },
      include: {
        tenant: {
          select: { id: true, name: true, email: true },
        },
        room: {
          select: {
            id: true,
            name: true,
            property: {
              select: { id: true, name: true, address: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedLease, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error updating lease" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const leaseId = searchParams.get("id");

  if (!leaseId) {
    return NextResponse.json({ message: "Missing lease ID" }, { status: 400 });
  }

  try {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { room: { include: { property: true } } },
    });

    if (!lease) {
      return NextResponse.json({ message: "Lease not found" }, { status: 404 });
    }

    if (lease.room.property.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized to delete this lease" }, { status: 403 });
    }

    await prisma.lease.delete({ where: { id: leaseId } });

    return NextResponse.json({ message: "Lease deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error deleting lease" }, { status: 500 });
  }
}
