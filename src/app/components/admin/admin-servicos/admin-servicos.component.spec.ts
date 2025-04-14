import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminServicosComponent } from './admin-servicos.component';

describe('AdminServicosComponent', () => {
  let component: AdminServicosComponent;
  let fixture: ComponentFixture<AdminServicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminServicosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminServicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
