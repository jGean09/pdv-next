// app/api/categories/route.js
import { prisma } from "../../../lib/prisma"; 
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const category = await prisma.category.create({
      data: { name: body.name }
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 400 });
  }
}