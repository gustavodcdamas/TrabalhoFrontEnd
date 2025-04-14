import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInstitucionaisComponent } from './admin-institucionais.component';

describe('AdminInstitucionaisComponent', () => {
  let component: AdminInstitucionaisComponent;
  let fixture: ComponentFixture<AdminInstitucionaisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminInstitucionaisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminInstitucionaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
