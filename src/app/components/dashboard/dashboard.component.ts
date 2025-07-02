import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FormsModule, NgForm } from '@angular/forms';
import { DashboardService } from 'src/app/services/dashboard.service';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

// Interfaces remain unchanged
interface Listing {
  userName: string;
  propertyTitle: string;
  price: number;
  bookingDate: string;
  paymentStatus: string;
  paymentMethod?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  rentalCount: number;
  date: string;
  status: string;
}

interface Review {
  id: string;
  email: string;
  name: string;
  location: string | null;
  phoneNumber: string | null;
  rating: number;
  joinedAt: string;
  profilePictureUrl: string | null;
}

interface Rating {
  star: number;
  percentage: number;
  barClass: string;
}

interface CustomerReviewStats {
  average: number;
  totalRatings: number;
  ratings: Rating[];
}

interface IncomeData {
  month: string;
  year: number;
  income: number;
}

interface CustomerAnalysisData {
  month: string;
  activeCustomers: number;
  newCustomers: number;
  bookings: number;
}

interface TotalApartmentUserRent {
  totalUsers: number;
  totalProperties: number;
  totalRents: number;
  usersGrowthPercent: string;
  propertiesGrowthPercent: string;
  rentsGrowthPercent: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  latestListings: Listing[] = [];
  users: User[] = [];
  reviews: Review[] = [];
  filteredUsers: User[] = [];
  filteredReviews: Review[] = [];
  incomeData: IncomeData[] = [];
  customerAnalysisData: CustomerAnalysisData[] = [];
  totalUsers: number = 0;
  totalProperties: number = 0;
  totalRents: number = 0;
  usersGrowthPercent: string = '0%';
  propertiesGrowthPercent: string = '0%';
  rentsGrowthPercent: string = '0%';
  isSidebarOpen = false;
  currentSection: string = 'overview';
  searchName: string = '';
  searchStatus: string = '';
  adminName: string = '';
  adminImagePath: string = '';
  totalReviewsCount: number = 0;
  reviewGrowthMessage: string = 'Growth in reviews this year';
  averageReviewsValue: number = 0;
  customerReviewStats: CustomerReviewStats = {
    average: 0,
    totalRatings: 0,
    ratings: []
  };
  selectedUser: User = { id: '', email: '', name: '', phoneNumber: '', rentalCount: 0, date: '', status: 'active' };
  currentLang: string = '';

  @ViewChild('customerAnalysisChartCanvas') customerAnalysisChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('incomeAnalysisChartCanvas') incomeAnalysisChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('editForm') editForm!: NgForm;

  customerAnalysisChart: Chart | undefined;
  incomeAnalysisChart: Chart | undefined;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private profileService: ProfileService,
    private http: HttpClient,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  changeSection(section: string) {
    this.currentSection = section;
  }

  logout() {
    this.authService.logout();
    console.log('User logged out');
  }

  loadProfileData(): void {
    this.profileService.getMyProfile().subscribe({
      next: (res) => {
        this.adminName = res.fullName || 'Admin';
        this.adminImagePath = res.profilePictureUrl || './assets/imgs/ahmed.png';
        console.log('Admin Profile Data:', res);
      },
      error: (err) => {
        console.error('Error fetching admin profile data:', err);
        this.adminName = 'Abdulrahman Magdy';
        this.adminImagePath = './assets/imgs/ahmed.png';
      }
    });
  }

  openEditModal(user: User) {
    this.selectedUser = { ...user };
    const modal = document.getElementById('editUserModal');
    if (modal) {
      (modal as any).showModal();
    }
  }

  saveUserChanges() {
    if (this.editForm.valid) {
      this.dashboardService.editUserData(
        this.selectedUser.id,
        {
          fullName: this.selectedUser.name,
          email: this.selectedUser.email,
          phoneNumber: this.selectedUser.phoneNumber,
        }
      ).subscribe({
        next: (response) => {
          console.log('User updated:', response);
          this.users = this.users.map(u => u.id === this.selectedUser.id ? this.selectedUser : u);
          this.filterUsers();
          const modal = document.getElementById('editUserModal');
          if (modal) {
            (modal as any).hideModal();
          }
        },
        error: (err) => {
          console.error('Error updating user:', err);
        }
      });
    }
  }

