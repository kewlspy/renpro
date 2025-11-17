import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const data = await prisma.property.findMany({
    where: { ownerId: session.user.id     },    include: { 
      rooms: {
        include: {
          leases: true,
        }
      }
    },
  });
  return NextResponse.json(data);
}

// POST route to create a new property
// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const body = await req.json();

//   const created = await prisma.property.create({
//     data: {
//       name: body.name,
//       address: body.address,
//       ownerId: session.user.id, // link to logged-in user
//     },
//   });

//   return NextResponse.json(created, { status: 201 });
// }


// ====================================

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, address, rooms } = body;

  try {
    const property = await prisma.property.create({
      data: {
        name,
        address,
        ownerId: session.user.id,
        rooms: {
          create: rooms.map((r: any) => ({
            name: r.name,
            description: r.description || '', // Ensure description is optional
            // You can optionally save r.description in a new Room field if schema updated
          })),
        },
      },
      include: { rooms: true },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error creating property' }, { status: 500 });
  }
}
