import { Component } from '@angular/core';

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'ngx-ckeditor',
  template: `
    <nb-card>
      <nb-card-header>
        CKEditor
      </nb-card-header>
      <nb-card-body>
        <ckeditor [editor]="editor" [(ngModel)]="content"></ckeditor>
      </nb-card-body>
    </nb-card>
  `,
})
export class CKEditorComponent {
  editor = ClassicEditor;
  content = '<p>Hello, world!</p>';
}
