const characterLibrary = window.CHARACTER_LIBRARY || {};
const characterKeys = Object.keys(characterLibrary);

const sprite = document.querySelector("#character-sprite");
const trigger = document.querySelector("#character-trigger");
const actionContainer = document.querySelector("#character-actions");
const utilityButtons = document.querySelectorAll("[data-utility-action]");
const characterSelect = document.querySelector("#character-select");

const statusCharacter = document.querySelector("#status-character");
const statusAction = document.querySelector("#status-action");
const statusOrigin = document.querySelector("#status-origin");
const statusBase = document.querySelector("#status-base");
const statusFacing = document.querySelector("#status-facing");

const helpClickAction = document.querySelector("#help-click-action");
const helpHoldAction = document.querySelector("#help-hold-action");
const helpShortcuts = document.querySelector("#help-shortcuts");

const state = {
  currentCharacterKey: characterKeys[0] || null,
  baseAction: "",
  currentAction: "",
  isBusy: false,
  isFrozen: false,
  isFlipped: false,
  frameIndex: 0,
  frameTimer: null,
  pressTimer: null,
  pressFired: false,
  activePointerId: null,
  jumpVisualTimer: null,
};

function getCharacterConfig() {
  return characterLibrary[state.currentCharacterKey];
}

function getAnimations() {
  const characterConfig = getCharacterConfig();
  return characterConfig ? characterConfig.actions : {};
}

function getAnimation(actionName) {
  return getAnimations()[actionName];
}

function getActionLabel(actionName) {
  const animation = getAnimation(actionName);
  return animation ? animation.label || actionName : actionName;
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
  const shortcuts = Object.entries(getAnimations())
    .filter(([, actionConfig]) => actionConfig.shortcut)
    .map(([, actionConfig]) => `<code>${actionConfig.shortcut}</code> ${actionConfig.label}`);

  shortcuts.push("<code>f</code> flip", "<code>r</code> reset");
  return shortcuts.join(", ");
}

function renderSelector() {
  characterSelect.innerHTML = characterKeys
    .map((characterKey) => {
      const characterConfig = characterLibrary[characterKey];
      const selected = characterKey === state.currentCharacterKey ? "selected" : "";

      return `<option value="${characterKey}" ${selected}>${characterConfig.label}</option>`;
    })
    .join("");
}

function renderControls() {
  const actions = Object.entries(getAnimations());

  actionContainer.innerHTML = actions
    .map(([actionKey, actionConfig]) => {
      const buttonClass = [
        "control-btn",
        state.baseAction === actionKey && actionConfig.loop ? "is-active" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `
        <button type="button" class="${buttonClass}" data-action="${actionKey}">
          ${actionConfig.label}
        </button>
      `;
    })
    .join("");

  actionContainer.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handleAction(button.dataset.action, "control");
    });
  });
}

function renderHelp() {
  const characterConfig = getCharacterConfig();
  const clickAction = characterConfig?.interactions?.click;
  const holdAction = characterConfig?.interactions?.hold;

  helpClickAction.textContent = clickAction ? getActionLabel(clickAction) : "sin accion";
  helpHoldAction.textContent = holdAction ? getActionLabel(holdAction) : "sin accion";
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
  playAction(state.baseAction, { origin, force: true });
}

function clearPressTimer() {
  if (state.pressTimer) {
    window.clearTimeout(state.pressTimer);
    state.pressTimer = null;
  }
}

function clearJumpVisual() {
  if (state.jumpVisualTimer) {
    window.clearTimeout(state.jumpVisualTimer);
    state.jumpVisualTimer = null;
  }

  trigger.classList.remove("is-jumping");
}

function startJumpVisual(actionName) {
  if (actionName !== "jump") {
    clearJumpVisual();
    return;
  }

  const animation = getAnimation(actionName);
  const duration = animation
    ? Math.max(450, Math.round((animation.frames.length / animation.fps) * 1000))
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

    playAction(getRestingAction(), { origin: `${origin}-return`, force: true });
    return;
  }

  state.frameIndex += 1;
  state.frameTimer = window.setTimeout(
    () => runAnimationStep(actionName, origin),
    1000 / animation.fps,
  );
}

function playAction(actionName, options = {}) {
  const { origin = "system", force = false } = options;
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
  if (actionName === "flip") {
    state.isFlipped = !state.isFlipped;
    applyFlip(origin);
    return;
  }

  if (actionName === "reset") {
    state.baseAction = getDefaultBaseAction(getCharacterConfig());
    state.isFlipped = false;
    applyFlip(origin);
    resetToBase(origin);
  }
}

function handleAction(actionName, origin = "control") {
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

  clearAnimationTimer();
  state.currentCharacterKey = characterKey;
  state.baseAction = getDefaultBaseAction(nextCharacter);
  state.currentAction = state.baseAction;
  state.isBusy = false;
  state.isFrozen = false;
  state.isFlipped = false;
  state.frameIndex = 0;
  state.pressFired = false;
  state.activePointerId = null;

  clearPressTimer();
  clearJumpVisual();
  sprite.alt = nextCharacter.spriteAlt || nextCharacter.label;
  applyFlip(origin, { emit: false });
  syncCharacterUI(origin);
  playAction(state.baseAction, { origin, force: true });

  emitCharacterEvent("character:interaction", {
    type: "character-change",
    character: characterKey,
  });
}

trigger.addEventListener("pointerdown", (event) => {
  const holdDelay = getCharacterConfig()?.interactions?.holdDelay ?? 380;
  const holdAction = getCharacterConfig()?.interactions?.hold;

  trigger.setPointerCapture(event.pointerId);
  state.activePointerId = event.pointerId;
  state.pressFired = false;
  clearPressTimer();

  if (!holdAction) {
    return;
  }

  state.pressTimer = window.setTimeout(() => {
    state.pressFired = true;
    emitCharacterEvent("character:interaction", {
      type: "hold",
      character: state.currentCharacterKey,
      action: holdAction,
    });
    triggerOneShot(holdAction, "hold");
  }, holdDelay);
});

function releasePointerInteraction(origin) {
  const clickAction = getCharacterConfig()?.interactions?.click;

  clearPressTimer();

  if (state.pressFired) {
    state.pressFired = false;
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

  clearPressTimer();
  state.pressFired = false;
  state.activePointerId = null;
});

trigger.addEventListener("pointerleave", (event) => {
  if (state.activePointerId !== event.pointerId) {
    return;
  }

  clearPressTimer();
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

utilityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleUtilityAction(button.dataset.utilityAction, "control");
  });
});

characterSelect.addEventListener("change", (event) => {
  switchCharacter(event.target.value, "selector");
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "f") {
    handleUtilityAction("flip", "keyboard");
    return;
  }

  if (key === "r") {
    handleUtilityAction("reset", "keyboard");
    return;
  }

  const shortcutMatch = Object.entries(getAnimations()).find(
    ([, actionConfig]) => actionConfig.shortcut?.toLowerCase() === key,
  );

  if (!shortcutMatch) {
    return;
  }

  const [actionName, actionConfig] = shortcutMatch;
  if (actionConfig.loop) {
    setBaseAction(actionName, "keyboard");
    return;
  }

  triggerOneShot(actionName, "keyboard");
});

window.addEventListener("character:action", (event) => {
  const { character, action, origin } = event.detail;
  console.debug(`[character] ${character}:${action} via ${origin}`);
});

if (!characterKeys.length) {
  throw new Error("No hay personajes configurados en character-config.js");
}

switchCharacter(state.currentCharacterKey, "inicio");
