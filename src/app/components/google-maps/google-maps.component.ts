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
	latitude: any = 17.9962;
	longitude: any = -76.8019;

	constructor(
		private ngZone: NgZone,
		private geolocation: Geolocation,
		private platform: Platform
	) {}

	setPosition(latLng: google.maps.LatLngLiteral) {
		this.map.setCenter(latLng);
	}

	updateMap(): void {
		const inputEl = this.pacInput.nativeElement;
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

	ngOnInit() {}

	ngAfterViewInit(): void {
		if (this.platform.is('android')) {
			this.geolocation
				.getCurrentPosition()
				.then((resp) => {
					this.latitude = resp.coords.latitude;
					this.longitude = resp.coords.longitude;
					this.map = new google.maps.Map(this.viewMap.nativeElement, {
						center: { lat: resp.coords.latitude, lng: resp.coords.longitude },
						zoom: 15,
					});
					this.updateMap();
				})
				.catch((err) => {
					console.error(err);
					this.map = new google.maps.Map(this.viewMap.nativeElement, {
						center: { lat: -76.8019, lng: 17.9962 },
						zoom: 15,
					});
					this.updateMap();
				});
		} else {
			navigator.geolocation.getCurrentPosition((position) => {
				this.latitude = position.coords.latitude;
				this.longitude = position.coords.longitude;

				this.map = new google.maps.Map(this.viewMap.nativeElement, {
					center: { lat: this.latitude, lng: this.longitude },
					zoom: 10,
				});
			});
		}
	}
}
