import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const saleId = parseInt(id);

    await prisma.$transaction(async (tx) => {
      // 1. Busca a venda e itens
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { items: true }
      });

      if (!sale) throw new Error("Venda não encontrada.");

      // 2. Devolve os itens ao estoque (usando o nome correto: quantity)
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: { increment: item.quantity } // Mudado de stock para quantity
          }
        });
      }

      // 3. Deleta os itens da venda
      await tx.saleItem.deleteMany({
        where: { saleId: saleId }
      });

      // 4. Deleta a venda
      await tx.sale.delete({
        where: { id: saleId }
      });
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("ERRO NO ESTORNO:", error.message);
    return NextResponse.json(
      { error: "Erro ao estornar: " + error.message }, 
      { status: 500 }
    );
  }
}