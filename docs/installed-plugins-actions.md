# Installed Stream Deck Plugin Action IDs

Reference file extracted from local plugin manifests in
`~/Library/Application Support/com.elgato.StreamDeck/Plugins/`.

Use these UUIDs when you want to trigger an existing plugin's action from another context
or verify there's no overlap with our plugin's namespace (`com.angelcantugr.devworkflow.*`).

---

## Most Useful for Reuse

| Plugin | Action UUID | What it does |
|---|---|---|
| Mac Automation | `com.thoughtasylum.macauto.runshell` | Run an arbitrary shell script — the closest analogue to our Shell Command action |
| Mac Automation | `com.thoughtasylum.macauto.runshortcut` | Run a macOS Shortcut |
| Mac Automation | `com.thoughtasylum.macauto.runjxascript` | Run JavaScript for Automation (JXA) |
| OSAScript | `com.gabrielperales.osascript.action` | Run AppleScript or JavaScript via OSA |
| PythonScriptDeck | `com.nicoohagedorn.pythonscriptdeck.script` | Run a Python script |
| Shortcuts | `com.sentinelite.streamdeckshortcuts.launcher` | Launch a macOS Shortcut by name |

---

## Full Reference

### Keyboard Maestro

Plugin UUID: `com.stairways.keyboardmaestro`

| Action UUID | Name |
|---|---|
| `com.stairways.keyboardmaestro.action` | Trigger a Keyboard Maestro macro |

---

### Mac Automation

Plugin UUID: `com.thoughtasylum.macauto`

| Action UUID | Name |
|---|---|
| `com.thoughtasylum.macauto.runapplescriptscript` | Run AppleScript |
| `com.thoughtasylum.macauto.runjxascript` | Run JavaScript for Automation (JXA) |
| `com.thoughtasylum.macauto.runshell` | Run Shell Script |
| `com.thoughtasylum.macauto.runshortcut` | Run Shortcut |
| `com.thoughtasylum.macauto.triggershortcut` | Trigger Shortcut |
| `com.thoughtasylum.macauto.runkmmacro` | Run Keyboard Maestro Macro |
| `com.thoughtasylum.macauto.triggerkmmacro` | Trigger Keyboard Maestro Macro |
| `com.thoughtasylum.macauto.runopen` | Open File/URL |
| `com.thoughtasylum.macauto.curlstandard` | cURL (Standard) |
| `com.thoughtasylum.macauto.curlstructured` | cURL (Structured) |

---

### Nanoleaf Controller

Plugin UUID: `com.baptiewright.nanoleaf`

| Action UUID | Name |
|---|---|
| `com.baptiewright.nanoleaf.control` | On/Off |
| `com.baptiewright.nanoleaf.brightness` | Brightness |
| `com.baptiewright.nanoleaf.effects` | Effects |
| `com.baptiewright.nanoleaf.color` | Color |

---

### OSAScript

Plugin UUID: `com.gabrielperales.osascript`

| Action UUID | Name |
|---|---|
| `com.gabrielperales.osascript.action` | Run AppleScript or JavaScript |

---

### PythonScriptDeck

Plugin UUID: `com.nicoohagedorn.pythonscriptdeck`

| Action UUID | Name |
|---|---|
| `com.nicoohagedorn.pythonscriptdeck.script` | Run Script |
| `com.nicoohagedorn.pythonscriptdeck.service` | Run Service |

---

### Shortcuts

Plugin UUID: `com.sentinelite.streamdeckshortcuts`

| Action UUID | Name |
|---|---|
| `com.sentinelite.streamdeckshortcuts.launcher` | Launch Shortcut |

---

### Spotify

Plugin UUID: `com.elgato.spotify`

| Action UUID | Name |
|---|---|
| `com.elgato.spotify.player-control` | Player Controls (play/pause/skip) |
| `com.elgato.spotify.multimedia` | Now Playing display |
| `com.elgato.spotify.shuffle` | Shuffle |
| `com.elgato.spotify.repeat-macos` | Repeat (macOS) |
| `com.elgato.spotify.repeat-windows` | Repeat (Windows) |
| `com.elgato.spotify.volume` | Volume |

---

### Volume Controller

Plugin UUID: `com.elgato.volume-controller`

