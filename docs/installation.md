# Installation

## Automatic

Install directly from the [GNOME Extensions site](https://extensions.gnome.org/extension/7858/timer/).

## Manual (Development)

Clone the repository and copy it to your local GNOME extensions folder:

```bash
git clone https://github.com/YOUR_USERNAME/timer.git
mkdir -p ~/.local/share/gnome-shell/extensions/
cp -r timer ~/.local/share/gnome-shell/extensions/timer@lbgracioso.net
```

Then enable it:

```bash
gnome-extensions enable timer@lbgracioso.net
```