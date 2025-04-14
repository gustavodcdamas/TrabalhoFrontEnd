import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonaSecaoDuvidasComponent } from './nona-secao-duvidas.component';

describe('NonaSecaoDuvidasComponent', () => {
  let component: NonaSecaoDuvidasComponent;
  let fixture: ComponentFixture<NonaSecaoDuvidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NonaSecaoDuvidasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonaSecaoDuvidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
