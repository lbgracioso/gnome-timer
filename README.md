# Timer

**Timer** is a lightweight and customizable GNOME Shell extension that adds a timer with alarm sound notifications to your top panel. Ideal for productivity workflows, workouts, or any countdown need (I use it most to help me while cooking).

Supports simple time formats (`1m`, `30s`), repetitions (`rep3`), and rest intervals (`rest30s`). Easy to install and intuitive to use.

## Project Details

Timer supports a variety of time-based inputs to suit different use cases. You can enter simple time units such as `1h`, `30s`, or `2m`, or combine multiple units like `1h 20m 30s` for more precise control.

The extension also allows repetitions using the `repX` syntax. For example, `rep3` runs the timer three times in sequence. Between repetitions, you can insert rest periods using the `restX` format, such as `rest1m` or `rest30s`.

You can also combine these elements. For example, `2s rep3 rest1m` sets a 2-second timer with 3 repetitions and 1-minute rests in between.


## Documentation

- [Usage Guide](docs/usage.md)
- [Installation Instructions](docs/installation.md)
- [Developer Guide](docs/development.md)
- [Roadmap](docs/roadmap.md)
- [Credits](docs/credits.md)
- [Changelog](CHANGELOG.md)

## License

Timer is licensed under the GNU General Public License v3 or later.
See the full [LICENSE](LICENSE) for details.
