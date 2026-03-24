function sequence(basePath, total, options = {}) {
  const { startAt = 1, extension = "png" } = options;

  return Array.from(
    { length: total },
    (_, index) => `${basePath}${index + startAt}.${extension}`,
  );
}

// Registra aqui tus personajes.
// Cada personaje define:
// - label: nombre visible
// - spriteAlt: texto alternativo
// - defaultBaseAction: animacion en reposo
// - audioFolder: carpeta base de audios para ese personaje
// - speakVariants: cantidad de variantes disponibles para la accion speak
// - speakLabel: texto visible del boton Speak
// - interactions.click: accion puntual al hacer click o tap
// - interactions.tapThreshold: numero de taps para disparar una accion especial
// - interactions.tapThresholdAction: accion especial al alcanzar el umbral
// - controlActions: acciones visibles como botones
// - actions: lista de acciones disponibles
//
// Cada accion admite:
// - label: texto del boton
// - frames: array con rutas PNG
// - fps: velocidad
// - loop: true para animaciones base, false para acciones puntuales
// - freezeOnEnd: opcional, deja el ultimo frame fijo
// - shortcut: opcional, atajo de teclado
// - audio: opcional, nombre base del archivo de audio si no coincide con la accion
// - controlLabel: opcional, texto visible del boton si quieres que difiera del label
//
// Si una animacion no sigue una numeracion simple, puedes usar:
// frames: ["./ruta/frame-a.png", "./ruta/frame-b.png"]
window.AVAILABLE_LANGUAGES = [
  { code: "esES", label: "Spanish" },
  { code: "enUS", label: "English US" },
  { code: "enUK", label: "English UK" },
  { code: "deDE", label: "German" },
  { code: "frFR", label: "French" },
  { code: "itIT", label: "Italian" },
];

