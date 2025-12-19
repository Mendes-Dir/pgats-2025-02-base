// Gera dados aleatórios simples sem depender de bibliotecas externas (compatível com k6)
export function generateUser() {
    const id = Math.floor(Math.random() * 1e6);
    return {
        name: `User ${id}`,
        email: `user${id}@example.com`,
        password: `Pass${Math.random().toString(36).slice(2,10)}`
    };
}
