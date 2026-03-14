# 🚀 PDV MASTER - Sistema de Gestão e Ponto de Venda

O **PDV Master** é um sistema completo de Ponto de Venda desenvolvido com o que há de mais moderno no ecossistema Web. Focado em velocidade operacional, segurança de dados e controle rigoroso de estoque e financeiro.

## 🛠️ Tecnologias Utilizadas

* **Framework:** Next.js 16 (App Router & Turbopack)
* **Banco de Dados:** SQLite com **Prisma ORM**
* **Segurança:** Autenticação JWT (JOSE) e Middleware de Controle de Acesso (RBAC)
* **Estilização:** Tailwind CSS & FontAwesome
* **Lógica de Negócio:** Transações atômicas para garantia de estoque

## 🔒 Diferenciais Estratégicos

### 1. Segurança por Níveis (RBAC)
O sistema diferencia **ADMIN** de **CAIXA** no nível do servidor (Middleware). 
* **Admin:** Acesso total a Dashboards, Financeiro, Estoque e Gestão de Usuários.
* **Caixa:** Interface simplificada focada exclusivamente na venda, com bloqueio automático de rotas administrativas.

### 2. Controle de Estoque Blindado
Cada venda realizada dispara uma transação no banco de dados que abate o estoque automaticamente. O sistema possui lógica de **Estorno Inteligente**: ao cancelar uma venda no Livro-Caixa, os produtos retornam à prateleira instantaneamente, garantindo a integridade do inventário.

### 3. Auditoria Financeira
Livro-caixa detalhado com filtros por data, permitindo o acompanhamento do faturamento em tempo real e análise de lucratividade.

## 🚀 Como Executar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/pdv-next.git](https://github.com/seu-usuario/pdv-next.git)
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Banco de Dados:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  **Acesse no navegador:**
    `http://localhost:3000`

## 📂 Estrutura de Pastas Chave

* `/app/api/auth`: Motor de autenticação e cookies.
* `/app/api/sales`: Lógica de vendas e estorno por ID.
* `/app/caixa`: Interface de frente de caixa.
* `/app/financeiro`: Livro-caixa e auditoria.
* `/proxy.js`: O "Guardião" do sistema (Middleware de segurança).

## 📝 Próximos Passos (Roadmap)
- [ ] Impressão de Comprovante de Venda (Termal 80mm).
- [ ] Relatórios de Curva ABC de produtos.
- [ ] Integração com APIs de Pagamento (PIX/Cartão).

---
Desenvolvido com foco em alta performance e honestidade técnica. 🚀