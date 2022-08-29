import { Injectable } from '@angular/core';

interface Sound<T> {
	key: string;
	asset: T;
}
@Injectable({
	providedIn: 'root',
})
export class audioService {
	private sounds: Sound<Function>[] = [];
	private forceWebAudio: boolean = false;

	constructor() {}

	preload(key: string, asset: string): void {
		let audio = new Audio('assets/sounds/proximity.wav');
		this.sounds.push({ key: key, asset: () => {
			audio.play();
		} });
	}

	play(key: string): void {
		let soundToPlay = this.sounds.find((sound) => {
			return sound.key === key;
		});
		soundToPlay.asset()
	}
}
