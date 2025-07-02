import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IProperty } from 'src/app/interfaces/iproperty';
import { PropertyService } from 'src/app/services/property.service';
import { LanguageService } from 'src/app/services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WichlistService } from 'src/app/services/wichlist.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isLoggedIn: boolean = false;
  translations: any = {};
  propertys: IProperty[] = [];
  filteredProperties: IProperty[] = [];
  places: string[] = [];
  priceRanges: { label: string, min: number, max: number }[] = [];
  currentPage: number = 1;
  currentLang: string = 'en';
  searchQuery: string = '';
  selectedLocation: string = '';
  selectedPriceRange: string = '';
  wishList:string[]=[]
  isdataloaded:boolean=false
  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private _PropertyService: PropertyService,
    private authService: AuthService,
    private _WishListService:WichlistService,
    private _NgxSpinnerService: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loadTranslations();
    this.languageService.currentLang$.subscribe(() => {
      this.loadTranslations();
      this.languageService.currentLang$.subscribe((lang) => {
        this.currentLang = lang;
      });
    });
    this._PropertyService.getAllPropertys().subscribe({
      next: (response) => {
        this.propertys = response;
        this.filteredProperties = [...this.propertys];
        this.places = [...new Set(this.propertys.map(property => property.location))];
        this.generatePriceRanges();
        this.applyFilters();
        this.isdataloaded=true
      }
    });
    this.checkLoginStatus();

    this.languageService.loadSavedLang();
   
  }

  checkLoginStatus(): void {
    this.authService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      if(loggedIn==true){
    this._WishListService.getUserCart().subscribe({
      next:(response)=>{
        
        
        this._WishListService.wishCount.next(response.length);
        const newData=response.map((item:any)=>item.propertyId)
        this.wishList=newData  
        return;      
      }
    })
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
    removeProuWichList(id:any){
      this._WishListService.removeitem(id).subscribe({
        next:(response)=>{
          
          this.wishList = response.favorites.map((item: any) => item.propertyId);
          this._WishListService.wishCount.next(response.favorites.length)
    
        }
      })}
  loadTranslations() {
    this.translate.get([
      'HERO.TITLE',
      'HERO.SUBTITLE',
      'HERO.SEARCH.KEYWORD',
      'HERO.SEARCH.LOCATION',
      'HERO.SEARCH.PRICE',
      'HERO.SEARCH.ADVANCED_SEARCH',
      'GET_RECOMMENDATIONS.TITLE',
      'GET_RECOMMENDATIONS.SUBTITLE',
      'GET_RECOMMENDATIONS.SIGN_IN',
      'RECOMMENDATIONS.TITLE',
      'RECOMMENDATIONS.SUBTITLE',
      'RECOMMENDATIONS.SEE_MORE',
      'WHY_CHOOSE_US.TITLE',
      'WHY_CHOOSE_US.CARD_1.TITLE',
      'WHY_CHOOSE_US.CARD_1.DESCRIPTION',
      'WHY_CHOOSE_US.CARD_2.TITLE',
      'WHY_CHOOSE_US.CARD_2.DESCRIPTION',
      'WHY_CHOOSE_US.CARD_3.TITLE',
      'WHY_CHOOSE_US.CARD_3.DESCRIPTION',
      'TOP_PROPERTIES.TITLE',
      'TOP_PROPERTIES.SUBTITLE',
      'TESTIMONIALS.TITLE',
      'TESTIMONIALS.TESTIMONIAL_1',
      'TESTIMONIALS.TESTIMONIAL_2',
      'TESTIMONIALS.TESTIMONIAL_3',
      'TESTIMONIALS.NAMES.PERSON_1',
      'TESTIMONIALS.NAMES.PERSON_2',
      'TESTIMONIALS.NAMES.PERSON_3',
      'TESTIMONIALS.JOBS.PERSON_1',
      'TESTIMONIALS.JOBS.PERSON_2',
      'TESTIMONIALS.JOBS.PERSON_3',
      'APP_SECTION.TITLE',
      'APP_SECTION.DESCRIPTION',
      'APP_SECTION.DOWNLOAD'
    ]).subscribe((res) => {
      this.translations = res;
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  generatePriceRanges() {
    const prices = this.propertys.map(property => property.price).filter(price => price !== undefined);
    if (prices.length === 0) {
      this.priceRanges = [];
      return;
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const rangeStep = Math.ceil((maxPrice - minPrice) / 4);

    this.priceRanges = [];
    for (let i = 0; i < 4; i++) {
      const rangeMin = minPrice + (i * rangeStep);
      const rangeMax = (i === 3) ? maxPrice : rangeMin + rangeStep - 1;
      if (rangeMin <= maxPrice) {
        this.priceRanges.push({
          label: `EGP ${rangeMin} - EGP ${rangeMax}`,
          min: rangeMin,
          max: rangeMax
        });
      }
    }
  }

  applyFilters() {
    this.filteredProperties = this.propertys.filter(property => {
      const matchesSearch = !this.searchQuery || 
        property.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesLocation = !this.selectedLocation || property.location === this.selectedLocation;

      let matchesPrice = true;
      if (this.selectedPriceRange) {
        const selectedRange = this.priceRanges.find(range => range.label === this.selectedPriceRange);
        if (selectedRange) {
          matchesPrice = property.price >= selectedRange.min && property.price <= selectedRange.max;
        }
      }

      return matchesSearch && matchesLocation && matchesPrice;
    });
  }
}