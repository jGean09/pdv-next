import { prisma } from "../../../../lib/prisma"; 
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params; 
    const id = parseInt(resolvedParams.id);
    
    // SOFT DELETE: Atualiza o status para inativo em vez de destruir os dados
    await prisma.product.update({ 
      where: { id },
      data: { active: false }
    });
    
    return NextResponse.json({ message: "Produto inativado com sucesso" });
  } catch (error) {
    console.error("ERRO NO DELETE LÓGICO:", error); 
    return NextResponse.json({ error: "Erro ao inativar produto" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // No Next.js 15+, params precisa de await
    const resolvedParams = await params; 
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        price: parseFloat(body.price),
        cost: parseFloat(body.cost),
        quantity: parseInt(body.quantity),
        categoryId: parseInt(body.categoryId)
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("ERRO NO PUT:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params; 
    const id = parseInt(resolvedParams.id);
    const body = await request.json(); // Espera receber { active: true }

    const product = await prisma.product.update({
      where: { id },
      data: { active: body.active }
    });
    
    return NextResponse.json(product);
  } catch (error) {
    console.error("ERRO NO PATCH (REATIVAR):", error);
    return NextResponse.json({ error: "Erro ao mudar status do produto" }, { status: 500 });
  }
}