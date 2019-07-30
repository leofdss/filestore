import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FileUploadModule } from 'ng2-file-upload';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FileExplorerComponent } from './file-explorer.component';
import { NewFolderDialogComponent } from './modals/newFolderDialog/newFolderDialog.component';
import { RenameDialogComponent } from './modals/renameDialog/renameDialog.component';
import { NgxMaskModule } from 'ngx-mask';
import { FileNameDirective } from '../directives/file-name.directive';
import { ResponsiveColsDirective } from '../directives/responsive-cols.directive';
import { MaterialModule } from '../material-module';

@NgModule({
  declarations: [
    FileExplorerComponent,
    NewFolderDialogComponent,
    RenameDialogComponent,
    FileNameDirective,
    ResponsiveColsDirective,
  ],
  imports: [
    CommonModule,
    DragDropModule,
    FileUploadModule,
    FormsModule,
    FlexLayoutModule,
    NgxMaskModule.forRoot(),
    MaterialModule
  ],
  exports: [
    CommonModule,
    DragDropModule,
    FileUploadModule,
    FormsModule,
    FlexLayoutModule,
    FileExplorerComponent,
    NgxMaskModule
  ],
  entryComponents: [NewFolderDialogComponent, RenameDialogComponent]
})
export class FileExplorerModule { }
