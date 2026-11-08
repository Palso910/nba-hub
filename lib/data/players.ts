import type { Player } from "@/lib/types";

// Keep this list factual: add a player only with a checked roster and a dated stat source.
export const players: Player[] = [];

export const playerDataStatus = {
  season: "À renseigner",
  updatedAt: null as string | null,
  note: "Effectifs et statistiques à compléter à partir d'une source datée avant publication.",
};
