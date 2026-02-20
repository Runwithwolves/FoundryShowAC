/**
 * DnD 5e show AC Module
 * Displays Armour Class on tokens for Gamemasters.
 */

class ACOverlayManager {
    constructor() {
        this.overlays = new Map();
        this.container = null;
        this.color = '#ff0000';
    }

    /**
     * Initialize the manager and register hooks.
     */
    init() {
        // Only Gamemasters can see these overlays
        if (!game.user.isGM) return;

        console.log('DnD 5e show AC | Initializing ACOverlayManager');

        // Apply current color setting from module settings
        try {
            this.setColor(game.settings.get('foundry-ac', 'acColor'));
        } catch (e) {
            this.setColor('#ff0000');
        }

        Hooks.on('canvasReady', () => this.drawAll());
        Hooks.on('updateActor', (actor) => this.updateActor(actor));
        Hooks.on('updateToken', (tokenDoc) => this.updateToken(tokenDoc.object));
        Hooks.on('createToken', (tokenDoc) => this.updateToken(tokenDoc.object));
        Hooks.on('deleteToken', (tokenDoc) => this.removeToken(tokenDoc.id));
        Hooks.on('canvasPan', () => this.syncAll());
        Hooks.on('refreshToken', (token) => this.syncToken(token));

        // Additional hooks to catch AC changes from items and effects
        const updateOnChildDoc = (doc) => {
            if (doc.parent instanceof Actor) this.updateActor(doc.parent);
        };
        Hooks.on('createItem', updateOnChildDoc);
        Hooks.on('updateItem', updateOnChildDoc);
        Hooks.on('deleteItem', updateOnChildDoc);
        Hooks.on('createActiveEffect', updateOnChildDoc);
        Hooks.on('updateActiveEffect', updateOnChildDoc);
        Hooks.on('deleteActiveEffect', updateOnChildDoc);
        
        // If canvas is already ready, draw immediately
        if (canvas.ready) this.drawAll();
    }

    /**
     * Ensure the DOM container for overlays exists and is attached to the body.
     * @private
     */
    _ensureContainer() {
        if (this.container && document.body.contains(this.container)) return;
        this.container = document.createElement('div');
        this.container.id = 'dnd5e-ac-overlay-container';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '100';
        this.container.style.setProperty('--ac-badge-color', this.color || '#ff0000');
        document.body.appendChild(this.container);
    }

    /**
     * Set or update the current badge color and propagate to the container CSS variable.
     * @param {string} color
     */
    setColor(color) {
        this.color = color || '#ff0000';
        if (this.container) {
            this.container.style.setProperty('--ac-badge-color', this.color);
        }
    }

    /**
     * Clear all existing overlays and redraw for all tokens on the canvas.
     */
    drawAll() {
        this.clear();
        if (!canvas.tokens?.placeables) return;
        this._ensureContainer();
        for (let token of canvas.tokens.placeables) {
            this.updateToken(token);
        }
    }

    /**
     * Update overlays for all tokens associated with a specific actor.
     * @param {Actor} actor
     */
    updateActor(actor) {
        // Use a small delay to ensure derived data (AC) is fully recalculated by the system
        setTimeout(() => {
            const tokens = actor.getActiveTokens();
            for (let token of tokens) {
                this.updateToken(token);
            }
        }, 100);
    }

    /**
     * Update or create the AC overlay for a specific token.
     * @param {Token} token
     */
    updateToken(token) {
        if (!token || !token.actor || !token.id) return;
        
        // Only show for character and npc types in D&D 5e
        const allowedTypes = ['character', 'npc'];
        if (!allowedTypes.includes(token.actor.type)) return;

        // Retrieve AC from the standard D&D 5e path
        const ac = token.actor.system?.attributes?.ac?.value;
        if (ac === undefined || ac === null) {
            this.removeToken(token.id);
            return;
        }

        this._ensureContainer();
        let badge = this.overlays.get(token.id);
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'dnd5e-ac-badge';
            this.container.appendChild(badge);
            this.overlays.set(token.id, badge);
        }

        // Only update innerHTML if the value actually changed to avoid redundant DOM writes
        const acStr = String(ac);
        if (badge.dataset.ac !== acStr) {
            badge.innerHTML = `<i class="fas fa-shield-alt"></i> ${ac}`;
            badge.dataset.ac = acStr;
        }
        
