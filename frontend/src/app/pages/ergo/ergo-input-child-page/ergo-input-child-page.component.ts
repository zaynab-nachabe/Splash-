import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from "../../../shared/services/localStorage.service";
import { AVATAR_PRICES } from 'src/app/shared/models/avatar.model';

@Component({
  selector: 'app-ergo-input-child',
  templateUrl: './ergo-input-child-page.component.html',
  styleUrl: './ergo-input-child-page.component.scss'
})
export class ErgoInputChildComponent implements OnInit {
  childForm: FormGroup;
  defaultConditions: string[] = [
    'Dyslexie',
    'Dyscalculie',
    'Dysgraphie',
    'TDAH',
    'troubles visuelles'
  ];
  availableConditions: string[] = [];
  selectedConditions: string[] = [];
  showNewConditionInput: boolean = false;
  newCondition: string = '';
  warningMessage: string = '';


  selectedIcon: string = 'pp-1.png';
  private TROUBLES_STORAGE_KEY = 'availableTroubles';

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService
  ) {
    this.childForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });
  }

  ngOnInit(): void {
    this.loadAvailableConditions();
  }

  private loadAvailableConditions(): void {
    // Try to get conditions from localStorage
    const storedConditions = this.localStorageService.getData(this.TROUBLES_STORAGE_KEY);

    if (storedConditions) {
      try {
        this.availableConditions = JSON.parse(storedConditions);
      } catch (e) {
        console.error('Error parsing stored conditions:', e);
        this.resetToDefaultConditions();
      }
    } else {
      this.resetToDefaultConditions();
    }
  }

  /*
  private resetToDefaultConditions(): void {
    this.availableConditions = [...this.defaultConditions];
    this.saveAvailableConditions();
  }
   */
  private resetToDefaultConditions(): void {
    // Save current selections to restore them after reset
    const currentSelections = [...this.selectedConditions];

    // Reset available conditions to defaults
    this.availableConditions = [...this.defaultConditions];
    this.saveAvailableConditions();

    this.selectedConditions = currentSelections.filter(
      condition => this.defaultConditions.includes(condition)
    );
  }


  private saveAvailableConditions(): void {
    this.localStorageService.saveData(
      this.TROUBLES_STORAGE_KEY,
      JSON.stringify(this.availableConditions)
    );
  }

  showAddNewCondition(): void {
    this.showNewConditionInput = true;
  }

  cancelAddNewCondition(): void {
    this.showNewConditionInput = false;
    this.newCondition = '';
  }

  addNewCondition(): void {
    if (this.newCondition && this.newCondition.trim() !== '') {
      const formattedCondition = this.newCondition.trim();

      if (!this.availableConditions.includes(formattedCondition)) {
        this.availableConditions.push(formattedCondition);
        this.saveAvailableConditions();

        this.selectedConditions.push(formattedCondition);
      }

      this.newCondition = '';
      this.showNewConditionInput = false;
    }
  }


  toggleCondition(condition: string): void {
    const index = this.selectedConditions.indexOf(condition);
    if (index > -1) {
      this.selectedConditions.splice(index, 1);
    } else {
      this.selectedConditions.push(condition);
    }
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
  }

  onSaveChild(): void {
    this.warningMessage = '';
    if (this.childForm.valid && this.selectedIcon && this.selectedConditions.length > 0) {
      const age = Number(this.childForm.value.age);
      if (age < 3 || age > 100) {
        this.warningMessage = 'L\'âge doit être compris entre 3 et 100 ans.';
        return;
      }
      const newChild = {
        userId: Date.now().toString(),
        name: `${this.childForm.value.firstName} ${this.childForm.value.lastName}`.trim(),
        age: this.childForm.value.age,

        icon: this.selectedIcon,
        conditions: this.selectedConditions,

        userConfig: {
          showAnswer: false,
          addition: false,
          subtraction: false,
          multiplication: false,
          division: false,
          rewrite: true,
          encryption: false,
          word: false,
          showScore: false,
          nombresDeQuestion: 10,
          chiffresEnLettres: false,
          longueurMaximaleDesMots: 10
        },
        selectedPlayerImage: AVATAR_PRICES.find(a => a.id === 'yellow_fish')?.path || 'assets/images/game/player/yellow_fish.png',
        unlockedAvatars: ['yellow_fish']
      };

      this.userService.addUser(newChild);
      this.router.navigate(['/ergo-stat-selected'], {
        queryParams: { userId: newChild.userId }
      });
    } else {
      this.warningMessage = 'Veuillez remplir tous les champs requis';
    }
  }

  onCancel(): void {
    this.router.navigate(['/ergo-play']);
  }

  handleTroubleSelection(value: string): void {
    if (value === 'add') {
      this.showAddNewCondition();
      setTimeout(() => {
        const selectElement = document.querySelector('.troubles-dropdown') as HTMLSelectElement;
        if (selectElement) {
          selectElement.value = '';
        }
      });
    } else if (value === 'reset') {
      this.resetToDefaultConditions();
      alert('La liste des troubles a été réinitialisée aux valeurs par défaut.');
      this.resetDropdown();
    }
    else if (value) {
      if (!this.selectedConditions.includes(value)) {
        this.selectedConditions.push(value);
      }
      this.resetDropdown();

    }
  }

  private resetDropdown(): void {
    setTimeout(() => {
      const selectElement = document.querySelector('.troubles-dropdown') as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = '';
      }
    });
  }


  removeAvailableCondition(condition: string): void {
    this.availableConditions = this.availableConditions.filter(c => c !== condition);
    this.selectedConditions = this.selectedConditions.filter(c => c !== condition);
    this.saveAvailableConditions();
  }

}
