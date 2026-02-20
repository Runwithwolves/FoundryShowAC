# DnD 5e show AC

This Foundry VTT module displays the Armour Class (AC) of characters and NPCs directly on their tokens on the canvas. 

### Features
- **GM Only**: The AC badges are only visible to users with the Gamemaster role.
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
