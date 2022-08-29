import {
	AfterViewInit,
	Component,
	ElementRef,
	NgZone,
	OnInit,
	ViewChild,
} from '@angular/core';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { Platform } from '@ionic/angular';

@Component({
	selector: 'app-google-maps',
	templateUrl: './google-maps.component.html',
	styleUrls: ['./google-maps.component.scss'],
})
export class GoogleMapsComponent implements OnInit, AfterViewInit {
	@ViewChild('pac_input') pacInput: ElementRef<HTMLInputElement>;
	@ViewChild('map') viewMap: ElementRef<HTMLDivElement>;

	map!: google.maps.Map;
	center: google.maps.LatLngLiteral = { lat: 30, lng: -110 };
	marker = new google.maps.Marker({
		animation: google.maps.Animation.DROP,
	});
	latitude: any = 17.9962;
	longitude: any = -76.8019;
	autocomplete: google.maps.places.Autocomplete;

	constructor(
		private ngZone: NgZone,
		private geolocation: Geolocation,
		private platform: Platform
	) {}

	/**
	 * Sets a position with a marker on the map
	 * @param latLng Latitude,Longitude object
	 */
	setPosition(latLng: google.maps.LatLngLiteral) {
		this.map.setCenter(latLng);
		this.marker.setOptions({
			position: {
				lat: this.latitude,
				lng: this.longitude,
			},
			map: this.map,
		});
	}

	ngOnInit() {}

	ngAfterViewInit(): void {
		// Create a new autocomplete object and provide the InputEl to it
		const inputEl = this.pacInput.nativeElement;
		const options = {
			componentRestrictions: { country: 'jm' },
			fields: ['address_components', 'geometry', 'icon', 'name'],
			strictBounds: false,
		};
		this.autocomplete = new google.maps.places.Autocomplete(inputEl, options);

		// Add listener for when a new address is selected and the place changes
		this.autocomplete.addListener('place_changed', () => {
			this.ngZone.run(() => {
				const place: google.maps.places.PlaceResult =
					this.autocomplete.getPlace();
				this.latitude = place.geometry.location.lat();
				this.longitude = place.geometry.location.lng();
				// Function that sets marker on the map
				this.setPosition({ lat: this.latitude, lng: this.longitude });
			});
		});

		// Checks if the app is running on android
		if (this.platform.is('android')) {
			//Use geolocation cordova plugin to get current position of device
			this.geolocation
				.getCurrentPosition()
				.then((resp) => {
					this.latitude = resp.coords.latitude;
					this.longitude = resp.coords.longitude;
					// Initialize the map using the div element and these options
					this.map = new google.maps.Map(this.viewMap.nativeElement, {
						center: {
							lat: resp.coords.latitude,
							lng: resp.coords.longitude,
						},
						zoom: 15,
					});
				})
				.catch((err) => {
					console.error(err);
					// If there's an error, use some default values.
					this.map = new google.maps.Map(this.viewMap.nativeElement, {
						center: { lng: this.longitude, lat: this.latitude },
						zoom: 15,
					});
				});
		} else {
			// On a non-android system we'll try to use the browser version
			navigator.geolocation.getCurrentPosition((position) => {
				this.latitude = position.coords.latitude;
				this.longitude = position.coords.longitude;
				// Initialize the map using the div element and these options
				this.map = new google.maps.Map(this.viewMap.nativeElement, {
					center: { lat: this.latitude, lng: this.longitude },
					zoom: 15,
				});
			});
		}
	}
}
