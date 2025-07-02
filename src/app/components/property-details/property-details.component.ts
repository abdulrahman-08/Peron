import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { environment } from '../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { PropertyService } from 'src/app/services/property.service';
import { AuthService } from 'src/app/services/auth.service';
import { WichlistService } from 'src/app/services/wichlist.service';
import { IProperty } from 'src/app/interfaces/iproperty';
import { LanguageService } from 'src/app/services/language.service';

export interface Review {
  ratingId: number;
  userName: string;
  stars: number;
  comment: string;
  createdAt: string;
  timeAgo: string;
}

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GoogleMapsModule, TranslateModule, RouterLink],
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.css']
})
export class PropertyDetailsComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  currentLang: string = '';

  constructor(
    private fb: FormBuilder,
    private _PropertyService: PropertyService,
    private authService: AuthService,
    private _WishListService: WichlistService,
    private _ActivatedRoute: ActivatedRoute,
    private languageService: LanguageService
  ) {}

  property: IProperty = {
    propertyId: 0,
    title: '',
    location: '',
    price: 0,
    rentType: '',
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    floor: 0,
    isFurnished: false,
    hasBalcony: false,
    hasInternet: false,
    hasSecurity: false,
    hasElevator: false,
    allowsPets: false,
    smokingAllowed: false,
    availableFrom: '',
    availableTo: '',
    minBookingDays: 0,
    averageRating: 0,
    description: '',
    images: [],
    latitude: null,
    longitude: null
  };
  activeTab: string = 'descriptions';
  rating: number = 0;
  isFavorite: boolean = false;
  currentSlide: number = 0;
  currentTranslate: number = 0;
  firstFourImages: string[] = [];
  lastFourImages: string[] = [];
  propertys: IProperty[] = [];
  isLoggedIn: boolean = false;
  wishList: string[] = [];
  productDetails: IProperty = {} as IProperty;
  images: string[] = [];
  productId: any = 0;
  review: Review[] = [];

  // إعدادات الخريطة
  center: google.maps.LatLngLiteral = { lat: 40.73061, lng: -73.935242 }; // إحداثيات افتراضية (نيويورك)
  zoom: number = 12;
  markerPosition: google.maps.LatLngLiteral = { lat: 40.73061, lng: -73.935242 };

  reviewForm: FormGroup = this.fb.group({
    comment: ['', Validators.required]
  });

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
    this.languageService.loadSavedLang();

    this._ActivatedRoute.paramMap.subscribe({
      next: (parameter) => {
        this.productId = parameter.get('id');
        this._PropertyService.getPropertyDetails(this.productId).subscribe({
          next: (response) => {
            this.productDetails = response;
            this.fetchPropertyDetails(this.productDetails);
            console.log(response);
          },
          error: (err) => {
            console.error('Error fetching property details:', err);
          }
        });
      }
    });

    this._PropertyService.getPropertyRating(this.productId).subscribe({
      next: (response) => {
        console.log(response);
        this.review = response;
      }
    });

    this.loadGoogleMapsScript();
  }

  checkLoginStatus(): void {
    this.authService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this._WishListService.getUserCart().subscribe({
          next: (response) => {
            this._WishListService.wishCount.next(response.length);
            const newData = response.map((item: any) => item.propertyId);
            this.wishList = newData;
          }
        });
      }
    });
  }

  addToWichList(id: any) {
    this._WishListService.addToWishList(id).subscribe({
      next: (response) => {
        this.wishList = response.favorites.map((item: any) => item.propertyId);
        this._WishListService.wishCount.next(response.favorites.length);
      }
    });
  }

  removeProuWichList(id: any) {
    this._WishListService.removeitem(id).subscribe({
      next: (response) => {
        this.wishList = response.favorites.map((item: any) => item.propertyId);
        this._WishListService.wishCount.next(response.favorites.length);
      }
    });
  }

  loadGoogleMapsScript(): void {
    if (!document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  fetchPropertyDetails(data: IProperty): void {
    this.property = {
      ...data,
      images: data.images || [],
    };

    this.firstFourImages = this.property.images.slice(0, 4);
    this.lastFourImages = this.property.images.slice(-4);
    this.currentTranslate = 100;

    if (this.property.latitude && this.property.longitude) {
      this.center = { lat: this.property.latitude, lng: this.property.longitude };
      this.markerPosition = { lat: this.property.latitude, lng: this.property.longitude };
    } else {
      this.center = { lat: 40.73061, lng: -73.935242 };
      this.markerPosition = { lat: 40.73061, lng: -73.935242 };
    }
  }

  setMainImage(image: string): void {
    this.property.images[0] = image;
  }

  nextSlide(): void {
    if (this.property.images.length < 5) return;

    this.currentSlide++;
    this.currentTranslate += this.currentLang === 'ar' ? -25 : 25;

    if (this.currentSlide >= this.property.images.length) {
      this.currentSlide = 0;
      this.currentTranslate = this.currentLang === 'ar' ? -100 : 100;
    }
  }

  prevSlide(): void {
    if (this.property.images.length < 5) return;

    this.currentSlide--;
    this.currentTranslate -= this.currentLang === 'ar' ? -25 : 25;

    if (this.currentSlide < 0) {
      this.currentSlide = this.property.images.length - 4;
      this.currentTranslate = this.currentLang === 'ar' ? -100 - (this.currentSlide * 25) : 100 + (this.currentSlide * 25);
    }
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
    if (tab == 'additional-info') {
      this._PropertyService.getAllPropertys().subscribe({
        next: (response) => {
          this.propertys = response;
        }
      });
      this.checkLoginStatus();
    }
  }

  setRating(star: number): void {
    this.rating = star;
  }

  addReview(): void {
    if (this.reviewForm.invalid || this.rating === 0) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    const newReview = {
      propertyId: this.productId,
      stars: this.rating,
      comment: this.reviewForm.get('comment')?.value,
    };

    this._PropertyService.addPropertyRating(newReview).subscribe({
      next: (response) => {
        console.log(response);
        this.reviewForm.reset();
        this.rating = 0;
        this.review = response;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    if (this.isFavorite) {
      this.addToWichList(this.property.propertyId);
    } else {
      this.removeProuWichList(this.property.propertyId);
    }
  }
}