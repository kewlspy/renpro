import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcrypt'// To hash the password

export async function GET() {
const data= await prisma.user.findMany({
  select: {
    // id: true,
    name: true,
    email: true,
    role: true, // Include role if needed,
  }
})  
return NextResponse.json(data);

}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password,role,phone } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone, // Default empty phone
        role// "USER" // Optional, default is USER
      }
    });

  return NextResponse.json(
    {
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      },
    },
    { status: 201 }
  ); 
 } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
