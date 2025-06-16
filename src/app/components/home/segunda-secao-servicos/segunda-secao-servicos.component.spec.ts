import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegundaSecaoServicosComponent } from './segunda-secao-servicos.component';

describe('SegundaSecaoServicosComponent', () => {
  let component: SegundaSecaoServicosComponent;
  let fixture: ComponentFixture<SegundaSecaoServicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegundaSecaoServicosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SegundaSecaoServicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
