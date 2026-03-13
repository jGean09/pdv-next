import { prisma } from "../../../lib/prisma"; 
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

// === NOVA FUNÇÃO: BUSCAR O HISTÓRICO DE VENDAS ===
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: 'desc' }, // Traz as vendas mais novas primeiro
      include: {
        client: true, // Puxa os dados do cliente junto
        items: {
          include: {
            product: true // Puxa os dados do produto que foi vendido
          }
        }
      }
    });
    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar histórico de vendas" }, { status: 500 });
  }
}

// === SUA FUNÇÃO POST CONTINUA AQUI INTACTA ===
export async function POST(request) {
  try {
    const body = await request.json();
    const novaVenda = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          total: parseFloat(body.total),
          customerId: body.customerId || null,
          items: {
            create: body.items.map(item => ({
              productId: item.id,
              quantity: item.quantidadeVenda,
              price: item.price
            }))
          }
        }
      });

      for (const item of body.items) {
        await tx.product.update({
          where: { id: item.id },
          data: { quantity: { decrement: item.quantidadeVenda } }
        });
      }
      return sale;
    });

    return NextResponse.json(novaVenda, { status: 201 });
  } catch (error) {
    console.error("ERRO AO PROCESSAR VENDA:", error);
    return NextResponse.json({ error: "Falha ao processar a venda" }, { status: 500 });
  }
}