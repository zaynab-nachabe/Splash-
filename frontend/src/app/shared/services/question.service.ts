import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../models/question.model';
import { UserConfig } from '../models/user-config.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private readonly apiUrl = environment.apiUrl+'/questions';

  constructor(private http: HttpClient) {}

  generateQuestion(userConfig: UserConfig): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/generate`, userConfig);
  }
}
