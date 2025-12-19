# API Checkout Rest e GraphQL

[![k6 tests](https://github.com/juliodelimas/pgats-2025-02-base/actions/workflows/k6.yml/badge.svg)](https://github.com/juliodelimas/pgats-2025-02-base/actions/workflows/k6.yml)

Se você é aluno da Pós-Graduação em Automação de Testes de Software (Turma 2), faça um fork desse repositório e boa sorte em seu trabalho de conclusão da disciplina.

## Instalação

```bash
npm install express jsonwebtoken swagger-ui-express apollo-server-express graphql
```

## Exemplos de chamadas

### REST

#### Registro de usuário
```bash
curl -X POST http://localhost:3000/api/users/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Novo Usuário","email":"novo@email.com","password":"senha123"}'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
	-H "Content-Type: application/json" \
	-d '{"email":"novo@email.com","password":"senha123"}'
```

#### Checkout (boleto)
```bash
curl -X POST http://localhost:3000/api/checkout \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <TOKEN_JWT>" \
	-d '{
		"items": [{"productId":1,"quantity":2}],
		"freight": 20,
		"paymentMethod": "boleto"
	}'
```

#### Checkout (cartão de crédito)
```bash
curl -X POST http://localhost:3000/api/checkout \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <TOKEN_JWT>" \
	-d '{
		"items": [{"productId":2,"quantity":1}],
		"freight": 15,
		"paymentMethod": "credit_card",
		"cardData": {
			"number": "4111111111111111",
			"name": "Nome do Titular",
			"expiry": "12/30",
			"cvv": "123"
		}
	}'
```

### GraphQL

#### Registro de usuário
Mutation:
```graphql
mutation Register($name: String!, $email: String!, $password: String!) {
  register(name: $name, email: $email, password: $password) {
    email
    name
  }
}

Variables:
{
  "name": "Julio",
  "email": "julio@abc.com",
  "password": "123456"
}
```

#### Login
Mutation:
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
  }
}

Variables:
{
  "email": "alice@email.com",
  "password": "123456"
}
```


#### Checkout (boleto)
Mutation (envie o token JWT no header Authorization: Bearer <TOKEN_JWT>):
```graphql
mutation Checkout($items: [CheckoutItemInput!]!, $freight: Float!, $paymentMethod: String!, $cardData: CardDataInput) {
  checkout(items: $items, freight: $freight, paymentMethod: $paymentMethod, cardData: $cardData) {
    freight
    items {
      productId
      quantity
    }
    paymentMethod
    userId
    valorFinal
  }
}

Variables:
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "freight": 10,
  "paymentMethod": "boleto"
}
```

#### Checkout (cartão de crédito)
Mutation (envie o token JWT no header Authorization: Bearer <TOKEN_JWT>):
```graphql
mutation {
	checkout(
		items: [{productId: 2, quantity: 1}],
		freight: 15,
		paymentMethod: "credit_card",
		cardData: {
			number: "4111111111111111",
			name: "Nome do Titular",
			expiry: "12/30",
			cvv: "123"
		}
	) {
		valorFinal
		paymentMethod
		freight
		items { productId quantity }
	}
}

Variables:
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "freight": 10,
  "paymentMethod": "credit_card",
  "cardData": {
    "cvv": "123",
    "expiry": "10/04",
    "name": "Julio Costa",
    "number": "1234432112344321"
  }
}
```

#### Consulta de usuários
Query:
```graphql
query Users {
  users {
    email
    name
  }
}
```

## Como rodar

### REST
```bash
node rest/server.js
```
Acesse a documentação Swagger em [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### GraphQL
```bash
node graphql/app.js
```
Acesse o playground GraphQL em [http://localhost:4000/graphql](http://localhost:4000/graphql)

## Endpoints REST
- POST `/api/users/register` — Registro de usuário
- POST `/api/users/login` — Login (retorna token JWT)
- POST `/api/checkout` — Checkout (requer token JWT)

## Regras de Checkout
- Só pode fazer checkout com token JWT válido
- Informe lista de produtos, quantidades, valor do frete, método de pagamento e dados do cartão se necessário
- 5% de desconto no valor total se pagar com cartão
- Resposta do checkout contém valor final

## Banco de dados
- Usuários e produtos em memória (veja arquivos em `src/models`)

## Testes
- Para testes automatizados, importe o `app` de `rest/app.js` ou `graphql/app.js` sem o método `listen()`

### Exemplo de teste k6
O código abaixo está armazenado no arquivo `test/k6/checkout.test.js` e demonstra o uso do conceito de **Groups**; dentro dele é utilizado um **helper** (`login`) importado de outro script JavaScript (`../helpers/auth.helper.js`).

```javascript
// test/k6/checkout.test.js (exemplo)
import http from 'k6/http';
import { group, check } from 'k6';
import { login } from '../helpers/auth.helper.js';

