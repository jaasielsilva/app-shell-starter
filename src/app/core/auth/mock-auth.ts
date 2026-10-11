import { shellConfig } from '../config/shell.config';
import type { Role, User } from '../models/user.model';

/** Backend simulado, usado apenas quando shellConfig.api.useMock = true. */
interface MockAccount {
  password: string;
  id: string;
  name: string;
  role: Role;
}

const ACCOUNTS: Record<string, MockAccount> = {
  'admin@app.local': { password: 'admin123', id: '1', name: 'Marina Costa', role: 'ADMIN' },
  'operador@app.local': { password: 'operador123', id: '2', name: 'Diego Martins', role: 'OPERADOR' },
  'leitor@app.local': { password: 'leitor123', id: '3', name: 'Tatiane Reis', role: 'VISUALIZADOR' },
};

export const MOCK_HINT = 'admin@app.local / admin123';

function toUser(email: string, account: MockAccount): User {
  return {
    id: account.id,
    name: account.name,
    email,
    role: account.role,
    tenant: shellConfig.tenant,
  };
}

export function mockAuthenticate(email: string, password: string): User | null {
  const key = email.trim().toLowerCase();
  const account = ACCOUNTS[key];
  return account && account.password === password ? toUser(key, account) : null;
}

/** Token simulado = "mock.<email>". */
export function mockUserFromToken(token: string): User | null {
  const email = token.startsWith('mock.') ? token.slice(5) : '';
  const account = ACCOUNTS[email];
  return account ? toUser(email, account) : null;
}
