/* extension.js
 * Created by Lucas Gracioso <lucas@gracioso.net.br>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import St from 'gi://St';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

class TimerMenu extends PopupMenu.PopupMenu {
    constructor(sourceActor, arrowAlignment, arrowSide, button, extensionPath) {
        super(sourceActor, arrowAlignment, arrowSide);
        this._button = button;
        this._extensionPath = extensionPath;
        this._alarmTimeoutId = null;

        // ────────────────────────── MENU CONTAINER
        let menuvbox = this._createMenuContainer();
        
        // ────────────────────────── TIMER INPUT (ICON + ENTRY)
        let timerhbox = this._createTimerInput();
        
        menuvbox.add_child(timerhbox);

        // ────────────────────────── BUTTONS AND ICONS
        let buttonshbox = this._createButtons();

        // ────────────────────────── EVENT HANDLERS
        this._connectEventHandlers();
        
        // ────────────────────────── MENU HANDLER
        this._menuItem = new PopupMenu.PopupBaseMenuItem({ reactive: false });
        this._menuItem.add_child(menuvbox);
        this._menuItem.add_child(buttonshbox);
        this.addMenuItem(this._menuItem);
        
        // ────────────────────────── TIMER STATE
        this._timerState = TimerState.Stopped;
        this._durationInSeconds = 0;
        this._currentRep = 0;
        this._remainingTime = 0;
        this._remainingReps = 0;
        this._restTime = 0;
        this._timerInterval = null;
    }

    _createMenuContainer() {
        return new St.BoxLayout({ vertical: true, x_expand: true, y_expand: true });
    }

    _createTimerInput() {
        let timerhbox = new St.BoxLayout({ vertical: false, x_expand: true });

        this._alarmIcon = new St.Icon({
            gicon: Gio.icon_new_for_string('alarm-symbolic'),
            icon_size: 16,
            style_class: 'menu-icon',
        });

        this._timerEntry = new St.Entry({
            hint_text: _('1h; 1m; 1s; rep1; rest1s...'),
            can_focus: true,
            x_expand: true,
            style_class: 'menu-entry',
        });

        timerhbox.add_child(this._alarmIcon);
        timerhbox.add_child(this._timerEntry);

        return timerhbox;
    }

    _createButtons() {
        let buttonshbox = new St.BoxLayout({ vertical: false, x_expand: true });

        this._startButton = this._createButton('media-playback-start-symbolic');
        this._pauseButton = this._createButton('media-playback-pause-symbolic');
        this._stopButton = this._createButton('media-playback-stop-symbolic');

        buttonshbox.add_child(this._startButton);
        buttonshbox.add_child(this._pauseButton);
        buttonshbox.add_child(this._stopButton);

        return buttonshbox;
    }

    _createButton(iconName) {
        let button = new St.Button({
            style_class: 'timer-button',
            x_expand: true,
            can_focus: true,
        });

        let icon = new St.Icon({
            gicon: Gio.icon_new_for_string(iconName),
            icon_size: 16,
        });

        button.add_child(icon);

        return button;
    }

    _connectEventHandlers() {
        this._startButton.connect('clicked', () => {
            if (this._timerState === TimerState.Paused) {
                this.resumeTimer();
            } else {
                this.startTimer();
            }
        }); 

        this._pauseButton.connect('clicked', () => {
            this.pauseTimer();
        });

        this._stopButton.connect('clicked', () => {
            this.stopTimer();
        });
    }
    
    // ────────────────────────── ALARM SOUND
    _playAlarmSound() {
        if (this._alarmTimeoutId) {
            GLib.Source.remove(this._alarmTimeoutId);
            this._alarmTimeoutId = null;
        }

        let alarmFilePath = GLib.build_filenamev([this._extensionPath, 'alarm.ogg']);
        let file = Gio.File.new_for_path(alarmFilePath);

        let player = global.display.get_sound_player(); 
        player.play_from_file(file, 'Alarm', null);

        this._alarmTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10000, () => {
            return GLib.SOURCE_REMOVE;
        });
    }
    
    // ────────────────────────── UPDATE TITLE
    _updateTitleWithTime(hours, minutes, seconds) {
        let extra = "";
        if (this._remainingReps > 0) {
            extra = `${this._currentRep + 1}:`
        }
        
        if (this._timerState == TimerState.Resting) {
            extra = `Rest:`
        }
        
        let formattedTime = `${extra} ${this._padTime(hours)}:${this._padTime(minutes)}:${this._padTime(seconds)}`;
        this._button._label.text = formattedTime;
    }
    
    _updateTitleWithString(str) {
        this._button._label.text = str;
    }
    
    _padTime(time) {
        return time < 10 ? '0' + time : time;
    }
  
    // ────────────────────────── TIMER COUNTDOWN
    _startCountdown() {
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
        }

        this._timerInterval = setInterval(() => {
            this._updateCountdown();
        }, 1000);
    }

    // Handles the countdown logic
    _updateCountdown() {
        let remainingTime = this._remainingTime;
        let remainingReps = this._remainingReps;
        let hours = Math.floor(remainingTime / 3600);
        let minutes = Math.floor((remainingTime % 3600) / 60);
        let seconds = remainingTime % 60;

        this._updateTitleWithTime(hours, minutes, seconds);

        if (remainingTime <= 0) {
            this._handleTimerState();
        } else {
            this._remainingTime--;
        }
    }

    // Handles the logic when time reaches 0
    _handleTimerState() {
        if (this._timerState === TimerState.Resting) {
            this._handleRestEnd();
        } else if (this._timerState === TimerState.Running) {
            this._handleWorkEnd();
        }
    }

    // Handles when a work session ends (transition to rest or next rep)
    _handleWorkEnd() {
        if (this._restTime > 0) {
            this._timerState = TimerState.Resting;
            this._remainingTime = this._restTime;
        } else {
            this._moveToNextRep();
        }
    }

    // Handles when a rest session ends (transition to next rep or stop)
    _handleRestEnd() {
        if (this._remainingReps > 0) {
            this._remainingReps--;
            this._currentRep++;
            console.log(`[TIMER EXTENSION] Starting rep ${this._currentRep} of ${this._remainingReps}`);
            this._moveToNextState();
        } else {
            this.stopTimerPlayAlarm();
        }
    }

    // Moves to the next rep or stops the timer if no reps are left
    _moveToNextRep() {
        this._remainingReps--;
        this._currentRep++;
        console.log(`[TIMER EXTENSION] Starting rep ${this._currentRep} of ${this._remainingReps}`);

        if (this._remainingReps > 0) {
            this._remainingTime = this._durationInSeconds;
            this._timerState = TimerState.Running;
        } else {
            this.stopTimerPlayAlarm();
        }
    }

    // Moves to the next state based on the timer's current state
    _moveToNextState() {
        if (this._remainingReps > 0) {
            this._remainingTime = this._durationInSeconds;
            this._timerState = TimerState.Running;
        } else {
            this.stopTimerPlayAlarm();
        }
    }
    
    // ────────────────────────── TIME PARSER (for work time: 5s, 1m, 1h)
    _parseTimeUnits(timeString) {
        let regex = /(\d+)([hms])/g; // 'h', 'm', or 's'
        let match;
        let totalSeconds = 0;

        while ((match = regex.exec(timeString)) !== null) {
            let value = parseInt(match[1]);
            let unit = match[2];

            switch (unit) {
                case 'h':
                    totalSeconds += value * 3600;
                    break;
                case 'm':
                    totalSeconds += value * 60;
                    break;
                case 's':
                    totalSeconds += value;
                    break;
                default:
                    break;
            }
        }

        return totalSeconds;
    }

    parseTimer(timeString) {
        let tokens = timeString.split(/\s+/).filter(t => t.length > 0);
        let valid = true;
        let restTimeInSeconds = 0;
        let repetitions = 0;
        let durationInSeconds = 0;

        for (let token of tokens) {
            if (/^\d+[hms]$/.test(token)) {
                durationInSeconds += this._parseTimeUnits(token);
            } else if (/^rep\d+$/.test(token)) {
                repetitions = parseInt(token.replace('rep', ''));
            } else if (/^rest\d+[hms]$/.test(token)) {
                restTimeInSeconds += this._parseRestTime(token);
            } else {
                valid = false;
                break;
            }
        }

        if (!valid || durationInSeconds === 0) {
            this._timerEntry.add_style_class_name('timer-entry-error');
            console.log('[TIMER EXTENSION] Invalid time format.');
            this._durationInSeconds = 0;
            this._remainingReps = 0;
            this._restTime = 0;
            return null;
        }

        this._timerEntry.remove_style_class_name('timer-entry-error');

        this._durationInSeconds = durationInSeconds;
        this._remainingReps = repetitions;
        this._restTime = restTimeInSeconds;

        return timeString.trim();
    }


    // ────────────────────────── REST PARSER (for rest time: rest1m, rest1h, rest1s)
    _parseRestTime(timeString) {
        let regex = /rest(\d+)([hms])/g;  // match "restXY" (where X is a number followed by a Y unit h/m/s)
        let match;
        let totalRestTime = 0;

        while ((match = regex.exec(timeString)) !== null) {
            let value = match[1];
            let unit = match[2];

            let restTimeStr = value + unit;

            totalRestTime += this._parseTimeUnits(restTimeStr);
            
            timeString = timeString.replace(match[0], '');
        }

        return totalRestTime;
    }

    // ────────────────────────── REPETITION PARSER (for repetitions: rep2)
    _parseRepetition(timeString) {
        let regex = /(rep)(\d+)/g;  // match "repX" (where X is a number)
        let match;
        let totalRepetitions = 0;

        while ((match = regex.exec(timeString)) !== null) {
            let value = parseInt(match[2]);
            totalRepetitions += value;
        }

        return totalRepetitions;
    }
  
    startTimer() {
        let time = this._timerEntry.get_text().trim();
        if (time.length > 0) {
            let updatedTimeString = this.parseTimer(time);

            if (this._durationInSeconds > 0) {
                console.log(`[TIMER EXTENSION] Starting timer for: ${updatedTimeString}`);
                this._timerState = TimerState.Running;
                this._remainingTime = this._durationInSeconds;
                this._currentRep = 0;
                this._startCountdown();
                this._timerEntry.set_text('');
            } else {
                console.log('[TIMER EXTENSION] Invalid time format.');
            }
        }
    }

    pauseTimer() {
        console.log('[TIMER EXTENSION] Timer paused');
        clearInterval(this._timerInterval);
        this._timerState = TimerState.Paused;
        this._updateTitleWithString('Paused');
    }
    
    resumeTimer() {
        console.log('[TIMER EXTENSION] Timer resumed');
        this._timerState = TimerState.Running;
        this._startCountdown(); 
    }

    stopTimer() {
        console.log('[TIMER EXTENSION] Timer stopped');
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
        this._timerState = TimerState.Stopped;
        this._remainingTime = 0;
        this._remainingReps = 0;
        this._currentRep = 0;
        this._timerEntry.set_text('');
        this._updateTitleWithString('Timer');
    } 
    
    stopTimerPlayAlarm() {
        this.stopTimer();
        this._playAlarmSound();
    }
    
    destroy() {
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
        
        if (this._alarmTimeoutId) {
            GLib.Source.remove(this._alarmTimeoutId);
            this._alarmTimeoutId = null;
        }
        
        super.destroy();
    }
}

const TimerState = {
    Running: Symbol("Running"),
    Paused: Symbol("Paused"),
    Stopped: Symbol("Stopped"),
    Resting: Symbol("Resting")
};

class TimerButton extends PanelMenu.Button {
    static {
        GObject.registerClass(this);
    }

    constructor(extensionPath) {
        super(0.0, _('Timer'));

        this._label = new St.Label({
            text: _('Timer'),
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });

        this.add_child(this._label);

        this._menu = new TimerMenu(this, 1.0, St.Side.TOP, this, extensionPath);
        this.setMenu(this._menu);
    }
    
    destroy() {
        if (this._menu) {
            this._menu.destroy();
            this._menu = null;
        }
        super.destroy();
    }
}

export default class TimerExtension extends Extension {
    enable() {
        this._indicator = new TimerButton(this.path);
        Main.panel.addToStatusArea('panelTimer', this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}

