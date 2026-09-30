# Sound and music

Press **Escape** during a run to open the options. **Game audio** is the master switch and **Overall volume** adjusts the combined game sound. Music, Sound effects and Ambience each have a separate switch and volume slider. You can keep the score while muting strikes, hear the town without music, or turn every game sound off. The browser remembers these choices across reloads and saved runs.

All game audio is original and synthesized locally with Web Audio. The game downloads no music files and requires no audio service. Music starts after you interact with the game. The score adapts between four original themes:

| Theme | Situation |
| --- | --- |
| Morrow at Dawn | Daytime exploration |
| Empty Streets | Nighttime exploration |
| Under the Sirens | A living zombie is close to the player |
| The Road Beyond | Driving, while no nearby zombie takes priority |

Effects include weapon strikes and shots, footsteps, doors, vehicles, gathering, looting and companion sounds. Ambience includes wind, rain, birds and nighttime wildlife. Turning off a channel does not change the simulation. Music and continuous environmental or engine loops stop while the game is paused, hidden, at a menu or after the run ends. The procedural score schedules only the current beat and keeps at most 12 music voices; transient effects have a separate 40-voice limit.

These options control the game score and sounds. Multiplayer proximity voice uses its own audio graph and its own **Mute microphone**, **Deafen** and **Turn voice off** controls in the chat panel. Game audio settings do not request microphone access or change incoming voice distance gain.

`tests/audio-settings-browser.cjs` verifies real Chrome audio waveform output for each isolated channel, volume changes, master mute, adaptive themes, cleanup and persisted options. Its report identifies the explicit scene and visibility fixtures; it does not claim a physical speaker listening test.
