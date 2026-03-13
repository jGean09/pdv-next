// src/app/api/products/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get("includeInactive") === "true";

  try {
      const products = await prisma.product.findMany({
          where: includeInactive ? {} : { active: true },
          include: { category: true },
          orderBy: { name: 'asc' }
      });
      return NextResponse.json(products);
  } catch (error) {
      return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

// Exemplo de POST (Criar produto) já seguindo o padrão que você usava
export async function POST(request) {
    try {
        const body = await request.json();
        const product = await prisma.product.create({
            data: {
                name: body.name,
                price: parseFloat(body.price),
                cost: parseFloat(body.cost),
                quantity: parseInt(body.quantity),
                category: { connect: { id: parseInt(body.categoryId) } }
            }
        });
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao criar produto" }, { status: 400 });
    }
}