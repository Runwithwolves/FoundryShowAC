# DnD AC Show

This Foundry VTT module displays the Armour Class (AC) of characters and NPCs directly on their tokens on the canvas. 

### Features
- **GM Only**: The AC badges are only visible to users with the Gamemaster role.
- **Toggle Display**: A new toggle button in the Token Instruments menu allows GMs to quickly show or hide all AC overlays.
- **Dynamic Positioning**: The badge is positioned at the bottom-left of the token and moves with it.
- **Auto-Sync**: AC values update automatically when the actor's data changes.
- **Non-Intrusive**: No modifications to core system templates or actor sheets.

### Installation

To install this module in Foundry VTT, use the following **Manifest URL**:
```
https://raw.githubusercontent.com/Runwithwolves/FoundryShowAC/main/module.json
```

### Direct Download Link
If you prefer a manual installation, you can download the module ZIP here:
[https://github.com/Runwithwolves/FoundryShowAC/archive/refs/heads/main.zip](https://github.com/Runwithwolves/FoundryShowAC/archive/refs/heads/main.zip)

### Patch Notes (v1.1.7)
- **Critical Fix**: Updated overlay positioning to be relative to the canvas bounding box, fixing alignment issues with UI scaling or layout changes.
- **Improved Structure**: Restructured module files into `scripts/` and `styles/` directories.
- **Manifest Update**: Added system restriction (`dnd5e`) and updated manifest structure for better compatibility.
- **Bug Fix**: Added defensive checks to `updateToken` and `createToken` hooks to prevent errors in edge cases.
- **Hygiene**: Removed IDE metadata from the repository and cleaned up CSS/HTML rendering.

### Patch Notes (v1.1.6)
- **New Feature**: Added a toggle button to the **Token Instruments** (left-hand controls) to enable/disable AC overlays.
  - Icon: A white shield icon.
  - Clicking the icon toggles all AC overlays on or off globally for the GM.
- **Version Bump**: Updated module version to 1.1.6.

### Patch Notes (v1.1.5)
- **Bug Fix**: Fixed an issue where the module was not appearing in the Module Settings list.
- **Renamed**: Module title updated to **DnD AC Show**.
- **Settings Refactor**: Color settings are now integrated directly into the Module Settings list for easier access.
  - **AC Color Palette**: A hand-picked color picker.
  - **AC Color Hex**: A manual text input for hex codes.
  - Both options are synchronized in real-time.
- **Improved UI**: Cleaner integration with Foundry VTT's native settings menu.

### Patch Notes (v1.1.4)
- New: Hand-picked color palette available via Module Settings → DnD 5e show AC → AC Color Palette. GMs can choose a color using an in-game palette.
- Manual Input: A hex code field is shown below the palette and stays synchronized; you can paste or type a hex value.
- Behavior: Only the shield icon and badge border change color; the AC value text remains white.
- Live Update: Changes apply immediately for GMs; no reload required.

### Patch Notes (v1.1.3)
- Updated title to 'DnD 5e show AC' and bumped version to 1.1.3.

### Patch Notes (v1.1.2)
- New: Module setting "AC Badge Color" in Module Settings. Enter a hex color (e.g., #00ff88) to change the shield icon and border color of the AC badge. The AC number remains white.
- Live Update: Changing the setting updates all badges immediately for GMs.

### Patch Notes (v1.1.1)
- **Bug Fix**: Resolved an issue where the Armour Class (AC) value on tokens could become static or fail to update when decreased.
- **Improved Sync**: Added proactive AC checks during token refreshes and hooks for item/effect updates to ensure the display always matches the Actor sheet.
- **Performance**: Optimized DOM updates using a cache to prevent redundant re-renders.

### Author
Runwithwolves
