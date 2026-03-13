// app/api/categories/[id]/route.js
import { prisma } from "../../../../lib/prisma"; 
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    
    const category = await prisma.category.update({
      where: { id },
      data: { name: body.name }
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Categoria excluída" });
  } catch (error) {
    // O Prisma vai cair aqui automaticamente se tentar apagar uma categoria que tem produtos
    return NextResponse.json(
      { error: "Não é possível excluir: existem produtos vinculados a esta categoria." }, 
      { status: 500 }
    );
  }
}