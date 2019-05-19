import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { MatDialog } from '@angular/material';
import { FileElement } from '../model/element';
import { MatMenuTrigger } from '@angular/material/menu';
import { NewFolderDialogComponent } from './modals/newFolderDialog/newFolderDialog.component';
import { RenameDialogComponent } from './modals/renameDialog/renameDialog.component';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss']
})
export class FileExplorerComponent implements OnInit {

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit() { }

  @Output() uploaderEmitter = new EventEmitter<FileUploader>();
  @Input() uploader: FileUploader;

  public hasBaseDropZoneOver: boolean = false;

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
    this.hasBaseDropZoneOver = e;
    if (!e || typeof (e) == 'object') {
      this.uploadAll();
    }
  }

  public onFileSelected(event: EventEmitter<File[]>) {
    const file: File = event[0];
    this.uploadAll();
  }

  uploadAll() {
    for (let i = 0; i < this.uploader.queue.length; i++) {
      if (this.uploader.queue[i].file.size < 300 * 1024 * 1024) {

        if (!this.uploader.queue[i].isUploaded && !this.uploader.queue[i].isSuccess) {
          this.uploader.queue[i].upload();
        }

      } else {
        this.uploader.queue[i].isError = true;
        alert('Arquivo maior que 300mb!');
      }
    }
  }

  @Input() fileElements: FileElement[];
  @Input() canNavigateUp: string;
  @Input() path: string;

  @Output() folderAdded = new EventEmitter<{ name: string }>();
  @Output() elementRemoved = new EventEmitter<FileElement>();
  @Output() elementRenamed = new EventEmitter<FileElement>();
  @Output() elementMoved = new EventEmitter<{ element: FileElement; moveTo: FileElement }>();
  @Output() navigatedDown = new EventEmitter<FileElement>();
  @Output() downloadEmitter = new EventEmitter<FileElement>();
  @Output() navigatedUp = new EventEmitter();
  @Output() updateEmitter = new EventEmitter();

  deleteElement(element: FileElement) {
    this.elementRemoved.emit(element);
  }

  navigate(element: FileElement) {
    if (element.isFolder) {
      this.navigatedDown.emit(element);
    }
  }

  navigateUp() {
    this.navigatedUp.emit();
  }

  moveElement(element: FileElement, moveTo: FileElement) {
    this.elementMoved.emit({ element: element, moveTo: moveTo });
  }

  openNewFolderDialog() {
    let dialogRef = this.dialog.open(NewFolderDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.folderAdded.emit({ name: res });
      }
    });
  }

  download(element: FileElement) {
    this.downloadEmitter.emit(element);
  }

  update() {
    this.updateEmitter.emit();
  }

  openRenameDialog(element: FileElement) {
    let dialogRef = this.dialog.open(RenameDialogComponent, {
      width: '250px',
      data: element
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        element.name = res;
        this.elementRenamed.emit(element);
      }
    });
  }

  openMenu(event: MouseEvent, viewChild: MatMenuTrigger) {
    event.preventDefault();
    viewChild.openMenu();
  }
}
