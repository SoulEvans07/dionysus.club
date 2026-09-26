#!/usr/bin/env node
// Launch a tmux session built from .vscode/terminals.json (Terminals Manager format).
//   node scripts/tmux-terminals.mjs [path/to/terminals.json]
//
// Each terminal becomes a window; terminals linked with "split" share a window,
// side by side. Supported fields: name, icon, color, cwd, command(s), execute,
// split, target, focus, env, shellPath/shellArgs, dynamicTitle, onlySingle/onlyAPI.
// Re-running attaches to the existing session instead of creating a new one.
// Icons are Nerd Font codicons (same set VSCode uses), looked up in codicons.json.

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPTS, '..');
const CONFIG = resolve(process.argv[2] ?? `${ROOT}/.vscode/terminals.json`);
// One session per checkout, so worktrees don't collide
const SESSION = process.env.TMUX_SESSION ?? `terminals-${basename(ROOT).replace(/[.:]/g, '-')}`;

const CODICONS = JSON.parse(readFileSync(`${SCRIPTS}/codicons.json`, 'utf8'));
const DEFAULT_ICON = 'terminal';

// Pane name, falling back to the running command (dynamicTitle, or panes split by hand)
const PANE_NAME = '#{?@name,#{@name},#{pane_current_command}}';

const tmux = (...args) => execFileSync('tmux', args, { encoding: 'utf8' }).trim();

const warn = (msg) => console.warn(`tmux-terminals: ${msg}`);

function attach() {
  const args = process.env.TMUX ? ['switch-client', '-t', SESSION] : ['attach-session', '-t', SESSION];
  process.exit(spawnSync('tmux', args, { stdio: 'inherit' }).status ?? 1);
}

// terminals.json is JSONC: drop comments (outside strings) and trailing commas
function parseJsonc(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      const start = i;
      for (i++; i < text.length && text[i] !== '"'; i++) if (text[i] === '\\') i++;
      out += text.slice(start, i + 1);
    } else if (ch === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      out += '\n';
    } else if (ch === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i + 2) + 1 || text.length;
    } else {
      out += ch;
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
}

function iconFor(t) {
  const name = t.icon ?? DEFAULT_ICON;
  const hex = CODICONS[name];
  if (hex) return String.fromCodePoint(parseInt(hex, 16));
  warn(`unknown icon "${name}" on "${t.name}", using "${DEFAULT_ICON}"`);
  return String.fromCodePoint(parseInt(CODICONS[DEFAULT_ICON], 16));
}

// "terminal.ansiBrightRed" -> "brightred"; other theme colors aren't representable
function colorFor(t) {
  const match = /^terminal\.ansi(Bright)?(Black|Red|Green|Yellow|Blue|Magenta|Cyan|White)$/.exec(t.color ?? '');
  if (match) return `${match[1] ? 'bright' : ''}${match[2].toLowerCase()}`;
  if (t.color) warn(`unsupported color "${t.color}" on "${t.name}"`);
  return 'default';
}

function cwdFor(t) {
  if (!t.cwd) return ROOT;
  return resolve(ROOT, t.cwd.replace(/^~(?=$|\/)/, homedir()));
}

// Options shared by new-session / new-window / split-window: cwd, env, and custom shell
function spawnArgs(t) {
  const env = Object.entries(t.env ?? {}).flatMap(([k, v]) => ['-e', `${k}=${v}`]);
  const shell = t.shellPath ? [[t.shellPath, ...(t.shellArgs ?? [])].map(quote).join(' ')] : [];
  return { pre: ['-c', cwdFor(t), ...env], shell };
}

const quote = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;

function tagPane(pane, t) {
  if (!t.dynamicTitle) tmux('set-option', '-p', '-t', pane, '@name', t.name);
  tmux('set-option', '-p', '-t', pane, '@icon', iconFor(t));
  tmux('set-option', '-p', '-t', pane, '@color', colorFor(t));
}

// Every command runs; with execute: false the last one is typed but not run
function sendCommands(pane, t) {
  const commands = t.commands ?? (t.command ? [t.command] : []);
  commands.forEach((cmd, i) => {
    tmux('send-keys', '-t', pane, '-l', cmd);
    if (i < commands.length - 1 || t.execute !== false) tmux('send-keys', '-t', pane, 'Enter');
  });
}

