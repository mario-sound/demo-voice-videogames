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
// - interactions.click: accion puntual al hacer click o tap
// - interactions.hold: accion puntual al mantener pulsado
// - interactions.holdDelay: milisegundos para la pulsacion larga
// - actions: lista de acciones disponibles
//
// Cada accion admite:
// - label: texto del boton
// - frames: array con rutas PNG
// - fps: velocidad
// - loop: true para animaciones base, false para acciones puntuales
// - freezeOnEnd: opcional, deja el ultimo frame fijo
// - shortcut: opcional, atajo de teclado
//
// Si una animacion no sigue una numeracion simple, puedes usar:
// frames: ["./ruta/frame-a.png", "./ruta/frame-b.png"]
window.CHARACTER_LIBRARY = {
  knight: {
    label: "Knight",
    spriteAlt: "Caballero pixel art",
    defaultBaseAction: "idle",
    interactions: {
      click: "hurt",
      hold: "jump",
      holdDelay: 380,
    },
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
        frames: sequence("./characters/Knight/Attack/attack", 5, { startAt: 0 }),
        fps: 12,
        loop: false,
        shortcut: "a",
      },
      jump: {
        label: "Jump",
        frames: sequence("./characters/Knight/Jump/jump", 7),
        fps: 10,
        loop: false,
        shortcut: "j",
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
    interactions: {
      click: "hurt",
      hold: "jump",
      holdDelay: 380,
    },
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
      jump: {
        label: "Jump",
        frames: sequence("./characters/Rogue/Jump/jump", 7),
        fps: 11,
        loop: false,
        shortcut: "j",
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
    interactions: {
      click: "hurt",
      hold: "jump",
      holdDelay: 380,
    },
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
