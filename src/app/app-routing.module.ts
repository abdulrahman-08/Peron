import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-gard.guard';
import { isloginGard } from './guards/islogin.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/blank-layout/blank-layout.component').then((m) => m.BlankLayoutComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent), title: 'Home' },
      { path: 'property', loadComponent: () => import('./components/rent/rent.component').then((m) => m.RentComponent), title: 'Property' },
      { path: 'property/:id', loadComponent: () => import('./components/property-details/property-details.component').then((m) => m.PropertyDetailsComponent), title: 'PropertyDetails' },
      { path: 'payment-success', loadComponent: () => import('./components/payment-success/payment-success.component').then((m) => m.PaymentSuccessComponent), title: 'payment-success' },
      { path: 'advanced-filter', loadComponent: () => import('./components/advanced-filter/advanced-filter.component').then((m) => m.AdvancedFilterComponent), title: 'Advanced-filter' },
      { path: 'contact-us', loadComponent: () => import('./components/contact-us/contact-us.component').then((m) => m.ContactUsComponent), title: 'Contact Us' },
      { path: 'notifications', loadComponent: () => import('./components/notifications/notifications.component').then((m) => m.NotificationsComponent), title: 'Notifications' },
      { path: 'wishlist', loadComponent: () => import('./components/wichlist/wichlist.component').then((m) => m.WichlistComponent), title: 'wishlist' },
      { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then((m) => m.ProfileComponent), title: 'Profile',canActivate:[AuthGuard] },
      { path: 'about', loadComponent: () => import('./components/about/about.component').then((m) => m.AboutComponent), title: 'About' },
      { path: 'terms', loadComponent: () => import('./components/terms/terms.component').then((m) => m.TermsComponent), title: 'Terms&Condition' },



      { 
        path: 'advertise', 
        loadComponent: () => import('./components/advertise/advertise.component').then((m) => m.AdvertiseComponent), 
        title: 'Advertise', 
        canActivate: [AuthGuard] 
      },
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./components/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { 
        path: 'login', 
        loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent), 
        title: 'Login',
        canActivate: [AuthGuard], 
        data: { authRequired: false } 
      },
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent), title: 'Dashboard',canActivate:[AuthGuard] },
      { 
        path: 'register', 
        loadComponent: () => import('./components/register/register.component').then((m) => m.RegisterComponent), 
        title: 'Register',
        canActivate: [AuthGuard],
        data: { authRequired: false }
      },
      { 
        path: 'forget-password', 
        loadComponent: () => import('./components/forget-password/forget-password.component').then((m) => m.ForgetPasswordComponent), 
        title: 'Forget Password',
        canActivate: [AuthGuard],
        data: { authRequired: false }
      },
      { 
        path: 'otp', 
        loadComponent: () => import('./components/otp/otp.component').then((m) => m.OtpComponent), 
        title: 'Send OTP',
        canActivate: [AuthGuard],
        data: { authRequired: false }
      },
      { 
        path: 'newPassword', 
        loadComponent: () => import('./components/set-new-password/set-new-password.component').then((m) => m.SetNewPasswordComponent), 
        title: 'New Password',
        canActivate: [AuthGuard],
        data: { authRequired: false }
      },
    ]
  },
  { path: '**', loadComponent: () => import('./components/notfound/notfound.component').then((m) => m.NotfoundComponent), title: '404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }