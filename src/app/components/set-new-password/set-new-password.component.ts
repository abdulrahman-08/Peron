import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from 'src/app/services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-set-new-password',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterLink,TranslateModule],
  templateUrl: './set-new-password.component.html',
  styleUrls: ['./set-new-password.component.css']
})
export class SetNewPasswordComponent {
constructor(private _AuthService:AuthService,private _Router:Router,private _FormBuilder:FormBuilder,private translate: TranslateService,
  private languageService: LanguageService){
}
ngOnInit(): void {
  this.languageService.currentLang$.subscribe((lang) => {
    this.currentLang = lang;
    this.translate.use(lang);
  });
  this.languageService.loadSavedLang();
  this.emailOrPhone=this._AuthService.getemailOrPhone()
  this.otp=this._AuthService.getOtp()
  this.changePasswordSucss=false
}
currentLang:string='en'
mserror:string=''
  spincheak:boolean=false
  inputErr:boolean=false
  emailOrPhone:string=''
  otp:string=''
  changePasswordSucss:boolean=false
passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}
passwordForm:FormGroup=this._FormBuilder.group(
    {
      password: ['', [Validators.required]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator() } 
  );
  
  setlogin():void{
  if (this.passwordForm.valid) {
    this.spincheak=true
    const opj={
      "email": this.emailOrPhone,
      "otpCode": this.otp,
      "newPassword": this.passwordForm.value.password,
      "confirmPassword":this.passwordForm.value.confirmPassword 
    }
    console.log(opj)
    this._AuthService.changePassword(opj).subscribe({
      next:(Response)=>{
        this.spincheak=false
        console.log(Response);
        this.changePasswordSucss=true
      }, error:(err:HttpErrorResponse)=>{
        this.spincheak=false
          this.mserror= err.error.message
          console.log(err)
      }
    })
  }
  else{
    this.mserror="plasee Enter Your Passwords"
  }
  }
}
