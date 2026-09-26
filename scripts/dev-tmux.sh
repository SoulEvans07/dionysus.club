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

# Tag a pane with a title, icon and color (read by the border/status formats below)
tag_pane() {
  tmux select-pane -t "$1" -T "$2"
  tmux set-option -p -t "$1" @icon "$3"
  tmux set-option -p -t "$1" @color "$4"
}

# Tag a window with an icon and color for the status bar.
# Separate names from the pane options, since formats resolve pane options first.
tag_window() {
  tmux set-option -w -t "$1" @win_icon "$2"
  tmux set-option -w -t "$1" @win_color "$3"
}

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

tag_window "$SESSION:dev" "$ICON_SERVER $ICON_APP" yellow

# Extra windows
tmux new-window -d -t "$SESSION" -n db -c "$ROOT"
tag_pane "$SESSION:db.0" db "$ICON_DB" white
tag_window "$SESSION:db" "$ICON_DB" white

tmux new-window -d -t "$SESSION" -n libs -c "$ROOT/libs"
tag_pane "$SESSION:libs.0" libs "$ICON_LIBS" magenta
tag_window "$SESSION:libs" "$ICON_LIBS" magenta

tmux new-window -d -t "$SESSION" -n cmd -c "$ROOT"
tag_pane "$SESSION:cmd.0" cmd "$ICON_CMD" green
tag_window "$SESSION:cmd" "$ICON_CMD" green

# These are window options, so they have to be set on each window
# (setting them against the session only hits the current window)
for win in dev db libs cmd; do
  # Pane titles: colored icon + name in the top border, bold when active
  tmux set-option -w -t "$SESSION:$win" pane-border-status top
  tmux set-option -w -t "$SESSION:$win" pane-border-format \
    "#[fg=#{@color}]#{?pane_active,#[bold],} #{@icon} #{pane_title} #[default]"

  # Status bar: each window shows its icon in its color, current one filled
  tmux set-option -w -t "$SESSION:$win" window-status-format \
    "#[fg=#{@win_color}] #{@win_icon} #W #[default]"
  tmux set-option -w -t "$SESSION:$win" window-status-current-format \
    "#[fg=black,bg=#{@win_color},bold] #{@win_icon} #W #[default]"
done

tmux select-window -t "$SESSION:dev"
tmux select-pane -t "$SESSION:dev.0"
attach
