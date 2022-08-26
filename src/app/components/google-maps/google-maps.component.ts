import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';

@Component({
	selector: 'app-google-maps',
	templateUrl: './google-maps.component.html',
	styleUrls: ['./google-maps.component.scss'],
})
export class GoogleMapsComponent implements OnInit, AfterViewInit {
	map!: google.maps.Map;
	center: google.maps.LatLngLiteral = { lat: 30, lng: -110 };
	latitude: any;
	longitude: any;

	constructor(private ngZone: NgZone) {}

	setPosition(latLng: google.maps.LatLngLiteral) {
		this.map.setCenter(latLng);
	}

	initMap(): void {
		const inputEl = document.getElementById('pac-input') as HTMLInputElement;
		const options = {
			componentRestrictions: { country: 'jm' },
			fields: ['address_components', 'geometry', 'icon', 'name'],
			strictBounds: false,
		};
		const autocomplete = new google.maps.places.Autocomplete(inputEl, options);

		autocomplete.addListener('place_changed', () => {
			this.ngZone.run(() => {
				const place: google.maps.places.PlaceResult = autocomplete.getPlace();
				this.latitude = place.geometry.location.lat();
				this.longitude = place.geometry.location.lng();

				this.setPosition({ lat: this.latitude, lng: this.longitude });
			});
		});
	}

	ngOnInit() {
		navigator.geolocation.getCurrentPosition((position) => {
			this.latitude = position.coords.latitude;
			this.longitude = position.coords.longitude;

			this.map = new google.maps.Map(
				document.getElementById('map') as HTMLElement,
				{ center: { lat: this.latitude, lng: this.longitude }, zoom: 10 }
			);
		});
	}

	ngAfterViewInit(): void {
		this.initMap();
	}
}
