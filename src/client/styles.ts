/**
 * Panel styles, expressed against the Host's theme tokens.
 *
 * Every token read carries the Host name first and a neutral fallback second,
 * so the panel keeps its layout and stays legible even before a theme has
 * defined the aliases. The output area is deliberately dark in both themes:
 * build logs are terminal output and read better on a terminal ground.
 */

/** The stylesheet this plugin installs for the lifetime of its Client run. */
export const STYLES = `
.gt-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--dsw-alias-bg-base, #ffffff);
  color: var(--dsw-alias-label-primary, #1f2328);
  font-size: 13px;
  line-height: 1.5;
}
.gt-header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, #e5e7eb);
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.gt-title {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}
.gt-path {
  flex: 1 1 240px;
  min-width: 160px;
  padding: 5px 9px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d7de);
  border-radius: 6px;
  background: var(--dsw-alias-bg-base, #ffffff);
  color: inherit;
  font: inherit;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}
.gt-path:focus {
  outline: 2px solid var(--dsw-alias-brand-primary, #2563eb);
  outline-offset: -1px;
}
.gt-button {
  padding: 5px 11px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d7de);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: inherit;
  font: inherit;
  cursor: pointer;
  white-space: nowrap;
}
.gt-button:hover:not(:disabled) {
  background: var(--dsw-alias-bg-layer-2, #f3f4f6);
}
.gt-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.gt-button.gt-primary {
  border-color: var(--dsw-alias-brand-primary, #2563eb);
  color: var(--dsw-alias-brand-primary, #2563eb);
}
.gt-java {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d7de);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.gt-java-label {
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 12px;
}
.gt-select {
  max-width: 260px;
  padding: 3px 4px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.gt-select:focus {
  outline: none;
}
.gt-main {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
}
.gt-tasks {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  width: min(42%, 430px);
  min-width: 250px;
  min-height: 0;
  border-right: 1px solid var(--dsw-alias-border-l1, #e5e7eb);
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.gt-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, #e5e7eb);
}
.gt-filter {
  flex: 1 1 auto;
  min-width: 0;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d7de);
  border-radius: 6px;
  background: var(--dsw-alias-bg-base, #ffffff);
  color: inherit;
  font: inherit;
  font-size: 12px;
}
.gt-hint {
  padding: 4px 12px 8px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 11px;
}
.gt-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 4px 8px 16px;
}
.gt-group-head {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 6px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}
.gt-group-head:hover {
  background: var(--dsw-alias-bg-layer-2, #f3f4f6);
}
.gt-caret {
  display: inline-block;
  width: 10px;
  transition: transform 0.12s ease;
}
.gt-caret.gt-open {
  transform: rotate(90deg);
}
.gt-count {
  margin-left: auto;
  font-weight: 400;
  opacity: 0.75;
}
.gt-task {
  display: block;
  width: 100%;
  padding: 4px 8px 4px 24px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.gt-task:hover {
  background: var(--dsw-alias-bg-layer-2, #f3f4f6);
}
.gt-task.gt-selected {
  background: var(--dsw-alias-bg-layer-2, #eef2ff);
  box-shadow: inset 2px 0 0 var(--dsw-alias-brand-primary, #2563eb);
}
.gt-task-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
}
.gt-task-desc {
  overflow: hidden;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 11.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gt-empty {
  padding: 24px 16px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 12px;
  text-align: center;
}
.gt-terminal {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
.gt-term-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, #e5e7eb);
}
.gt-badge {
  padding: 1px 8px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d7de);
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
}
.gt-badge.gt-ok {
  border-color: var(--dsw-alias-state-success-primary, #15803d);
  color: var(--dsw-alias-state-success-primary, #15803d);
}
.gt-badge.gt-bad {
  border-color: var(--dsw-alias-state-error-primary, #b91c1c);
  color: var(--dsw-alias-state-error-primary, #b91c1c);
}
.gt-badge.gt-busy {
  border-color: var(--dsw-alias-brand-primary, #2563eb);
  color: var(--dsw-alias-brand-primary, #2563eb);
}
.gt-command {
  overflow: hidden;
  flex: 1 1 200px;
  min-width: 0;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gt-term-body {
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  overflow: auto;
  padding: 10px 12px 16px;
  background: #0b1020;
  color: #e5e7eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
.gt-term-body .gt-term-muted {
  color: #9ca3af;
}
@media (max-width: 900px) {
  .gt-main {
    flex-direction: column;
  }
  .gt-tasks {
    width: auto;
    max-height: 45%;
    border-right: 0;
    border-bottom: 1px solid var(--dsw-alias-border-l1, #e5e7eb);
  }
}
`