| Action UUID | Name |
|---|---|
| `com.elgato.volume-controller.output-device-control` | Output Device Control (dial) |
| `com.elgato.volume-controller.input-device-control` | Input Device Control (dial) |
| `com.elgato.volume-controller.auto-detection` | Auto Detection |
| `com.elgato.volume-controller.auto-detection.volume` | Auto Detection — Volume |
| `com.elgato.volume-controller.auto-detection.volume-up` | Auto Detection — Volume Up |
| `com.elgato.volume-controller.auto-detection.volume-down` | Auto Detection — Volume Down |
| `com.elgato.volume-controller.auto-detection.mute` | Auto Detection — Mute |
| `com.elgato.volume-controller.auto-detection.next` | Auto Detection — Next |
| `com.elgato.volume-controller.auto-detection.previous` | Auto Detection — Previous |
| `com.elgato.volume-controller.auto-detection.blank` | Auto Detection — Blank |
| `com.elgato.volume-controller.manual-detection` | Manual Detection |
| `com.elgato.volume-controller.back-to-profile` | Back to Profile |

---

### Window Mover

Plugin UUID: `com.elgato.window-mover`

| Action UUID | Name |
|---|---|
| `com.elgato.window-mover.layout` | Layout (predefined positions) |
| `com.elgato.window-mover.maximize` | Maximize |
| `com.elgato.window-mover.custom` | Custom Position |

---

### iCUE (Corsair)

Plugin UUID: `com.corsair.icue`

| Action UUID | Name |
|---|---|
| `com.corsair.icue.activate-lighting-link-effect` | Lighting Link |
| `com.corsair.icue.activate-library-action` | Actions Library |
| `com.corsair.icue.activate-profile` | Profiles |
| `com.corsair.icue.activate-display-action` | Xeneon |
| `com.corsair.icue.activate-mural` | Murals |
| `com.corsair.icue.cooling` | Cooling |
| `com.corsair.icue.sensor` | Sensor |
| `com.corsair.icue.audio.surround-sound` | Surround Sound |
| `com.corsair.icue.battery-status` | Battery Status |
| `com.corsair.icue.audio.microphone` | Microphone |
| `com.corsair.icue.audio.equalizer` | Equalizer |
| `com.corsair.icue.audio.nvidia-broadcast` | NVIDIA Broadcast Technologies |

---

### Adobe Photoshop

Plugin UUID: `com.elgato.photoshop`

| Action UUID | Name |
|---|---|
| `com.elgato.photoshop.select-tool` | Select Tool |
| `com.elgato.photoshop.brightness` | Brightness |
| `com.elgato.photoshop.brush-control` | Brush Control |
| `com.elgato.photoshop.content-aware-fill` | Content-Aware Fill |
| `com.elgato.photoshop.create-fill-adjustment-layer` | Create Fill/Adjustment Layer |
| `com.elgato.photoshop.hsl-control` | HSL Control |
| `com.elgato.photoshop.image-size` | Image Size |
| `com.elgato.photoshop.layer-control` | Layer Control |
| `com.elgato.photoshop.layer-mode` | Layer Mode |
| `com.elgato.photoshop.layer-opacity` | Layer Opacity |
| `com.elgato.photoshop.layer-scroll` | Layer Scroll |
| `com.elgato.photoshop.play-action` | Play Action |
| `com.elgato.photoshop.rasterize-layer-type` | Rasterize Layer Type |
| `com.elgato.photoshop.rotation-view-tool` | Rotation View Tool |
| `com.elgato.photoshop.select-subject` | Select Subject |
| `com.elgato.photoshop.set-color` | Set Color |
| `com.elgato.photoshop.transform-layer` | Transform Layer |
| `com.elgato.photoshop.undo-redo` | Undo/Redo |
| `com.elgato.photoshop.zoom` | Zoom |

---

### Analog Clock

Plugin UUID: `com.elgato.analogclock`

| Action UUID | Name |
|---|---|
| `com.elgato.analogclock.action` | Analog Clock |

---

### Apple Music

Plugin UUID: `com.elgato.applemusic`

| Action UUID | Name |
|---|---|
| `com.elgato.applemusic.play` | Play/Pause |
| `com.elgato.applemusic.shuffle` | Shuffle |
| `com.elgato.applemusic.love` | Love |
| `com.elgato.applemusic.next` | Next Track |
| `com.elgato.applemusic.previous` | Previous Track |
| `com.elgato.applemusic.volume` | Volume |

---

### CPU

Plugin UUID: `com.elgato.cpu`

| Action UUID | Name |
|---|---|
| `com.elgato.cpu.cpu` | CPU Usage (displays %) |

---

### Camera Hub

Plugin UUID: `com.elgato.camerahub`

