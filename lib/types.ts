export type Conference = "Est" | "Ouest";

export type Team = {
  id: string;
  name: string;
  conference: Conference;
  division: string;
  color: string;
};

export type Player = {
  id: string;
  name: string;
  teamId: string;
  position: string;
  number: number | null;
  height?: string;
  weight?: string;
  season: string;
  stats: {
    points: number | null;
    rebounds: number | null;
    assists: number | null;
    threePointPct: number | null;
  };
  strengths: string[];
  weaknesses: string[];
  studyFocus: string[];
  advice: string[];
  youtubeSearch: string;
};

export type Game = {
  id: string;
  date: string;
  tipoffParis: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  status: "upcoming" | "live" | "final";
  source: string;
};

export type Move = {
  id: string;
  name: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  description: string;
  useCases: string[];
  commonMistakes: string[];
  drill: string;
  playersToStudy: string[];
};

export type Tactic = {
  id: string;
  name: string;
  category: "Attaque" | "Défense";
  description: string;
  read: string;
  examples: string[];
};

export type Standing = {
  teamId: string;
  conference: Conference;
  rank: number;
  wins: number;
  losses: number;
  asOf: string;
};
