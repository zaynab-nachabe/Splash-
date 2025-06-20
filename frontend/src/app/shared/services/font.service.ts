import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable ({
    providedIn: 'root'
})
export class FontService {
    private selectedFontSubject = new BehaviorSubject<string>('Arial');
    selectedFont$ = this.selectedFontSubject.asObservable();
    private fonts: string[] = ['Arial', 'Courier New', 'Times New Roman', 'Verdana', 'Cursive'];

    constructor() {}
    
    setSelectedFont(font: string){
        console.log('font updated to ', font);
        this.selectedFontSubject.next(font);
    }

    getFonts(): string[] {
        return this.fonts;
    }
}