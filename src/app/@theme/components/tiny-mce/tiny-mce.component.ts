import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ngx-tiny-mce',
  template: `
    <editor [init]="init" (onKeyUp)="onKeyUp($event)"></editor>
  `,
})
export class TinyMCEComponent {

  @Output() editorKeyup = new EventEmitter<any>();

  init = {
    base_url: 'assets/tinymce',
    suffix: '.min',
    plugins: ['link', 'table'],
    promotion: false,
    height: 320,
  };

  onKeyUp(event: any) {
    this.editorKeyup.emit(event.editor.getContent());
  }
}
