import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OitavaSecaoSobreComponent } from './oitava-secao-sobre.component';

describe('OitavaSecaoSobreComponent', () => {
  let component: OitavaSecaoSobreComponent;
  let fixture: ComponentFixture<OitavaSecaoSobreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OitavaSecaoSobreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OitavaSecaoSobreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
