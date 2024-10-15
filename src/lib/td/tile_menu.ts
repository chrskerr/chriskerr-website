//

import { computePosition, autoPlacement, offset } from '@floating-ui/dom';
import type { Tile } from './tile';

export class TileMenu {
	private readonly tiles: Readonly<Tile>[] = [];
	private openTile: Tile | null = null;

	constructor(private readonly tileMenuEl: HTMLDivElement) {
		window.addEventListener('click', event => {
			if (!this.openTile) {
				return;
			}
			if (!event.target) {
				return;
			}
			if (
				event.target instanceof HTMLButtonElement &&
				event.target.classList.contains('tile')
			) {
				return;
			}
			if (tileMenuEl.contains(event.target as Node)) {
				return;
			}

			Object.assign(tileMenuEl.style, {
				visibility: 'hidden',
			});

			this.openTile.setActive(false);
		});
	}

	registerTile(tile: Tile) {
		this.tiles.push(tile);
	}

	openMenu(openTile: Tile) {
		this.openTile = openTile;

		for (const tile of this.tiles) {
			if (tile === openTile) {
				tile.setActive(true);
			} else {
				tile.setActive(false);
			}
		}

		// add tile menu content

		this.displayMenu(openTile.tileEl);
	}

	private async displayMenu(tileEl: HTMLButtonElement) {
		const { x, y } = await computePosition(tileEl, this.tileMenuEl, {
			placement: 'right-start',
			middleware: [
				offset(2),
				autoPlacement({
					boundary:
						document.querySelector<HTMLDivElement>('#tile-board')!,
					allowedPlacements: [
						'right-start',
						'left-start',
						'right-end',
						'left-end',
					],
				}),
			],
		});

		Object.assign(this.tileMenuEl.style, {
			left: `${x}px`,
			top: `${y}px`,
			visibility: 'visible',
		});
	}
}
