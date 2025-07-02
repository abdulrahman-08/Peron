import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterLink,TranslateModule],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
})
export class OtpComponent {
constructor(private _AuthService: AuthService,private _Router: Router,private _FormBuilder: FormBuilder,private translate: TranslateService,
  private languageService: LanguageService){}
  mserror: string = '';
  spincheak: boolean = false;
  otp: string[] = ['', '', '', ''];
  timer: string = '00:51';
  countdown: any;
  isResendDisabled: boolean = true;
  emailOrPhone:string=''
  currentLang:string='en'

  @ViewChildren('otp1,otp2,otp3,otp4') inputs!: QueryList<ElementRef>;
ngOnInit(): void {
  this.languageService.currentLang$.subscribe((lang) => {
    this.currentLang = lang;
    this.translate.use(lang);
  });
  this.languageService.loadSavedLang();
this.startTimer();
this.emailOrPhone=this._AuthService.getemailOrPhone()
}
  OTPForm:FormGroup = this._FormBuilder.group({
    otp0: [null, Validators.required],
    otp1: [null, Validators.required],
    otp2: [null, Validators.required],
    otp3: [null, Validators.required],
  });
  moveToNext(currentInput: any, nextInput?: any) {
    if (currentInput.value.length === 1 && nextInput) {
      nextInput.focus();
    } else if (currentInput.value.length === 1 && nextInput == null) {
      currentInput.blur();
      console.log(this.OTPForm.value);
      
    }
  }

  updateBorder(input: HTMLInputElement, index: number) {
    if (input.value) {
      input.classList.add('filled');
    } else {
      input.classList.remove('filled');
    }
  }

  onKeyDown(
    event: KeyboardEvent,
    index: number,
    currentInput: HTMLInputElement,
    nextInput?: HTMLInputElement,
    prevInput?: HTMLInputElement
  ) {
    if (event.ctrlKey && event.key.toLowerCase() === 'v') {
      setTimeout(() => {
        this.onPaste(event as any as ClipboardEvent, index);
      }, 50);
    } 
    else if (event.key === "Backspace") {
      if (currentInput.value.trim() !== "") {
        this.otp[index] = "";
        currentInput.value = "";
        event.preventDefault();
      } 
      else if (prevInput) {
        event.preventDefault();
        prevInput.focus();
      }
    }
  }
  onPaste(event: ClipboardEvent, index: number) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') || '';
    const numbersOnly = text.replace(/\D/g, '');

    for (let i = 0; i < numbersOnly.length; i++) {
      if (index + i < 4) {
        this.otp[index + i] = numbersOnly[i];
        this.OTPForm.get(`otp${index + i}`)?.setValue(numbersOnly[i]);
        this.updateBorder(this.inputs.toArray()[index + i].nativeElement, index + i);
      }
    }
  }
  startTimer() {
    let timeLeft = 51;
    this.isResendDisabled = true;

    this.countdown = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(this.countdown);
        this.timer = '00:00';
        this.isResendDisabled = false;
      } else {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        this.timer = `00:${seconds < 10 ? '0' + seconds : seconds}`;
        timeLeft--;
      }
    }, 1000);
  }

  resendOtp() {
    if (!this.isResendDisabled) {
      clearInterval(this.countdown);
      this.timer = '00:51';
      this.startTimer();
      this._AuthService.forgetpassword({
        "email": this.emailOrPhone
      }).subscribe({
        next:(Response)=>{
          console.log(Response);
          
        }, error:(err:HttpErrorResponse)=>{
          this.mserror= err.error.message
          console.log(err);
          
        }
      })
    }
  }

sendOtp(): void {
    if (this.OTPForm.valid) {
      this.spincheak = true;
      const otpValues = Object.values(this.OTPForm.value);
      const otpString = otpValues.join('');
      this._AuthService.setOtp(otpString)
      const optObj =
      {
        "email": this.emailOrPhone,
        "otpCode": otpString
      }
      this._AuthService.sendOtpToResetPassword(optObj).subscribe({
        next: (Response) => {
          this._Router.navigate(['/auth/newPassword']);
          this.spincheak = false;
          console.log(Response);
          
        },
        error: (err: HttpErrorResponse) => {
          this.spincheak = false;
          this.mserror = err.error.message;
          console.log(err);
          
        },
      });
    } else {
      this.mserror = 'Please Enter Your OTP';
    }
  }
}