window.CHARACTER_LIBRARY = {
  knight: {
    label: "Knight",
    spriteAlt: "Caballero pixel art",
    defaultBaseAction: "idle",
    audioFolder: "Knight",
    speakVariants: 5,
    speakLabel: "Speak",
    interactions: {
      click: "hurt",
      tapThreshold: 7,
      tapThresholdAction: "death",
    },
    controlActions: ["speak", "idle", "walk", "attack", "jump"],
    actions: {
      idle: {
        label: "Idle",
        frames: sequence("./characters/Knight/Idle/idle", 12),
        fps: 8,
        loop: true,
        shortcut: "1",
      },
      walk: {
        label: "Walk",
        frames: sequence("./characters/Knight/Walk/walk", 6),
        fps: 10,
        loop: true,
        shortcut: "2",
      },
      run: {
        label: "Run",
        frames: sequence("./characters/Knight/Run/run", 8),
        fps: 14,
        loop: true,
        shortcut: "3",
      },
      attack: {
        label: "Attack",
        frames: sequence("./characters/Knight/Attack/attack", 5, {
          startAt: 0,
        }),
        fps: 12,
        loop: false,
        shortcut: "a",
      },
      attackExtra: {
        label: "Attack Extra",
        frames: sequence("./characters/Knight/Attack_Extra/attack_extra", 8),
        fps: 14,
        loop: false,
      },
      walkAttack: {
        label: "Walk Attack",
        frames: sequence("./characters/Knight/Walk_Attack/walk_attack", 6),
        fps: 12,
        loop: false,
      },
      runAttack: {
        label: "Run Attack",
        frames: sequence("./characters/Knight/Run_Attack/run_attack", 8),
        fps: 14,
        loop: false,
      },
      jump: {
        label: "Jump",
        frames: sequence("./characters/Knight/Jump/jump", 7),
        fps: 10,
        loop: false,
        shortcut: "j",
      },
      highJump: {
        label: "High Jump",
        frames: sequence("./characters/Knight/High_Jump/high_jump", 12),
        fps: 11,
        loop: false,
      },
      hurt: {
        label: "Hurt",
        frames: sequence("./characters/Knight/Hurt/hurt", 4),
        fps: 8,
        loop: false,
        shortcut: "h",
      },
      death: {
        label: "Death",
        frames: sequence("./characters/Knight/Death/death", 10),
        fps: 10,
        loop: false,
        freezeOnEnd: true,
        shortcut: "x",
      },
    },
  },
  rogue: {
    label: "Rogue",
    spriteAlt: "Picaro pixel art",
    defaultBaseAction: "idle",
    audioFolder: "Rogue",
    speakVariants: 5,
    speakLabel: "Speak",
    interactions: {
      click: "hurt",
      tapThreshold: 7,
      tapThresholdAction: "death",
    },
    controlActions: ["speak", "idle", "walk", "attack", "jump"],
    actions: {
      idle: {
        label: "Idle",
        frames: sequence("./characters/Rogue/Idle/idle", 18),
        fps: 10,
        loop: true,
        shortcut: "1",
      },
      walk: {
        label: "Walk",
        frames: sequence("./characters/Rogue/Walk/walk", 6),
        fps: 11,
        loop: true,
        shortcut: "2",
      },
      run: {
        label: "Run",
        frames: sequence("./characters/Rogue/Run/run", 8),
        fps: 15,
        loop: true,
        shortcut: "3",
      },
      attack: {
        label: "Attack",
        frames: sequence("./characters/Rogue/Attack/Attack", 7),
        fps: 14,
        loop: false,
        shortcut: "a",
      },
      walkAttack: {
        label: "Walk Attack",
        frames: sequence("./characters/Rogue/Walk_Attack/walk_attack", 6),
        fps: 13,
        loop: false,
      },
      runAttack: {
        label: "Run Attack",
        frames: sequence("./characters/Rogue/Run_Attack/run_attack", 8),
        fps: 15,
        loop: false,
      },
      jump: {
        label: "Jump",
        frames: sequence("./characters/Rogue/Jump/jump", 7),
        fps: 11,
        loop: false,
        shortcut: "j",
      },
      highJump: {
        label: "High Jump",
        frames: sequence("./characters/Rogue/High_Jump/high_jump", 12),
        fps: 12,
        loop: false,
      },
      hurt: {
        label: "Hurt",
        frames: sequence("./characters/Rogue/Hurt/hurt", 4),
        fps: 9,
        loop: false,
        shortcut: "h",
      },
      death: {
        label: "Death",
        frames: sequence("./characters/Rogue/Death/death", 10),
        fps: 10,
        loop: false,
        freezeOnEnd: true,
        shortcut: "x",
      },
      attackExtra: {
        label: "Attack Extra",
        frames: sequence("./characters/Rogue/Attack_Extra/attack_extra", 11),
        fps: 15,
        loop: false,
      },
    },
  },
  mage: {
    label: "Mage",
    spriteAlt: "Mago pixel art",
    defaultBaseAction: "idle",
    audioFolder: "Mage",
    speakVariants: 5,
    speakLabel: "Speak",
    interactions: {
      click: "hurt",
      tapThreshold: 7,
      tapThresholdAction: "death",
    },
    controlActions: ["speak", "idle", "walk", "attack", "jump"],
    actions: {
      idle: {
        label: "Idle",
        frames: sequence("./characters/Mage/Idle/idle", 14),
        fps: 9,
        loop: true,
        shortcut: "1",
      },
      walk: {
        label: "Walk",
        frames: sequence("./characters/Mage/Walk/walk", 6),
        fps: 10,
        loop: true,
        shortcut: "2",
      },
      run: {
        label: "Run",
        frames: sequence("./characters/Mage/Run/run", 8),
        fps: 14,
        loop: true,
        shortcut: "3",
      },
      attack: {
        label: "Attack",
        frames: sequence("./characters/Mage/Attack/attack", 7),
        fps: 12,
        loop: false,
        shortcut: "a",
      },
      attackExtra: {
        label: "Attack Extra",
        frames: sequence("./characters/Mage/Attack_Extra/attack_extra", 7, {
          startAt: 0,
        }),
        fps: 13,
        loop: false,
      },
      walkAttack: {
        label: "Walk Attack",
        frames: sequence("./characters/Mage/Walk_Attack/walk_attack", 6),
        fps: 12,
        loop: false,
      },
      runAttack: {
        label: "Run Attack",
        frames: sequence("./characters/Mage/Run_Attack/run_attack", 8),
        fps: 14,
        loop: false,
      },
      fire: {
        label: "Fire",
        frames: sequence("./characters/Mage/Fire/fire", 9),
        fps: 12,
        loop: false,
        shortcut: "c",
      },
      jump: {
        label: "Jump",
        frames: sequence("./characters/Mage/Jump/jump", 7),
        fps: 10,
        loop: false,
        shortcut: "j",
      },
      highJump: {
        label: "High Jump",
        frames: sequence("./characters/Mage/High_Jump/high_jump", 12),
        fps: 11,
        loop: false,
      },
      hurt: {
        label: "Hurt",
        frames: sequence("./characters/Mage/Hurt/hurt", 4),
        fps: 8,
        loop: false,
        shortcut: "h",
      },
      death: {
        label: "Death",
        frames: sequence("./characters/Mage/Death/death", 10),
        fps: 10,
        loop: false,
        freezeOnEnd: true,
        shortcut: "x",
      },
    },
  },
};
