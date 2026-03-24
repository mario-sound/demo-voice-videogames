const characterLibrary = window.CHARACTER_LIBRARY || {};
const characterKeys = Object.keys(characterLibrary);
const availableLanguages = window.AVAILABLE_LANGUAGES || [
  { code: "es", label: "Español" },
];

const sprite = document.querySelector("#character-sprite");
const trigger = document.querySelector("#character-trigger");
const actionContainer = document.querySelector("#character-actions");
const characterSelect = document.querySelector("#character-select");
const languageSelect = document.querySelector("#language-select");

const statusCharacter = document.querySelector("#status-character");
const statusAction = document.querySelector("#status-action");
const statusOrigin = document.querySelector("#status-origin");
const statusLanguage = document.querySelector("#status-language");
const statusBase = document.querySelector("#status-base");
const statusFacing = document.querySelector("#status-facing");

const helpClickAction = document.querySelector("#help-click-action");
const helpHoldAction = document.querySelector("#help-hold-action");
const helpShortcuts = document.querySelector("#help-shortcuts");

const state = {
  currentCharacterKey: characterKeys[0] || null,
  currentLanguage: availableLanguages[0]?.code || "es",
  baseAction: "",
  currentAction: "",
  isBusy: false,
  isFrozen: false,
  isFlipped: false,
  frameIndex: 0,
  frameTimer: null,
  activePointerId: null,
  jumpVisualTimer: null,
  tapCount: 0,
  attackAltIndex: 0,
  jumpAltIndex: 0,
  speakVariantIndex: 0,
  activeAudio: null,
};

function getCharacterConfig() {
  return characterLibrary[state.currentCharacterKey];
}

function getAnimations() {
  const characterConfig = getCharacterConfig();
  return characterConfig ? characterConfig.actions : {};
}

function getControlActions() {
  const characterConfig = getCharacterConfig();
  return characterConfig?.controlActions || Object.keys(getAnimations());
}

function getAnimation(actionName) {
  return getAnimations()[actionName];
}

function getControlMeta(actionName) {
  const characterConfig = getCharacterConfig();

  if (actionName === "speak") {
    return {
      label: characterConfig?.speakLabel || "Speak",
      shortcut: "s",
    };
  }

  const animation = getAnimation(actionName);
  if (!animation) {
    return null;
  }

  return {
    label: animation.controlLabel || animation.label || actionName,
    shortcut: animation.shortcut || null,
    loop: Boolean(animation.loop),
  };
}

function getActionLabel(actionName) {
  const controlMeta = getControlMeta(actionName);
  if (controlMeta) {
    return controlMeta.label;
  }

  const animation = getAnimation(actionName);
  return animation ? animation.label || actionName : actionName;
}

function getAudioName(actionName) {
  const actionConfig = getAnimation(actionName);
  return actionConfig?.audio || actionName;
}

function getAudioPath(audioName) {
  const characterConfig = getCharacterConfig();
  const audioFolder = characterConfig?.audioFolder;
  const languageCode = state.currentLanguage;

  if (!audioFolder || !languageCode || !audioName) {
    return null;
  }

  return `./audio/${audioFolder}/${languageCode}/${audioName}_${languageCode}.mp3`;
}

function getSpeakVariantCount() {
  const characterConfig = getCharacterConfig();
  return Math.max(1, characterConfig?.speakVariants || 1);
}

function getSpeakAudioPath() {
  const variantCount = getSpeakVariantCount();

  if (variantCount <= 1) {
    return getAudioPath("speak");
  }

  const variantNumber = (state.speakVariantIndex % variantCount) + 1;
  return getAudioPath(`speak_${variantNumber}`);
}

function getActionAudioPath(actionName) {
  return getAudioPath(getAudioName(actionName));
}

function getDefaultBaseAction(characterConfig) {
  if (characterConfig.actions[characterConfig.defaultBaseAction]) {
    return characterConfig.defaultBaseAction;
  }

  const firstLoopAction = Object.entries(characterConfig.actions).find(
    ([, actionConfig]) => actionConfig.loop,
  );

  if (firstLoopAction) {
    return firstLoopAction[0];
  }

  return Object.keys(characterConfig.actions)[0];
}

