import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NbCardModule } from '@nebular/theme';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { ThemeModule } from '../../@theme/theme.module';

import { EditorsRoutingModule, routedComponents } from './editors-routing.module';

@NgModule({
  imports: [
    NbCardModule,
    FormsModule,
    ThemeModule,
    EditorsRoutingModule,
    CKEditorModule,
  ],
  declarations: [
    ...routedComponents,
  ],
})
export class EditorsModule { }
