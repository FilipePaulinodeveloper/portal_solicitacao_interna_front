# Portal de Solicitações Internas — Bit Soluções

Frontend web para registrar e acompanhar solicitações internas. A aplicação oferece autenticação, um dashboard de resumo e um quadro Kanban para consultar, criar, editar e excluir solicitações conforme o status.

> Este repositório contém somente o frontend. A API, o banco de dados, suas migrações e os usuários de teste devem ser configurados no projeto de backend correspondente.

## Funcionalidades

- Login e encerramento de sessão pela API.
- Dashboard com totais de solicitações e gráfico de distribuição por status.
- Listagem Kanban com colunas por status.
- Busca e filtros por título, descrição, categoria, status e período.
- Criação de solicitações e edição ou exclusão das que estão abertas.
- Layout responsivo para desktop, tablet e celular.

## Tecnologias

- Vue 3, TypeScript e Vue Router.
- Vite.
- Tailwind CSS 4.
- Componentes de interface baseados em Reka UI.
- Gráficos com Unovis.
- Requisições HTTP com Axios.
- Ícones Lucide.

## Pré-requisitos

- Node.js `^22.18.0` ou `>=24.12.0`.
- npm.
- API do Portal de Solicitações em execução e acessível pelo navegador.
- Banco de dados e credenciais de acesso configurados no backend.

O frontend não contém servidor, banco de dados, migrações ou configuração de banco. Consulte as instruções do projeto de backend para preparar esses recursos.

## Instalação e configuração

### 1. Obter o código

```sh
git clone https://github.com/FilipePaulinodeveloper/portal_solicitacao_interna_front.git
cd portal_solicitacao_interna_front
```

### 2. Instalar as dependências

```sh
npm install
```

### 3. Configurar a URL da API

Copie o arquivo de exemplo para `.env` na raiz do projeto:

```sh
cp .env.exemple .env
```

No Windows PowerShell, use:

```powershell
Copy-Item .env.exemple .env
```

Confirme no `.env` que a URL corresponde ao backend local:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

O valor deve apontar para a URL base acessível da API no seu ambiente. Se a API estiver em outro host ou porta, altere essa variável e reinicie o servidor Vite.

Não coloque tokens, senhas ou outros segredos em variáveis `VITE_*`: elas são incorporadas ao bundle e ficam visíveis no navegador.

### 4. Preparar backend e banco de dados

Este repositório não inclui o backend. No projeto da API:

1. Siga as instruções do backend para instalar dependências e configurar seu arquivo `.env`.
2. Configure o banco de dados conforme o ambiente.
3. Execute as migrações e, se disponíveis, os seeders de usuário de teste conforme a documentação do backend.
4. Inicie a API antes de acessar o frontend.

Os comandos de instalação, configuração de chaves, criação do banco e migração dependem do backend utilizado e não estão definidos neste repositório.

## Executar em desenvolvimento

Com o backend em execução e `VITE_API_BASE_URL` configurada:

```sh
npm run dev
```

Abra no navegador o endereço mostrado pelo Vite (normalmente `http://localhost:5173`). Para executar frontend e backend, mantenha cada projeto em seu próprio terminal, usando os comandos documentados por cada um.

Rotas principais da interface:

- `/login`: autenticação.
- `/dashboard`: resumo e gráfico.
- `/solicitacoes`: quadro Kanban.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite. |
| `npm run type-check` | Verifica os tipos TypeScript e componentes Vue. |
| `npm run build` | Executa verificação de tipos e gera o build de produção. |
| `npm run build-only` | Gera o build sem executar a verificação de tipos. |
| `npm run preview` | Serve localmente o build de produção. |

## Integração com a API

O frontend consome os seguintes recursos, relativos à URL configurada em `VITE_API_BASE_URL`:

| Método | Recurso | Uso |
| --- | --- | --- |
| `POST` | `/login` | Autentica o usuário. |
| `GET` | `/user/{id}` | Carrega o usuário autenticado. |
| `POST` | `/logout` | Encerra a sessão. |
| `GET` | `/dashboard` | Obtém os totais do dashboard. |
| `GET` | `/solicitacoes` | Lista solicitações e aceita filtros. |
| `POST` | `/solicitacoes` | Cria uma solicitação. |
| `PATCH` | `/solicitacoes/{id}` | Atualiza os dados editáveis da solicitação. |
| `PATCH` | `/solicitacoes/{id}/status` | Atualiza o status ao mover o cartão no Kanban. |
| `DELETE` | `/solicitacoes/{id}` | Exclui uma solicitação aberta. |

Os filtros da listagem podem incluir `titulo`, `descricao`, `categoria`, `status`, `data_inicio` e `data_fim`. A API deve aplicar as regras de autorização e validar as operações, mesmo quando a interface também limita ações por status.

## Credenciais de acesso

Este repositório não inclui credenciais de teste nem cria usuários. Use uma conta já cadastrada na API ou consulte o responsável pelo backend para obter credenciais de demonstração. Se o backend tiver seed de usuário, siga as instruções dele para criar a conta.

Não adicione senhas ou tokens reais a este README, ao código ou ao controle de versão.

## Memorial Técnico

Não há um arquivo de Memorial Técnico neste repositório. Se o projeto exigir esse documento, adicione-o separadamente e inclua aqui um link relativo, por exemplo: `[Memorial Técnico](./MEMORIAL_TECNICO.md)`.
