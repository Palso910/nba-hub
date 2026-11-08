"use client";

import { useEffect, useMemo, useState } from "react";
import { freeResources } from "@/lib/data/resources";
import { teams } from "@/lib/data/teams";
import { games } from "@/lib/data/games";
import { players, playerDataStatus } from "@/lib/data/players";
import { moves } from "@/lib/data/moves";
import { tactics } from "@/lib/data/tactics";
import { standings } from "@/lib/data/standings";
import { youtubeSearch } from "@/lib/utils";

type Section = "home" | "planning" | "players" | "moves" | "tactics" | "standings" | "free" | "favorites";

const navigation: { id: Section; label: string; icon: string }[] = [
  { id: "home", label: "Accueil", icon: "⌂" },
  { id: "planning", label: "Planning & scores", icon: "▦" },
  { id: "players", label: "Joueurs", icon: "◎" },
  { id: "moves", label: "Moves & drills", icon: "↗" },
  { id: "tactics", label: "Tactique", icon: "⌘" },
  { id: "standings", label: "Classements", icon: "▤" },
  { id: "free", label: "Contenu gratuit", icon: "▷" },
  { id: "favorites", label: "Ma watchlist", icon: "☆" },
];

export function Dashboard() {
  const [section, setSection] = useState<Section>("home");
  const [query, setQuery] = useState("");
  const [conference, setConference] = useState<"Toutes" | "Est" | "Ouest">("Toutes");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("nbahub.favorites");
      const savedNotes = localStorage.getItem("nbahub.notes");
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites) as string[]);
      if (savedNotes) setNotes(JSON.parse(savedNotes) as Record<string, string>);
    } catch {
      setFavorites([]);
      setNotes({});
    }
  }, []);

  const saveFavorites = (items: string[]) => {
    setFavorites(items);
    try {
      localStorage.setItem("nbahub.favorites", JSON.stringify(items));
    } catch {
      // The app remains usable when browser storage is disabled.
    }
  };

  const filteredTeams = useMemo(() => teams.filter((team) => {
    const matchesConference = conference === "Toutes" || team.conference === conference;
    const matchesQuery = `${team.name} ${team.id} ${team.division}`.toLowerCase().includes(query.toLowerCase());
    return matchesConference && matchesQuery;
  }), [conference, query]);

  const playerResults = players.filter((player) => {
    const team = teams.find((item) => item.id === player.teamId);
    return `${player.name} ${team?.name ?? ""}`.toLowerCase().includes(query.toLowerCase());
  });

  const toggleFavorite = (id: string) => {
    saveFavorites(favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id]);
  };

  const updateNote = (id: string, value: string) => {
    const next = { ...notes, [id]: value };
    setNotes(next);
    try {
      localStorage.setItem("nbahub.notes", JSON.stringify(next));
    } catch {
      // Notes remain in memory for this visit if storage is unavailable.
    }
  };

  const heading = navigation.find((item) => item.id === section)?.label ?? "NBA Hub";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setSection("home")} aria-label="Retour à l'accueil">
          <span className="brand-mark">N</span><span>NBA <b>Hub</b></span>
        </button>
        <div className="sidebar-label">TON ESPACE</div>
        <nav className="side-nav" aria-label="Navigation principale">
          {navigation.map((item) => (
            <button key={item.id} className={section === item.id ? "nav-item active" : "nav-item"} onClick={() => setSection(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
              {item.id === "favorites" && favorites.length > 0 && <span className="nav-count">{favorites.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="eyebrow">GRATUIT & LOCAL</span>
          <b>Pas d'abonnement. Pas de compte.</b>
          <p>Les données et tes favoris restent dans ton navigateur.</p>
        </div>
        <div className="sidebar-foot">NBA HUB · ÉDITION FRANÇAISE</div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">N</span> NBA <b>Hub</b></div>
          <label className="searchbox">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher équipe, joueur, move, tactique…" />
            <kbd>CTRL K</kbd>
          </label>
          <span className="offline-pill"><i /> HORS LIGNE</span>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><span className="eyebrow">LE JEU, EN PROFONDEUR</span><h1>{heading}</h1></div>
            <span className="season-tag">30 ÉQUIPES · MODE GRATUIT</span>
          </div>
          {section === "home" && <Home gamesCount={games.length} playersCount={players.length} teamsCount={teams.length} onNavigate={setSection} />}
          {section === "planning" && <Planning />}
          {section === "players" && <Players query={query} results={playerResults} selected={selectedPlayer} onSelect={setSelectedPlayer} favorites={favorites} onFavorite={toggleFavorite} notes={notes} onNote={updateNote} />}
          {section === "moves" && <Moves query={query} favorites={favorites} onFavorite={toggleFavorite} />}
          {section === "tactics" && <Tactics query={query} favorites={favorites} onFavorite={toggleFavorite} />}
          {section === "standings" && <Standings conference={conference} setConference={setConference} teams={filteredTeams} />}
          {section === "free" && <FreeContent />}
          {section === "favorites" && <Favorites ids={favorites} onRemove={toggleFavorite} onNavigate={setSection} />}
        </div>
      </main>
    </div>
  );
}

function Home({ gamesCount, playersCount, teamsCount, onNavigate }: { gamesCount: number; playersCount: number; teamsCount: number; onNavigate: (section: Section) => void }) {
  return <>
    <section className="hero-panel">
      <div className="hero-copy"><span className="eyebrow">SANS ABONNEMENT · SANS API</span>
        <h2>Ta passion NBA,<br /><em>sans limites.</em></h2>
        <p>Une base pour suivre les équipes, comprendre le jeu et progresser — utilisable hors ligne, avec des sources vidéo gratuites en option.</p>
        <button className="primary-button" onClick={() => onNavigate("free")}>Voir les sources gratuites <span>↗</span></button>
      </div>
      <div className="hero-orb" aria-hidden="true"><span>NBA</span><b>HUB</b></div>
    </section>
    <section className="stat-grid">
      <Stat value={teamsCount.toString()} label="ÉQUIPES" detail="Est & Ouest" />
      <Stat value={playersCount.toString()} label="FICHES JOUEURS" detail="À enrichir avec sources datées" />
      <Stat value={gamesCount.toString()} label="MATCHS LOCAUX" detail="Aucun faux score" />
      <Stat value={`${moves.length}+`} label="MOVES" detail="Avec exercices associés" />
    </section>
    <section className="section-block">
      <div className="section-title"><div><span className="eyebrow">EXPLORER</span><h2>Le basket sous tous les angles</h2></div></div>
      <div className="feature-grid">
        <Feature title="Les joueurs" text={`${playersCount ? `${playersCount} fiches disponibles` : "La base d'effectifs vérifiés est en cours de chargement."} Stats avec date et source prévues.`} icon="◎" onClick={() => onNavigate("players")} />
        <Feature title="Moves & drills" text={`${moves.length} gestes techniques expliqués avec situations d'usage et entraînements.`} icon="↗" onClick={() => onNavigate("moves")} />
        <Feature title="Analyse tactique" text={`${tactics.length} systèmes d'attaque et principes défensifs illustrés simplement.`} icon="⌘" onClick={() => onNavigate("tactics")} />
        <Feature title="Classements" text="Classements par conférence affichés uniquement quand leur date de mise à jour est fournie." icon="▤" onClick={() => onNavigate("standings")} />
      </div>
    </section>
    <section className="section-block">
      <div className="section-title"><div><span className="eyebrow">CONTENU GRATUIT</span><h2>Regarder, écouter, apprendre</h2></div><button className="text-button" onClick={() => onNavigate("free")}>Toutes les sources ↗</button></div>
      <div className="resource-strip">{freeResources.slice(0, 4).map((resource) => <a className="resource-mini" key={resource.name} href={resource.url} target="_blank" rel="noreferrer"><span>↗</span><b>{resource.name}</b><small>{resource.category} · Gratuit</small></a>)}</div>
    </section>
  </>;
}

function Stat({ value, label, detail }: { value: string; label: string; detail: string }) {
  return <div className="stat-card"><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>;
}

function Feature({ title, text, icon, onClick }: { title: string; text: string; icon: string; onClick: () => void }) {
  return <button className="feature-card" onClick={onClick}><span className="feature-icon">{icon}</span><b>{title}</b><p>{text}</p><span className="feature-arrow">Explorer ↗</span></button>;
}

function Planning() {
  return <section className="empty-panel"><span className="empty-icon">▦</span><h2>Planning sans matchs inventés</h2><p>Cette version n'affiche aucun calendrier généré artificiellement. Les rencontres se chargent depuis le tableau local <code>lib/data/games.ts</code> une fois les dates vérifiées.</p><div className="free-callout">Les scores en direct ne sont pas disponibles hors ligne. Les liens gratuits vers NBA.com et NBA sur YouTube sont dans « Contenu gratuit ».</div></section>;
}

function Players({ query, results, selected, onSelect, favorites, onFavorite, notes, onNote }: { query: string; results: typeof players; selected: string | null; onSelect: (id: string | null) => void; favorites: string[]; onFavorite: (id: string) => void; notes: Record<string, string>; onNote: (id: string, value: string) => void }) {
  const player = players.find((item) => item.id === selected);
  if (player) {
    const team = teams.find((item) => item.id === player.teamId);
    return <section className="section-block"><button className="text-button" onClick={() => onSelect(null)}>← Retour à tous les joueurs</button><div className="detail-panel"><span className="eyebrow">{team?.name} · {player.position} · #{player.number ?? "—"}</span><h2>{player.name}</h2><p>{playerDataStatus.season} · points forts, lectures et conseils d'étude</p><div className="detail-grid"><div><b>Points forts</b>{player.strengths.map((text) => <p key={text}>• {text}</p>)}</div><div><b>À travailler</b>{player.weaknesses.map((text) => <p key={text}>• {text}</p>)}</div><div><b>Séquences à observer</b>{player.studyFocus.map((text) => <p key={text}>• {text}</p>)}</div><div><b>Conseils pratiques</b>{player.advice.map((text) => <p key={text}>• {text}</p>)}</div></div><a className="primary-button inline" href={youtubeSearch(`${player.name} NBA highlights`)} target="_blank" rel="noreferrer">Recherche YouTube gratuite ↗</a><label className="note-field">Mes notes<textarea value={notes[player.id] ?? ""} onChange={(event) => onNote(player.id, event.target.value)} placeholder="Notes personnelles, détails à revoir…" /></label></div></section>;
  }
  return <section className="section-block"><div className="section-title"><div><span className="eyebrow">BASE DE JOUEURS</span><h2>{results.length} fiche{results.length === 1 ? "" : "s"}</h2></div></div>
    <div className="data-notice"><b>Base actuelle : {playerDataStatus.season}</b><span>{playerDataStatus.note} Les stats ne sont jamais présentées comme du direct.</span></div>
    {results.length ? <div className="player-grid">{results.map((player) => <article className="player-card" key={player.id}><button className="favorite-button" onClick={() => onFavorite(player.id)} aria-label="Ajouter aux favoris">{favorites.includes(player.id) ? "★" : "☆"}</button><span className="eyebrow">{teams.find((team) => team.id === player.teamId)?.name}</span><h3>{player.name}</h3><p>{player.position} · #{player.number ?? "—"}</p><div className="player-stats"><span>{player.stats.points ?? "—"}<small>PTS</small></span><span>{player.stats.rebounds ?? "—"}<small>REB</small></span><span>{player.stats.assists ?? "—"}<small>AST</small></span></div><button className="text-button" onClick={() => onSelect(player.id)}>Ouvrir la fiche ↗</button></article>)}</div> : <div className="empty-panel compact"><h3>{query ? "Aucun joueur trouvé" : "Les effectifs complets arrivent dans cette base"}</h3><p>Le format inclut équipe, poste, numéro, taille, poids, stats datées, points forts/faibles, liens vidéo et conseils. Aucun joueur de remplissage ne sera ajouté pour gonfler le compteur.</p></div>}
  </section>;
}

function Moves({ query, favorites, onFavorite }: { query: string; favorites: string[]; onFavorite: (id: string) => void }) {
  const filtered = moves.filter((item) => `${item.name} ${item.description} ${item.playersToStudy.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="section-block"><div className="section-title"><div><span className="eyebrow">TECHNIQUE INDIVIDUELLE</span><h2>{filtered.length} moves à travailler</h2></div></div><div className="move-grid">{filtered.map((move) => <article className="content-card" key={move.id}><div className="card-top"><span className={`level ${move.level.toLowerCase()}`}>{move.level}</span><button className="favorite-button" onClick={() => onFavorite(`move:${move.id}`)} aria-label="Ajouter aux favoris">{favorites.includes(`move:${move.id}`) ? "★" : "☆"}</button></div><h3>{move.name}</h3><p>{move.description}</p><b>Quand l'utiliser</b><ul>{move.useCases.map((text) => <li key={text}>{text}</li>)}</ul><b>Erreurs fréquentes</b><ul>{move.commonMistakes.map((text) => <li key={text}>{text}</li>)}</ul><div className="drill-box"><b>Drill</b><span>{move.drill}</span></div><small>À étudier : {move.playersToStudy.join(", ")}</small><a className="text-button" href={youtubeSearch(`${move.name} basketball tutorial`)} target="_blank" rel="noreferrer">Vidéo gratuite ↗</a></article>)}</div></section>;
}

function Tactics({ query, favorites, onFavorite }: { query: string; favorites: string[]; onFavorite: (id: string) => void }) {
  const filtered = tactics.filter((item) => `${item.name} ${item.description} ${item.read} ${item.examples.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="section-block"><div className="section-title"><div><span className="eyebrow">LECTURE DU JEU</span><h2>{filtered.length} principes tactiques</h2></div></div><div className="tactic-grid">{filtered.map((item) => <article className="content-card tactic-card" key={item.id}><div className="card-top"><span className="eyebrow">{item.category}</span><button className="favorite-button" onClick={() => onFavorite(`tactic:${item.id}`)} aria-label="Ajouter aux favoris">{favorites.includes(`tactic:${item.id}`) ? "★" : "☆"}</button></div><h3>{item.name}</h3><div className="court-sketch" aria-label="Schéma tactique simplifié"><span className="ball">●</span><span className="arrow-line">↗</span><span className="defender">×</span><span className="court-caption">BALLON · DÉPLACEMENT · DÉFENSE</span></div><p>{item.description}</p><div className="drill-box"><b>Lecture clé</b><span>{item.read}</span></div><small>Exemples : {item.examples.join(" · ")}</small><a className="text-button" href={youtubeSearch(`NBA ${item.name} explained`)} target="_blank" rel="noreferrer">Voir une analyse gratuite ↗</a></article>)}</div></section>;
}

function Standings({ conference, setConference, teams: visibleTeams }: { conference: "Toutes" | "Est" | "Ouest"; setConference: (value: "Toutes" | "Est" | "Ouest") => void; teams: typeof teams }) {
  return <section className="section-block"><div className="section-title"><div><span className="eyebrow">EST & OUEST</span><h2>Classements</h2></div><div className="filter-row">{(["Toutes", "Est", "Ouest"] as const).map((value) => <button key={value} className={conference === value ? "filter active" : "filter"} onClick={() => setConference(value)}>{value}</button>)}</div></div>
    <div className="data-notice"><b>Aucun bilan fictif</b><span>Les victoires, défaites et rangs restent masqués tant que leur date de mise à jour n'est pas renseignée.</span></div>
    <div className="team-grid">{visibleTeams.map((team) => { const standing = standings.find((item) => item.teamId === team.id); return <article className="team-row" key={team.id}><span className="team-dot" style={{ background: team.color }} /><b>{team.name}</b><small>{team.conference} · {team.division}</small><span className="team-rank">{standing ? `#${standing.rank} · ${standing.wins}-${standing.losses}` : "Classement à mettre à jour"}</span></article>; })}</div>
  </section>;
}

function FreeContent() {
  return <section className="section-block"><div className="section-title"><div><span className="eyebrow">SANS ABONNEMENT</span><h2>Sources gratuites</h2><p className="muted">L'application fonctionne hors ligne. Ces sources s'ouvrent seulement à ta demande et nécessitent Internet.</p></div></div><div className="resource-grid">{freeResources.map((resource) => <a className="resource-card" key={resource.name} href={resource.url} target="_blank" rel="noreferrer"><span className="resource-category">{resource.category} · GRATUIT</span><h3>{resource.name} <i>↗</i></h3><p>{resource.detail}</p></a>)}</div></section>;
}

function Favorites({ ids, onRemove, onNavigate }: { ids: string[]; onRemove: (id: string) => void; onNavigate: (section: Section) => void }) {
  const items = ids.map((id) => {
    const move = moves.find((item) => `move:${item.id}` === id);
    const tactic = tactics.find((item) => `tactic:${item.id}` === id);
    const player = players.find((item) => item.id === id);
    return move ? { id, label: move.name, section: "moves" as Section } : tactic ? { id, label: tactic.name, section: "tactics" as Section } : player ? { id, label: player.name, section: "players" as Section } : null;
  }).filter((item): item is { id: string; label: string; section: Section } => item !== null);
  return <section className="section-block"><div className="section-title"><div><span className="eyebrow">ENREGISTRÉS DANS CE NAVIGATEUR</span><h2>Ma watchlist</h2></div></div>{items.length ? <div className="favorite-list">{items.map((item) => <div className="favorite-row" key={item.id}><button onClick={() => onNavigate(item.section)}>{item.label} <span>Ouvrir ↗</span></button><button className="remove-button" onClick={() => onRemove(item.id)} aria-label={`Retirer ${item.label}`}>×</button></div>)}</div> : <div className="empty-panel compact"><h3>Ta watchlist est vide</h3><p>Ajoute des moves, tactiques ou joueurs pour les retrouver ici. Les favoris sont stockés localement.</p></div>}</section>;
}
