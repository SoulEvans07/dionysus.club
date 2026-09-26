#!/usr/bin/env bash
# Launch a tmux dev session mirroring .vscode/terminals.json.
#   window "dev":  server | app (side by side)
#   window "db", "libs", "cmd": plain shells
# Re-running attaches to the existing session instead of creating a new one.
# Icons are Nerd Font codicons (same set VSCode uses), so the terminal needs a Nerd Font.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# One session per checkout, so worktrees don't collide
SESSION="dionysus-$(basename "$ROOT" | tr '.:' '--')"

# codicons as UTF-8 bytes (nf-cod-*), written as escapes so editors don't mangle them
ICON_SERVER=$'\xee\xad\x90'  # server   U+EB50
ICON_APP=$'\xee\xac\xaf'     # preview  U+EB2F
ICON_DB=$'\xee\xab\x8e'      # database U+EACE
ICON_LIBS=$'\xee\xae\x9c'    # library  U+EB9C
ICON_CMD=$'\xee\xaa\x85'     # terminal U+EA85

attach() {
  if [ -n "${TMUX:-}" ]; then
    tmux switch-client -t "$SESSION"
  else
    tmux attach-session -t "$SESSION"
  fi
}

# Tag a pane with a name, icon and color (read by the border/status formats below).
# Window tabs resolve these from the window's active pane, so "dev" follows focus.
# @name rather than the pane title, since shells and programs can overwrite titles.
tag_pane() {
  tmux set-option -p -t "$1" @name "$2"
  tmux set-option -p -t "$1" @icon "$3"
  tmux set-option -p -t "$1" @color "$4"
}

# Pane name, falling back to the running command for panes split by hand
PANE_NAME="#{?@name,#{@name},#{pane_current_command}}"
# Window name, plus the active pane's name when the window is split (e.g. dev/server)
TAB_LABEL="#{?#{e|>:#{window_panes},1},#W/$PANE_NAME,#W}"

if tmux has-session -t "$SESSION" 2>/dev/null; then
  attach
  exit 0
fi

# dev window: server (left) | app (right)
tmux new-session -d -s "$SESSION" -n dev -c "$ROOT/apps/api"
tag_pane "$SESSION:dev.0" server "$ICON_SERVER" red
tmux send-keys -t "$SESSION:dev.0" "pnpm dev" C-m

tmux split-window -h -t "$SESSION:dev" -c "$ROOT/apps/app"
tag_pane "$SESSION:dev.1" app "$ICON_APP" blue
tmux send-keys -t "$SESSION:dev.1" "pnpm dev" C-m

# Extra windows
tmux new-window -d -t "$SESSION" -n db -c "$ROOT"
tag_pane "$SESSION:db.0" db "$ICON_DB" white

tmux new-window -d -t "$SESSION" -n libs -c "$ROOT/libs"
tag_pane "$SESSION:libs.0" libs "$ICON_LIBS" magenta

tmux new-window -d -t "$SESSION" -n cmd -c "$ROOT"
tag_pane "$SESSION:cmd.0" cmd "$ICON_CMD" green

# These are window options, so they have to be set on each window
# (setting them against the session only hits the current window)
for win in dev db libs cmd; do
  # Pane borders: colored icon + name at the top, bold when active
  tmux set-option -w -t "$SESSION:$win" pane-border-status top
  tmux set-option -w -t "$SESSION:$win" pane-border-format \
    "#[fg=#{@color}]#{?pane_active,#[bold],} #{@icon} $PANE_NAME #[default]"

  # Status bar: active pane's icon in its color, current window filled
  tmux set-option -w -t "$SESSION:$win" window-status-format \
    "#[fg=#{@color}] #{@icon} $TAB_LABEL #[default]"
  tmux set-option -w -t "$SESSION:$win" window-status-current-format \
    "#[fg=black,bg=#{@color},bold] #{@icon} $TAB_LABEL #[default]"
done

tmux select-window -t "$SESSION:dev"
tmux select-pane -t "$SESSION:dev.0"
attach
