/**
 * All UI strings used in the application, keyed by locale code.
 */

export type LocaleCode = "en" | "cs" | "de" | "fr";

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;

  // π badge
  dropHint: string;

  // Legend
  legendCrossing: string;
  legendNotCrossing: string;

  // ControlPanel
  panelParameters: string;
  panelNeedleConstraint: string;
  labelNeedleLength: string;
  descNeedleLength: string;
  labelLineSpacing: string;
  descLineSpacing: string;
  labelSpeed: string;
  descSpeed: string;
  descSpeedSlow: string;
  labelMaxNeedles: string;
  descMaxNeedles: string;
  btnStart: string;
  btnPause: string;
  btnReset: string;
  btnDropOne: string;

  /** Short hint shown below the canvas */
  panelStats: string;
  statNeedlesDropped: string;
  statCrossingLines: string;
  statCrossingRatio: string;
  statPiReal: string;
  statPiEstimated: string;
  statAbsError: string;
  statRelError: string;

  // InfoPanel
  panelHowItWorks: string;
  infoLine1: string;
  infoLine2: string;
  infoWhere: string;
  infoAfter: string;
  infoConverge: string;
  /** Short hint shown below the canvas */
  clickToDropHint: string;
  // Footer
  footerStar: string;
  footerFork: string;
}

const en: Translations = {
  appTitle: "Buffon's Needle",
  appSubtitle: "Estimating π through geometric probability",
  dropHint: "Drop some needles to estimate π…",
  legendCrossing: "Crossing line",
  legendNotCrossing: "Not crossing",
  panelParameters: "Parameters",
  panelNeedleConstraint: "Needle length must not exceed line spacing.",
  labelNeedleLength: "Needle length",
  descNeedleLength: "Length of each dropped needle",
  labelLineSpacing: "Line spacing",
  descLineSpacing: "Distance between parallel lines",
  labelSpeed: "Speed",
  descSpeed: "Needles added per animation frame",
  descSpeedSlow: "One needle every {n} frames",
  labelMaxNeedles: "Max needles",
  descMaxNeedles: "Simulation stops after this many needles",
  btnStart: "▶ Start",
  btnPause: "⏸ Pause",
  btnReset: "↺ Reset",
  btnDropOne: "+ Drop one",
  panelStats: "Live Statistics",
  statNeedlesDropped: "Needles dropped",
  statCrossingLines: "Crossing lines",
  statCrossingRatio: "Crossing ratio",
  statPiReal: "π  (real)",
  statPiEstimated: "π  (estimated)",
  statAbsError: "Absolute error",
  statRelError: "Relative error",
  panelHowItWorks: "How it works",
  infoLine1: "A needle of length {l} is dropped randomly on a floor ruled with parallel lines spaced {d} apart (where l ≤ d).",
  infoLine2: "The needle crosses a line when:",
  infoWhere: "where {yc} is the centre y-coordinate and {theta} is the needle's angle.",
  infoAfter: "After {n} throws with {c} crossings, we estimate:",
  infoConverge: "The more needles dropped, the closer the estimate converges to the true value of π ≈ 3.14159…",
  clickToDropHint: "Click on the canvas to drop a needle at that position",
  footerStar: "Star on GitHub",
  footerFork: "Fork",
};

const cs: Translations = {
  appTitle: "Buffonova jehla",
  appSubtitle: "Odhad π pomocí geometrické pravděpodobnosti",
  dropHint: "Pusťte jehly a odhadněte π…",
  legendCrossing: "Protíná čáru",
  legendNotCrossing: "Neprotíná",
  panelParameters: "Parametry",
  panelNeedleConstraint: "Délka jehly nesmí přesáhnout rozestup čar.",
  labelNeedleLength: "Délka jehly",
  descNeedleLength: "Délka každé hozené jehly",
  labelLineSpacing: "Rozestup čar",
  descLineSpacing: "Vzdálenost mezi rovnoběžnými čarami",
  labelSpeed: "Rychlost",
  descSpeed: "Jehly přidané za snímek animace",
  descSpeedSlow: "Jedna jehla každých {n} snímků",
  labelMaxNeedles: "Max. jehel",
  descMaxNeedles: "Simulace se zastaví po tomto počtu jehel",
  btnStart: "▶ Spustit",
  btnPause: "⏸ Pozastavit",
  btnReset: "↺ Reset",
  btnDropOne: "+ Hodit jehlu",
  panelStats: "Živá statistika",
  statNeedlesDropped: "Hozených jehel",
  statCrossingLines: "Protínajících čáru",
  statCrossingRatio: "Podíl protínajících",
  statPiReal: "π  (skutečné)",
  statPiEstimated: "π  (odhadované)",
  statAbsError: "Absolutní chyba",
  statRelError: "Relativní chyba",
  panelHowItWorks: "Jak to funguje",
  infoLine1: "Jehla délky {l} je náhodně hozena na podlahu s rovnoběžnými čarami vzdálenými {d} (kde l ≤ d).",
  infoLine2: "Jehla protíná čáru, pokud:",
  infoWhere: "kde {yc} je y-souřadnice středu jehly a {theta} je úhel jehly.",
  infoAfter: "Po {n} hodech s {c} průsečíky odhadujeme:",
  infoConverge: "Čím více jehel, tím přesněji se odhad blíží skutečné hodnotě π ≈ 3,14159…",
  clickToDropHint: "Kliknutím na plátno hodíte jehlu na dané místo",
  footerStar: "Hvězda na GitHubu",
  footerFork: "Forkovat",
};

