export type Role = 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenant: string;
}
