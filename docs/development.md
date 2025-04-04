# Developer Guide

## Recommended Tools

- **GNOME Builder** for native GNOME development experience
- `gnome-shell` and `gnome-extensions` CLI tools

## Notes

Ensure the extension is located at:

```bash
~/.local/share/gnome-shell/extensions/timer@lbgracioso.net
```

## Testing Instructions

### On Wayland

```bash
dbus-run-session -- gnome-shell --nested --wayland
gnome-extensions enable timer@lbgracioso.net
```

### On X11

```bash
gnome-extensions enable timer@lbgracioso.net
```

Once enabled, access the timer from your top panel.