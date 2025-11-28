import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone")?.trim() || "";

  const owner = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!owner) return NextResponse.json([], { status: 200 });

  let whereClause: any = {
    role: "TENANT",
    country: owner.country ?? null,
  };

  if (phone) {
    whereClause.phone = {
      contains: phone,
      mode: "insensitive",
    };
  }

  const tenants = await prisma.user.findMany({
    where: whereClause,
    select: { id: true, name: true, email: true, phone: true, country: true },
  });

  return NextResponse.json(tenants);
}
