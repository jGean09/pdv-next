import { prisma } from "../../../lib/prisma"; 
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categoryId = searchParams.get("categoryId");

    let whereClause = {};

    // A MÁGICA DO FUSO HORÁRIO AQUI (-03:00 garante o horário do Brasil)
    if (startDate || endDate) {
      whereClause.sale = { createdAt: {} };
      if (startDate) whereClause.sale.createdAt.gte = new Date(`${startDate}T00:00:00-03:00`);
      if (endDate) whereClause.sale.createdAt.lte = new Date(`${endDate}T23:59:59-03:00`);
    }

    if (categoryId) {
      whereClause.product = { categoryId: parseInt(categoryId) };
    }

    const items = await prisma.saleItem.findMany({
      where: whereClause,
      include: {
        sale: true,
        product: true
      }
    });

    let faturamento = 0;
    let custo = 0;
    const salesIds = new Set();
    const productStats = {};

    items.forEach(item => {
      const receitaItem = item.price * item.quantity;
      const custoItem = item.product.cost * item.quantity;

      faturamento += receitaItem;
      custo += custoItem;
      salesIds.add(item.saleId);

      if (!productStats[item.productId]) {
        productStats[item.productId] = {
          name: item.product.name,
          quantity: 0,
          revenue: 0
        };
      }
      productStats[item.productId].quantity += item.quantity;
      productStats[item.productId].revenue += receitaItem;
    });

    const lucro = faturamento - custo;
    const qtdVendas = salesIds.size;
    const ticketMedio = qtdVendas > 0 ? faturamento / qtdVendas : 0;

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      faturamento,
      custo,
      lucro,
      ticketMedio,
      qtdVendas,
      topProducts
    });

  } catch (error) {
    console.error("Erro no motor do Dashboard:", error);
    return NextResponse.json({ error: "Erro ao extrair dados" }, { status: 500 });
  }
}