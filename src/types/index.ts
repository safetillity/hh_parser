export interface Region {
  id: string;
  name: string;
}

export interface Vacancy {
  id: string;
  name: string;
  employer: {
    name: string;
    url: string;
  };
  salary_from: number | null;
  salary_to: number | null;
  experience: string;
  key_skills: string[];
}

export interface SearchState {
  query: string;
  numVacancies: number;
  region: string;
  loading: boolean;
  error: string | null;
  results: {
    vacancies: Vacancy[];
    statistics: {
      total: number;
      salary_stats: {
        min: number;
        max: number;
        mean: number;
        median: number;
      };
      experience_distribution: Record<string, number>;
      top_skills: Record<string, number>;
    };
  } | null;
} 