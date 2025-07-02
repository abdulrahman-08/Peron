import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from 'src/app/services/property.service';
import { IProperty } from 'src/app/interfaces/iproperty';
import { FormsModule } from '@angular/forms';
import { LanguageService } from 'src/app/services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { WichlistService } from 'src/app/services/wichlist.service';
import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rent',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule,RouterLink], 
  templateUrl: './rent.component.html',
  styleUrls: ['./rent.component.css']
})
export class RentComponent implements OnInit {
  propertys: IProperty[] = [];
  filteredProperties: IProperty[] = []; 
  currentPage: number = 1;
  sortBy: string = 'mostRented'; 
  searchQuery: string = ''; 
  wishList:any[]=[]
  isLoggedIn:boolean=false
topRentalProp:IProperty[]=[]
  constructor(private _PropertyService: PropertyService,private _WishListService:WichlistService,private authService:AuthService) {}

  ngOnInit(): void {
    this._PropertyService.getAllPropertys().subscribe({
      next: (response) => {
        this.propertys = response;
        console.log(response);
        this.topRentalProp=response.sort((a: IProperty, b: IProperty) => (b.averageRating || 0) - (a.averageRating || 0));
        this.filteredProperties = [...this.propertys]; 
        this.sortProperties(this.sortBy);
      },
      error: (err) => {
        console.error('خطأ في جلب العقارات:', err);
      }
    });
    this.checkLoginStatus()
   
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
  sortProperties(sortOption: string): void {
    this.sortBy = sortOption;

    switch (sortOption) {
      case 'mostRented':
        this.filteredProperties.sort((a: IProperty, b: IProperty) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'largestArea':
        this.filteredProperties.sort((a: IProperty, b: IProperty) => b.area - a.area);
        break;
      case 'lowerArea':
        this.filteredProperties.sort((a: IProperty, b: IProperty) => a.area - b.area);
        break;
      case 'highestPrice':
        this.filteredProperties.sort((a: IProperty, b: IProperty) => b.price - a.price);
        break;
    }
  }

  filterProperties(): void {
    if (!this.searchQuery) {
      this.filteredProperties = [...this.propertys]; // لو السيرش فاضي، اعرض كل البيانات
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredProperties = this.propertys.filter((property: IProperty) =>
        (property.title?.toLowerCase().includes(query) || false) ||
        (property.location?.toLowerCase().includes(query) || false) ||
        (property.description?.toLowerCase().includes(query) || false)
      );
    }

    // نفذ الترتيب بعد الفلترة
    this.sortProperties(this.sortBy);
  }
}