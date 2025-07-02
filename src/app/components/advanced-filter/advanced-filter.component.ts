import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PropertyService } from 'src/app/services/property.service';
import { LanguageService } from 'src/app/services/language.service';
import { IProperty } from 'src/app/interfaces/iproperty';
import { WichlistService } from 'src/app/services/wichlist.service';
import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-advanced-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule,RouterLink],
  templateUrl: './advanced-filter.component.html',
  styleUrls: ['./advanced-filter.component.css']
})
export class AdvancedFilterComponent implements OnInit {
  currentLang: string = 'en';
  propertys: IProperty[] = [];
  filteredProperties: IProperty[] = [];
  currentPage: number = 1;
  sortBy: string = 'mostRented';
  searchQuery: string = '';
  places: string[] = [];
  selectedPlace: string = '';
  rentalPeriod: string = '';
  wishList:string[]=[]
  minPrice: number = 0;
  maxPrice: number = 10000;
  priceGap: number = 1000;
  counters: { label: string; value: number }[] = [
    { label: 'Rooms', value: 0 },
    { label: 'Bathrooms', value: 0 },
    { label: 'Floor', value: 0 },
    { label: 'Rating', value: 0 }
  ];
  isLoggedIn:boolean=false
  furnishedOptions: string[] = ['YES', 'PARTIALLY_FURNISHED', 'NO'];
  selectedFurnishedOptions: string[] = [];
  services: string[] = ['ALL', 'BALCONY', 'WIFI', 'GARAGE', 'SECURITY', 'CENTRAL_HEATING', 'ELEVATOR'];
  selectedServices: string[] = ['All'];
  petsAllowed: boolean = false;
  isDropdownOpen: boolean = false;

  daysOfWeek: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  selectedYear: number = new Date().getFullYear();
  selectedMonth: string = this.months[new Date().getMonth()];
  selectedDateFrom: Date | null = null;
  selectedDateTo: Date | null = null;
  selectingFrom: boolean = true;