function styleWindow(win) {
  // These are window options, so they have to be set on each window
  tmux('set-option', '-w', '-t', win, 'pane-border-status', 'top');
  tmux(
    'set-option',
    '-w',
    '-t',
    win,
    'pane-border-format',
    `#[fg=#{@color}]#{?pane_active,#[bold],} #{@icon} ${PANE_NAME} #[default]`
  );
  // Tabs take the active pane's icon and color, so split windows follow focus
  tmux('set-option', '-w', '-t', win, 'window-status-format', '#[fg=#{@color}] #{@icon} #W #[default]');
  tmux(
    'set-option',
    '-w',
    '-t',
    win,
    'window-status-current-format',
    '#[fg=black,bg=#{@color},bold] #{@icon} #W #[default]'
  );
}

// Group terminals linked by "split" (either direction) into windows, in config order
function groupBySplit(terminals) {
  const byName = new Map(terminals.map((t) => [t.name, t]));
  const links = new Map(terminals.map((t) => [t.name, new Set()]));
  for (const t of terminals) {
    if (!t.split) continue;
    if (!byName.has(t.split)) {
      warn(`"${t.name}" splits from unknown terminal "${t.split}", opening it on its own`);
      continue;
    }
    links.get(t.name).add(t.split);
    links.get(t.split).add(t.name);
  }

  const seen = new Set();
  const groups = [];
  for (const t of terminals) {
    if (seen.has(t.name)) continue;
    const group = [];
    const queue = [t.name];
    seen.add(t.name);
    // BFS keeps each member after something it's linked to, so it has a pane to split from
    while (queue.length) {
      const name = queue.shift();
      const linked = [...links.get(name)].filter((n) => !seen.has(n));
      for (const n of linked) seen.add(n);
      queue.push(...linked);
      group.push({ terminal: byName.get(name), parent: group.length ? findParent(name, group, links) : null });
    }
    groups.push(group);
  }
  return groups;
}

const findParent = (name, group, links) => group.find((m) => links.get(name).has(m.terminal.name)).terminal.name;

if (spawnSync('tmux', ['has-session', '-t', SESSION], { stdio: 'ignore' }).status === 0) attach();

const config = parseJsonc(readFileSync(CONFIG, 'utf8'));
// Match "Terminals: Run", which skips onlySingle / onlyAPI terminals
const terminals = (config.terminals ?? []).filter((t) => t.name && !t.onlySingle && !t.onlyAPI);
const own = terminals.filter((t) => !t.target);
const targeted = terminals.filter((t) => t.target);

const panes = new Map(); // terminal name -> pane id
let first = true;

for (const group of groupBySplit(own)) {
  const windowName = group.map((m) => m.terminal.name).join('/');
  let windowId;

  for (const { terminal: t, parent } of group) {
    const { pre, shell } = spawnArgs(t);
    const fmt = ['-P', '-F', '#{window_id} #{pane_id}'];
    let out;
    if (!parent && first) out = tmux('new-session', '-d', '-s', SESSION, '-n', windowName, ...fmt, ...pre, ...shell);
    else if (!parent) out = tmux('new-window', '-d', '-t', `${SESSION}:`, '-n', windowName, ...fmt, ...pre, ...shell);
    else out = tmux('split-window', '-d', '-h', '-t', panes.get(parent), ...fmt, ...pre, ...shell);
    first = false;

    const [win, pane] = out.split(' ');
    windowId ??= win;
    panes.set(t.name, pane);
    tagPane(pane, t);
    sendCommands(pane, t);
  }

  if (group.length > 2) tmux('select-layout', '-t', windowId, 'even-horizontal');
  styleWindow(windowId);
}

if (first) {
  console.error(`tmux-terminals: no terminals to open in ${CONFIG}`);
  process.exit(1);
}

// "target" terminals run their commands in another terminal's pane
for (const t of targeted) {
  const pane = panes.get(t.target);
  if (pane) sendCommands(pane, t);
  else warn(`"${t.name}" targets unknown terminal "${t.target}", skipping`);
}

// Like the extension, the last terminal with focus: true ends up focused
const focused = [...terminals].reverse().find((t) => t.focus && panes.has(t.target ?? t.name));
const focusPane = panes.get(focused ? (focused.target ?? focused.name) : own[0].name);
tmux('select-window', '-t', focusPane);
tmux('select-pane', '-t', focusPane);

attach();