export default function () {
  group('Fluxo de Checkout', () => {
    const token = login('alice@email.com', '123456');

    group('Criar checkout', () => {
      const res = http.post(`${__ENV.BASE_URL}/api/checkout`, JSON.stringify({
        items: [{ productId: 1, quantity: 1 }],
        freight: 10,
        paymentMethod: 'boleto'
      }), {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });

      check(res, { 'checkout ok': (r) => r.status === 200 });
    });
  });
}
```

**Explicação:** Este exemplo mostra como agrupar passos com `group()` e reutilizar um helper de login importado para obter o token antes de executar o fluxo de checkout.

### CI / GitHub Actions ✅

- O repositório inclui um workflow em `.github/workflows/k6.yml` que roda o servidor e executa os testes k6 em pushes/PRs na branch `main`.
- O workflow instala o k6, inicia `rest/server.js` em segundo plano e executa `npm run test:k6:json`, salvando o resultado em `reports/k6-report.json`.
- O arquivo `reports/k6-report.json` é carregado como artefato do build (vá em *Actions* → *workflow run* → *Artifacts* para baixar o relatório).

### Executando os testes localmente

1. Inicie a API em um terminal:

```bash
npm start
```

2. Em outro terminal, execute os testes k6:

- Execução rápida (saida no console):
```bash
npm run test:k6
```

- Gerar relatório JSON (em `reports/k6-report.json`):
```bash
npm run test:k6:json
```

> Observação: o relatório HTML pode ser gerado localmente usando conversores externos a partir do JSON, ou usando a opção `--out web-dashboard=export=relatorio-performance.html` quando disponível.


## Documentação
- Swagger disponível em `/api-docs`
- Playground GraphQL disponível em `/graphql`

---

## Conceitos exigidos e como foram aplicados

1) Thresholds (Limites):

- Arquivo: [`test/k6/tests/api.performance.test.js`](test/k6/tests/api.performance.test.js) 
- Aplicação: Definimos que 95% das requisições devem ser menores que 500ms (http_req_duration) e a média de criação de usuários menor que 400ms.

2) Checks (Validações):

- Arquivo: [`test/k6/helpers/auth.helper.js`](test/k6/helpers/auth.helper.js) e [`test/k6/tests/api.performance.test.js`](test/k6/tests/api.performance.test.js) 
- Aplicação: Validamos se o status code de retorno é 200 para login e 201 para criação de usuário.

3) Helpers:

- Arquivo: Pasta [`test/k6/helpers/`](test/k6/helpers/) 
- Aplicação: Criamos funções modulares para login e `generateUser`, facilitando o reaproveitamento de código.

4) Trends (Métricas Personalizadas):

- Arquivo: [`test/k6/metrics/trends.js`](test/k6/metrics/trends.js) 
- Aplicação: Criamos a métrica `create_user_duration` para medir especificamente o tempo da rota de cadastro.

5) Faker (Dados Dinâmicos):

- Arquivo: [`test/k6/helpers/user.helper.js`](test/k6/helpers/user.helper.js) 
- Aplicação: Utilizamos um gerador inline (substituindo o Faker — incompatível com k6) para gerar nomes e e-mails aleatórios em cada iteração do teste.

6) Variável de Ambiente:

- Arquivo: [`test/k6/helpers/auth.helper.js`](test/k6/helpers/auth.helper.js) 
- Aplicação: Utilizamos `__ENV.BASE_URL` para que a URL da API seja definida apenas na execução via terminal.

7) Stages (Carga Progressiva):

- Arquivo: [`test/k6/config/stages.config.js`](test/k6/config/stages.config.js) 
- Aplicação: Configuramos um ramping de usuários (subindo para 5, depois 10 e descendo para 0) para simular o comportamento real de acessos.

8) Reaproveitamento de Resposta:

- Arquivo: [`test/k6/helpers/auth.helper.js`](test/k6/helpers/auth.helper.js) 
- Aplicação: Capturamos o JSON de resposta do login para extrair o token e utilizá-lo no próximo passo.

9) Uso de Token de Autenticação:

- Arquivo: [`test/k6/tests/api.performance.test.js`](test/k6/tests/api.performance.test.js) 
- Aplicação: Injetamos o token obtido no login no header Authorization da requisição de criação de usuário.

10) Data-Driven Testing (DDT):

- Arquivo: [`test/k6/data/users.data.js`](test/k6/data/users.data.js) 
- Aplicação: Utilizamos um array de usuários pré-definidos para realizar o login baseado no ID do Usuário Virtual (VU).

11) Groups:

- Arquivo: [`test/k6/tests/api.performance.test.js`](test/k6/tests/api.performance.test.js) 
- Aplicação: Organizamos as ações em blocos lógicos como "Login do usuário" e "Criação de usuário" para melhor visualização no relatório.