  constructor(
    private _PropertyService: PropertyService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private _WishListService:WichlistService,
    private authService:AuthService
  ) {}

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
      this.translate.use(lang);
      this.updateMonthDisplay();
    });
    this.languageService.loadSavedLang();
    this._PropertyService.getAllPropertys().subscribe({
      next: (response) => {
        this.propertys = response;
        this.places = [...new Set(this.propertys.map(property => property.location))];
        this.filteredProperties = [...this.propertys];
        this.applyFilters();
      },
      error: (err) => {
      }
    });
    this.checkLoginStatus()
  }
  addToWichList(id: any) {
    this._WishListService.addToWishList(id).subscribe({
      next: (response) => {
        console.log(response);
        this.wishList = response.favorites.map((item: any) => item.propertyId);
        this._WishListService.wishCount.next(response.favorites.length);
      }
    });
  }
    removeProuWichList(id:any){
      this._WishListService.removeitem(id).subscribe({
        next:(response)=>{
          console.log(response);
          this.wishList = response.favorites.map((item: any) => item.propertyId);
          this._WishListService.wishCount.next(response.favorites.length)
    
        }
      })}
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  checkLoginStatus(): void {
    this.authService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      if(loggedIn==true){
       
        this._WishListService.getUserCart().subscribe({
          next:(response)=>{
            console.log(response);
            
            this._WishListService.wishCount.next(response.length);
            const newData=response.map((item:any)=>item.propertyId)
            this.wishList=newData        
          }
        })
      }
    });
  }
  selectPlace(place: string) {
    this.selectedPlace = place;
    this.isDropdownOpen = false;
    this.applyFilters();
  }

  setRentalPeriod(period: string) {
    this.rentalPeriod = this.rentalPeriod === period ? '' : period;
    this.applyFilters();
  }

  updatePriceSlider() {
    if (this.minPrice > this.maxPrice - this.priceGap) {
      this.minPrice = this.maxPrice - this.priceGap;
    }
    if (this.maxPrice < this.minPrice + this.priceGap) {
      this.maxPrice = this.minPrice + this.priceGap;
    }
    if (this.minPrice < 0) {
      this.minPrice = 0;
    }
    if (this.maxPrice > 10000) {
      this.maxPrice = 10000;
    }
    this.applyFilters();
  }

  updateRangeFromInput() {
    let minp = this.minPrice;
    let maxp = this.maxPrice;

    if (minp < 0) minp = 0;
    if (maxp > 10000) maxp = 10000;
    if (minp > maxp - this.priceGap) minp = Math.max(0, maxp - this.priceGap);
    if (maxp < minp + this.priceGap) maxp = Math.min(10000, minp + this.priceGap);

    this.minPrice = minp;
    this.maxPrice = maxp;
    this.applyFilters();
  }

  increment(counter: { label: string; value: number }) {
    counter.value++;
    this.applyFilters();
  }

  decrement(counter: { label: string; value: number }) {
    if (counter.value > 0) {
      counter.value--;
      this.applyFilters();
    }
  }

  setFurnished(option: string) {
    if (this.selectedFurnishedOptions.includes(option)) {
      this.selectedFurnishedOptions = this.selectedFurnishedOptions.filter(opt => opt !== option);
    } else {
      this.selectedFurnishedOptions.push(option);
    }
    this.applyFilters();
  }

  selectService(service: string) {
    if (service === 'ALL') {
      this.selectedServices = this.selectedServices.includes('ALL') ? [] : ['ALL'];
    } else {
      if (this.selectedServices.includes('ALL')) {
        this.selectedServices = [];
      }
      if (this.selectedServices.includes(service)) {
        this.selectedServices = this.selectedServices.filter(s => s !== service);
      } else {
        this.selectedServices.push(service);
      }
      if (this.selectedServices.length === 0) {
        this.selectedServices = ['ALL'];
      }
    }
    this.applyFilters();
  }

  onPetsToggle() {
    this.petsAllowed = !this.petsAllowed;
    this.applyFilters();
  }

  getDaysInMonth(year: number, month: string): (number | null)[] {
    const monthIndex = this.months.indexOf(month);
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }

  changeMonth(direction: 'prev' | 'next') {
    let monthIndex = this.months.indexOf(this.selectedMonth);
    if (direction === 'prev') {
      monthIndex--;
      if (monthIndex < 0) {
        monthIndex = 11;
        this.selectedYear--;
      }
    } else {
      monthIndex++;
      if (monthIndex > 11) {
        monthIndex = 0;
        this.selectedYear++;
      }
    }
    this.selectedMonth = this.months[monthIndex];
    this.updateMonthDisplay();
  }

  selectDay(day: number | null) {
    if (!day || this.isDayDisabled(day)) return;
    const selectedDate = new Date(this.selectedYear, this.months.indexOf(this.selectedMonth), day);
    if (this.selectingFrom) {
      this.selectedDateFrom = selectedDate;
      this.selectedDateTo = null;
      this.selectingFrom = false;
    } else {
      if (selectedDate < this.selectedDateFrom!) {
        this.selectedDateTo = this.selectedDateFrom;
        this.selectedDateFrom = selectedDate;
      } else {
        this.selectedDateTo = selectedDate;
      }
      this.selectingFrom = true;
    }
    this.applyFilters();
  }

  isDayDisabled(day: number): boolean {
    const today = new Date();
    const currentDate = new Date(this.selectedYear, this.months.indexOf(this.selectedMonth), day);
    return currentDate < today;
  }

  isDaySelected(day: number | null): boolean {
    if (!day) return false;
    const currentDate = new Date(this.selectedYear, this.months.indexOf(this.selectedMonth), day);
    if (this.selectedDateFrom) {
      const fromDate = new Date(this.selectedDateFrom);
      if (
        currentDate.getDate() === fromDate.getDate() &&
        currentDate.getMonth() === fromDate.getMonth() &&
        currentDate.getFullYear() === fromDate.getFullYear()
      ) return true;
    }
    if (this.selectedDateTo) {
      const toDate = new Date(this.selectedDateTo);
      if (
        currentDate.getDate() === toDate.getDate() &&
        currentDate.getMonth() === toDate.getMonth() &&
        currentDate.getFullYear() === toDate.getFullYear()
      ) return true;
    }
    return false;
  }

  isDayInRange(day: number | null): boolean {
    if (!day || !this.selectedDateFrom || !this.selectedDateTo) return false;
    const currentDate = new Date(this.selectedYear, this.months.indexOf(this.selectedMonth), day);
    return currentDate > this.selectedDateFrom && currentDate < this.selectedDateTo;
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', options).format(date);
  }

  getSliderStyles(): { [key: string]: string } {
    const minPercent = (this.minPrice / 10000) * 100;
    const maxPercent = (this.maxPrice / 10000) * 100;
    if (this.currentLang === 'ar') {
      return {
        'right': `${minPercent}%`,
        'left': `${100 - maxPercent}%`
      };
    } else {
      return {
        'left': `${minPercent}%`,
        'right': `${100 - maxPercent}%`
      };
    }
  }

  updateMonthDisplay() {}

  applyFilters() {
    this.filteredProperties = this.propertys.filter(property => {
      const matchesLocation = !this.selectedPlace || property.location === this.selectedPlace;
      const matchesPrice = property.price >= this.minPrice && property.price <= this.maxPrice;
      const matchesRentalPeriod = !this.rentalPeriod || property.rentType === this.rentalPeriod;
      const roomsFilter = this.counters.find(c => c.label === 'Rooms')?.value || 0;
      const matchesRooms = property.bedrooms >= roomsFilter;
      const bathroomsFilter = this.counters.find(c => c.label === 'Bathrooms')?.value || 0;
      const matchesBathrooms = property.bathrooms >= bathroomsFilter;
      const floorFilter = this.counters.find(c => c.label === 'Floor')?.value || 0;
      const matchesFloor = property.floor >= floorFilter;
      const ratingFilter = this.counters.find(c => c.label === 'Rating')?.value || 0;
      const propertyRating = property.averageRating ? (typeof property.averageRating === 'string' ? parseFloat(property.averageRating) : property.averageRating) : 0;
      const matchesRating = propertyRating >= ratingFilter;
      let matchesFurnished = true;
      if (this.selectedFurnishedOptions.length > 0) {
        matchesFurnished = this.selectedFurnishedOptions.some(option => {
          if (option === 'NO') return !property.isFurnished;
          if (option === 'YES') return property.isFurnished;
          if (option === 'PARTIALLY_FURNISHED') return property.isFurnished;
          return true;
        });
      }
      let matchesServices = true;
      if (!this.selectedServices.includes('ALL')) {
        matchesServices = this.selectedServices.every(service => {
          if (service === 'BALCONY') return property.hasBalcony;
          if (service === 'WIFI') return property.hasInternet;
          if (service === 'GARAGE') return property.garage;
          if (service === 'SECURITY') return property.hasSecurity;
          if (service === 'CENTRAL_HEATING') return property.centralHeating;
          if (service === 'ELEVATOR') return property.hasElevator;
          return true;
        });
      }
      const matchesPets = !this.petsAllowed || property.allowsPets;
      const matchesSearch = !this.searchQuery || 
        property.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(this.searchQuery.toLowerCase());
      let matchesBookingPeriod = true;
      if (this.selectedDateFrom && this.selectedDateTo) {
        const fromDate = this.selectedDateFrom;
        const toDate = this.selectedDateTo;
        const propertyFromDate = property.availableFrom ? new Date(property.availableFrom) : null;
        const propertyToDate = property.availableTo ? new Date(property.availableTo) : null;
        if (propertyFromDate && propertyToDate) {
          matchesBookingPeriod = fromDate >= propertyFromDate && toDate <= propertyToDate;
        }
      }
      return (
        matchesLocation &&
        matchesPrice &&
        matchesRentalPeriod &&
        matchesRooms &&
        matchesBathrooms &&
        matchesFloor &&
        matchesRating &&
        matchesFurnished &&
        matchesServices &&
        matchesPets &&
        matchesSearch &&
        matchesBookingPeriod
      );
    });
  }
}