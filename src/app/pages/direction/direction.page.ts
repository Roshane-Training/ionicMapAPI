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
	@ViewChild('map') mapDiv: ElementRef<HTMLDivElement>;
	@ViewChild('start') start: ElementRef<HTMLInputElement>;
	@ViewChild('end') end: ElementRef<HTMLInputElement>;

	map: google.maps.Map;
	currentDirection: google.maps.DirectionsResult;
	markerA = new google.maps.Marker();
	markerB = new google.maps.Marker({
		draggable: true,
		label: 'D',
		animation: google.maps.Animation.DROP,
	});
	collection: { place: google.maps.LatLng; name: string }[] = [
		{
			place: new google.maps.LatLng({ lng: -76.8019, lat: 17.9962 }),
			name: 'First Location',
		},
	];

	constructor(private ngZone: NgZone) {}
	ngOnInit(): void {}

	ngAfterViewInit() {
		this.initMap();
	}

	addMarker(name) {
		this.collection.push({ place: this.markerB.getPosition(), name: name });
		return true;
	}

	setDestination(place: google.maps.LatLng) {
		new google.maps.Geocoder()
			.geocode({ location: place })
			.then((resp) => {
				this.end.nativeElement.value = resp.results[0].formatted_address;
			})
			.catch((e) => {
				//Error handling
			});
	}

	initMap(): void {
		this.map = new google.maps.Map(this.mapDiv.nativeElement, {
			zoom: 15,
			center: { lng: -76.8019, lat: 17.9962 },
		});

		const directionsService = new google.maps.DirectionsService();
		const directionsRenderer = new google.maps.DirectionsRenderer({
			draggable: true,
			map: this.map,
		});

		const onChangeHandler = (
			originQuery: string,
			destinationQuery: string
		) => {
			this.calculateAndDisplayRoute(
				directionsService,
				directionsRenderer,
				originQuery,
				destinationQuery
			);
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
			this.ngZone.run(() => {
				const place = autocompleteA.getPlace();

				if (this.end.nativeElement.value !== '') {
					onChangeHandler(
						this.start.nativeElement.value.trim(),
						this.end.nativeElement.value.trim()
					);
				}

				this.markerA.setOptions({
					position: {
						lat: place.geometry.location.lat(),
						lng: place.geometry.location.lng(),
					},
					map: this.map,
				});

				// map.panTo(this.markerA.getPosition() as google.maps.LatLng);
			});
		});

		autocompleteB.addListener('place_changed', () => {
			this.ngZone.run(() => {
				const place = autocompleteB.getPlace();

				if (this.start.nativeElement.value !== '') {
					onChangeHandler(
						this.start.nativeElement.value.trim(),
						this.end.nativeElement.value.trim()
					);
				}

				this.markerB.setOptions({
					position: {
						lat: place.geometry.location.lat(),
						lng: place.geometry.location.lng(),
					},
					map: this.map,
					draggable: true,
				});

				// map.panTo(this.markerB.getPosition() as google.maps.LatLng);
			});
		});

		this.markerB.addListener('dragend', () => {
			const latLng = this.markerB.getPosition();
			new google.maps.Geocoder()
				.geocode({ location: latLng })
				.then((resp) => {
					this.end.nativeElement.value = resp.results[0].formatted_address;
					if (this.start.nativeElement.value !== '') {
						this.calculateAndDisplayRoute(
							directionsService,
							directionsRenderer,
							this.start.nativeElement.value,
							latLng
						);
					}
				})
				.catch();
		});
		// this.markerA.addListener('dragend', () => {
		// 	const latLng = this.markerA.getPosition();
		// 	if (this.end.nativeElement.value !== '') {
		// 		this.calculateAndDisplayRoute(
		// 			directionsService,
		// 			directionsRenderer,
		// 			this.end.nativeElement.value,
		// 			latLng
		// 		);
		// 	}
		// });
	}

	calculateAndDisplayRoute(
		directionsService: google.maps.DirectionsService,
		directionsRenderer: google.maps.DirectionsRenderer,
		origin:
			| string
			| google.maps.LatLng
			| google.maps.LatLngLiteral
			| google.maps.Place,
		destination:
			| string
			| google.maps.LatLng
			| google.maps.LatLngLiteral
			| google.maps.Place
	) {
		directionsService
			.route({
				origin,
				destination,
				travelMode: google.maps.TravelMode.DRIVING,
				avoidTolls: true,
				optimizeWaypoints: true,
				drivingOptions: {
					departureTime: new Date(),
				},
			})
			.then((response) => {
				directionsRenderer.setDirections(response);
				directionsRenderer.setOptions({ suppressMarkers: true });
				this.currentDirection = directionsRenderer.getDirections();
				this.map.setCenter(this.markerB.getPosition());
			})
			.catch((e) => console.log(e));
	}
}
