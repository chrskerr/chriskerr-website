//

import type { TileMenu } from './tile_menu';

export class Tile {
	private _isActive: boolean = false;
	private _towerLevel: number | null = null;

	private constructor(
		private readonly _tileEl: HTMLButtonElement,
		private readonly openTileMenu: (tile: Tile) => void,
	) {
		_tileEl.addEventListener('click', () => this.openTileMenu(this));
	}

	static create(tileEl: HTMLButtonElement, tileMenu: TileMenu): Tile {
		const tile = new Tile(tileEl, tile => tileMenu.openMenu(tile));
		tileMenu.registerTile(tile);
		return tile;
	}

	get tileEl(): Readonly<HTMLButtonElement> {
		return this._tileEl;
	}

	get isActive(): boolean {
		return this._isActive;
	}

	setActive(newActive: boolean): void {
		this._isActive = newActive;
		if (newActive) {
			this._tileEl.classList.add('bg-slate-300');
		} else {
			this._tileEl.classList.remove('bg-slate-300');
		}
	}

	upgradeTower() {
		this._towerLevel = (this._towerLevel ?? 0) + 1;
	}

	get towerLever() {
		return this._towerLevel;
	}
}
