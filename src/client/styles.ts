/**
 * Panel styles for the right Sidebar's narrow column.
 *
 * Every colour comes from a Host `--dsw-alias-*` token. The fallbacks are
 * deliberately neutral — a `color-mix` of `currentColor`, or `transparent` —
 * because a literal light palette would be legible in a light theme and wrong
 * in a dark one, which is exactly the failure a themed selector is here to fix.
 */

/** The stylesheet this plugin installs for the lifetime of its Client run. */
export const STYLES = `
.gt-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--dsw-alias-bg-base, transparent);
  color: var(--dsw-alias-label-primary, inherit);
  font-family: var(--dsw-font-family, inherit);
  font-size: 13px;
  line-height: 1.45;
}

/* ── header: the JDK picker and the two icon controls ───────────────────── */

.gt-header {
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 8px 8px 6px;
}

.gt-java {
  position: relative;
  display: inline-flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 3px 6px 3px 8px;
  border: 0.5px solid var(--dsw-alias-border-l4, currentColor);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-1, transparent);
}

.gt-java[data-open='true'] {
  border-color: var(--dsw-alias-state-business-primary, currentColor);
}

.gt-java-label {
  flex: none;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 11.5px;
  letter-spacing: 0.01em;
}

.gt-picker-trigger {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 4px;
  min-width: 0;
  min-height: 20px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-label-primary, inherit);
  font: inherit;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
}

.gt-picker-trigger:disabled {
  cursor: default;
}

.gt-picker-trigger:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary, currentColor);
  outline-offset: 2px;
  border-radius: 4px;
}

.gt-picker-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-picker-dim {
  color: var(--dsw-alias-label-tertiary, inherit);
}

.gt-picker-caret {
  display: inline-flex;
  flex: none;
  align-items: center;
  color: var(--dsw-alias-label-tertiary, inherit);
}

/* The popup sits inside the page, above the tree and above a floating pane. */
.gt-popup {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 240px;
  max-width: min(420px, calc(100vw - 24px));
  max-height: 320px;
  padding: 4px;
  overflow: auto;
  border: 0.5px solid var(--dsw-alias-border-l4, currentColor);
  border-radius: var(--dsw-radius-md, 12px);
  background: var(--dsw-specific-menu, var(--dsw-alias-bg-layer-2, Canvas));
  box-shadow: var(--dsw-elevation-panel, 0 6px 20px rgb(0 0 0 / 18%));
  backdrop-filter: var(--dsw-menu-backdrop-filter, none);
}

.gt-popup-above {
  top: auto;
  bottom: calc(100% + 4px);
}

.gt-option {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 8px;
  border: 0;
  border-radius: var(--dsw-radius-sm, 8px);
  background: none;
  color: var(--dsw-alias-label-primary, inherit);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.gt-option.gt-option-active {
  background: var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, currentColor 8%, transparent));
}

.gt-option.gt-option-selected {
  background: var(--dsw-alias-button-ghost-active-fill, color-mix(in srgb, currentColor 12%, transparent));
}

.gt-option-main {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 12.5px;
}

.gt-option-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-option-check {
  display: inline-flex;
  flex: none;
  margin-left: auto;
  color: var(--dsw-alias-state-business-primary, currentColor);
}

.gt-option-path {
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-icon-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0.5px solid var(--dsw-alias-border-l4, currentColor);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-secondary, inherit);
  cursor: pointer;
}

.gt-icon-button:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, currentColor 8%, transparent));
  color: var(--dsw-alias-label-primary, inherit);
}

.gt-icon-button:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary, currentColor);
  outline-offset: 1px;
}

.gt-icon-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.gt-icon-button.gt-icon-button-on {
  border-color: var(--dsw-alias-state-business-primary, currentColor);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, currentColor) 16%, transparent);
  color: var(--dsw-alias-state-business-primary, currentColor);
}

/* ── status lines ───────────────────────────────────────────────────────── */

.gt-hint {
  flex: none;
  padding: 0 10px 6px;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 11.5px;
  word-break: break-word;
}

.gt-status {
  color: var(--dsw-alias-label-secondary, inherit);
}

.gt-hint-warn {
  color: var(--dsw-alias-state-warn-primary, inherit);
}

.gt-hint-launch {
  margin-top: 3px;
  color: var(--dsw-alias-state-success-primary, inherit);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-hint-foot {
  padding: 10px 12px 16px;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 11.5px;
  text-align: center;
}

/* ── filter row ─────────────────────────────────────────────────────────── */

.gt-toolbar {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-top: 0.5px solid var(--dsw-alias-border-l2, currentColor);
}

.gt-filter-wrap {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 5px;
  min-width: 0;
  padding: 3px 8px;
  border: 0.5px solid var(--dsw-alias-border-l4, currentColor);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-1, transparent);
}

.gt-filter-wrap:focus-within {
  border-color: var(--dsw-alias-state-business-primary, currentColor);
}

.gt-filter-icon {
  display: inline-flex;
  flex: none;
  color: var(--dsw-alias-label-tertiary, inherit);
}

.gt-filter {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 12px;
}

.gt-filter::placeholder {
  color: var(--dsw-alias-label-tertiary, inherit);
}

.gt-count {
  flex: none;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}

/* ── the tree ───────────────────────────────────────────────────────────── */

.gt-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 2px 6px 12px;
  scrollbar-color: var(--dsw-alias-scrollbar-bg-l2, transparent) transparent;
  scrollbar-width: thin;
}

.gt-row {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  min-height: 22px;
  padding-right: 4px;
  border-radius: var(--dsw-radius-sm, 8px);
  color: var(--dsw-alias-label-secondary, inherit);
}

/* One hairline per level, drawn on the row's own left edge: a row indented by
   padding alone makes a task and its group hard to tell apart, and the rail is
   what turns the indent into a readable hierarchy. It fades at the row's ends so
   neighbouring rows join into a continuous line. */
.gt-guide {
  flex: none;
  align-self: stretch;
  width: 16px;
  box-sizing: border-box;
  border-left: 0.5px solid var(--dsw-alias-border-l2, color-mix(in srgb, currentColor 22%, transparent));
}

.gt-row:hover {
  background: var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, currentColor 8%, transparent));
}

.gt-twisty {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 20px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-label-tertiary, inherit);
  cursor: pointer;
}

.gt-caret {
  display: inline-block;
  font-size: 8px;
  line-height: 1;
  transition: transform 0.12s ease;
}

.gt-caret.gt-open {
  transform: rotate(90deg);
}

.gt-row-body {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 5px;
  min-width: 0;
  padding: 2px 2px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.gt-row-body:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary, currentColor);
  outline-offset: -1px;
  border-radius: 4px;
}

.gt-row-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
}

.gt-icon-project {
  color: var(--dsw-alias-state-business-primary, currentColor);
}

.gt-icon-module {
  color: var(--dsw-alias-label-secondary, inherit);
}

.gt-icon-group {
  color: var(--dsw-alias-label-tertiary, inherit);
}

.gt-icon-task {
  color: var(--dsw-alias-label-tertiary, inherit);
}

.gt-row-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-row-project .gt-row-name {
  color: var(--dsw-alias-label-primary, inherit);
  font-weight: 600;
}

.gt-row-path {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-row-module-name {
  color: var(--dsw-alias-label-primary, inherit);
}

.gt-row-group .gt-row-name {
  font-weight: 500;
}

.gt-row-task-name {
  font-size: 12.5px;
}

.gt-badge {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding-left: 6px;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.gt-badge-busy {
  color: var(--dsw-alias-state-business-primary, currentColor);
}

.gt-row-action {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 2px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: none;
  color: var(--dsw-alias-label-tertiary, inherit);
  opacity: 0;
  cursor: pointer;
}

.gt-row:hover .gt-row-action,
.gt-row-action:focus-visible {
  opacity: 1;
}

.gt-row-action:hover {
  color: var(--dsw-alias-label-primary, inherit);
}

.gt-row-task {
  color: var(--dsw-alias-label-secondary, inherit);
}

.gt-row-task:hover .gt-row-task-name {
  color: var(--dsw-alias-label-primary, inherit);
}

.gt-row-task.gt-row-selected {
  background: var(--dsw-alias-interactive-bg-active, color-mix(in srgb, currentColor 14%, transparent));
  box-shadow: inset 2px 0 0 var(--dsw-alias-state-business-primary, currentColor);
}

.gt-row-task.gt-row-selected .gt-row-task-name {
  color: var(--dsw-alias-label-primary, inherit);
}

.gt-row-task-body:disabled {
  cursor: progress;
  opacity: 0.6;
}

/* The heading between the build-wide list and the subproject rows. It is not a
   row: nothing folds here, it only names what follows so the same task appearing
   twice in the tree does not read as a duplicate. */
.gt-section {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 6px 0 2px;
  padding: 2px 4px 2px 8px;
  border-top: 0.5px solid var(--dsw-alias-border-l1, color-mix(in srgb, currentColor 14%, transparent));
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 10.5px;
  letter-spacing: 0.02em;
}

.gt-section-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-row-note {
  padding: 3px 8px 6px 34px;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 11.5px;
  word-break: break-word;
}

/* A failure is one row like any other: the cause, and a caret when the build
   log is worth unfolding underneath it. */
.gt-row-error-box {
  padding: 0 6px 2px 18px;
}

.gt-row-error {
  display: flex;
  align-items: baseline;
  gap: 5px;
  width: 100%;
  box-sizing: border-box;
  padding: 2px 4px;
  border: 0;
  border-radius: var(--dsw-radius-sm, 8px);
  background: none;
  color: var(--dsw-alias-state-error-primary, inherit);
  font: inherit;
  font-size: 11.5px;
  text-align: left;
  cursor: pointer;
}

.gt-row-error:disabled {
  cursor: default;
}

.gt-row-error:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-danger, color-mix(in srgb, currentColor 10%, transparent));
}

.gt-row-error-mark {
  flex: none;
  font-weight: 700;
}

.gt-row-error-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-row-error .gt-caret {
  flex: none;
  margin-left: auto;
  color: var(--dsw-alias-label-tertiary, inherit);
}

/* The unfolded log keeps the panel's width: it scrolls in both directions
   rather than pushing the tree sideways. */
.gt-row-error-log {
  max-height: 220px;
  margin: 2px 0 4px;
  padding: 6px 8px;
  overflow: auto;
  border: 0.5px solid var(--dsw-alias-border-l2, currentColor);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-secondary, inherit);
  font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 10.5px;
  line-height: 1.4;
  white-space: pre;
  tab-size: 2;
}

.gt-spinner {
  animation: gt-spin 0.9s linear infinite;
  transform-origin: 50% 50%;
}

@keyframes gt-spin {
  to { transform: rotate(360deg); }
}

.gt-empty {
  padding: 20px 12px;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 12px;
  text-align: center;
  word-break: break-word;
}

@media (prefers-reduced-motion: reduce) {
  .gt-caret,
  .gt-spinner {
    transition: none;
    animation: none;
  }
}
`