function emitCharacterEvent(name, detail) {
  window.dispatchEvent(
    new CustomEvent(name, {
      detail: {
        ...detail,
        at: new Date().toISOString(),
      },
    }),
  );
}

function updateStatus(origin) {
  const characterConfig = getCharacterConfig();
  statusCharacter.textContent = characterConfig ? characterConfig.label : "-";
  statusAction.textContent = state.currentAction || "-";
  statusOrigin.textContent = origin;
  statusLanguage.textContent = state.currentLanguage || "-";
  statusBase.textContent = state.baseAction || "-";
  statusFacing.textContent = state.isFlipped ? "izquierda" : "derecha";
}

function showFrame(actionName, frameIndex) {
  const animation = getAnimation(actionName);
  if (!animation) {
    return;
  }

  sprite.src = animation.frames[frameIndex];
}

function clearAnimationTimer() {
  if (state.frameTimer) {
    window.clearTimeout(state.frameTimer);
    state.frameTimer = null;
  }
}

function getRestingAction() {
  return state.baseAction;
}

function getShortcutMarkup() {
  const shortcuts = getControlActions()
    .map((actionName) => getControlMeta(actionName))
    .filter((controlMeta) => Boolean(controlMeta?.shortcut))
    .map(
      (controlMeta) =>
        `<code>${controlMeta.shortcut}</code> ${controlMeta.label}`,
    );

  shortcuts.push("<code>r</code> reset");
  return shortcuts.join(", ");
}

function renderSelector() {
  characterSelect.innerHTML = characterKeys
    .map((characterKey) => {
      const characterConfig = characterLibrary[characterKey];
      const selected =
        characterKey === state.currentCharacterKey ? "selected" : "";

      return `<option value="${characterKey}" ${selected}>${characterConfig.label}</option>`;
    })
    .join("");

  languageSelect.innerHTML = availableLanguages
    .map((language) => {
      const selected =
        language.code === state.currentLanguage ? "selected" : "";
      return `<option value="${language.code}" ${selected}>${language.label}</option>`;
    })
    .join("");
}

function renderControls() {
  const actions = getControlActions()
    .map((actionName) => [actionName, getControlMeta(actionName)])
    .filter(([, controlMeta]) => Boolean(controlMeta));

  const actionButtons = actions.map(([actionKey, controlMeta]) => {
    const animation = getAnimation(actionKey);
    const buttonClass = [
      "control-btn",
      state.baseAction === actionKey && animation?.loop ? "is-active" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return `
        <button type="button" class="${buttonClass}" data-action="${actionKey}">
          ${controlMeta.label}
        </button>
      `;
  });

  actionButtons.push(`
    <button
      type="button"
      class="control-btn control-btn--ghost"
      data-utility-action="reset"
    >
      Reset
    </button>
  `);

  actionContainer.innerHTML = actionButtons.join("");

  actionContainer.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handleAction(button.dataset.action, "control");
    });
  });

  actionContainer
    .querySelectorAll("[data-utility-action]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        handleUtilityAction(button.dataset.utilityAction, "control");
      });
    });
}

function renderHelp() {
  const characterConfig = getCharacterConfig();
  const clickAction = characterConfig?.interactions?.click;

  helpClickAction.textContent = clickAction
    ? getActionLabel(clickAction)
    : "sin accion";
  helpHoldAction.textContent = "sin accion";
  helpShortcuts.innerHTML = getShortcutMarkup();
}

function syncCharacterUI(origin) {
  renderSelector();
  renderControls();
  renderHelp();
  updateStatus(origin);
}

function applyFlip(origin = "flip", options = {}) {
  const { emit = true } = options;

  sprite.classList.toggle("is-flipped", state.isFlipped);
  updateStatus(origin);

  if (emit) {
    emitCharacterEvent("character:interaction", {
      type: "flip",
      character: state.currentCharacterKey,
      flipped: state.isFlipped,
    });
  }
}

function resetToBase(origin = "reset") {
  state.isFrozen = false;
  state.isBusy = false;
  playAction(state.baseAction, { origin, force: true, withAudio: false });
}

function clearJumpVisual() {
  if (state.jumpVisualTimer) {
    window.clearTimeout(state.jumpVisualTimer);
    state.jumpVisualTimer = null;
  }

  trigger.classList.remove("is-jumping");
}

