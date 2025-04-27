import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable ({
    providedIn: 'root'
})
export class FontSelectorService {
    private selectedFontSubject = new BehaviorSubject<string>('Arial');
    selectedFont$ = this.selectedFontSubject.asObservable();

    constructor() {}
    
    setSelectedFont(font: string){
        this.selectedFontSubject.next(font);
    }
}