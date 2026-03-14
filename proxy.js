// proxy.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode("sua-chave-secreta-pdv-master-super-segura");

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. Rotas que NUNCA são bloqueadas (Login, APIs de Auth e Arquivos Estáticos)
  const isPublicApi = pathname.startsWith('/api/auth');
  const isLoginPage = pathname === '/login';
  const isStatic = pathname.startsWith('/_next') || pathname.includes('.');

  const token = request.cookies.get('pdv_session')?.value;

  if (isPublicApi || isStatic) {
    return NextResponse.next();
  }

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);

      if (isLoginPage) {
        return NextResponse.redirect(
          new URL(payload.role === 'CAIXA' ? '/caixa' : '/', request.url)
        );
      }

      // ---------------------------------------------------------
      // REGRAS DE ACESSO PARA O CAIXA (RBAC)
      // ---------------------------------------------------------
      if (payload.role === 'CAIXA') {
        // Lista de APIs que o Caixa PRECISA para o PDV funcionar
        const apisPermitidas = [
          '/api/products',
          '/api/clients',
          '/api/sales',
          '/api/categories',
          '/api/auth/logout'
        ];

        const acessandoApiPermitida = apisPermitidas.some(api => pathname.startsWith(api));

        // Se o Caixa tentar sair da tela /caixa e não for para uma API vital, ele é barrado
        if (pathname !== '/caixa' && !acessandoApiPermitida) {
          return NextResponse.redirect(new URL('/caixa', request.url));
        }
      }

      // Se for ADMIN ou passar pelas regras acima, segue o jogo
      return NextResponse.next();

    } catch (error) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('pdv_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};