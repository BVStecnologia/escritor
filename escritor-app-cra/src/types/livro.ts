// Interface para representar um livro
export interface Livro {
  id: number;
  created_at: string;
  updated_at?: string;
  "Nome do livro": string;
  "Autor"?: string;
  email_user?: string;
  titulo?: string; // Adicionado para compatibilidade com DashboardPage
  autor?: string;  // Adicionado para compatibilidade com DashboardPage
}