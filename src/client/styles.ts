/**
 * Panel styles for the right Sidebar's narrow column.
 *
 * Every token read carries the Host name first and a neutral fallback second,
 * so the panel keeps its layout and stays legible even before a theme defines
 * the aliases. The output area is deliberately dark in both themes: build logs
 * are terminal output and read better on a terminal ground.
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
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px 8px;
}
.gt-path {
  width: 100%;
  box-sizing: border-box;
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
.gt-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.gt-button {
  padding: 4px 10px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d7de);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: inherit;
  font: inherit;
  font-size: 12px;
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
  flex: 1 1 auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 3px 8px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d7de);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.gt-java-label {
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 12px;
}
.gt-select {
  flex: 1 1 auto;
  min-width: 0;
  padding: 2px 0;
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
.gt-hint {
  padding: 0 12px 8px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 11.5px;
  word-break: break-word;
}
.gt-hint-detail {
  opacity: 0.8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
}
.gt-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-top: 1px solid var(--dsw-alias-border-l1, #e5e7eb);
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
.gt-scroll {
  flex: 1 1 auto;
  min-height: 90px;
  overflow: auto;
  padding: 2px 8px 10px;
}
.gt-group-head {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 4px 6px;
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
.gt-group-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  box-sizing: border-box;
  padding: 4px 8px 4px 22px;
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
  word-break: break-word;
}
.gt-task-desc {
  overflow: hidden;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 11.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gt-empty {
  padding: 20px 12px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 12px;
  text-align: center;
}
.gt-terminal {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  height: 42%;
  min-height: 150px;
  border-top: 1px solid var(--dsw-alias-border-l1, #e5e7eb);
  background: #0b1020;
}
.gt-term-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-bottom: 1px solid #1f2937;
}
.gt-badge {
  padding: 1px 8px;
  border: 1px solid #4b5563;
  border-radius: 999px;
  color: #d1d5db;
  font-size: 11px;
  white-space: nowrap;
}
.gt-badge.gt-ok {
  border-color: #15803d;
  color: #4ade80;
}
.gt-badge.gt-bad {
  border-color: #b91c1c;
  color: #f87171;
}
.gt-badge.gt-busy {
  border-color: #2563eb;
  color: #93c5fd;
}
.gt-command {
  overflow: hidden;
  flex: 1 1 120px;
  min-width: 0;
  color: #9ca3af;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gt-terminal .gt-button {
  border-color: #374151;
  background: transparent;
  color: #d1d5db;
  font-size: 11.5px;
}
.gt-terminal .gt-button:hover:not(:disabled) {
  background: #1f2937;
}
.gt-term-body {
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  overflow: auto;
  padding: 8px 10px 12px;
  color: #e5e7eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
.gt-term-muted {
  color: #9ca3af;
}
`
