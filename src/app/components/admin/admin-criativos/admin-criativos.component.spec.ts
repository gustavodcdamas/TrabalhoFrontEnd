import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCriativosComponent } from './admin-criativos.component';

describe('AdminCriativosComponent', () => {
  let component: AdminCriativosComponent;
  let fixture: ComponentFixture<AdminCriativosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCriativosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCriativosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
