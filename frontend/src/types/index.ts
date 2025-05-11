export interface Vacancy {
  id: string;
  name: string;
  employer: string;
  employer_id: string;
  salary_from: number | null;
  salary_to: number | null;
  experience: string;
  key_skills: string[];
}

export interface SalaryStats {
  min: number | null;
  max: number | null;
  mean: number | null;
  median: number | null;
}

export interface Statistics {
  total_vacancies: number;
  salary_stats: SalaryStats;
  experience_distribution: Record<string, number>;
  top_skills: Record<string, number>;
}

export interface SearchResponse {
  vacancies: Vacancy[];
  statistics: Statistics;
}

export interface Region {
  id: string;
  name: string;
}

export interface SearchState {
  query: string;
  numVacancies: number;
  region: string;
  loading: boolean;
  error: string | null;
  results: SearchResponse | null;
}

export interface RootState {
  search: SearchState;
} 