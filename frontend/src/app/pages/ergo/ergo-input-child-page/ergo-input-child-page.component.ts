import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {LocalStorageService} from "../../../shared/services/localStorage.service";

@Component({
  selector: 'app-ergo-input-child',
  templateUrl: './ergo-input-child-page.component.html',
  styleUrl: './ergo-input-child-page.component.scss'
})
export class ErgoInputChildComponent implements OnInit {
  childForm: FormGroup;
  defaultConditions: string[] = [
    'Dyslexia',
    'Dyscalculia',
    'Dysgraphia',
    'ADHD',
    'Visual Processing Disorder'
  ];
  availableConditions: string[] = [];
  selectedConditions: string[] = [];
  showNewConditionInput: boolean = false;
  newCondition: string = '';

  selectedIcon: string = 'pp-1.png';
  private TROUBLES_STORAGE_KEY = 'availableTroubles';

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService
  ) {
    this.childForm = this.fb.group({
      name: ['', Validators.required],
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

    // Update selected conditions - only keep those that still exist in the defaults
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

      // Check if condition already exists
      if (!this.availableConditions.includes(formattedCondition)) {
        this.availableConditions.push(formattedCondition);
        this.saveAvailableConditions();

        // Select the newly added condition
        this.selectedConditions.push(formattedCondition);
      }

      // Reset the input
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
    if (this.childForm.valid) {
      const newChild = {
        userId: Date.now().toString(), // Generate a unique ID
        name: this.childForm.value.name,
        age: this.childForm.value.age,
        icon: this.selectedIcon,
        conditions: this.selectedConditions,
        userConfig: {
          showsAnswer: false,
          addition: true,
          subtraction: true,
          multiplication: true,
          division: true,
          rewrite: true,
          encryption: false,
          word: false,
        }
      };

      this.userService.addUser(newChild);
      this.router.navigate(['/ergo-config']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/ergo-config']);
  }

  handleTroubleSelection(value: string): void {
    if (value === 'add') {
      this.showAddNewCondition();
      // Reset the dropdown
      setTimeout(() => {
        const selectElement = document.querySelector('.troubles-dropdown') as HTMLSelectElement;
        if (selectElement) {
          selectElement.value = '';
        }
      });
    } else if (value === 'reset') {
      // Reset to default conditions
      this.resetToDefaultConditions();
      // Show confirmation message (optional)
      alert('La liste des troubles a été réinitialisée aux valeurs par défaut.');
      this.resetDropdown();
    }
    else if (value) {
      // Only add if not already in the array
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

}
