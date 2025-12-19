import http from 'k6/http';
import { group, check } from 'k6';
import { login } from '../helpers/auth.helper.js';
import { generateUser } from '../helpers/user.helper.js';
import { users } from '../data/users.data.js';
import { createUserTrend } from '../metrics/trends.js';
import { stages } from '../config/stages.config.js';

export const options = {
    stages, // Conceito: Stages (Passo 10)
    thresholds: { // Conceito: Thresholds
        http_req_duration: ['p(95)<500'], // 95% das requisições devem ser < 500ms
        create_user_duration: ['avg<400'] // Média da nossa trend personalizada < 400ms
    }
};

export default function () {
    // Conceito: Data-Driven Testing (Usa os usuários do arquivo data)
    const userIndex = __VU % users.length;
    const credentials = users[userIndex];

    group('Fluxo de Performance API', () => { // Conceito: Groups
        
        // Passo 1: Login para obter o Token
        // Conceito: Helpers e Reaproveitamento de Resposta
        const token = login(credentials.email, credentials.password);

        group('Criação de novo usuário', () => {
            const payload = generateUser(); // Conceito: Faker

            const response = http.post(`${__ENV.BASE_URL}/api/users/register`, JSON.stringify(payload), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Conceito: Uso de Token
                }
            });

            // Conceito: Trends (Métrica personalizada)
            createUserTrend.add(response.timings.duration);

            // Conceito: Checks (Validação)
            check(response, {
                'usuário criado com sucesso': (r) => r.status === 201
            });
        });
    });
}
