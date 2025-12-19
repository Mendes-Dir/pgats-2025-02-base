import { Trend } from 'k6/metrics';

// Define uma métrica personalizada para medir o tempo de criação de usuários [cite: 93, 95]
export const createUserTrend = new Trend('create_user_duration');