const de: Translations = {
  appTitle: "Buffons Nadel",
  appSubtitle: "Schätzung von π durch geometrische Wahrscheinlichkeit",
  dropHint: "Werfen Sie Nadeln, um π zu schätzen…",
  legendCrossing: "Schneidet Linie",
  legendNotCrossing: "Schneidet nicht",
  panelParameters: "Parameter",
  panelNeedleConstraint: "Nadellänge darf den Linienabstand nicht überschreiten.",
  labelNeedleLength: "Nadellänge",
  descNeedleLength: "Länge jeder geworfenen Nadel",
  labelLineSpacing: "Linienabstand",
  descLineSpacing: "Abstand zwischen parallelen Linien",
  labelSpeed: "Geschwindigkeit",
  descSpeed: "Nadeln pro Animationsframe",
  descSpeedSlow: "Eine Nadel alle {n} Frames",
  labelMaxNeedles: "Max. Nadeln",
  descMaxNeedles: "Simulation stoppt nach dieser Anzahl",
  btnStart: "▶ Starten",
  btnPause: "⏸ Pause",
  btnReset: "↺ Zurücksetzen",
  btnDropOne: "+ Eine werfen",
  panelStats: "Live-Statistik",
  statNeedlesDropped: "Geworfene Nadeln",
  statCrossingLines: "Schneidende Nadeln",
  statCrossingRatio: "Schneidequote",
  statPiReal: "π  (real)",
  statPiEstimated: "π  (geschätzt)",
  statAbsError: "Absoluter Fehler",
  statRelError: "Relativer Fehler",
  panelHowItWorks: "So funktioniert es",
  infoLine1: "Eine Nadel der Länge {l} wird zufällig auf einen Boden mit parallelen Linien im Abstand {d} geworfen (wobei l ≤ d).",
  infoLine2: "Die Nadel schneidet eine Linie, wenn:",
  infoWhere: "wobei {yc} die y-Koordinate des Mittelpunkts und {theta} der Winkel der Nadel ist.",
  infoAfter: "Nach {n} Würfen mit {c} Schnitten schätzen wir:",
  infoConverge: "Je mehr Nadeln, desto näher konvergiert die Schätzung zum wahren Wert π ≈ 3,14159…",
  clickToDropHint: "Klicken Sie auf die Leinwand, um eine Nadel an dieser Stelle zu werfen",
  footerStar: "Stern auf GitHub",
  footerFork: "Forken",
};

const fr: Translations = {
  appTitle: "L'aiguille de Buffon",
  appSubtitle: "Estimation de π par la probabilité géométrique",
  dropHint: "Lancez des aiguilles pour estimer π…",
  legendCrossing: "Croise une ligne",
  legendNotCrossing: "Ne croise pas",
  panelParameters: "Paramètres",
  panelNeedleConstraint: "La longueur de l'aiguille ne doit pas dépasser l'espacement.",
  labelNeedleLength: "Longueur de l'aiguille",
  descNeedleLength: "Longueur de chaque aiguille lancée",
  labelLineSpacing: "Espacement des lignes",
  descLineSpacing: "Distance entre les lignes parallèles",
  labelSpeed: "Vitesse",
  descSpeed: "Aiguilles ajoutées par frame d'animation",
  descSpeedSlow: "Une aiguille toutes les {n} frames",
  labelMaxNeedles: "Max. aiguilles",
  descMaxNeedles: "La simulation s'arrête après ce nombre d'aiguilles",
  btnStart: "▶ Démarrer",
  btnPause: "⏸ Pause",
  btnReset: "↺ Réinitialiser",
  btnDropOne: "+ Lancer une",
  panelStats: "Statistiques en direct",
  statNeedlesDropped: "Aiguilles lancées",
  statCrossingLines: "Croisant une ligne",
  statCrossingRatio: "Taux de croisement",
  statPiReal: "π  (réel)",
  statPiEstimated: "π  (estimé)",
  statAbsError: "Erreur absolue",
  statRelError: "Erreur relative",
  panelHowItWorks: "Comment ça marche",
  infoLine1: "Une aiguille de longueur {l} est lancée aléatoirement sur un plancher quadrillé de lignes espacées de {d} (où l ≤ d).",
  infoLine2: "L'aiguille croise une ligne lorsque :",
  infoWhere: "où {yc} est la coordonnée y du centre et {theta} est l'angle de l'aiguille.",
  infoAfter: "Après {n} lancers avec {c} croisements, on estime :",
  infoConverge: "Plus il y a d'aiguilles, plus l'estimation converge vers la vraie valeur de π ≈ 3,14159…",
  clickToDropHint: "Cliquez sur le canvas pour lancer une aiguille à cet endroit",
  footerStar: "Étoile sur GitHub",
  footerFork: "Forker",
};

export const LOCALES: Record<LocaleCode, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  cs: { label: "Čeština", flag: "🇨🇿" },
  de: { label: "Deutsch", flag: "🇩🇪" },
  fr: { label: "Français", flag: "🇫🇷" },
};

export const translations: Record<LocaleCode, Translations> = { en, cs, de, fr };






