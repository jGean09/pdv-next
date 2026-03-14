// proxy.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode("sua-chave-secreta-pdv-master-super-segura");

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. Definição de rotas que não precisam de autenticação
  const isPublicApi = pathname.startsWith('/api/auth');
  const isLoginPage = pathname === '/login';
  const isStatic = pathname.startsWith('/_next') || pathname.includes('.');

  const token = request.cookies.get('pdv_session')?.value;

  // 2. Se for API de autenticação ou arquivos do sistema, deixa passar
  if (isPublicApi || isStatic) {
    return NextResponse.next();
  }

  // 3. Se não tem token e não está no login, expulsa para o login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Se tem token, valida o acesso
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);

      // Se já está logado e tenta ir para a tela de login
      if (isLoginPage) {
        return NextResponse.redirect(
          new URL(payload.role === 'CAIXA' ? '/caixa' : '/', request.url)
        );
      }

      // Restrição de nível: Caixa só acessa a tela de venda (/caixa)
      if (payload.role === 'CAIXA' && pathname !== '/caixa') {
        return NextResponse.redirect(new URL('/caixa', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Token inválido ou expirado
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