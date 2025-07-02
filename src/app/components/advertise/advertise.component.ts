import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PropertyService } from 'src/app/services/property.service';
import * as L from 'leaflet';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';
import { ProfileService } from 'src/app/services/profile.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-advertise',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, FormsModule],
  templateUrl: './advertise.component.html',
  styleUrls: ['./advertise.component.css']
})
export class AdvertiseComponent implements AfterViewInit, OnInit {
  selectedFiles: File[] = [];
  imageError: string | null = null;
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  searchAddress: string = '';
  searchError: string | null = null;
  selectedAddress: string | null = null;
  showPaymentPopup: boolean = false;
  currentLang: string = 'en';
  stripUrl: string = '';
  userphone: string = '';
  private searchSubject: Subject<string> = new Subject<string>();
  advertisementForm: FormGroup = this.fb.group({
    Title: ['', Validators.required],
    Location: ['', Validators.required],
    Price: [0, Validators.required],
    RentType: [''],
    Bedrooms: [0],
    Bathrooms: [0],
    HasInternet: [false],
    AllowsPets: [false],
    Area: [0],
    SmokingAllowed: [false],
    Floor: [0],
    IsFurnished: [false],
    HasBalcony: [false],
    HasSecurity: [false],
    HasElevator: [false],
    MinBookingDays: [0],
    AvailableFrom: ['', Validators.required],
    AvailableTo: ['', Validators.required],
    Description: [''],
    YouTubeLink: [''],
    Address: [''],
    Latitude: [0],
    Longitude: [0]
  });

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private _PropertyService: PropertyService,
    private router: Router,
    private translate: TranslateService,
    private languageService: LanguageService,
    private profileService: ProfileService
  ) {
    if (environment.production) {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
    }
  }

  ngOnInit(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: './assets/imgs/marker-icon-2x.png',
      iconUrl: './assets/imgs/marker-icon.png',
      shadowUrl: './assets/imgs/marker-shadow.png',
    });

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      if (searchTerm) {
        this.searchLocation(searchTerm);
      }
    });

    this.profileService.getMyProfile().subscribe({
      next: (res) => {
        this.userphone = res.phoneNumber;
      },
      error: () => {
        this.translate.get('ADVERTISE.FORM.ERROR.PROFILE_ERROR').subscribe((translatedError: string) => {
          this.searchError = translatedError;
        });
      }
    });

    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
      this.translate.use(lang);
      if (this.searchError) {
        this.translate.get(this.searchError).subscribe((translatedError: string) => {
          this.searchError = translatedError;
        });
      }
      if (this.imageError) {
        this.translate.get('ADVERTISE.FORM.ERROR.IMAGE_ERROR').subscribe((translatedError: string) => {
          this.imageError = translatedError;
        });
      }
    });
    this.languageService.loadSavedLang();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.map = L.map('map').setView([30.0444, 31.2357], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      this.advertisementForm.patchValue({
        Latitude: lat,
        Longitude: lng
      });

      if (this.marker) {
        this.map?.removeLayer(this.marker);
      }

      this.marker = L.marker([lat, lng]).addTo(this.map!);
      this.marker.bindPopup(`Fetching address...`).openPopup();

      this.reverseGeocode(lat, lng);
    });
  }

  onSearchAddressChange(searchTerm: string): void {
    this.searchAddress = searchTerm;
    this.searchSubject.next(searchTerm);
  }

  searchLocation(searchTerm: string): void {
    if (!searchTerm) {
      this.translate.get('ADVERTISE.FORM.ERROR.SEARCH_EMPTY').subscribe((translatedError: string) => {
        this.searchError = translatedError;
      });
      return;
    }

    this.searchError = null;

    const query = encodeURIComponent(searchTerm);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&accept-language=${this.currentLang}&countrycodes=eg&addressdetails=1`;

    this.http.get<any[]>(nominatimUrl, {
      headers: new HttpHeaders({ 'User-Agent': 'Peron-App' })
    }).subscribe({
      next: (results) => {
        if (results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          const displayName = results[0].display_name;

          this.advertisementForm.patchValue({
            Latitude: lat,
            Longitude: lon
          });

          this.selectedAddress = displayName;

          if (this.marker) {
            this.map?.removeLayer(this.marker);
          }

          this.marker = L.marker([lat, lon]).addTo(this.map!);
          this.marker.bindPopup(displayName).openPopup();

          this.map?.setView([lat, lon], 13);
        } else {
          this.translate.get('ADVERTISE.FORM.ERROR.SEARCH_NOT_FOUND').subscribe((translatedError: string) => {
            this.searchError = translatedError;
          });
        }
      },
      error: () => {
        this.translate.get('ADVERTISE.FORM.ERROR.SEARCH_ERROR').subscribe((translatedError: string) => {
          this.searchError = translatedError;
        });
      }
    });
  }

  reverseGeocode(lat: number, lng: number): void {
    const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${this.currentLang}`;

    this.http.get<any>(reverseGeocodeUrl, {
      headers: new HttpHeaders({ 'User-Agent': 'Peron-App' })
    }).subscribe({
      next: (result) => {
        const displayName = result.display_name || `Latitude: ${lat}, Longitude: ${lng}`;
        this.selectedAddress = displayName;

        if (this.marker) {
          this.marker.bindPopup(displayName).openPopup();
        }
      },
      error: () => {
        this.translate.get('ADVERTISE.FORM.ERROR.ADDRESS_UNAVAILABLE').subscribe((translatedError: string) => {
          this.selectedAddress = translatedError;
          if (this.marker) {
            this.marker.bindPopup(this.selectedAddress).openPopup();
          }
        });
      }
    });
  }

  resetMap(): void {
    if (this.marker) {
      this.map?.removeLayer(this.marker);
      this.marker = undefined;
    }

    this.advertisementForm.patchValue({
      Latitude: 0,
      Longitude: 0
    });

    this.map?.setView([30.0444, 31.2357], 13);

    this.searchAddress = '';
    this.searchError = null;
    this.selectedAddress = null;
  }

  onFileChange(event: any): void {
    const files: File[] = Array.from(event.target.files);
    this.imageError = null;
    this.selectedFiles = [];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    for (const file of files) {
      if (allowedTypes.includes(file.type)) {
        this.selectedFiles.push(file);
      } else {
        this.translate.get('ADVERTISE.FORM.ERROR.IMAGE_ERROR').subscribe((translatedError: string) => {
          this.imageError = translatedError;
        });
        return;
      }
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    fileInput.click();
  }

  onSubmit(): void {
    if (this.advertisementForm.valid) {
      if (this.advertisementForm.get('Latitude')?.value === 0 || this.advertisementForm.get('Longitude')?.value === 0) {
        this.translate.get('ADVERTISE.FORM.ERROR.LOCATION_REQUIRED').subscribe((translatedError: string) => {
          alert(translatedError);
        });
        return;
      }

      const formData = new FormData();

      formData.append('title', this.advertisementForm.get('Title')?.value || '');
      formData.append('location', this.advertisementForm.get('Location')?.value || '');
      formData.append('price', (parseFloat(this.advertisementForm.get('Price')?.value) || 0).toString());

      const availableFrom = this.advertisementForm.get('AvailableFrom')?.value;
      const availableTo = this.advertisementForm.get('AvailableTo')?.value;
      formData.append('availableFrom', availableFrom ? new Date(availableFrom).toISOString() : '');
      formData.append('availableTo', availableTo ? new Date(availableTo).toISOString() : '');

      formData.append('rentType', this.advertisementForm.get('RentType')?.value || '');
      formData.append('bedrooms', (parseInt(this.advertisementForm.get('Bedrooms')?.value) || 0).toString());
      formData.append('bathrooms', (parseInt(this.advertisementForm.get('Bathrooms')?.value) || 0).toString());
      formData.append('hasInternet', this.advertisementForm.get('HasInternet')?.value === true ? 'true' : 'false');
      formData.append('allowsPets', this.advertisementForm.get('AllowsPets')?.value === true ? 'true' : 'false');
      formData.append('area', (parseInt(this.advertisementForm.get('Area')?.value) || 0).toString());
      formData.append('smokingAllowed', this.advertisementForm.get('SmokingAllowed')?.value === true ? 'true' : 'false');
      formData.append('floor', (parseInt(this.advertisementForm.get('Floor')?.value) || 0).toString());
      formData.append('isFurnished', this.advertisementForm.get('IsFurnished')?.value === true ? 'true' : 'false');
      formData.append('hasBalcony', this.advertisementForm.get('HasBalcony')?.value === true ? 'true' : 'false');
      formData.append('hasSecurity', this.advertisementForm.get('HasSecurity')?.value === true ? 'true' : 'false');
      formData.append('hasElevator', this.advertisementForm.get('HasElevator')?.value === true ? 'true' : 'false');
      formData.append('minBookingDays', (parseInt(this.advertisementForm.get('MinBookingDays')?.value) || 0).toString());
      formData.append('description', this.advertisementForm.get('Description')?.value || '');
      formData.append('latitude', (this.advertisementForm.get('Latitude')?.value || 0).toString());
      formData.append('longitude', (this.advertisementForm.get('Longitude')?.value || 0).toString());

      this.selectedFiles.forEach((file) => {
        formData.append('images', file, file.name);
      });

      this._PropertyService.addProperty(formData).subscribe({
        next: (res) => {
          this.showPaymentPopup = true;
          this.stripUrl = res.paypalurl;
        },
        error: () => {
          this.translate.get('ADVERTISE.FORM.ERROR.SUBMIT_ERROR').subscribe((translatedError: string) => {
            alert(translatedError);
          });
        }
      });
    } else {
      this.translate.get('ADVERTISE.FORM.ERROR.FORM_INVALID').subscribe((translatedError: string) => {
        alert(translatedError);
      });
    }
  }

  onCancelPopup(): void {
    this.showPaymentPopup = false;
    this.router.navigate(['/profile']);
  }

  onPay(): void {
    this.showPaymentPopup = false;
    window.open(this.stripUrl, '_blank');
  }
}