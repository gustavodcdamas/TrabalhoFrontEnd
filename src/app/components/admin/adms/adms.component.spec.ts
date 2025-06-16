import { ComponentFixture, TestBed } from '@angular/core/testing';

import { admsComponent } from './adms.component';

describe('ContasComponent', () => {
  let component: admsComponent;
  let fixture: ComponentFixture<admsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [admsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(admsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