        this.syncToken(token);
    }

    /**
     * Remove the overlay for a token.
     * @param {string} tokenId
     */
    removeToken(tokenId) {
        const badge = this.overlays.get(tokenId);
        if (badge) {
            badge.remove();
            this.overlays.delete(tokenId);
        }
    }

    /**
     * Synchronize the position of all overlays with their respective tokens.
     */
    syncAll() {
        if (!this.overlays.size) return;
        for (let [tokenId, badge] of this.overlays) {
            const token = canvas.tokens.get(tokenId);
            if (token) this.syncToken(token);
        }
    }

    /**
     * Synchronize the position of a single token's overlay.
     * @param {Token} token
     */
    syncToken(token) {
        const badge = this.overlays.get(token.id);
        if (!badge) return;

        // Handle visibility (e.g. if token is hidden or on another layer)
        if (!token.visible || !token.renderable) {
            badge.style.display = 'none';
            return;
        }

        badge.style.display = 'flex';

        // Proactively check if AC changed (fallback for missed update hooks)
        const ac = token.actor?.system?.attributes?.ac?.value;
        if (ac !== undefined && ac !== null) {
            const acStr = String(ac);
            if (badge.dataset.ac !== acStr) {
                badge.innerHTML = `<i class="fas fa-shield-alt"></i> ${ac}`;
                badge.dataset.ac = acStr;
            }
        }
        
        // Map canvas coordinates (bottom-left of token) to global screen coordinates
        const globalPos = token.worldTransform.apply(new PIXI.Point(0, token.h));
        
        badge.style.left = `${globalPos.x}px`;
        badge.style.top = `${globalPos.y}px`;
        
        // Apply scaling if desired, but here we keep it mostly constant 
        // We can optionally scale the badge with the canvas zoom for better look
        const scale = canvas.stage.scale.x;
        badge.style.transform = `translate(0, -100%) scale(${Math.max(0.5, Math.min(scale, 1.2))})`;
    }

    /**
     * Remove all overlays and clean up.
     */
    clear() {
        if (this.container) this.container.innerHTML = '';
        this.overlays.clear();
    }
}

// Create the manager instance
const acOverlayManager = new ACOverlayManager();

/**
 * Settings menu with a color palette and manual hex input
 */
class ACColorMenu extends Application {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'foundry-ac-color-menu',
            title: 'AC Color Palette',
            template: null,
            popOut: true,
            width: 420,
            height: 'auto',
            classes: ['foundry-ac', 'ac-color-menu']
        });
    }

    getData(options) {
        return {
            color: game.settings.get('foundry-ac', 'acColor') || '#ff0000'
        };
    }

    async _renderInner(data) {
        const color = data.color || '#ff0000';
        const html = $(`
          <form class="ac-color-form">
            <div class="form-group">
              <label>Pick Color</label>
              <input type="color" name="color" value="${color}" />
              <p class="notes">Choose a color using the palette. Applies to the shield icon and the badge border. The AC number remains white.</p>
            </div>
            <div class="form-group">
              <label>Hex Code</label>
              <input type="text" name="hex" value="${color}" placeholder="#ffffff" />
              <p class="notes">You can also enter a hex color code manually. It will stay synchronized with the picker above.</p>
            </div>
            <footer class="sheet-footer flexrow">
              <button type="submit" class="submit"><i class="fas fa-save"></i> Save & Close</button>
              <button type="button" class="reset"><i class="fas fa-undo"></i> Reset to Default</button>
            </footer>
          </form>
        `);
        return html;
    }

    activateListeners(html) {
        super.activateListeners(html);

        const $form = html.find('form.ac-color-form');
        const $color = html.find('input[name="color"]');
        const $hex = html.find('input[name="hex"]');

        const normalizeHex = (v) => {
            if (!v) return null;
            let s = String(v).trim();
            if (!s) return null;
            if (!s.startsWith('#')) s = `#${s}`;
            s = s.toLowerCase();
            return /^#([0-9a-f]{6})$/.test(s) ? s : null;
        };

        const apply = async (hex) => {
            const valid = normalizeHex(hex);
            if (!valid) return;
            // Persist to settings
            await game.settings.set('foundry-ac', 'acColor', valid);
            // Live-apply for GMs
            if (game.user?.isGM && acOverlayManager) acOverlayManager.setColor(valid);
            // Sync inputs
            $hex.val(valid);
            $color.val(valid);
        };

        $color.on('input change', (ev) => apply(ev.currentTarget.value));
        $hex.on('input change', (ev) => apply(ev.currentTarget.value));

        $form.on('submit', (ev) => {
            ev.preventDefault();
            this.close();
        });

        html.find('button.reset').on('click', (ev) => {
            ev.preventDefault();
            const setting = game.settings.settings.get('foundry-ac.acColor');
            const def = setting?.default ?? '#ff0000';
            apply(def);
        });
    }
}

// Register module settings (color palette)
Hooks.once('init', () => {
    // Hidden storage setting; UI provided via menu below
    game.settings.register('foundry-ac', 'acColor', {
        name: 'AC Badge Color',
        hint: 'Hex color (e.g., #ff0000). Changes the shield icon and border color. AC value remains white.',
        scope: 'world',
        config: false,
        type: String,
        default: '#ff0000',
        onChange: (value) => {
            // Update live for GMs
            if (game.user?.isGM && acOverlayManager) acOverlayManager.setColor(value);
        }
    });

    // Menu entry to open the palette UI
    game.settings.registerMenu('foundry-ac', 'acColorMenu', {
        name: 'AC Color Palette',
        label: 'Open Palette',
        hint: 'Pick from a color palette or enter a hex code. Applies to the shield icon and border. AC value remains white.',
        icon: 'fas fa-palette',
        type: ACColorMenu,
        restricted: true
    });
});

// Initialize the module logic once Foundry is ready
Hooks.once('ready', () => {
    acOverlayManager.init();
});

console.log('DnD 5e show AC | Module script loaded');
