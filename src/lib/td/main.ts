//

import { TileMenu } from './tile_menu';
import { Tile } from './tile';

const tileEls = document.querySelectorAll<HTMLButtonElement>('.tile');
const tileMenuEl = document.querySelector<HTMLDivElement>('#tile-menu');

if (!tileMenuEl) {
	throw new Error('Tile menu div missing');
}

const tileMenu = new TileMenu(tileMenuEl);
const tiles: Tile[] = [];

for (const tileEl of tileEls) {
	tiles.push(Tile.create(tileEl, tileMenu));
}
