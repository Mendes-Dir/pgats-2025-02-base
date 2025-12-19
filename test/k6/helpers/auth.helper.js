import http from 'k6/http';
import { check } from 'k6';

export function login(email, password) {
    // Note que usamos __ENV.BASE_URL para ser dinâmico (Conceito: Variável de Ambiente)
    // Endpoint do projeto: /api/users/login
    const response = http.post(`${__ENV.BASE_URL}/api/users/login`, JSON.stringify({
        email,
        password
    }), {
        headers: { 'Content-Type': 'application/json' }
    });

    check(response, {
        'login realizado com sucesso': (r) => r.status === 200
    });

    // Retorna o token para ser usado em outras requisições (Conceito: Reaproveitamento de Resposta)
    return response.json('token');
}
