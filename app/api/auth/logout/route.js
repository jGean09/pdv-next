// app/api/auth/logout/route.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // O servidor deleta o cookie de forma oficial
    cookieStore.delete("pdv_session");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao sair" }, { status: 500 });
  }
}