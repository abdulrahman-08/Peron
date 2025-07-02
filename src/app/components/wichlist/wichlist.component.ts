import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';
import { RouterLink } from '@angular/router';
import { WichlistService } from 'src/app/services/wichlist.service';
import { FormsModule } from '@angular/forms';
import { IProperty } from 'src/app/interfaces/iproperty';

@Component({
  selector: 'app-wichlist',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, FormsModule],
  templateUrl: './wichlist.component.html',
  styleUrls: ['./wichlist.component.css']
})
export class WichlistComponent implements OnInit {
  cartitem: IProperty[] = [];
  filteredCartItems: IProperty[] = []; 
  searchvalue: string = '';
  currentLang: string = '';
  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private _WishListService: WichlistService
  ) {}

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
    this.languageService.loadSavedLang();
    this.loadTranslations();
    this.getWishList();
  }
 
  getWishList() {
    this._WishListService.getUserCart().subscribe({
      next: (response) => {
        this._WishListService.wishCount.next(response.length);
        this.cartitem = response;
        this.filteredCartItems = [...this.cartitem]; 
      }
    });
  }

  removeProuWichList(id: string) {
    this._WishListService.removeitem(id).subscribe({
      next: (response) => {
        this.cartitem=response.favorites      
        this.filteredCartItems = [...this.cartitem]; 
        this._WishListService.wishCount.next(response.favorites.length);
      }
    });
  }

  filterWishlist() {
    if (!this.searchvalue) {
      this.filteredCartItems = [...this.cartitem]; // إذا كان حقل البحث فاضي، نعرض كل العقارات
      return;
    }

    this.filteredCartItems = this.cartitem.filter(item =>
      item.title.toLowerCase().includes(this.searchvalue.toLowerCase()) ||
      item.location.toLowerCase().includes(this.searchvalue.toLowerCase())
    );
  }

  loadTranslations() {
    this.translate.get([
      'FAVORITES.NO_FAVORITES_TITLE',
      'FAVORITES.NO_FAVORITES_DESCRIPTION',
      'FAVORITES.EXPLORE_NOW',
      'FAVORITES.LATER',
      'FAVORITES.BACK_TO_HOME',
      'PROPERTY_SEARCH.SEARCH_PLACEHOLDER'
    ]).subscribe();
  }
}