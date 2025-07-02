import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ProfileService } from 'src/app/services/profile.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';
import { WichlistService } from 'src/app/services/wichlist.service';
import { IProperty } from 'src/app/interfaces/iproperty';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentSection: string = 'account';
  profileImage: string = './assets/imgs/ahmed.png';
  initialFormValues: any;
  isFormChanged: boolean = false;
  userName: string = '';
  activeTab: string = 'publish'; // Default tab
  cartItem: IProperty[] = [];
  filteredCartItems: IProperty[] = [];
  searchValue: string = '';
  currentLang: string = '';

  profileForm: FormGroup = this._FormBuilder.group({
    fullName: [null, [Validators.required, Validators.maxLength(30), Validators.minLength(3)]],
    email: [null, [Validators.required, Validators.email]],
    phoneNumber: [null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    oldPassword: [null],
    password: [null],
    confirmPassword: [null],
    profileImage: [null]
  }, { validators: this.passwordMatchValidator() });

  constructor(
    private _FormBuilder: FormBuilder,
    private _ProfileService: ProfileService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private _WishListService: WichlistService,
    private authService: AuthService,
    private router: Router
  ) {}

  getWishList() {
    this._WishListService.getUserCart().subscribe({
      next: (response) => {
        this._WishListService.wishCount.next(response.length);
        this.cartItem = response;
        this.filteredCartItems = [...this.cartItem];
      }
    });
  }

  removeProuWichList(id: string) {
    this._WishListService.removeitem(id).subscribe({
      next: (response) => {
        this.cartItem = response.favorites;
        this.filteredCartItems = [...this.cartItem];
        this._WishListService.wishCount.next(response.favorites.length);
      }
    });
  }

  filterWishlist() {
    if (!this.searchValue) {
      this.filteredCartItems = [...this.cartItem];
      return;
    }

    this.filteredCartItems = this.cartItem.filter(item =>
      item.title.toLowerCase().includes(this.searchValue.toLowerCase()) ||
      item.location.toLowerCase().includes(this.searchValue.toLowerCase())
    );
  }

  ngOnInit(): void {
    this.loadProfileData();
    this.profileForm.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
      this.translate.use(lang);
    });
    this.languageService.loadSavedLang();
    this.getWishList();
  }

  loadProfileData(): void {
    this._ProfileService.getMyProfile().subscribe({
      next: (res) => {
        this.profileForm.patchValue({
          fullName: res.fullName || '',
          email: res.email || '',
          phoneNumber: res.phoneNumber || ''
        }, { emitEvent: false });

        this.profileImage = res.profilePictureUrl || this.profileImage;
        this.initialFormValues = { ...this.profileForm.value };
        this.isFormChanged = false;
        this.userName = res.fullName;
      },
      error: (err) => {
        console.error('Error fetching profile data:', err);
      }
    });
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const oldPassword = control.get('oldPassword')?.value;
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;

      if (!oldPassword && !password && !confirmPassword) {
        return null;
      }

      if (oldPassword && (!password || !confirmPassword)) {
        return { passwordRequired: true };
      }

      if (password !== confirmPassword) {
        return { passwordMismatch: true };
      }

      return null;
    };
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  addAdvertise() {
   this.router.navigate(['/advertise']);
  }

  changeSection(section: string) {
    this.currentSection = section;
   
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileForm.patchValue({ profileImage: file }, { emitEvent: false });
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result as string;
        this.checkFormChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  checkFormChanges(): void {
    const currentValues = this.profileForm.value;
    this.isFormChanged = (
      currentValues.fullName !== this.initialFormValues.fullName ||
      currentValues.email !== this.initialFormValues.email ||
      currentValues.phoneNumber !== this.initialFormValues.phoneNumber ||
      currentValues.oldPassword !== this.initialFormValues.oldPassword ||
      currentValues.password !== this.initialFormValues.password ||
      currentValues.confirmPassword !== this.initialFormValues.confirmPassword ||
      currentValues.profileImage !== this.initialFormValues.profileImage
    );
  }

  onSubmit() {
    if (!this.profileForm.valid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const currentValues = this.profileForm.value;
    const profileData = new FormData();
    let hasChanges = false;

    if (
      currentValues.fullName !== this.initialFormValues.fullName ||
      currentValues.email !== this.initialFormValues.email ||
      currentValues.phoneNumber !== this.initialFormValues.phoneNumber ||
      currentValues.profileImage !== this.initialFormValues.profileImage
    ) {
      profileData.append('fullName', currentValues.fullName);
      profileData.append('email', currentValues.email);
      profileData.append('phoneNumber', currentValues.phoneNumber);
      if (currentValues.profileImage) {
        profileData.append('profilePicture', currentValues.profileImage);
      }
      hasChanges = true;
    }

    if (currentValues.oldPassword && currentValues.password && currentValues.confirmPassword) {
      profileData.append('oldPassword', currentValues.oldPassword);
      profileData.append('password', currentValues.password);
      profileData.append('confirmPassword', currentValues.confirmPassword);
      hasChanges = true;
    }

    if (hasChanges) {
      this._ProfileService.updateProfile(profileData).subscribe({
        next: (response) => {
          this.initialFormValues = { ...this.profileForm.value };
          this.isFormChanged = false;

          if (currentValues.oldPassword) {
            this.profileForm.patchValue({
              oldPassword: null,
              password: null,
              confirmPassword: null
            }, { emitEvent: false });
            this.initialFormValues = { ...this.profileForm.value };
          }
        },
        error: (err) => {
          console.error('Error updating profile:', err);
        }
      });
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
        this.router.navigate(['/auth/login']);
      }
    });
  }
}