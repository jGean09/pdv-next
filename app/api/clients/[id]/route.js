import { prisma } from "../../../../lib/prisma"; 
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    
    const client = await prisma.client.update({
      where: { id },
      data: { name: body.name, phone: body.phone || "" }
    });
    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}

// SOFT DELETE
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    await prisma.client.update({
      where: { id },
      data: { active: false }
    });
    return NextResponse.json({ message: "Cliente inativado" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao inativar cliente." }, { status: 500 });
  }
}

// REATIVAR
export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();

    const client = await prisma.client.update({
      where: { id },
      data: { active: body.active }
    });
    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao reativar cliente" }, { status: 500 });
  }
}