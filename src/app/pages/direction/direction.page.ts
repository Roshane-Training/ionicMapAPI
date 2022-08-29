import {
	AfterViewInit,
	Component,
	ElementRef,
	NgZone,
	OnInit,
	ViewChild,
} from '@angular/core';
import { audioService } from 'src/app/services/audio.service';

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
	collection: { place: google.maps.LatLng; name: string }[] = [];
	proxAlert = 30;

	constructor(private ngZone: NgZone, private audioPlayer: audioService) {}

	ngOnInit(): void {
		this.audioPlayer.preload('proximity', 'assets/sounds/proximity.wav');
	}

	ngAfterViewInit() {
		this.initMap();
	}

	/**
	 * Handler for updating directions in response to events
	 * @param originQuery Address of origin
	 * @param destinationQuery Address of destination
	 */
	onChangeHandler: Function;

	/**
	 * Adds a marker to the collection if it'sa part of a direction response
	 * @param name Name of the new marker
	 * @returns true - if the marker existed and could be added to collection
	 */
	addMarker(name) {
		if (this.markerB.getPosition()) {
			this.collection.push({
				place: this.markerB.getPosition(),
				name: name,
			});
		} else return false;
		return true;
	}

	/**
	 * Special handler for activating a marker from collections
	 * @param place place object returned by autocomplete input fields
	 */
	setDestination(place: google.maps.LatLng) {
		// Find the address of a certain latitude and longitude
		new google.maps.Geocoder()
			.geocode({ location: place })
			.then((resp) => {
				this.end.nativeElement.value = resp.results[0].formatted_address;
				if (this.start.nativeElement.value !== '')
					this.onChangeHandler(
						this.start.nativeElement.value.trim(),
						this.end.nativeElement.value.trim()
					);
			})
			.catch((e) => {
				//Error handling
			});
	}

	/**
	 * Checks the distance of markerB from markerA, if it's <= a set amount, an alert will play
	 * @param distance Distance value in metric units
	 */
	proximityCheck(distance: number) {
		if (distance <= this.proxAlert) {
			this.audioPlayer.play('proximity');
			//Alert
		}
	}

	/**
	 * Initializes the map and related processes
	 */
	initMap(): void {
		// Initialize the map using the div element and these options
		this.map = new google.maps.Map(this.mapDiv.nativeElement, {
			zoom: 15,
			center: { lng: -76.8019, lat: 17.9962 },
		});

		// Directions objects needed to create and manage the directions object
		const directionsService = new google.maps.DirectionsService();
		// Provides mad to renderer
		const directionsRenderer = new google.maps.DirectionsRenderer({
			map: this.map,
		});

		this.onChangeHandler = (
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

		// Set places options, such as resticting it to jamaica
		const options = {
			componentRestrictions: { country: 'jm' },
			fields: ['address_components', 'geometry', 'icon', 'name'],
			strictBounds: false,
		};

		// Create the autocomplete objects and give them input elements to manage
		const autocompleteA = new google.maps.places.Autocomplete(
			this.start.nativeElement,
			options
		);
		const autocompleteB = new google.maps.places.Autocomplete(
			this.end.nativeElement,
			options
		);

		// Listen for the event of the place being updated, and respond with update logic
		autocompleteA.addListener('place_changed', () => {
			this.ngZone.run(() => {
				if (this.end.nativeElement.value !== '') {
					this.onChangeHandler(
						this.start.nativeElement.value.trim(),
						this.end.nativeElement.value.trim()
					);
				}
			});
		});

		autocompleteB.addListener('place_changed', () => {
			this.ngZone.run(() => {
				if (this.start.nativeElement.value !== '') {
					this.onChangeHandler(
						this.start.nativeElement.value.trim(),
						this.end.nativeElement.value.trim()
					);
				}
			});
		});

		// Add gragging event end event listener to update directions when a drag is complete
		this.markerB.addListener('dragend', () => {
			const latLng = this.markerB.getPosition();
			// Find address with latitude and longitude
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
				.catch((err) => {
					//Error handling
				});
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

	/**
	 * Prepare and render new route information
	 * @param directionsService 
	 * @param directionsRenderer 
	 * @param origin Address of origin
	 * @param destination Address of destination
	 */
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
		// Create the directions request
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
				// Use directions response to set the direction values in the directions renderer
				directionsRenderer.setDirections(response);
				directionsRenderer.setOptions({ suppressMarkers: true });
				// Establish markers at point A and B
				this.markerA.setOptions({
					position: {
						lat: response.routes[0].legs[0].start_location.lat(),
						lng: response.routes[0].legs[0].start_location.lng(),
					},
					map: this.map,
				});
				this.markerB.setOptions({
					position: {
						lat: response.routes[0].legs[0].end_location.lat(),
						lng: response.routes[0].legs[0].end_location.lng(),
					},
					map: this.map,
				});
				// Save latest directions response
				this.currentDirection = response;
				// Set map centre
				this.map.setCenter(this.markerB.getPosition());
				// Check proximity of directions destination
				this.proximityCheck(response.routes[0].legs[0].distance.value);
			})
			.catch((e) => console.log(e));
	}
}