function stopActiveAudio() {
  if (!state.activeAudio) {
    return;
  }

  state.activeAudio.pause();
  state.activeAudio.currentTime = 0;
  state.activeAudio = null;
}

function playAudio(audioPath, detail = {}) {
  if (!audioPath) {
    return;
  }

  stopActiveAudio();

  const audio = new Audio(audioPath);
  state.activeAudio = audio;

  audio.addEventListener("ended", () => {
    if (state.activeAudio === audio) {
      state.activeAudio = null;
    }
  });

  audio.addEventListener("error", () => {
    console.warn(`[audio] No se pudo cargar ${audioPath}`);
    if (state.activeAudio === audio) {
      state.activeAudio = null;
    }

    emitCharacterEvent("character:audio-error", {
      character: state.currentCharacterKey,
      language: state.currentLanguage,
      src: audioPath,
      ...detail,
    });
  });

  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch((error) => {
      console.warn(`[audio] No se pudo reproducir ${audioPath}`, error);
      if (state.activeAudio === audio) {
        state.activeAudio = null;
      }
    });
  }
}

function playSpeakAudio(origin = "control") {
  const audioPath = getSpeakAudioPath();
  if (!audioPath) {
    return;
  }

  const variantCount = getSpeakVariantCount();
  const variantNumber =
    variantCount <= 1 ? 1 : (state.speakVariantIndex % variantCount) + 1;

  updateStatus(`${origin}-speak`);
  emitCharacterEvent("character:interaction", {
    type: "speak",
    character: state.currentCharacterKey,
    language: state.currentLanguage,
    action: "speak",
    variant: variantNumber,
    src: audioPath,
  });
  playAudio(audioPath, { action: "speak", type: "speak", origin });

  state.speakVariantIndex =
    variantCount <= 1 ? 0 : (state.speakVariantIndex + 1) % variantCount;
}

function playActionAudio(actionName, origin = "action") {
  const audioPath = getActionAudioPath(actionName);
  if (!audioPath) {
    return;
  }

  emitCharacterEvent("character:interaction", {
    type: "action-audio",
    character: state.currentCharacterKey,
    language: state.currentLanguage,
    action: actionName,
    origin,
    src: audioPath,
  });

  playAudio(audioPath, {
    action: actionName,
    type: "action-audio",
    origin,
  });
}

function startJumpVisual(actionName) {
  if (actionName !== "jump" && actionName !== "highJump") {
    clearJumpVisual();
    return;
  }

  const animation = getAnimation(actionName);
  const duration = animation
    ? Math.max(
        450,
        Math.round((animation.frames.length / animation.fps) * 1000),
      )
    : 700;

  clearJumpVisual();
  trigger.classList.remove("is-jumping");
  void trigger.offsetWidth;
  trigger.classList.add("is-jumping");
  state.jumpVisualTimer = window.setTimeout(() => {
    trigger.classList.remove("is-jumping");
    state.jumpVisualTimer = null;
  }, duration);
}

function runAnimationStep(actionName, origin) {
  const animation = getAnimation(actionName);
  if (!animation) {
    return;
  }

  showFrame(actionName, state.frameIndex);

  const isLastFrame = state.frameIndex === animation.frames.length - 1;
  if (isLastFrame) {
    if (animation.loop) {
      state.frameIndex = 0;
      state.frameTimer = window.setTimeout(
        () => runAnimationStep(actionName, origin),
        1000 / animation.fps,
      );
      return;
    }

    state.isBusy = false;

    if (animation.freezeOnEnd) {
      state.isFrozen = true;
      updateStatus(origin);
      return;
    }

    playAction(getRestingAction(), {
      origin: `${origin}-return`,
      force: true,
      withAudio: false,
    });
    return;
  }

  state.frameIndex += 1;
  state.frameTimer = window.setTimeout(
    () => runAnimationStep(actionName, origin),
    1000 / animation.fps,
  );
}

function playAction(actionName, options = {}) {
  const { origin = "system", force = false, withAudio = true } = options;
  const animation = getAnimation(actionName);

  if (!animation) {
    return;
  }

  if (state.isFrozen && !force && !animation.loop) {
    return;
  }

  clearAnimationTimer();
  state.currentAction = actionName;
  state.frameIndex = 0;
  state.isBusy = !animation.loop;

  startJumpVisual(actionName);
  if (withAudio) {
    playActionAudio(actionName, origin);
  }
  syncCharacterUI(origin);
  emitCharacterEvent("character:action", {
    character: state.currentCharacterKey,
    action: actionName,
    origin,
    baseAction: state.baseAction,
  });

  runAnimationStep(actionName, origin);
}

