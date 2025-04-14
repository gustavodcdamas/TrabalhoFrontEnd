import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLandingPagesComponent } from './admin-landing-pages.component';

describe('AdminLandingPagesComponent', () => {
  let component: AdminLandingPagesComponent;
  let fixture: ComponentFixture<AdminLandingPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLandingPagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLandingPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
