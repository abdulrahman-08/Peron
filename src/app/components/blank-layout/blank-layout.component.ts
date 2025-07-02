import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBlankComponent } from '../nav-blank/nav-blank.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-blank-layout',
  standalone: true,
  imports: [CommonModule, NavBlankComponent, RouterOutlet, FooterComponent],
  templateUrl: './blank-layout.component.html',
  styleUrls: ['./blank-layout.component.css']
})
export class BlankLayoutComponent {

}
