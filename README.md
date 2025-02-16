# Timer

A simple GNOME extension that provides a panel timer with an alarm sound notification.
![Usage gif.](docs/usage.gif)

👉 **Download from GNOME Extensions:** [Timer on GNOME Extensions](https://extensions.gnome.org/extension/7858/timer/)

## Features
- **Single time units**: Use simple time formats like '1h', '1m', or '1s'.
- **Multiple time units**: Combine units, such as '1h 30m', '1m 25s', or '1h 20m 30s'.

## Usage
📥 **Download:** You can install the extension directly from the [GNOME Extensions website](https://extensions.gnome.org/extension/7858/timer/).

To start the timer:
1. Input the desired duration in the format(s) mentioned above.
2. Click on the **Start** icon to begin the countdown.
3. Once the time is up, an alarm sound will notify you.

## Developers

### Notes
- I recommend using **GNOME Builder**.
- Make sure the project is located **inside** `/home/<user>/.local/share/gnome-shell/extensions/timer@lbgracioso.net`

### Running the extension

#### On Wayland
To test and run the extension on Wayland:
1. Launch a nested GNOME session with:
    ```bash
    dbus-run-session -- gnome-shell --nested --wayland
    ```
2. Enable the extension:
    ```bash
    gnome-extensions enable timer@lbgracioso.net
    ```
3. Enjoy it ;)

#### On X11
To run the extension on a regular GNOME session (X11):
1. Enable the extension using GNOME Tweaks or the command line:
    ```bash
    gnome-extensions enable timer@lbgracioso.net
    ```

## Others
Sound Effect by <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=90867">freesound_community</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=90867">Pixabay</a>

## License
Timer is distributed under the terms of the GNU General Public License, version 3 or later. See the [LICENSE file][license] for details. Individual extensions may be licensed under different terms; check the source files for specifics.

[license]: LICENSE
