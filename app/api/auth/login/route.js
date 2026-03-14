import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode("sua-chave-secreta-pdv-master-super-segura");

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const token = await new SignJWT({ id: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('12h')
      .sign(SECRET_KEY);

    const response = NextResponse.json({ success: true, role: user.role });

    // 1. COOKIE DE SESSÃO (Seguro, apenas o servidor lê)
    response.cookies.set({
      name: 'pdv_session',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 12,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    // 2. COOKIE DE CARGO (Acessível via JS para a Sidebar saber quem você é)
    response.cookies.set({
      name: 'role',
      value: user.role,
      httpOnly: false, // IMPORTANTE: False para o frontend conseguir ler
      path: '/',
      maxAge: 60 * 60 * 12,
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}