  deleteUser(id: string) {
    if (confirm(this.translate.instant('DASHBOARD.USERS.CONFIRM_DELETE'))) {
      this.dashboardService.deleteUser(id).subscribe({
        next: (response) => {
          console.log('User deleted:', response);
          this.users = this.users.filter(u => u.id !== id);
          this.filterUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  ngOnInit(): void {
    this.loadProfileData();
    this.dashboardService.getTotalApartmentUserrent().subscribe({
      next: (response: TotalApartmentUserRent) => {
        this.totalUsers = response.totalUsers || 0;
        this.totalProperties = response.totalProperties || 0;
        this.totalRents = response.totalRents || 0;
        this.usersGrowthPercent = response.usersGrowthPercent || '0%';
        this.propertiesGrowthPercent = response.propertiesGrowthPercent || '0%';
        this.rentsGrowthPercent = response.rentsGrowthPercent || '0%';
        console.log('Total Apartment User Rent:', response);
      },
      error: (error) => {
        console.error('Error fetching Total Apartment User Rent:', error);
        this.totalUsers = 0;
        this.totalProperties = 0;
        this.totalRents = 0;
        this.usersGrowthPercent = '0%';
        this.propertiesGrowthPercent = '0%';
        this.rentsGrowthPercent = '0%';
      }
    });

    this.dashboardService.getlatestlistings().subscribe({
      next: (response: Listing[]) => {
        this.latestListings = response || [];
        console.log('Latest Listings:', this.latestListings);
      },
      error: (error) => {
        console.error('Error fetching Latest Listings:', error);
        this.latestListings = [];
      }
    });

    this.dashboardService.GetLast12MonthsIncome().subscribe({
      next: (response: IncomeData[]) => {
        this.incomeData = response || [];
        console.log('Last 12 Months Income:', this.incomeData);
        if (this.incomeAnalysisChartCanvas) {
          this.createIncomeAnalysisChart();
        }
      },
      error: (error) => {
        console.error('Error fetching Last 12 Months Income:', error);
        this.incomeData = [];
      }
    });

    this.dashboardService.getCustomerAnalysis().subscribe({
      next: (response: CustomerAnalysisData[]) => {
        this.customerAnalysisData = response || [];
        console.log('Customer Analysis:', this.customerAnalysisData);
        if (this.customerAnalysisChartCanvas) {
          this.createCustomerAnalysisChart();
        }
      },
      error: (error) => {
        console.error('Error fetching Customer Analysis:', error);
        this.customerAnalysisData = [];
      }
    });

    this.dashboardService.getTotalRatings().subscribe({
      next: (response: number) => {
        this.totalReviewsCount = response || 0;
        console.log('Total Ratings:', this.totalReviewsCount);
      },
      error: (error) => {
        console.error('Error fetching Total Ratings:', error);
        this.totalReviewsCount = 0;
      }
    });

    this.dashboardService.getAppRatingusers().subscribe({
      next: (response: Review[]) => {
        this.reviews = response.map(review => ({
          id: review.id,
          email: review.email,
          name: review.name,
          location: review.location || null,
          phoneNumber: review.phoneNumber || null,
          rating: review.rating,
          joinedAt: review.joinedAt,
          profilePictureUrl: review.profilePictureUrl || null
        })) || [];
        this.filterReviews();
        this.updateReviewStats();
        console.log('App Rating Users:', this.reviews);
      },
      error: (error) => {
        console.error('Error fetching App Rating Users:', error);
        this.reviews = [];
      }
    });

    this.dashboardService.getAverage().subscribe({
      next: (response: { averageRating: number }) => {
        this.averageReviewsValue = response.averageRating || 0;
        this.customerReviewStats.average = this.averageReviewsValue;
        console.log('Average:', response);
      },
      error: (error) => {
        console.error('Error fetching Average:', error);
        this.averageReviewsValue = 0;
      }
    });

    this.dashboardService.getUsersWithPropertyPayments().subscribe({
      next: (response: User[]) => {
        this.users = response.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          rentalCount: user.rentalCount || 0,
          date: user.date || new Date().toISOString(),
          status: user.status === 'Active' ? 'active' : 'inactive'
        })) || [];
        this.filterUsers();
        console.log('Users with Property Payments:', response);
      },
      error: (error) => {
        console.error('Error fetching Users with Property Payments:', error);
        this.users = [];
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.customerAnalysisChartCanvas && this.customerAnalysisData.length > 0) {
      this.createCustomerAnalysisChart();
    }
    if (this.incomeAnalysisChartCanvas && this.incomeData.length > 0) {
      this.createIncomeAnalysisChart();
    }
  }

  createCustomerAnalysisChart(): void {
    const labels = this.customerAnalysisData.map(item => item.month);
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Active Customers',
          data: this.customerAnalysisData.map(item => item.activeCustomers),
          backgroundColor: '#03045E',
          borderColor: '#03045E',
          borderWidth: 1,
          stack: 'Stack 0',
          barPercentage: 0.4,
          categoryPercentage: 0.8
        },
        {
          label: 'New Customers',
          data: this.customerAnalysisData.map(item => item.newCustomers),
          backgroundColor: '#0F7757',
          borderColor: '#0F7757',
          borderWidth: 1,
          stack: 'Stack 0',
          barPercentage: 0.4,
          categoryPercentage: 0.8
        },
        {
          label: 'Bookings',
          data: this.customerAnalysisData.map(item => item.bookings),
          backgroundColor: '#BD765C',
          borderColor: '#BD765C',
          borderWidth: 1,
          stack: 'Stack 0',
          barPercentage: 0.4,
          categoryPercentage: 0.8
        }
      ]
    };

    this.customerAnalysisChart = new Chart(this.customerAnalysisChartCanvas.nativeElement, {
      type: 'bar',
      data: data,
      plugins: [ChartDataLabels],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: {
              display: false
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: {
              display: false
            },
            ticks: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: false,
          },
          datalabels: {
            color: '#ffffff',
            formatter: (value: number, context: any) => {
              const datasetArray: number[] = context.chart.data.datasets.map((dataset: any) => dataset.data[context.dataIndex]);
              const total = datasetArray.reduce((sum: number, val: number) => sum + val, 0);
              const percentage = (value / total) * 100;
              return percentage.toFixed(1);
            },
            anchor: 'center',
            align: 'center',
            offset: 22,
            padding: {
              top: 10,
              bottom: 10,
              left: 10,
              right: 10
            },
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        }
      }
    });
  }

