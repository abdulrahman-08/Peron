import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,RouterLink,FormsModule,ReactiveFormsModule,TranslateModule
    ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
constructor(private _AuthService:AuthService, private _Router:Router, private _FormBuilder:FormBuilder,private translate: TranslateService,
  private languageService: LanguageService){}
@ViewChildren('otp1,otp2,otp3,otp4') inputs!: QueryList<ElementRef>;
  ngOnInit(): void
   {
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
      this.translate.use(lang);
    });
    this.languageService.loadSavedLang();
    this.startTimer();
      this.emailOrPhone=this._AuthService.getemailOrPhone()
  }
passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}

  registerForm:FormGroup=this._FormBuilder.group({
    fullName:[null,[Validators.required,Validators.maxLength(20),Validators.minLength(3)]],
    email:[null,[Validators.required,Validators.email]],
    phoneNumber:[null,[Validators.required,Validators.pattern(/^01[0125][0-9]{8}$/)]],
    password:[null,[Validators.required]],
    confirmPassword:[null,[Validators.required]]},
    { validators: this.passwordMatchValidator() } 
  )

  OTPForm:FormGroup = this._FormBuilder.group({
    otp0: [null, Validators.required],
    otp1: [null, Validators.required],
    otp2: [null, Validators.required],
    otp3: [null, Validators.required],
  });
  mserror:string=''
  spincheak:boolean=false
  otp: string[] = ['', '', '', ''];
  timer: string = '00:51';
  countdown: any;
  currentLang:string='en'
  isResendDisabled: boolean = true;
  emailOrPhone:string=''
  registerSucc:boolean=false;
  
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

  
 handelForm():void{
   if(this.registerForm.valid){
    this.emailOrPhone=this.registerForm.value.email
    this.spincheak=true
    this._AuthService.setRegister(this.registerForm.value).subscribe({
      next:(Response)=>{
        this.startTimer();
        this.spincheak=false
       console.log(Response)
       this.registerSucc=true;
       this.mserror=''
      },
      error:(err:HttpErrorResponse)=>{
        this.spincheak=false
        this.mserror= err.error.errors[0]
          console.log(err.error.errors[0]);
       
      }
    })
   }
   else{
    this.registerForm.markAllAsTouched();
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
      this._AuthService.sendOtpToConfirmedEmail(optObj).subscribe({
        next: (Response) => {
          this._Router.navigate(['/auth/login']);
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
          this.mserror= err.error.errors[0]
          console.log(err.error.errors[0]);
          
        }
      })
    }
  }
}
