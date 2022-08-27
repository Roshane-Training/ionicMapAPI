import {
	AfterViewInit,
	Component,
	ElementRef,
	NgZone,
	OnInit,
	ViewChild,
} from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
	selector: 'app-google-maps',
	templateUrl: './google-maps.component.html',
	styleUrls: ['./google-maps.component.scss'],
})
export class GoogleMapsComponent implements OnInit, AfterViewInit {
	map!: google.maps.Map;
	center: google.maps.LatLngLiteral = { lat: 30, lng: -110 };
	latitude: any = 17.9962;
	longitude: any = -76.8019;

	@ViewChild('pac_input') pac_input: ElementRef<HTMLInputElement>;
	@ViewChild('map') viewMap: ElementRef<HTMLDivElement>;

	constructor(private ngZone: NgZone, private geolocation: Geolocation) {}

	setPosition(latLng: google.maps.LatLngLiteral) {
		this.map.setCenter(latLng);
	}

	initMap(): void {
		const inputEl = this.pac_input.nativeElement;
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
		this.geolocation
			.getCurrentPosition()
			.then((resp) => {
				this.map = new google.maps.Map(this.viewMap.nativeElement, {
					center: { lat: resp.coords.latitude, lng: resp.coords.longitude },
					zoom: 10,
				});
				this.initMap();
			})
			.catch((err) => {
				console.error(err);
				this.map = new google.maps.Map(this.viewMap.nativeElement, {
					center: { lat: -76.8019, lng: 17.9962 },
					zoom: 10,
				});
				this.initMap();
			});
	}
}