| Action UUID | Name |
|---|---|
| `com.elgato.camerahub.selectwebcam` | Select Webcam |
| `com.elgato.camerahub.setproperty` | Set Property |
| `com.elgato.camerahub.adjustproperty` | Adjust Property |
| `com.elgato.camerahub.displayproperty` | Display Property |
| `com.elgato.camerahub.resetproperty` | Reset Property |
| `com.elgato.camerahub.refocus` | Refocus |
| `com.elgato.camerahub.takesnapshot` | Take Snapshot |
| `com.elgato.camerahub.toggleluteffect` | Toggle LUT Effect |
| `com.elgato.camerahub.toggleorientation` | Toggle Orientation |
| `com.elgato.camerahub.setnvidiavideoeffect` | Set NVIDIA Video Effect |
| `com.elgato.camerahub.promptercontrol` | Prompter Control |
| `com.elgato.camerahub.prompterappearancesettings` | Prompter Appearance Settings |
| `com.elgato.camerahub.promptercontentsettings` | Prompter Content Settings |
| `com.elgato.camerahub.prompterdisplaysettings` | Prompter Display Settings |
| `com.elgato.camerahub.prompteroverlaysettings` | Prompter Overlay Settings |
| `com.elgato.camerahub.prompterscrollingsettings` | Prompter Scrolling Settings |
| `com.elgato.camerahub.previewtoprompter` | Preview to Prompter |
| `com.elgato.camerahub.windowtoprompter` | Window to Prompter |

---

### Control Center

Plugin UUID: `com.elgato.controlcenter`

| Action UUID | Name |
|---|---|
| `com.elgato.controlcenter.lights-on-off` | Lights On/Off |
| `com.elgato.controlcenter.brightness-slider` | Brightness Slider |
| `com.elgato.controlcenter.brightness-stepper` | Brightness Stepper |
| `com.elgato.controlcenter.temperature-slider` | Color Temperature Slider |
| `com.elgato.controlcenter.temperature-stepper` | Color Temperature Stepper |
| `com.elgato.controlcenter.color-picker` | Color Picker |
| `com.elgato.controlcenter.scene` | Scene |
| `com.elgato.controlcenter.battery` | Battery |

---

### Discord

Plugin UUID: `com.elgato.discord`

| Action UUID | Name |
|---|---|
| `com.elgato.discord.mute` | Mute |
| `com.elgato.discord.deafen` | Deafen |
| `com.elgato.discord.pushto.talk` | Push to Talk |
| `com.elgato.discord.pushto.mute` | Push to Mute |
| `com.elgato.discord.pushtotalktoggle` | Push to Talk Toggle |
| `com.elgato.discord.videotoggle` | Video Toggle |
| `com.elgato.discord.streamtoggle` | Stream Toggle |
| `com.elgato.discord.volumecontrol` | Volume Control (dial) |
| `com.elgato.discord.volumecontrolbutton` | Volume Control (button) |
| `com.elgato.discord.uservolumecontroldial` | User Volume Control (dial) |
| `com.elgato.discord.uservolumecontrolbutton` | User Volume Control (button) |
| `com.elgato.discord.setaudiodevice` | Set Audio Device |
| `com.elgato.discord.channel.text` | Text Channel |
| `com.elgato.discord.channel.voice` | Voice Channel |
| `com.elgato.discord.soundboard` | Soundboard |
| `com.elgato.discord.serverstats` | Server Stats |
| `com.elgato.discord.notifications` | Notifications |

---

### Elgato Studio

Plugin UUID: `com.elgato.elgato-studio`

| Action UUID | Name |
|---|---|
| `com.elgato.elgato-studio.recording` | Recording |
| `com.elgato.elgato-studio.snapshot` | Snapshot |
| `com.elgato.elgato-studio.fullscreen` | Fullscreen |
| `com.elgato.elgato-studio.previewvolume` | Preview Volume |
| `com.elgato.elgato-studio.openstorage` | Open Storage |

---

### JetBrains IDE

Plugin folder: `com.jetbrains.ide.sdPlugin`
Action namespace: `com.jetbrains.idea` (note: different from plugin folder ID)

| Action UUID | Name |
|---|---|
| `com.jetbrains.idea.run` | Run |
| `com.jetbrains.idea.debug` | Debug |
| `com.jetbrains.idea.resume` | Resume |
| `com.jetbrains.idea.new` | New file/project |
| `com.jetbrains.idea.step.over` | Step Over |
| `com.jetbrains.idea.step.into` | Step Into |
| `com.jetbrains.idea.action.step.out` | Step Out |
| `com.jetbrains.idea.action.pause` | Pause |
| `com.jetbrains.idea.action.stop` | Stop |
| `com.jetbrains.idea.action.browser` | Open in Browser |
| `com.jetbrains.idea.action.pop.frame` | Pop Frame (debugger) |
| `com.jetbrains.idea.action.show.project.structure` | Show Project Structure |
| `com.jetbrains.idea.search.everywhere` | Search Everywhere |
| `com.jetbrains.idea.git.pull` | Git Pull |
| `com.jetbrains.idea.empty.action` | Empty Action (placeholder) |

---

*Extracted 2026-07-07 from `~/Library/Application Support/com.elgato.StreamDeck/Plugins/`*
