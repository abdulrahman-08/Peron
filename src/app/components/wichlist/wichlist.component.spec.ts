import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WichlistComponent } from './wichlist.component';

describe('WichlistComponent', () => {
  let component: WichlistComponent;
  let fixture: ComponentFixture<WichlistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WichlistComponent]
    });
    fixture = TestBed.createComponent(WichlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