function setBaseAction(actionName, origin = "control") {
  const animation = getAnimation(actionName);
  if (!animation || !animation.loop) {
    return;
  }

  state.baseAction = actionName;
  state.isFrozen = false;
  state.isBusy = false;
  playAction(getRestingAction(), { origin, force: true });
}

function triggerOneShot(actionName, origin = "interaction") {
  const animation = getAnimation(actionName);
  if (!animation || animation.loop) {
    return;
  }

  if (state.isBusy) {
    return;
  }

  if (state.isFrozen && actionName !== "death") {
    return;
  }

  playAction(actionName, { origin, force: true });
}

function handleUtilityAction(actionName, origin = "control") {
  if (actionName === "reset") {
    stopActiveAudio();
    state.tapCount = 0;
    state.attackAltIndex = 0;
    state.jumpAltIndex = 0;
    state.speakVariantIndex = 0;
    state.baseAction = getDefaultBaseAction(getCharacterConfig());
    state.isFlipped = false;
    applyFlip(origin);
    resetToBase(origin);
  }
}

function resolveAttackAction() {
  if (state.baseAction === "walk" && getAnimation("walkAttack")) {
    return "walkAttack";
  }

  if (state.baseAction === "run" && getAnimation("runAttack")) {
    return "runAttack";
  }

  if (state.baseAction === "idle") {
    const idleAttackOptions = ["attack", "attackExtra"].filter((actionName) =>
      Boolean(getAnimation(actionName)),
    );

    if (!idleAttackOptions.length) {
      return null;
    }

    const nextAction =
      idleAttackOptions[state.attackAltIndex % idleAttackOptions.length];
    state.attackAltIndex += 1;
    return nextAction;
  }

  if (getAnimation("attack")) {
    return "attack";
  }

  return null;
}

function resolveJumpAction() {
  const jumpOptions = ["jump", "highJump"].filter((actionName) =>
    Boolean(getAnimation(actionName)),
  );

  if (!jumpOptions.length) {
    return null;
  }

  const nextAction = jumpOptions[state.jumpAltIndex % jumpOptions.length];
  state.jumpAltIndex += 1;
  return nextAction;
}

function handleAction(actionName, origin = "control") {
  if (actionName === "speak") {
    playSpeakAudio(origin);
    return;
  }

  if (actionName === "walk") {
    const toggledAction =
      state.baseAction === "walk"
        ? "run"
        : state.baseAction === "run"
          ? "walk"
          : "walk";

    setBaseAction(toggledAction, origin);
    emitCharacterEvent("character:interaction", {
      type: "base-action",
      character: state.currentCharacterKey,
      action: toggledAction,
    });
    return;
  }

  if (actionName === "attack") {
    const resolvedAttack = resolveAttackAction();
    if (!resolvedAttack) {
      return;
    }

    triggerOneShot(resolvedAttack, origin);
    emitCharacterEvent("character:interaction", {
      type: "one-shot",
      character: state.currentCharacterKey,
      action: resolvedAttack,
    });
    return;
  }

  if (actionName === "jump") {
    const resolvedJump = resolveJumpAction();
    if (!resolvedJump) {
      return;
    }

    triggerOneShot(resolvedJump, origin);
    emitCharacterEvent("character:interaction", {
      type: "one-shot",
      character: state.currentCharacterKey,
      action: resolvedJump,
    });
    return;
  }

  const animation = getAnimation(actionName);
  if (!animation) {
    return;
  }

  if (animation.loop) {
    setBaseAction(actionName, origin);
    emitCharacterEvent("character:interaction", {
      type: "base-action",
      character: state.currentCharacterKey,
      action: actionName,
    });
    return;
  }

  triggerOneShot(actionName, origin);
  emitCharacterEvent("character:interaction", {
    type: "one-shot",
    character: state.currentCharacterKey,
    action: actionName,
  });
}

