import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-settings-slider',
  templateUrl: './settings-slider.component.html',
  styleUrl: './settings-slider.component.scss'
})
export class SettingsSliderComponent implements AfterViewInit {
  @Input() value: number = 1; // 0 to 1
  @Output() valueChange = new EventEmitter<number>();
  @ViewChild('slider', { static: false }) sliderRef!: ElementRef<HTMLDivElement>;

  private dragging = false;

  ngAfterViewInit() {
    // nothing needed here for now
  }

  onSliderMouseDown(event: MouseEvent) {
    this.setValueFromEvent(event);
    this.startDragging();
    event.preventDefault();
  }

  onSliderTouchStart(event: TouchEvent) {
    this.setValueFromEvent(event.touches[0]);
    this.startDragging(true);
    event.preventDefault();
  }

  onHeadMouseDown(event: MouseEvent) {
    this.startDragging();
    event.stopPropagation();
    event.preventDefault();
  }

  onHeadTouchStart(event: TouchEvent) {
    this.startDragging(true);
    event.stopPropagation();
    event.preventDefault();
  }

  onHeadKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      this.setValue(this.value - 0.05);
      event.preventDefault();
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      this.setValue(this.value + 0.05);
      event.preventDefault();
    }
  }

  private startDragging(isTouch = false) {
    this.dragging = true;
    const move = isTouch ? 'touchmove' : 'mousemove';
    const up = isTouch ? 'touchend' : 'mouseup';
    const moveHandler = (e: any) => {
      if (isTouch) {
        this.setValueFromEvent(e.touches[0]);
      } else {
        this.setValueFromEvent(e);
      }
    };
    const upHandler = () => {
      this.dragging = false;
      window.removeEventListener(move, moveHandler);
      window.removeEventListener(up, upHandler);
    };
    window.addEventListener(move, moveHandler);
    window.addEventListener(up, upHandler);
  }

  private setValueFromEvent(event: MouseEvent | Touch) {
    const slider: HTMLElement = this.sliderRef.nativeElement;
    const rect = slider.getBoundingClientRect();
    let pos = (event.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    this.setValue(pos);
  }

  private setValue(val: number) {
    this.value = Math.max(0, Math.min(1, val));
    this.valueChange.emit(this.value);
  }
}
