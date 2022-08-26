import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
	@ViewChild('mapIframe') mapIframe!: ElementRef;
	@ViewChild('inputEl') inputEl!: ElementRef;

	page = { title: 'Google Maps Embeded API' };
	locationQuery = 'Stonyhill';
	mapsFullUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
		`https://www.google.com/maps/embed/v1/search?key=AIzaSyAKyiL209OEEGRyIOQPWj80IhJM153EGzQ&q=
		${this.locationQuery}&zoom=15&maptype=roadmap`
	);

	constructor(protected sanitizer: DomSanitizer) {}

	ngOnInit(): void {}

	reloadMap() {
		location.reload();
	}
}