function switchCharacter(characterKey, origin = "selector") {
  const nextCharacter = characterLibrary[characterKey];
  if (!nextCharacter) {
    return;
  }

  stopActiveAudio();
  clearAnimationTimer();
  state.currentCharacterKey = characterKey;
  state.baseAction = getDefaultBaseAction(nextCharacter);
  state.currentAction = state.baseAction;
  state.isBusy = false;
  state.isFrozen = false;
  state.isFlipped = false;
  state.frameIndex = 0;
  state.activePointerId = null;
  state.tapCount = 0;
  state.attackAltIndex = 0;
  state.jumpAltIndex = 0;
  state.speakVariantIndex = 0;

  clearJumpVisual();
  sprite.alt = nextCharacter.spriteAlt || nextCharacter.label;
  applyFlip(origin, { emit: false });
  syncCharacterUI(origin);
  playAction(state.baseAction, { origin, force: true, withAudio: false });

  emitCharacterEvent("character:interaction", {
    type: "character-change",
    character: characterKey,
  });
}

trigger.addEventListener("pointerdown", (event) => {
  trigger.setPointerCapture(event.pointerId);
  state.activePointerId = event.pointerId;
});

function releasePointerInteraction(origin) {
  const characterConfig = getCharacterConfig();
  const clickAction = getCharacterConfig()?.interactions?.click;
  const tapThreshold = characterConfig?.interactions?.tapThreshold ?? 0;
  const tapThresholdAction = characterConfig?.interactions?.tapThresholdAction;

  state.tapCount += 1;

  if (
    tapThreshold > 0 &&
    state.tapCount >= tapThreshold &&
    tapThresholdAction
  ) {
    state.tapCount = 0;
    emitCharacterEvent("character:interaction", {
      type: "tap-threshold",
      character: state.currentCharacterKey,
      action: tapThresholdAction,
    });
    playAction(tapThresholdAction, { origin: "tap-threshold", force: true });
    state.activePointerId = null;
    return;
  }

  emitCharacterEvent("character:interaction", {
    type: origin,
    character: state.currentCharacterKey,
    action: clickAction || null,
  });

  if (clickAction) {
    triggerOneShot(clickAction, origin);
  }

  state.activePointerId = null;
}

trigger.addEventListener("pointerup", (event) => {
  if (state.activePointerId !== event.pointerId) {
    return;
  }

  if (trigger.hasPointerCapture(event.pointerId)) {
    trigger.releasePointerCapture(event.pointerId);
  }

  releasePointerInteraction("click");
});

trigger.addEventListener("pointercancel", (event) => {
  if (state.activePointerId !== event.pointerId) {
    return;
  }

  if (trigger.hasPointerCapture(event.pointerId)) {
    trigger.releasePointerCapture(event.pointerId);
  }

  state.activePointerId = null;
});

trigger.addEventListener("pointerleave", (event) => {
  if (state.activePointerId !== event.pointerId) {
    return;
  }
});

trigger.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

trigger.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();

  const clickAction = getCharacterConfig()?.interactions?.click;
  emitCharacterEvent("character:interaction", {
    type: "keyboard-click",
    character: state.currentCharacterKey,
    action: clickAction || null,
  });

  if (clickAction) {
    triggerOneShot(clickAction, "keyboard");
  }
});

characterSelect.addEventListener("change", (event) => {
  switchCharacter(event.target.value, "selector");
});

languageSelect.addEventListener("change", (event) => {
  stopActiveAudio();
  state.currentLanguage = event.target.value;
  state.speakVariantIndex = 0;
  syncCharacterUI("language-selector");

  emitCharacterEvent("character:interaction", {
    type: "language-change",
    character: state.currentCharacterKey,
    language: state.currentLanguage,
  });
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "r") {
    handleUtilityAction("reset", "keyboard");
    return;
  }

  const shortcutMatch = getControlActions().find((actionName) => {
    const controlMeta = getControlMeta(actionName);
    return controlMeta?.shortcut?.toLowerCase() === key;
  });

  if (!shortcutMatch) {
    return;
  }

  handleAction(shortcutMatch, "keyboard");
});

window.addEventListener("character:action", (event) => {
  const { character, action, origin } = event.detail;
  console.debug(`[character] ${character}:${action} via ${origin}`);
});

if (!characterKeys.length) {
  throw new Error("No hay personajes configurados en character-config.js");
}

switchCharacter(state.currentCharacterKey, "inicio");
