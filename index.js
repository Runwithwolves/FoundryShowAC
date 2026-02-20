/**
 * DnD 5e show AC Module
 * Displays Armour Class on tokens for Gamemasters.
 */

class ACOverlayManager {
    constructor() {
        this.overlays = new Map();
        this.container = null;
    }

    /**
     * Initialize the manager and register hooks.
     */
    init() {
        // Only Gamemasters can see these overlays
        if (!game.user.isGM) return;

        console.log('DnD 5e show AC | Initializing ACOverlayManager');

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
        document.body.appendChild(this.container);
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

// Initialize the module logic once Foundry is ready
Hooks.once('ready', () => {
    acOverlayManager.init();
});

console.log('DnD 5e show AC | Module script loaded');
