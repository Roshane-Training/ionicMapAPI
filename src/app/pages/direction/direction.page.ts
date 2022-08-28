import {
	AfterViewInit,
	Component,
	ElementRef,
	NgZone,
	OnInit,
	ViewChild,
} from '@angular/core';

@Component({
	selector: 'app-direction',
	templateUrl: './direction.page.html',
	styleUrls: ['./direction.page.scss'],
})
export class DirectionPage implements OnInit, AfterViewInit {
	@ViewChild('map') map: ElementRef<HTMLElement>;
	@ViewChild('start') start: ElementRef<HTMLInputElement>;
	@ViewChild('end') end: ElementRef<HTMLInputElement>;

	startAddress: string;
	endAddress: string;

	constructor(private ngZone: NgZone) {}
	ngOnInit(): void {}

	ngAfterViewInit() {
		this.initMap();
	}

	initMap(): void {
		const directionsService = new google.maps.DirectionsService();
		const directionsRenderer = new google.maps.DirectionsRenderer();

		const map = new google.maps.Map(this.map.nativeElement, {
			zoom: 15,
			center: { lng: -76.8019, lat: 17.9962 },
		});

		directionsRenderer.setMap(map);

		const onChangeHandler = () => {
			this.calculateAndDisplayRoute(directionsService, directionsRenderer);
		};

		const options = {
			componentRestrictions: { country: 'jm' },
			fields: ['address_components', 'geometry', 'icon', 'name'],
			strictBounds: false,
		};

		const autocompleteA = new google.maps.places.Autocomplete(
			this.start.nativeElement,
			options
		);
		const autocompleteB = new google.maps.places.Autocomplete(
			this.end.nativeElement,
			options
		);

		autocompleteA.addListener('place_changed', () => {
			(this.end.nativeElement.value !== '' ? onChangeHandler : () => {})();
		});

		autocompleteB.addListener('place_changed', () => {
			(this.start.nativeElement.value !== '' ? onChangeHandler : () => {})();
		});
	}

	calculateAndDisplayRoute(
		directionsService: google.maps.DirectionsService,
		directionsRenderer: google.maps.DirectionsRenderer
	) {
		directionsService
			.route({
				origin: {
					query: this.start.nativeElement.value.trim(),
				},
				destination: {
					query: this.end.nativeElement.value.trim(),
				},
				travelMode: google.maps.TravelMode.DRIVING,
			})
			.then((response) => {
				directionsRenderer.setDirections(response);
			})
			.catch((e) => console.log(e));
	}
}