  createIncomeAnalysisChart(): void {
    const labels = this.incomeData.map(item => `${item.month} ${item.year}`);
    const data = {
      labels: labels,
      datasets: [{
        label: 'Income',
        data: this.incomeData.map(item => item.income),
        fill: true,
        borderColor: '#4BC0C0',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        pointBackgroundColor: '#4BC0C0',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4BC0C0'
      }]
    };

    if (this.incomeAnalysisChart) {
      this.incomeAnalysisChart.destroy();
    }

    this.incomeAnalysisChart = new Chart(this.incomeAnalysisChartCanvas.nativeElement, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value;
              }
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          }
        }
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-success';
      case 'pending':
        return 'bg-warning text-dark';
      case 'unaccepted':
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const nameMatch = !this.searchName || user.name.toLowerCase().includes(this.searchName.toLowerCase());
      const statusMatch = !this.searchStatus || user.status === this.searchStatus;
      return nameMatch && statusMatch;
    });
    this.filteredUsers = this.filteredUsers.slice(0, 9);
  }

  loadMoreUsers() {
    const currentLength = this.filteredUsers.length;
    const additionalUsers = this.users.slice(currentLength, currentLength + 2);
    this.filteredUsers = [...this.filteredUsers, ...additionalUsers];
  }

  deleteReview(id: string) {
    if (confirm(this.translate.instant('DASHBOARD.REVIEWS.CONFIRM_DELETE'))) {
      this.dashboardService.deleteRating(id).subscribe({
        next: (response) => {
          console.log('Review deleted:', response);
          this.reviews = this.reviews.filter(r => r.id !== id);
          this.filterReviews();
          this.updateReviewStats();
        },
        error: (err) => {
          console.error('Error deleting review:', err);
        }
      });
    }
  }

  filterReviews() {
    this.filteredReviews = this.reviews;
    this.filteredReviews = this.filteredReviews.slice(0, 9);
  }

  loadMoreReviews() {
    const currentLength = this.filteredReviews.length;
    const additionalReviews = this.reviews.slice(currentLength, currentLength + 2);
    this.filteredReviews = [...this.filteredReviews, ...additionalReviews];
  }

  private updateReviewStats() {
    this.totalReviewsCount = this.reviews.length;
    this.averageReviewsValue = this.reviews.length
      ? this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length
      : 0;

    const ratingCounts = [0, 0, 0, 0, 0, 0];
    this.reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingCounts[review.rating]++;
      }
    });

    const totalRatings = this.reviews.length;
    this.customerReviewStats = {
      average: this.averageReviewsValue,
      totalRatings: totalRatings,
      ratings: [
        { star: 5, percentage: totalRatings ? Number(((ratingCounts[5] / totalRatings) * 100).toFixed(3)) : 0, barClass: 'bg-success' },
        { star: 4, percentage: totalRatings ? Number(((ratingCounts[4] / totalRatings) * 100).toFixed(3)) : 0, barClass: 'bg-primary' },
        { star: 3, percentage: totalRatings ? Number(((ratingCounts[3] / totalRatings) * 100).toFixed(3)) : 0, barClass: 'bg-warning' },
        { star: 2, percentage: totalRatings ? Number(((ratingCounts[2] / totalRatings) * 100).toFixed(3)) : 0, barClass: 'bg-danger' },
        { star: 1, percentage: totalRatings ? Number(((ratingCounts[1] / totalRatings) * 100).toFixed(3)) : 0, barClass: 'bg-danger' }
      ]
    };
  }

  ngOnDestroy(): void {
    if (this.customerAnalysisChart) {
      this.customerAnalysisChart.destroy();
    }
    if (this.incomeAnalysisChart) {
      this.incomeAnalysisChart.destroy();
    }
  }
}