// Define como a carga vai subir e descer durante o teste [cite: 97, 98]
export const stages = [
    { duration: '10s', target: 5 },  // Sobe para 5 usuários em 10 segundos [cite: 100]
    { duration: '20s', target: 10 }, // Sobe para 10 usuários por 20 segundos [cite: 101]
    { duration: '10s', target: 0 }   // Desce para 0 usuários em 10 segundos [cite: 102]
];
