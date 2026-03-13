import { prisma } from "../../../lib/prisma"; 
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Lê se a URL tem ?includeInactive=true
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    // Se for false, traz só os ativos. Se for true, traz todos (sem filtro).
    const whereClause = includeInactive ? {} : { active: true };

    const clients = await prisma.client.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await prisma.client.create({
      data: {
        name: body.name,
        phone: body.phone || "",
        active: true
      }
    });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 400 });
  }
}