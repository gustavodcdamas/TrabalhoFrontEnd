import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecimaSecaoContatoComponent } from './decima-secao-contato.component';

describe('DecimaSecaoContatoComponent', () => {
  let component: DecimaSecaoContatoComponent;
  let fixture: ComponentFixture<DecimaSecaoContatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecimaSecaoContatoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecimaSecaoContatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
