import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterLink,TranslateModule],
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent {
 constructor(private _AuthService:AuthService,private _Router:Router,private _FormBuilder:FormBuilder,private translate: TranslateService,
  private languageService: LanguageService){}
  ngOnInit(): void {
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
      this.translate.use(lang);
    });
    this.languageService.loadSavedLang();
    
  }
  loginform:FormGroup=this._FormBuilder.group({
    email: [null,[Validators.required]],    
  })
  mserror:string=''
  spincheak:boolean=false
  inputErr:boolean=false
  currentLang: string = 'en';
  setlogin():void{
  if (this.loginform.valid) {
    this.spincheak=true
    this._AuthService.setemailOrPhone(this.loginform.value.email)
    this._AuthService.forgetpassword(this.loginform.value).subscribe({
      next:(Response)=>{
        this._Router.navigate(['/auth/otp'])  
        this.spincheak=false
      }, error:(err:HttpErrorResponse)=>{
        this.spincheak=false
          this.mserror= err.error.message
      }
    })
  }
  else{
    this.mserror="plasee Enter Your Email or phone Number"
  }
  }
}
